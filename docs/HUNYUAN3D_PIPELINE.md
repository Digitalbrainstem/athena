# Hunyuan3D 2.1 Asset Pipeline — Setup & Results

## Overview

Complete 3D asset generation pipeline running on an Overwatch server (Unraid, 7900 XT GPU with ROCm).
Generates textured 3D game assets from text prompts in ~5 minutes per asset.

**Server:** `192.168.3.8` (SSH via `~/.ssh/unraid_hive_key`)
**Container:** `hunyuan3d` (rocm/pytorch:latest)
**GPU:** AMD Radeon RX 7900 XT (20GB VRAM)
**Workspace:** `/workspace/Hunyuan3D-2.1`

## Pipeline Stages

| Stage | Model | VRAM | Time | Output |
|-------|-------|------|------|--------|
| Text-to-Image | SDXL-Turbo | 6.7GB | ~3s | 512x512 reference PNG |
| Background Removal | rembg (u2net) | ~0 | <1s | RGBA PNG |
| Shape Generation | Hunyuan3D 2.1 DiT | 7.0GB | ~2min | GLB (300K-700K verts) |
| Texture Painting | Hunyuan3D Paint PBR | 6.9GB | ~1min | Textured GLB with PBR maps |

Models are swapped in/out of VRAM between stages. Peak VRAM ~7GB per stage.

## What Works

### ✅ Shape Generation
- Tested with demo.png (penguin), text-generated fox, text-generated owl
- Produces high-quality meshes: 300K-700K verts, 12-23MB GLB
- ~50 diffusion steps @ ~1 it/s, then volume decoding

### ✅ Texture Painting (PBR)
- Produces base color, metallic, and roughness maps
- Uses multiview diffusion + bake to UV
- **Critical:** Must use lower settings for 20GB VRAM:
  - `max_num_view=4` (not 6)
  - `resolution=320` (not 512)
  - `render_size=1024` (not 2048)
  - `texture_size=2048` (not 4096)
- Uses Blender 4.0.2 headless for OBJ→GLB conversion (subprocess, not bpy import)

### ✅ Text-to-Image (SDXL-Turbo)
- 4 inference steps, ~3 seconds per image
- Prompt enhanced with "3D render, studio lighting, centered, white background"

### ✅ Background Removal (rembg)
- Uses u2net.onnx model
- Fast, works well for generated images

### ✅ Batch Processing
- JSON manifest support for multiple assets
- Progress tracking with resume support
- Phased mode: all text2img → all rembg → all shapes → all textures (fewer model swaps)

## Patches Applied to Hunyuan3D 2.1

1. **`hy3dpaint/DifferentiableRenderer/mesh_utils.py`** — Replaced `import bpy` with
   Blender subprocess calls for OBJ→GLB conversion. Original backed up as `.bak`.

2. **`hy3dpaint/utils/simplify_mesh_utils.py`** — Fixed mesh decimation to use pymeshlab
   instead of `trimesh.simplify_quadric_decimation` (incompatible with trimesh 4.11+
   fast_simplification API). Original backed up as `.bak`.

3. **`hy3dpaint/custom_rasterizer`** — Built from source for ROCm/HIP (auto-translated
   CUDA→HIP by PyTorch build system).

4. **`hy3dpaint/DifferentiableRenderer/mesh_inpaint_processor.cpp`** — Compiled pybind11
   extension for vertex-aware texture inpainting.

## Installed Dependencies

```
apt install blender                    # Blender 4.0.2 (for OBJ→GLB)
pip install realesrgan basicsr         # Image upscaling
pip install fast_simplification        # Mesh decimation
# custom_rasterizer built from source (ROCm/HIP)
# mesh_inpaint_processor compiled with pybind11
# RealESRGAN_x4plus.pth downloaded from GitHub releases
```

## Usage

```bash
# Single asset from text prompt
docker exec hunyuan3d python3 /workspace/generate_assets.py \
  --single "a cute cartoon fox" --name fox --category characters

# Single asset with reference image (skip text-to-image)
docker exec hunyuan3d python3 /workspace/generate_assets.py \
  --single "a penguin" --name penguin --category animals \
  --reference-image /path/to/image.png

# Shape only (no textures, faster)
docker exec hunyuan3d python3 /workspace/generate_assets.py \
  --single "a wooden bridge" --name bridge --category structures \
  --only-shape

# Batch from manifest
docker exec hunyuan3d python3 /workspace/generate_assets.py \
  --manifest /workspace/manifest.json

# Batch with phased mode (fewer model swaps for large batches)
docker exec hunyuan3d python3 /workspace/generate_assets.py \
  --manifest /workspace/manifest.json --phased

# Resume interrupted batch
docker exec hunyuan3d python3 /workspace/generate_assets.py \
  --manifest /workspace/manifest.json --resume
```

### Manifest Format

```json
{
  "assets": [
    {
      "name": "oak-tree",
      "category": "vegetation",
      "prompt": "a large oak tree with green leaves, stylized 3D game asset",
      "type": "static"
    },
    {
      "name": "fox-companion",
      "category": "characters",
      "prompt": "a cute cartoon fox, stylized colorful 3D character",
      "type": "animated"
    }
  ]
}
```

Output goes to `/workspace/output/{category}/{name}/`:
- `reference.png` — Generated reference image
- `reference_rgba.png` — Background-removed RGBA
- `{name}_shape.glb` — Untextured mesh
- `{name}.glb` — Final textured mesh (PBR)
- `{name}_textured.obj/jpg/mtl` — OBJ with texture maps

## Animation (Task 3 Findings)

### HunyuanMotion Does Not Exist
The repo `Tencent-Hunyuan/HunyuanMotion` is not public. Instead, Tencent released:

**HY-Motion 1.0** — Text-to-3D human motion generation
- GitHub: https://github.com/Tencent-Hunyuan/HY-Motion-1.0
- HuggingFace: https://huggingface.co/tencent/HY-Motion-1.0
- Requires 24-26GB VRAM (too large for our 20GB 7900 XT without offloading)
- Outputs FBX/BVH skeleton animations
- **Humanoid only** — no animals, creatures, or vegetation

### Recommended Animation Workflows

| Asset Type | Approach |
|-----------|----------|
| **Companions/NPCs** | Generate mesh → Auto-rig (Rigify/Blender) → HY-Motion 1.0 or Mixamo animations |
| **Vegetation** | Generate static mesh → Vertex shader wind displacement (no rigging needed) |
| **Vehicles** | Generate mesh → Manual bone rigging → Keyframe animation (wheel rotation, doors) |

### Key Tools
- **Rigify** (Blender built-in) — Auto-humanoid rigging
- **HY-Motion 1.0** — AI text-to-motion (24GB+ VRAM)
- **Mixamo** — 4000+ pre-made animation clips
- **Shader-based wind** — GPU vertex displacement for vegetation

## VRAM Budget (20GB 7900 XT)

```
SDXL-Turbo:       6.7GB  (text-to-image)
Hunyuan3D Shape:   7.0GB  (mesh generation)
Hunyuan3D Paint:   6.9GB  (texture painting, low-VRAM settings)
HY-Motion 1.0:   24-26GB ❌ (won't fit — needs offloading or different GPU)
```

Only one model loaded at a time. The pipeline swaps between stages.
