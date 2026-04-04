#!/usr/bin/env python3
"""
Athena Asset Generation Pipeline
=================================
Batch 3D asset generator using:
  - SDXL-Turbo for text-to-image
  - rembg for background removal
  - Hunyuan3D 2.1 for shape generation
  - Hunyuan3D Paint for PBR texture generation
  - Blender (headless) for OBJ->GLB conversion

Designed for ROCm/AMD (7900 XT, 20GB VRAM).
VRAM-aware: swaps models between phases.

Usage:
  python3 generate_assets.py --manifest manifest.json
  python3 generate_assets.py --manifest manifest.json --resume
  python3 generate_assets.py --manifest manifest.json --only-shape
  python3 generate_assets.py --single "a cute cartoon fox" --name fox --category characters
"""
from __future__ import annotations

import os
import sys
import json
import time
import gc
import shutil
import argparse
import logging
import traceback
from pathlib import Path
from dataclasses import dataclass
from typing import Optional
from enum import Enum

import torch
import numpy as np
from PIL import Image

# ---------------------------------------------------------------------------
# Paths & ROCm config
# ---------------------------------------------------------------------------
os.environ.setdefault("PYTORCH_HIP_ALLOC_CONF", "expandable_segments:True")
os.environ.setdefault("HSA_OVERRIDE_GFX_VERSION", "11.0.0")

WORKSPACE = Path("/workspace")
HUNYUAN_ROOT = WORKSPACE / "Hunyuan3D-2.1"
OUTPUT_ROOT = WORKSPACE / "output"
PROGRESS_FILE = OUTPUT_ROOT / ".progress.json"

sys.path.insert(0, str(HUNYUAN_ROOT / "hy3dshape"))
sys.path.insert(0, str(HUNYUAN_ROOT / "hy3dpaint"))

# Apply torchvision compatibility fix
try:
    sys.path.insert(0, str(HUNYUAN_ROOT))
    from torchvision_fix import apply_fix
    apply_fix()
except Exception:
    pass

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("athena-gen")


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------
class Phase(str, Enum):
    TEXT2IMG = "text2img"
    REMBG = "rembg"
    SHAPE = "shape"
    TEXTURE = "texture"
    DONE = "done"


@dataclass
class AssetSpec:
    name: str
    category: str
    prompt: str
    type: str = "static"
    reference_image: Optional[str] = None
    max_faces: int = 40000
    texture_views: int = 6
    texture_resolution: int = 512


# ---------------------------------------------------------------------------
# VRAM management
# ---------------------------------------------------------------------------
def vram_used_mb() -> float:
    if torch.cuda.is_available():
        return torch.cuda.memory_allocated() / 1024**2
    return 0.0


def vram_free_mb() -> float:
    if torch.cuda.is_available():
        total = torch.cuda.get_device_properties(0).total_memory
        used = torch.cuda.memory_allocated()
        return (total - used) / 1024**2
    return 0.0


def flush_vram():
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.synchronize()
    log.info("VRAM after flush: %.0fMB used, %.0fMB free", vram_used_mb(), vram_free_mb())


