#!/usr/bin/env python3
"""
Voice DNA v2 — Diphone carrier generation for Chatterbox TTS.
Generates carrier words/phrases that cover all diphones needed for test sentences.

Run on the Chatterbox container:
    python3 -u /workspace/diphone_gen.py
"""
from __future__ import annotations
import os, sys, json, torch, soundfile as sf

# All unique words from the 3 test sentences
WORDS = [
    "let", "us", "build", "a", "big", "boat",
    "the", "forest", "is", "beautiful", "today",
    "come", "explore", "garden", "with", "me",
]

# Cross-word bigrams for between-word diphone transitions
BIGRAMS = [
    "let us", "us build", "build a", "a big", "big boat",
    "the forest", "forest is", "is beautiful", "beautiful today",
    "come explore", "explore the", "the garden", "garden with", "with me",
]

EXAG_LEVELS = {
    "stressed": 0.8,
    "normal": 0.5,
    "unstressed": 0.3,
}

OUT_DIR = "/workspace/voice_dna_v2_diphones"
REF_WAV = "/voices/philippa.wav"
SR = 24000


def main():
    from chatterbox.tts import ChatterboxTTS

    os.makedirs(OUT_DIR, exist_ok=True)

    print("Loading Chatterbox TTS model...")
    model = ChatterboxTTS.from_pretrained(device=torch.device("cuda"))
    print("Model loaded!")

    manifest = {}
    items = [(w, "word") for w in WORDS] + [(b, "bigram") for b in BIGRAMS]
    total = len(items) * len(EXAG_LEVELS)
    done = 0

    for text, item_type in items:
        for stress_name, exag in EXAG_LEVELS.items():
            done += 1
            safe_name = text.replace(" ", "_")
            file_id = f"{safe_name}_{stress_name}"
            out_path = os.path.join(OUT_DIR, f"{file_id}.wav")

            if os.path.exists(out_path) and os.path.getsize(out_path) > 500:
                print(f"[{done}/{total}] SKIP {file_id}")
                if file_id not in manifest:
                    manifest[file_id] = {
                        "text": text, "type": item_type,
                        "stress": stress_name, "exag": exag,
                        "file": f"{file_id}.wav",
                    }
                continue

            print(f"[{done}/{total}] {file_id}: \"{text}\" (exag={exag})")
            sys.stdout.flush()

            try:
                wav = model.generate(
                    text,
                    audio_prompt_path=REF_WAV,
                    exaggeration=exag,
                    cfg_weight=0.5,
                )
                if isinstance(wav, torch.Tensor):
                    wav = wav.squeeze().cpu().numpy()
                sf.write(out_path, wav, SR)
                dur = len(wav) / SR
                manifest[file_id] = {
                    "text": text, "type": item_type,
                    "stress": stress_name, "exag": exag,
                    "file": f"{file_id}.wav",
                    "samples": len(wav), "duration": round(dur, 2),
                }
                print(f"         -> {dur:.2f}s")
            except Exception as e:
                print(f"  ERROR: {e}")
            sys.stdout.flush()

    with open(os.path.join(OUT_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nDone: {len(manifest)} items generated")


if __name__ == "__main__":
    main()
