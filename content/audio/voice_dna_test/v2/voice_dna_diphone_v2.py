#!/usr/bin/env python3
"""
Voice DNA v2 — Diphone Synthesis Engine
========================================
Proper diphone-level speech synthesis:
  1. Text → phonemes (g2p_en)
  2. Phonemes → diphone sequence
  3. Carrier word segmentation → diphone extraction (mid-transition ~100ms)
  4. Overlap-add stitching with 10ms crossfade at zero crossings
  5. WORLD vocoder (pyworld) for formant-preserving DSP variants

Usage:
    python3 voice_dna_diphone_v2.py
"""
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from scipy import signal as scipy_signal
from scipy.io import wavfile

try:
    import pyworld as pw
    HAS_PYWORLD = True
except ImportError:
    HAS_PYWORLD = False
    print("WARNING: pyworld not installed — DSP variants will use fallback")

from g2p_en import G2p

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SAMPLE_RATE = 24000
V2_DIR = Path(__file__).parent
CARRIERS_DIR = V2_DIR / "carriers"
ASSEMBLED_DIR = V2_DIR / "assembled"

# Diphone extraction: capture ~100ms around each phoneme boundary
DIPHONE_WINDOW_MS = 120       # total window around boundary
CROSSFADE_MS = 10             # overlap-add crossfade for stitching
SILENCE_BETWEEN_WORDS_MS = 40 # brief silence at word boundaries

# Energy segmentation
FRAME_MS = 10
HOP_MS = 5


# ---------------------------------------------------------------------------
# Data
# ---------------------------------------------------------------------------
@dataclass
class Diphone:
    """A single diphone unit: the transition from phoneme A to phoneme B."""
    left: str               # left phoneme (e.g., "L")
    right: str              # right phoneme (e.g., "EH1")
    audio: np.ndarray       # extracted transition audio
    source: str             # carrier word it came from
    stress: str             # stressed/normal/unstressed
    duration_ms: float = 0.0

@dataclass
class DiphoneLibrary:
    """Collection of extracted diphone units."""
    units: dict[str, list[Diphone]] = field(
        default_factory=lambda: defaultdict(list)
    )

    def key(self, left: str, right: str) -> str:
        return f"{left}-{right}"

    def add(self, dp: Diphone):
        self.units[self.key(dp.left, dp.right)].append(dp)

    def get(self, left: str, right: str, stress: str = "stressed") -> Diphone | None:
        key = self.key(left, right)
        candidates = self.units.get(key, [])
        if not candidates:
            return None
        # Prefer matching stress level
        for c in candidates:
            if c.stress == stress:
                return c
        return candidates[0]


# ---------------------------------------------------------------------------
# Audio I/O
# ---------------------------------------------------------------------------
def load_wav(path: Path) -> np.ndarray:
    sr, data = wavfile.read(str(path))
    if data.dtype == np.int16:
        data = data.astype(np.float64) / 32768.0
    elif data.dtype == np.float32:
        data = data.astype(np.float64)
    else:
        data = data.astype(np.float64)
    if data.ndim > 1:
        data = data[:, 0]
    if sr != SAMPLE_RATE:
        from scipy.signal import resample
        data = resample(data, int(len(data) * SAMPLE_RATE / sr))
    return data


def save_wav(path: Path, audio: np.ndarray, sr: int = SAMPLE_RATE):
    peak = np.max(np.abs(audio)) if len(audio) > 0 else 1.0
    if peak > 0:
        audio = audio * (0.707 / peak)
    int_data = np.clip(audio * 32767, -32768, 32767).astype(np.int16)
    wavfile.write(str(path), sr, int_data)
    print(f"  💾 {path.name} ({len(audio)/sr:.2f}s, {path.stat().st_size/1024:.0f}KB)")