# ---------------------------------------------------------------------------
# Progress tracking
# ---------------------------------------------------------------------------
class ProgressTracker:
    def __init__(self, progress_file: Path):
        self.path = progress_file
        self.data: dict = {}
        self._load()

    def _load(self):
        if self.path.exists():
            with open(self.path) as f:
                self.data = json.load(f)

    def _save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.path, "w") as f:
            json.dump(self.data, f, indent=2)

    def get_phase(self, asset_name: str) -> Optional[str]:
        return self.data.get(asset_name, {}).get("phase")

    def set_phase(self, asset_name: str, phase: str, **extra):
        if asset_name not in self.data:
            self.data[asset_name] = {}
        self.data[asset_name]["phase"] = phase
        self.data[asset_name]["updated"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        self.data[asset_name].update(extra)
        self._save()

    def is_done(self, asset_name: str) -> bool:
        return self.get_phase(asset_name) == Phase.DONE


# ---------------------------------------------------------------------------
# Pipeline stages (lazy-loaded, VRAM-swappable)
# ---------------------------------------------------------------------------
class Text2ImageStage:
    """SDXL-Turbo: text prompt -> 512x512 reference image."""

    def __init__(self):
        self.pipe = None

    def load(self):
        if self.pipe is not None:
            return
        log.info("Loading SDXL-Turbo for text-to-image...")
        from diffusers import AutoPipelineForText2Image
        self.pipe = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/sdxl-turbo",
            torch_dtype=torch.float16,
            variant="fp16",
        ).to("cuda")
        self.pipe.set_progress_bar_config(disable=True)
        log.info("SDXL-Turbo loaded. VRAM: %.0fMB", vram_used_mb())

    def unload(self):
        if self.pipe is not None:
            del self.pipe
            self.pipe = None
            flush_vram()
            log.info("SDXL-Turbo unloaded")

    def generate(self, prompt: str, output_path: Path) -> Path:
        self.load()
        enhanced_prompt = (
            prompt + ", 3D render, studio lighting, centered, "
            "white background, high quality, detailed, game asset"
        )
        image = self.pipe(
            prompt=enhanced_prompt,
            num_inference_steps=4,
            guidance_scale=0.0,
            width=512,
            height=512,
        ).images[0]
        output_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(str(output_path))
        log.info("Generated reference image: %s", output_path)
        return output_path


class BackgroundRemovalStage:
    """rembg: remove background -> RGBA with transparent bg."""

    def __init__(self):
        self.remover = None

    def load(self):
        if self.remover is not None:
            return
        log.info("Loading rembg background remover...")
        from hy3dshape.rembg import BackgroundRemover
        self.remover = BackgroundRemover()
        log.info("rembg loaded")

    def unload(self):
        if self.remover is not None:
            del self.remover
            self.remover = None
            flush_vram()

    def remove(self, image_path: Path, output_path: Path) -> Path:
        self.load()
        image = Image.open(str(image_path)).convert("RGBA")
        alpha = np.array(image.getchannel("A"))
        if alpha.min() > 200:
            image = self.remover(image)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(str(output_path))
        log.info("Background removed: %s", output_path)
        return output_path


class ShapeGenerationStage:
    """Hunyuan3D 2.1: RGBA image -> 3D mesh (GLB)."""

    def __init__(self):
        self.pipeline = None

    def load(self):
        if self.pipeline is not None:
            return
        log.info("Loading Hunyuan3D shape generation pipeline...")
        from hy3dshape.pipelines import Hunyuan3DDiTFlowMatchingPipeline
        self.pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
            "tencent/Hunyuan3D-2.1"
        )
        log.info("Shape pipeline loaded. VRAM: %.0fMB", vram_used_mb())

    def unload(self):
        if self.pipeline is not None:
            del self.pipeline
            self.pipeline = None
            flush_vram()
            log.info("Shape pipeline unloaded")

    def generate(self, image_path: Path, output_path: Path) -> Path:
        self.load()
        image = Image.open(str(image_path)).convert("RGBA")
        mesh = self.pipeline(image=image)[0]
        output_path.parent.mkdir(parents=True, exist_ok=True)
        mesh.export(str(output_path))
        verts = getattr(mesh, "vertices", None)
        faces = getattr(mesh, "faces", None)
        v_count = len(verts) if verts is not None else "?"
        f_count = len(faces) if faces is not None else "?"
        size_mb = output_path.stat().st_size / 1024**2
        log.info("Shape generated: %s (%s verts, %s faces, %.1fMB)", output_path, v_count, f_count, size_mb)
        return output_path


