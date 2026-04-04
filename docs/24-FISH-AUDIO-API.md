# 24 — Fish Audio TTS API Reference

> How to call the self-hosted Fish Audio TTS on the Overwatch server (192.168.3.8)
> for batch voice generation. Model: **OpenAudio S1-Mini (0.5B)**.

---

## Server Details

| Item | Value |
|------|-------|
| **Host** | `192.168.3.8:8090` |
| **Container** | `fish-speech` (image: `fishaudio/fish-speech:latest`) |
| **Model** | `openaudio-s1-mini` — 0.5B param TTS, 13 languages |
| **GPU** | RTX 4060 (8GB) — LLM on GPU, codec on CPU |
| **Codec** | modded_dac_vq (44.1 kHz, ~21 tokens/sec) |
| **Speed** | ~11 tok/s LLM + ~1s CPU decode = ~20-30s per line |

## Startup

The container auto-applies patches on startup via `/app/references/fish_startup.sh`:
1. **torchaudio fix** — scope bug in `reference_loader.py`
2. **tiktoken tokenizer** — `AutoTokenizer` fallback for openaudio-s1-mini
3. **KV cache reduction** — `max_seq_len` 8192→3072 (saves ~0.6GB VRAM)
4. **hybrid decode** — tries GPU, falls back to CPU for codec

```bash
# Restart
ssh -i ~/.ssh/unraid_hive_key root@192.168.3.8 'docker restart fish-speech'

# Logs
ssh -i ~/.ssh/unraid_hive_key root@192.168.3.8 'docker logs fish-speech 2>&1 | tail -20'
```

---

## API Endpoints

### Health Check

```bash
curl http://192.168.3.8:8090/v1/health
# {"status":"ok"}
```

### Text-to-Speech

```bash
curl -X POST http://192.168.3.8:8090/v1/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to Nexus Academy.",
    "format": "wav",
    "temperature": 0.7,
    "top_p": 0.8,
    "max_new_tokens": 200
  }' \
  -o output.wav
```

**Request body (`ServeTTSRequest`):**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `text` | string | required | Text to synthesize |
| `format` | `wav\|mp3\|opus` | `wav` | Output audio format |
| `temperature` | float (0.1–1.0) | 0.8 | Generation randomness |
| `top_p` | float (0.1–1.0) | 0.8 | Nucleus sampling |
| `max_new_tokens` | int | 1024 | Max audio tokens (200≈9s) |
| `chunk_length` | int (100–1000) | 200 | Text chunk size in bytes |
| `reference_id` | string | null | Named reference voice |
| `references` | array | [] | Inline reference audio+text |
| `seed` | int | null | Reproducible generation |
| `repetition_penalty` | float (0.9–2.0) | 1.1 | Repetition suppression |
| `streaming` | bool | false | Stream WAV chunks |
| `normalize` | bool | true | Normalize numbers/text |

**Response:** Raw audio bytes with `Content-Type: audio/wav` (or `audio/mpeg`, `audio/ogg`).

### Reference Voices

```bash
# Add a reference voice
curl -X POST http://192.168.3.8:8090/v1/references/add \
  -F "id=nexus-voice" \
  -F "audio=@reference.wav" \
  -F "text=This is the reference text spoken in the audio."

# List references
curl http://192.168.3.8:8090/v1/references/list

# Delete
curl -X DELETE http://192.168.3.8:8090/v1/references/delete \
  -H "Content-Type: application/json" \
  -d '{"reference_id": "nexus-voice"}'
```

---

## Emotion & Tone Markers

The S1-Mini model supports inline markers in text:

**Emotions:** `(angry)` `(sad)` `(excited)` `(surprised)` `(warm)` `(proud)`
`(curious)` `(confident)` `(peaceful)` `(encouraging)` etc.

**Tones:** `(whispering)` `(soft tone)` `(shouting)` `(in a hurry tone)`

**Special:** `(laughing)` `(sighing)` `(chuckling)`

Example:
```json
{"text": "(warm) Welcome to Nexus Academy. (encouraging) Your journey begins now."}
```

---

## Batch Generation Script

```bash
# Generate all Priority 1 Nexus Voice lines
bash /home/blue/repo/athena/generate_nexus_voice.sh
```

For full 86K file automation, use a Python script:

```python
import requests, json, time
from pathlib import Path

API = "http://192.168.3.8:8090/v1/tts"

def generate(text, output_path, **kwargs):
    params = {
        "text": text,
        "format": "wav",
        "temperature": 0.7,
        "top_p": 0.8,
        "max_new_tokens": 200,
        **kwargs
    }
    r = requests.post(API, json=params, timeout=600)
    r.raise_for_status()
    Path(output_path).write_bytes(r.content)
    return len(r.content)

# Example batch
lines = [
    ("nv-welcome-01", "Welcome to Nexus Academy. Your journey begins now."),
    ("nv-welcome-02", "A new mind enters the Nexus."),
]
for line_id, text in lines:
    size = generate(text, f"content/audio/voice/nexus/{line_id}.wav")
    print(f"{line_id}: {size} bytes")
    time.sleep(1)  # Brief cooldown between requests
```

---

## Performance Notes

- **LLM generation:** ~11 tokens/sec on RTX 4060
- **Codec decode:** ~0.5s on GPU (small batches), ~1-20s on CPU
- **8GB VRAM constraint:** KV cache reduced from 8192→3072 tokens
- **Max audio per request:** ~200 tokens ≈ 9.5 seconds at 44.1kHz
- **For longer text:** Use `chunk_length` to split automatically
- **Docker CPU limit:** 2 cores on Unraid (codec decode is CPU-bound)

## Files on Server

```
/mnt/user/appdata/fish-speech/
├── checkpoints/
│   ├── openaudio-s1-mini/    # Active model
│   ├── fish-speech-1.5/      # Legacy (no matching codec in v2.0)
│   └── s2-pro/               # Incompatible codec
└── references/
    ├── fish_startup.sh        # Startup + patches
    ├── patch_tokenizer.py     # Tiktoken fallback
    ├── patch_kv_cache.py      # KV cache reduction
    ├── patch_hybrid_decode.py # GPU/CPU decode
    └── patch_cpu_decoder.py   # CPU decoder init
```

---

*Previous: [23-AUDIO_GENERATION_MANIFEST.md](23-AUDIO_GENERATION_MANIFEST.md)*