# ---------------------------------------------------------------------------
# Energy-based phoneme boundary detection
# ---------------------------------------------------------------------------
def compute_rms_frames(audio: np.ndarray) -> np.ndarray:
    frame_size = int(SAMPLE_RATE * FRAME_MS / 1000)
    hop_size = int(SAMPLE_RATE * HOP_MS / 1000)
    n = max(1, (len(audio) - frame_size) // hop_size + 1)
    energy = np.zeros(n)
    for i in range(n):
        s = i * hop_size
        energy[i] = np.sqrt(np.mean(audio[s:s + frame_size] ** 2) + 1e-10)
    return energy


def find_speech_region(audio: np.ndarray) -> tuple[int, int]:
    """Find the start and end of speech in a carrier word."""
    frame_size = int(SAMPLE_RATE * FRAME_MS / 1000)
    hop_size = int(SAMPLE_RATE * HOP_MS / 1000)
    energy = compute_rms_frames(audio)
    peak = np.max(energy)
    if peak < 1e-8:
        return 0, len(audio)

    threshold = peak * 0.05  # 5% of peak
    above = energy > threshold

    # Find first and last frame above threshold
    frames_above = np.where(above)[0]
    if len(frames_above) == 0:
        return 0, len(audio)

    start_frame = frames_above[0]
    end_frame = frames_above[-1]

    start_sample = max(0, start_frame * hop_size - int(SAMPLE_RATE * 0.005))
    end_sample = min(len(audio), end_frame * hop_size + frame_size + int(SAMPLE_RATE * 0.005))
    return start_sample, end_sample


def segment_phonemes_in_carrier(audio: np.ndarray, phonemes: list[str]) -> list[tuple[int, int]]:
    """
    Estimate phoneme boundaries within a carrier word's speech region.
    Uses proportional duration allocation with energy-guided refinement.
    """
    start, end = find_speech_region(audio)
    speech = audio[start:end]
    n_phonemes = len(phonemes)

    if n_phonemes <= 1:
        return [(start, end)]

    # Initial estimate: equal duration per phoneme
    total_samples = end - start
    boundaries = []
    for i in range(n_phonemes):
        p_start = start + int(i * total_samples / n_phonemes)
        p_end = start + int((i + 1) * total_samples / n_phonemes)
        boundaries.append((p_start, p_end))

    # Refine boundaries using energy minima (phoneme transitions often have
    # energy dips, especially at stop consonants)
    frame_size = int(SAMPLE_RATE * FRAME_MS / 1000)
    hop_size = int(SAMPLE_RATE * HOP_MS / 1000)

    refined = [boundaries[0]]
    for i in range(1, len(boundaries)):
        prev_end = boundaries[i - 1][1]
        curr_start = boundaries[i][0]
        # Search for energy minimum near the boundary
        search_range = int(SAMPLE_RATE * 0.02)  # ±20ms
        s = max(start, prev_end - search_range)
        e = min(end, prev_end + search_range)
        if e - s > frame_size:
            local_energy = compute_rms_frames(audio[s:e])
            if len(local_energy) > 0:
                min_idx = np.argmin(local_energy)
                boundary = s + min_idx * hop_size
                refined.append((boundary, boundaries[i][1]))
                # Adjust previous segment's end
                refined[-2] = (refined[-2][0], boundary)
                continue
        refined.append(boundaries[i])

    return refined


# ---------------------------------------------------------------------------
# Diphone extraction
# ---------------------------------------------------------------------------
def extract_diphones_from_carrier(
    audio: np.ndarray,
    phonemes: list[str],
    source_id: str,
    stress: str,
) -> list[Diphone]:
    """
    Extract diphone units from a carrier word.
    Each diphone captures ~DIPHONE_WINDOW_MS around the phoneme boundary.
    """
    if not phonemes:
        return []

    # Full sequence including silence boundaries
    full_seq = ["SIL"] + phonemes + ["SIL"]
    # Boundaries for the phonemes (not SIL)
    phon_bounds = segment_phonemes_in_carrier(audio, phonemes)

    if len(phon_bounds) != len(phonemes):
        return []

    diphones = []
    window_samples = int(SAMPLE_RATE * DIPHONE_WINDOW_MS / 1000)
    half_window = window_samples // 2

    # SIL→first_phoneme: take first ~60ms of speech
    onset_end = min(phon_bounds[0][0] + window_samples, phon_bounds[0][1])
    onset_start = max(0, phon_bounds[0][0] - int(SAMPLE_RATE * 0.01))
    onset_audio = audio[onset_start:onset_end].copy()
    if len(onset_audio) > 0:
        diphones.append(Diphone(
            left="SIL", right=phonemes[0],
            audio=onset_audio, source=source_id, stress=stress,
            duration_ms=len(onset_audio) / SAMPLE_RATE * 1000,
        ))

    # Internal diphones: from phoneme[i] to phoneme[i+1]
    for i in range(len(phonemes) - 1):
        # Boundary between phoneme i and i+1
        boundary = phon_bounds[i][1]  # end of phoneme i = start of i+1

        dp_start = max(0, boundary - half_window)
        dp_end = min(len(audio), boundary + half_window)
        dp_audio = audio[dp_start:dp_end].copy()

        if len(dp_audio) > int(SAMPLE_RATE * 0.01):  # at least 10ms
            diphones.append(Diphone(
                left=phonemes[i], right=phonemes[i + 1],
                audio=dp_audio, source=source_id, stress=stress,
                duration_ms=len(dp_audio) / SAMPLE_RATE * 1000,
            ))

    # last_phoneme→SIL: take last ~60ms of speech
    offset_start = max(phon_bounds[-1][0], phon_bounds[-1][1] - window_samples)
    offset_end = min(len(audio), phon_bounds[-1][1] + int(SAMPLE_RATE * 0.01))
    offset_audio = audio[offset_start:offset_end].copy()
    if len(offset_audio) > 0:
        diphones.append(Diphone(
            left=phonemes[-1], right="SIL",
            audio=offset_audio, source=source_id, stress=stress,
            duration_ms=len(offset_audio) / SAMPLE_RATE * 1000,
        ))

    return diphones


# ---------------------------------------------------------------------------
# Text → phonemes
# ---------------------------------------------------------------------------
_g2p = None

def text_to_phonemes(text: str) -> list[list[str]]:
    """Convert text to a list of word-level phoneme sequences."""
    global _g2p
    if _g2p is None:
        _g2p = G2p()

    raw = _g2p(text)
    # Split by spaces into word-level groups
    words = []
    current = []
    for p in raw:
        if p == " ":
            if current:
                words.append(current)
                current = []
        else:
            current.append(p)
    if current:
        words.append(current)
    return words


def phonemes_to_diphone_sequence(word_phonemes: list[list[str]]) -> list[tuple[str, str, bool]]:
    """
    Convert word-level phoneme lists to a flat diphone sequence.
    Returns list of (left_phoneme, right_phoneme, is_word_boundary).
    """
    diphones = []
    for w_idx, phonemes in enumerate(word_phonemes):
        if not phonemes:
            continue

        # Word onset: SIL→first
        diphones.append(("SIL", phonemes[0], True))

        # Internal transitions
        for i in range(len(phonemes) - 1):
            diphones.append((phonemes[i], phonemes[i + 1], False))

        # Word offset: last→SIL
        diphones.append((phonemes[-1], "SIL", True))

    return diphones


# ---------------------------------------------------------------------------
# Diphone stitching with overlap-add
# ---------------------------------------------------------------------------
def find_zero_crossing(audio: np.ndarray, near: int, radius: int = 80) -> int:
    """Find nearest zero crossing to position 'near'."""
    s = max(0, near - radius)
    e = min(len(audio), near + radius)
    if e - s < 2:
        return near
    segment = audio[s:e]
    crossings = np.where(np.diff(np.sign(segment)))[0]
    if len(crossings) == 0:
        return near
    target = near - s
    return s + crossings[np.argmin(np.abs(crossings - target))]


def overlap_add_stitch(diphone_audio_list: list[np.ndarray],
                       is_word_boundary: list[bool]) -> np.ndarray:
    """
    Stitch diphone audio segments using overlap-add with crossfade.
    Inserts brief silence at word boundaries.
    """
    if not diphone_audio_list:
        return np.array([], dtype=np.float64)

    cf_samples = int(SAMPLE_RATE * CROSSFADE_MS / 1000)
    silence_samples = int(SAMPLE_RATE * SILENCE_BETWEEN_WORDS_MS / 1000)

    # Estimate total length
    total = sum(len(a) for a in diphone_audio_list)
    total += silence_samples * sum(is_word_boundary)
    output = np.zeros(total + SAMPLE_RATE, dtype=np.float64)

    pos = 0
    for i, audio in enumerate(diphone_audio_list):
        if len(audio) == 0:
            continue

        if i == 0:
            output[pos:pos + len(audio)] = audio
            pos += len(audio)
            continue

        # Insert silence at word boundaries
        if is_word_boundary[i]:
            pos += silence_samples

        # Overlap-add crossfade
        cf = min(cf_samples, len(audio) // 3, pos)
        if cf > 2:
            # Align to zero crossing for phase coherence
            zc = find_zero_crossing(output, pos - cf // 2)
            overlap_start = max(0, zc - cf // 2)
            actual_cf = min(cf, pos - overlap_start, len(audio))

            if actual_cf > 2:
                fade_out = 0.5 * (1 + np.cos(np.pi * np.arange(actual_cf) / actual_cf))
                fade_in = 0.5 * (1 - np.cos(np.pi * np.arange(actual_cf) / actual_cf))
                output[overlap_start:overlap_start + actual_cf] *= fade_out
                output[overlap_start:overlap_start + actual_cf] += audio[:actual_cf] * fade_in
                remaining = audio[actual_cf:]
                output[overlap_start + actual_cf:overlap_start + actual_cf + len(remaining)] = remaining
                pos = overlap_start + actual_cf + len(remaining)
            else:
                output[pos:pos + len(audio)] = audio
                pos += len(audio)
        else:
            output[pos:pos + len(audio)] = audio
            pos += len(audio)

    return output[:pos]


def compute_rms(audio: np.ndarray) -> float:
    return float(np.sqrt(np.mean(audio ** 2) + 1e-10))


# ---------------------------------------------------------------------------
# Sentence assembly
# ---------------------------------------------------------------------------
def assemble_sentence(lib: DiphoneLibrary, text: str,
                      stress: str = "stressed") -> tuple[np.ndarray, list[str]]:
    """
    Assemble a sentence from diphone units.
    Returns (audio, status_messages).
    """
    word_phonemes = text_to_phonemes(text)
    diphone_seq = phonemes_to_diphone_sequence(word_phonemes)

    audio_segments = []
    word_boundaries = []
    status = []

    for left, right, is_boundary in diphone_seq:
        dp = lib.get(left, right, stress)
        if dp:
            audio_segments.append(dp.audio.copy())
            word_boundaries.append(is_boundary)
            status.append(f"  ✅ {left:>5s}→{right:<5s} ({dp.duration_ms:.0f}ms from {dp.source})")
        else:
            # Try stripping stress markers for fuzzy match
            left_base = re.sub(r'\d', '', left)
            right_base = re.sub(r'\d', '', right)
            dp = lib.get(left_base, right_base, stress)
            if not dp:
                # Try any stress variant
                for s in ["stressed", "normal", "unstressed"]:
                    dp = lib.get(left, right, s)
                    if dp:
                        break
                    dp = lib.get(left_base, right_base, s)
                    if dp:
                        break
            if dp:
                audio_segments.append(dp.audio.copy())
                word_boundaries.append(is_boundary)
                status.append(f"  🔶 {left:>5s}→{right:<5s} ({dp.duration_ms:.0f}ms fuzzy from {dp.source})")
            else:
                # Generate silence for missing diphone
                silence = np.zeros(int(SAMPLE_RATE * 0.05))
                audio_segments.append(silence)
                word_boundaries.append(is_boundary)
                status.append(f"  ❌ {left:>5s}→{right:<5s} MISSING — inserted silence")

    # Normalize energy across segments before stitching
    rms_values = [compute_rms(a) for a in audio_segments if compute_rms(a) > 1e-6]
    if rms_values:
        target_rms = np.median(rms_values)
        for i, a in enumerate(audio_segments):
            rms = compute_rms(a)
            if rms > 1e-6:
                audio_segments[i] = a * (target_rms / rms)

    assembled = overlap_add_stitch(audio_segments, word_boundaries)
    return assembled, status


# ---------------------------------------------------------------------------
# DSP variants using WORLD vocoder
# ---------------------------------------------------------------------------
def world_pitch_shift(audio: np.ndarray, semitones: float,
                      sr: int = SAMPLE_RATE) -> np.ndarray:
    """Formant-preserving pitch shift via WORLD vocoder."""
    if not HAS_PYWORLD:
        return _fallback_pitch(audio, semitones, sr)
    factor = 2.0 ** (semitones / 12.0)
    a64 = audio.astype(np.float64)
    f0, t = pw.harvest(a64, sr, f0_floor=50, f0_ceil=500)
    sp = pw.cheaptrick(a64, f0, t, sr)
    ap = pw.d4c(a64, f0, t, sr)
    f0_shifted = f0 * factor
    result = pw.synthesize(f0_shifted, sp, ap, sr)
    result = _match_length_and_rms(result, audio)
    return result


def world_time_stretch(audio: np.ndarray, rate: float,
                       sr: int = SAMPLE_RATE) -> np.ndarray:
    """Time stretch preserving pitch via WORLD vocoder."""
    if not HAS_PYWORLD:
        return _fallback_speed(audio, rate)
    a64 = audio.astype(np.float64)
    f0, t = pw.harvest(a64, sr, f0_floor=50, f0_ceil=500)
    sp = pw.cheaptrick(a64, f0, t, sr)
    ap = pw.d4c(a64, f0, t, sr)
    n_out = int(len(f0) / rate)
    if n_out < 2:
        return audio
    idx = np.linspace(0, len(f0) - 1, n_out)
    f0s = np.interp(idx, np.arange(len(f0)), f0)
    ts = np.linspace(t[0], t[-1] / rate, n_out)
    sps = np.zeros((n_out, sp.shape[1]))
    aps = np.zeros((n_out, ap.shape[1]))
    for j in range(sp.shape[1]):
        sps[:, j] = np.interp(idx, np.arange(len(f0)), sp[:, j])
        aps[:, j] = np.interp(idx, np.arange(len(f0)), ap[:, j])
    result = pw.synthesize(f0s, sps, aps, sr)
    rms_orig = compute_rms(audio)
    rms_new = compute_rms(result)
    if rms_new > 1e-10:
        result *= rms_orig / rms_new
    return result


def world_breathy(audio: np.ndarray, amount: float = 0.3,
                  sr: int = SAMPLE_RATE) -> np.ndarray:
    """Breathy variant: increase aperiodicity in WORLD vocoder."""
    if not HAS_PYWORLD:
        return _fallback_breathy(audio, amount * 0.2)
    a64 = audio.astype(np.float64)
    f0, t = pw.harvest(a64, sr, f0_floor=50, f0_ceil=500)
    sp = pw.cheaptrick(a64, f0, t, sr)
    ap = pw.d4c(a64, f0, t, sr)
    ap_breathy = ap + amount * (1.0 - ap)
    ap_breathy = np.clip(ap_breathy, 0, 1)
    sp_breathy = sp * (1.0 - amount * 0.3)
    result = pw.synthesize(f0, sp_breathy, ap_breathy, sr)
    result = _match_length_and_rms(result, audio)
    return result


def _match_length_and_rms(result: np.ndarray, original: np.ndarray) -> np.ndarray:
    if len(result) > len(original):
        result = result[:len(original)]
    elif len(result) < len(original):
        result = np.pad(result, (0, len(original) - len(result)))
    rms_orig = compute_rms(original)
    rms_new = compute_rms(result)
    if rms_new > 1e-10:
        result *= rms_orig / rms_new
    return result


def _fallback_pitch(audio, semitones, sr):
    factor = 2.0 ** (semitones / 12.0)
    grain_ms, hop_ms = 30, 15
    gs = int(sr * grain_ms / 1000)
    hs = int(sr * hop_ms / 1000)
    n = max(1, (len(audio) - gs) // hs + 1)
    out = np.zeros(len(audio) + gs, dtype=np.float64)
    win = np.hanning(gs)
    for i in range(n):
        s = i * hs
        g = audio[s:s + gs].copy()
        if len(g) < gs:
            g = np.pad(g, (0, gs - len(g)))
        g *= win
        nl = int(gs / factor)
        if nl < 2:
            continue
        sh = np.interp(np.linspace(0, gs - 1, nl), np.arange(gs), g)
        if len(sh) < gs:
            sh = np.pad(sh, (0, gs - len(sh)))
        elif len(sh) > gs:
            sh = sh[:gs]
        sh *= win[:len(sh)]
        e = s + len(sh)
        if e <= len(out):
            out[s:e] += sh
    out = out[:len(audio)]
    return _match_length_and_rms(out, audio)


def _fallback_speed(audio, factor):
    n = int(len(audio) / factor)
    if n < 2:
        return audio
    return np.interp(np.linspace(0, len(audio) - 1, n), np.arange(len(audio)), audio)


def _fallback_breathy(audio, amount):
    noise = np.random.randn(len(audio)) * amount
    env = np.abs(audio)
    k = int(SAMPLE_RATE * 0.02)
    if k > 1:
        env = np.convolve(env, np.ones(k) / k, mode='same')
    shaped = noise * (env + 0.02)
    b, a = scipy_signal.butter(4, 3000 / (SAMPLE_RATE / 2), btype='low')
    shaped = scipy_signal.filtfilt(b, a, shaped)
    return audio + shaped


# ---------------------------------------------------------------------------
# Build library from carrier WAVs
# ---------------------------------------------------------------------------
def build_diphone_library(carriers_dir: Path, manifest: dict) -> DiphoneLibrary:
    """Extract diphones from all carrier word WAVs."""
    g2p = G2p()
    lib = DiphoneLibrary()
    total_extracted = 0

    for item_id, info in sorted(manifest.items()):
        wav_path = carriers_dir / info["file"]
        if not wav_path.exists():
            continue

        audio = load_wav(wav_path)
        text = info["text"]
        stress = info["stress"]

        # Get phonemes for this carrier
        raw_phonemes = g2p(text)
        # Flatten, splitting on spaces (word boundaries become SIL)
        word_groups = []
        current = []
        for p in raw_phonemes:
            if p == " ":
                if current:
                    word_groups.append(current)
                    current = []
            else:
                current.append(p)
        if current:
            word_groups.append(current)

        # For single words, extract diphones directly
        # For bigrams, extract cross-word diphones too
        if info["type"] == "word":
            if word_groups:
                phonemes = word_groups[0]
                dps = extract_diphones_from_carrier(audio, phonemes, item_id, stress)
                for dp in dps:
                    lib.add(dp)
                    total_extracted += 1
        elif info["type"] == "bigram":
            # For bigrams, we want the cross-word transition
            # Segment into two word regions, extract all diphones
            all_phonemes = []
            for wg in word_groups:
                all_phonemes.extend(wg)
            if all_phonemes:
                dps = extract_diphones_from_carrier(audio, all_phonemes, item_id, stress)
                for dp in dps:
                    lib.add(dp)
                    total_extracted += 1

    print(f"\n📚 Diphone Library built:")
    print(f"   {total_extracted} diphone units extracted")
    print(f"   {len(lib.units)} unique diphone types")
    return lib


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("🦊 Voice DNA v2 — Diphone Synthesis Engine")
    print("=" * 60)

    if HAS_PYWORLD:
        print("✅ pyworld available — WORLD vocoder for DSP")
    else:
        print("⚠️  pyworld not available — fallback DSP")

    # Load manifest
    manifest_path = CARRIERS_DIR / "manifest.json"
    if not manifest_path.exists():
        print(f"❌ No manifest at {manifest_path}")
        print("   Run diphone_gen.py on Chatterbox first, then copy carriers here.")
        sys.exit(1)

    with open(manifest_path) as f:
        manifest = json.load(f)
    print(f"\n📋 Loaded {len(manifest)} carrier items")

    # Build diphone library
    print("\n🔬 Extracting diphones from carriers...")
    lib = build_diphone_library(CARRIERS_DIR, manifest)

    # Show coverage
    print(f"\n📖 Diphone inventory (sample):")
    for key in sorted(lib.units.keys())[:30]:
        units = lib.units[key]
        stresses = set(u.stress for u in units)
        avg_ms = np.mean([u.duration_ms for u in units])
        print(f"   {key:12s} → {len(units)} variant(s), "
              f"avg {avg_ms:.0f}ms, stresses: {','.join(sorted(stresses))}")
    if len(lib.units) > 30:
        print(f"   ... and {len(lib.units) - 30} more")

    # Test sentences
    ASSEMBLED_DIR.mkdir(parents=True, exist_ok=True)

    test_sentences = [
        "Let us build a big boat",
        "The forest is beautiful today",
        "Come explore the garden with me",
    ]

    print("\n" + "=" * 60)
    print("🔧 ASSEMBLING TEST SENTENCES (diphone synthesis)")
    print("=" * 60)

    assembled_files = []

    for i, sentence in enumerate(test_sentences, 1):
        print(f"\n{'─' * 50}")
        print(f"  Sentence {i}: \"{sentence}\"")

        # Show phoneme breakdown
        word_phon = text_to_phonemes(sentence)
        print(f"  Phonemes: {word_phon}")
        print(f"{'─' * 50}")

        audio, status = assemble_sentence(lib, sentence)

        for s in status:
            print(s)

        found = sum(1 for s in status if "✅" in s or "🔶" in s)
        missing = sum(1 for s in status if "❌" in s)
        print(f"\n  Coverage: {found}/{found + missing} diphones found")

        if len(audio) > 0:
            fname = f"assembled_{i:02d}_{sentence.lower().replace(' ', '_')[:40]}.wav"
            out_path = ASSEMBLED_DIR / fname
            save_wav(out_path, audio)
            assembled_files.append((sentence, out_path, audio))

    # DSP variants
    print("\n" + "=" * 60)
    print("🎛️  DSP VARIANTS (WORLD vocoder — formant preserving)")
    print("=" * 60)

    if assembled_files:
        base_sent, _, base_audio = assembled_files[0]
        print(f"\n  Base: \"{base_sent}\"")
        print(f"  Generating 5 variants...\n")

        variants = [
            ("original", base_audio),
            ("pitch_up_15pct", world_pitch_shift(base_audio, 2.5)),
            ("pitch_down_15pct", world_pitch_shift(base_audio, -2.5)),
            ("faster_115x", world_time_stretch(base_audio, 1.15)),
            ("breathy", world_breathy(base_audio, 0.3)),
        ]

        for name, audio in variants:
            save_wav(ASSEMBLED_DIR / f"dsp_{name}.wav", audio)

    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)

    all_out = sorted(ASSEMBLED_DIR.glob("*.wav"))
    print(f"\n  {len(all_out)} output files:")
    for f in all_out:
        sr, d = wavfile.read(str(f))
        print(f"  📁 {f.name:55s} {f.stat().st_size/1024:6.1f}KB  {len(d)/sr:.2f}s")

    print(f"\n✅ Voice DNA v2 diphone synthesis complete!")
    print(f"   Library: {len(lib.units)} diphone types from {len(manifest)} carriers")
    print(f"   Key: each diphone IS a real voice transition — natural by construction\n")


if __name__ == "__main__":
    main()