class TextureGenerationStage:
    """Hunyuan3D Paint: mesh + image -> PBR textured mesh."""

    def __init__(self):
        self.pipeline = None

    def load(self):
        if self.pipeline is not None:
            return
        log.info("Loading Hunyuan3D paint pipeline...")
        from textureGenPipeline import Hunyuan3DPaintPipeline, Hunyuan3DPaintConfig
        # 4 views @ 320px fits in 20GB VRAM (7900 XT)
        conf = Hunyuan3DPaintConfig(max_num_view=4, resolution=320)
        conf.realesrgan_ckpt_path = str(HUNYUAN_ROOT / "hy3dpaint" / "ckpt" / "RealESRGAN_x4plus.pth")
        conf.multiview_cfg_path = str(HUNYUAN_ROOT / "hy3dpaint" / "cfgs" / "hunyuan-paint-pbr.yaml")
        conf.custom_pipeline = str(HUNYUAN_ROOT / "hy3dpaint" / "hunyuanpaintpbr")
        conf.render_size = 1024   # halved from 2048 to fit 20GB VRAM
        conf.texture_size = 2048  # halved from 4096 to fit 20GB VRAM
        self.pipeline = Hunyuan3DPaintPipeline(conf)
        log.info("Paint pipeline loaded. VRAM: %.0fMB", vram_used_mb())

    def unload(self):
        if self.pipeline is not None:
            del self.pipeline
            self.pipeline = None
            flush_vram()
            log.info("Paint pipeline unloaded")

    def generate(self, mesh_path: Path, image_path: Path, output_path: Path) -> Path:
        self.load()
        obj_output = output_path.with_suffix(".obj")
        result = self.pipeline(
            mesh_path=str(mesh_path),
            image_path=str(image_path),
            output_mesh_path=str(obj_output),
        )
        glb_path = output_path.with_suffix(".glb")
        if glb_path.exists():
            size_mb = glb_path.stat().st_size / 1024**2
            log.info("Textured mesh: %s (%.1fMB)", glb_path, size_mb)
            return glb_path
        elif Path(result).exists():
            log.info("Textured mesh (OBJ): %s", result)
            return Path(result)
        else:
            raise RuntimeError("Paint pipeline produced no output at %s" % glb_path)


# ---------------------------------------------------------------------------
# Main pipeline orchestrator
# ---------------------------------------------------------------------------
class AssetPipeline:
    def __init__(self, only_shape: bool = False, resume: bool = True):
        self.only_shape = only_shape
        self.progress = ProgressTracker(PROGRESS_FILE)
        self.resume = resume
        self.text2img = Text2ImageStage()
        self.rembg_stage = BackgroundRemovalStage()
        self.shape_stage = ShapeGenerationStage()
        self.texture_stage = TextureGenerationStage()

    def asset_dir(self, spec: AssetSpec) -> Path:
        return OUTPUT_ROOT / spec.category / spec.name

    def process_asset(self, spec: AssetSpec) -> Optional[Path]:
        """Process a single asset through all pipeline stages."""
        asset_dir = self.asset_dir(spec)
        asset_dir.mkdir(parents=True, exist_ok=True)

        if self.resume and self.progress.is_done(spec.name):
            final_glb = asset_dir / (spec.name + ".glb")
            if final_glb.exists():
                log.info("[SKIP] %s already done: %s", spec.name, final_glb)
                return final_glb

        current_phase = self.progress.get_phase(spec.name)
        log.info("=" * 60)
        log.info("Processing: %s (category=%s, type=%s)", spec.name, spec.category, spec.type)
        log.info("  Prompt: %s", spec.prompt)
        log.info("  Resume from: %s", current_phase or "start")
        log.info("=" * 60)

        try:
            # Phase 1: Text to Image
            ref_image_path = asset_dir / "reference.png"
            if spec.reference_image and Path(spec.reference_image).exists():
                shutil.copy2(spec.reference_image, str(ref_image_path))
                log.info("Using provided reference image: %s", spec.reference_image)
            elif not (self.resume and current_phase and current_phase != Phase.TEXT2IMG and ref_image_path.exists()):
                self.progress.set_phase(spec.name, Phase.TEXT2IMG)
                ref_image_path = self.text2img.generate(spec.prompt, ref_image_path)

            # Phase 2: Background Removal
            rgba_path = asset_dir / "reference_rgba.png"
            if not (self.resume and current_phase and current_phase not in (Phase.TEXT2IMG, Phase.REMBG) and rgba_path.exists()):
                self.text2img.unload()
                self.progress.set_phase(spec.name, Phase.REMBG)
                rgba_path = self.rembg_stage.remove(ref_image_path, rgba_path)

            # Phase 3: Shape Generation
            shape_path = asset_dir / (spec.name + "_shape.glb")
            if not (self.resume and current_phase and current_phase not in (Phase.TEXT2IMG, Phase.REMBG, Phase.SHAPE) and shape_path.exists()):
                self.text2img.unload()
                self.rembg_stage.unload()
                self.progress.set_phase(spec.name, Phase.SHAPE)
                shape_path = self.shape_stage.generate(rgba_path, shape_path)

            # Phase 4: Texture Generation
            final_path = asset_dir / (spec.name + ".glb")
            if self.only_shape:
                shutil.copy2(str(shape_path), str(final_path))
                log.info("Shape-only mode: %s", final_path)
            elif not (self.resume and self.progress.is_done(spec.name) and final_path.exists()):
                self.shape_stage.unload()
                self.progress.set_phase(spec.name, Phase.TEXTURE)
                textured_path = self.texture_stage.generate(
                    shape_path, ref_image_path,
                    asset_dir / (spec.name + "_textured"),
                )
                if textured_path.suffix == ".glb":
                    shutil.copy2(str(textured_path), str(final_path))
                else:
                    shutil.copy2(str(textured_path), str(final_path.with_suffix(textured_path.suffix)))

            self.progress.set_phase(spec.name, Phase.DONE)
            log.info("COMPLETE: %s -> %s", spec.name, final_path)
            return final_path

        except Exception as e:
            log.error("FAILED: %s at phase %s: %s", spec.name, self.progress.get_phase(spec.name), e)
            traceback.print_exc()
            return None

    def process_batch(self, specs: list[AssetSpec]) -> dict:
        """Process a batch of assets."""
        results = {"success": [], "failed": [], "skipped": []}
        total = len(specs)

        for i, spec in enumerate(specs, 1):
            log.info("# Asset %d/%d: %s", i, total, spec.name)

            if self.resume and self.progress.is_done(spec.name):
                final_glb = self.asset_dir(spec) / (spec.name + ".glb")
                if final_glb.exists():
                    log.info("[SKIP] Already complete")
                    results["skipped"].append(spec.name)
                    continue

            result = self.process_asset(spec)
            if result:
                results["success"].append(spec.name)
            else:
                results["failed"].append(spec.name)
            flush_vram()

        self.text2img.unload()
        self.rembg_stage.unload()
        self.shape_stage.unload()
        self.texture_stage.unload()
        return results

    def process_batch_phased(self, specs: list[AssetSpec]) -> dict:
        """Process ALL assets phase-by-phase (fewer model swaps).

        Phase 1: Generate ALL reference images (text2img loaded once)
        Phase 2: Remove ALL backgrounds (rembg loaded once)
        Phase 3: Generate ALL shapes (shape model loaded once)
        Phase 4: Generate ALL textures (paint model loaded once)
        """
        results = {"success": [], "failed": [], "skipped": []}
        active_specs = []

        for spec in specs:
            if self.resume and self.progress.is_done(spec.name):
                results["skipped"].append(spec.name)
                continue
            active_specs.append(spec)

        if not active_specs:
            log.info("All assets already complete!")
            return results

        log.info("PHASED BATCH: %d assets to process", len(active_specs))

        # Phase 1: Text-to-Image
        needs_t2i = []
        for spec in active_specs:
            ad = self.asset_dir(spec)
            ref = ad / "reference.png"
            if spec.reference_image and Path(spec.reference_image).exists():
                ad.mkdir(parents=True, exist_ok=True)
                shutil.copy2(spec.reference_image, str(ref))
            elif not ref.exists():
                needs_t2i.append(spec)

        if needs_t2i:
            log.info("--- Phase 1: Text-to-Image (%d assets) ---", len(needs_t2i))
            for spec in needs_t2i:
                try:
                    ad = self.asset_dir(spec)
                    self.progress.set_phase(spec.name, Phase.TEXT2IMG)
                    self.text2img.generate(spec.prompt, ad / "reference.png")
                except Exception as e:
                    log.error("text2img failed for %s: %s", spec.name, e)
                    results["failed"].append(spec.name)
            self.text2img.unload()

        active_specs = [s for s in active_specs if s.name not in results["failed"]]

        # Phase 2: Background Removal
        needs_rembg = []
        for spec in active_specs:
            ad = self.asset_dir(spec)
            if not (ad / "reference_rgba.png").exists() and (ad / "reference.png").exists():
                needs_rembg.append(spec)

        if needs_rembg:
            log.info("--- Phase 2: Background Removal (%d assets) ---", len(needs_rembg))
            for spec in needs_rembg:
                try:
                    ad = self.asset_dir(spec)
                    self.progress.set_phase(spec.name, Phase.REMBG)
                    self.rembg_stage.remove(ad / "reference.png", ad / "reference_rgba.png")
                except Exception as e:
                    log.error("rembg failed for %s: %s", spec.name, e)
                    results["failed"].append(spec.name)
            self.rembg_stage.unload()

        active_specs = [s for s in active_specs if s.name not in results["failed"]]

        # Phase 3: Shape Generation
        needs_shape = []
        for spec in active_specs:
            ad = self.asset_dir(spec)
            if not (ad / (spec.name + "_shape.glb")).exists() and (ad / "reference_rgba.png").exists():
                needs_shape.append(spec)

        if needs_shape:
            log.info("--- Phase 3: Shape Generation (%d assets) ---", len(needs_shape))
            for spec in needs_shape:
                try:
                    ad = self.asset_dir(spec)
                    self.progress.set_phase(spec.name, Phase.SHAPE)
                    self.shape_stage.generate(ad / "reference_rgba.png", ad / (spec.name + "_shape.glb"))
                except Exception as e:
                    log.error("shape gen failed for %s: %s", spec.name, e)
                    results["failed"].append(spec.name)
            self.shape_stage.unload()

        active_specs = [s for s in active_specs if s.name not in results["failed"]]

        # Phase 4: Texture Generation
        if not self.only_shape:
            needs_texture = []
            for spec in active_specs:
                ad = self.asset_dir(spec)
                if not (ad / (spec.name + ".glb")).exists() and (ad / (spec.name + "_shape.glb")).exists():
                    needs_texture.append(spec)

            if needs_texture:
                log.info("--- Phase 4: Texture Generation (%d assets) ---", len(needs_texture))
                for spec in needs_texture:
                    try:
                        ad = self.asset_dir(spec)
                        self.progress.set_phase(spec.name, Phase.TEXTURE)
                        textured = self.texture_stage.generate(
                            ad / (spec.name + "_shape.glb"),
                            ad / "reference.png",
                            ad / (spec.name + "_textured"),
                        )
                        final = ad / (spec.name + ".glb")
                        shutil.copy2(str(textured), str(final))
                        self.progress.set_phase(spec.name, Phase.DONE)
                        results["success"].append(spec.name)
                    except Exception as e:
                        log.error("texture gen failed for %s: %s", spec.name, e)
                        results["failed"].append(spec.name)
                self.texture_stage.unload()
        else:
            for spec in active_specs:
                ad = self.asset_dir(spec)
                shape = ad / (spec.name + "_shape.glb")
                final = ad / (spec.name + ".glb")
                if shape.exists():
                    shutil.copy2(str(shape), str(final))
                    self.progress.set_phase(spec.name, Phase.DONE)
                    results["success"].append(spec.name)

        return results


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def load_manifest(path: str) -> list[AssetSpec]:
    with open(path) as f:
        data = json.load(f)

    items = data.get("assets", data if isinstance(data, list) else [])
    assets = []
    for item in items:
        assets.append(AssetSpec(
            name=item["name"],
            category=item.get("category", "misc"),
            prompt=item["prompt"],
            type=item.get("type", "static"),
            reference_image=item.get("reference_image"),
            max_faces=item.get("max_faces", 40000),
            texture_views=item.get("texture_views", 6),
            texture_resolution=item.get("texture_resolution", 512),
        ))
    return assets


def main():
    parser = argparse.ArgumentParser(description="Athena 3D Asset Generation Pipeline")
    parser.add_argument("--manifest", type=str, help="Path to JSON manifest file")
    parser.add_argument("--single", type=str, help="Single prompt (instead of manifest)")
    parser.add_argument("--name", type=str, default="asset", help="Asset name (for --single)")
    parser.add_argument("--category", type=str, default="misc", help="Category (for --single)")
    parser.add_argument("--resume", action="store_true", default=True, help="Resume from last checkpoint")
    parser.add_argument("--no-resume", action="store_true", help="Start fresh, ignore progress")
    parser.add_argument("--only-shape", action="store_true", help="Skip texture generation")
    parser.add_argument("--phased", action="store_true", help="Phased batch mode (fewer model swaps)")
    parser.add_argument("--reference-image", type=str, help="Path to reference image (skip text2img)")
    args = parser.parse_args()

    if args.no_resume:
        args.resume = False

    if args.single:
        specs = [AssetSpec(
            name=args.name,
            category=args.category,
            prompt=args.single,
            reference_image=args.reference_image,
        )]
    elif args.manifest:
        specs = load_manifest(args.manifest)
    else:
        parser.print_help()
        example = {
            "assets": [
                {"name": "oak-tree", "category": "vegetation", "prompt": "a large oak tree with green leaves", "type": "static"},
                {"name": "fox-companion", "category": "characters", "prompt": "a cute cartoon fox, stylized 3D", "type": "animated"},
                {"name": "wooden-bridge", "category": "structures", "prompt": "a simple wooden bridge", "type": "static"},
            ]
        }
        print("\nExample manifest.json:")
        print(json.dumps(example, indent=2))
        sys.exit(1)

    log.info("Athena Asset Pipeline")
    log.info("  Assets: %d", len(specs))
    log.info("  Output: %s", OUTPUT_ROOT)
    log.info("  Resume: %s", args.resume)
    log.info("  Shape only: %s", args.only_shape)
    log.info("  Phased mode: %s", args.phased)
    if torch.cuda.is_available():
        gpu = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
        log.info("  GPU: %s (%.1fGB VRAM)", gpu, vram_gb)

    pipeline = AssetPipeline(only_shape=args.only_shape, resume=args.resume)

    start_time = time.time()
    if args.phased and len(specs) > 1:
        results = pipeline.process_batch_phased(specs)
    else:
        results = pipeline.process_batch(specs)
    elapsed = time.time() - start_time

    log.info("=" * 60)
    log.info("BATCH COMPLETE in %.1f minutes", elapsed / 60)
    log.info("  Success: %d - %s", len(results["success"]), results["success"])
    log.info("  Failed:  %d - %s", len(results["failed"]), results["failed"])
    log.info("  Skipped: %d - %s", len(results["skipped"]), results["skipped"])
    log.info("=" * 60)

    sys.exit(1 if results["failed"] else 0)


if __name__ == "__main__":
    main()
