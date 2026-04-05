#!/usr/bin/env python3
"""
Voice DNA v2 Assembler
=======================
Phrase-level extraction, pitch/energy normalization, phase-aligned
crossfade stitching, and WORLD vocoder (pyworld) for DSP variants.

Fixes the v1 problems:
 1. Word-level extraction → PHRASE-level (2-4 words kept together)
 2. No normalization → F0 + RMS normalization across chunks
 3. 15ms crossfade → 40ms phase-aligned zero-crossing crossfade
 4. Naive pitch shift → WORLD vocoder (formant-preserving)

Usage:
    python3 voice_dna_assembler_v2.py
"""
from __future__ import annotations

import json
import math
import os
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

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SAMPLE_RATE = 24000

# v2 directories
V2_DIR = Path(__file__).parent
V1_DIR = V2_DIR.parent  # the original voice_dna_test dir
SOURCES_DIR = V2_DIR / "sources"
ASSEMBLED_DIR = V2_DIR / "assembled"

# Stitching parameters (v2 improvements)
CROSSFADE_MS = 40           # 40ms crossfade (was 15ms in v1)
SILENCE_GAP_MS = 50         # gap between stitched phrases
INTER_PHRASE_MS = 120       # pause at phrase boundaries

# Phrase segmentation parameters (v2: longer silence = phrase boundary)
FRAME_MS = 10
HOP_MS = 5
MIN_PHRASE_MS = 150         # minimum phrase duration (was 80ms "word" in v1)
PHRASE_SILENCE_MS = 300     # silence >= 300ms = phrase boundary (was 40ms in v1)
WORD_SILENCE_MS = 80        # silence >= 80ms but < 300ms = word boundary within phrase

# Energy segmentation
ENERGY_THRESHOLD_DB = -32

# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------
@dataclass
class PhraseChunk:
    """A multi-word audio phrase extracted from a carrier sentence."""
    audio: np.ndarray
    sample_rate: int
    source_id: str           # e.g. "exp-01"
    words: list[str]         # the words in this phrase
    phrase_text: str          # joined words
    word_indices: tuple[int, int]  # (start_idx, end_idx) in source
    mean_f0: float = 0.0
    rms_energy: float = 0.0

@dataclass
class VoiceDNAv2:
    """The v2 voice library — phrase-indexed."""
    # Multi-word phrase index: "let us" → [PhraseChunk, ...]
    phrase_index: dict[str, list[PhraseChunk]] = field(
        default_factory=lambda: defaultdict(list)
    )
    # Single-word index (fallback)
    word_index: dict[str, list[PhraseChunk]] = field(
        default_factory=lambda: defaultdict(list)
    )
    sample_rate: int = SAMPLE_RATE

# ---------------------------------------------------------------------------
# Audio I/O
# ---------------------------------------------------------------------------
def load_wav(path: Path) -> np.ndarray:
    """Load WAV as float64 mono [-1, 1]."""
    sr, data = wavfile.read(str(path))
    if sr != SAMPLE_RATE:
        # Resample if needed
        from scipy.signal import resample
        n_samples = int(len(data) * SAMPLE_RATE / sr)
        data = resample(data.astype(np.float64), n_samples)
    if data.dtype == np.int16:
        data = data.astype(np.float64) / 32768.0
    elif data.dtype == np.float32:
        data = data.astype(np.float64)
    else:
        data = data.astype(np.float64)
    if data.ndim > 1:
        data = data[:, 0]  # mono
    return data


def save_wav(path: Path, audio: np.ndarray, sr: int = SAMPLE_RATE):
    """Save float64 audio as 16-bit WAV, normalized to -3dB."""
    peak = np.max(np.abs(audio)) if len(audio) > 0 else 1.0
    if peak > 0:
        audio = audio * (0.707 / peak)  # normalize to -3dB
    int_data = np.clip(audio * 32767, -32768, 32767).astype(np.int16)
    wavfile.write(str(path), sr, int_data)
    print(f"  💾 Saved: {path.name} ({len(audio)/sr:.2f}s, {path.stat().st_size/1024:.0f}KB)")


# ---------------------------------------------------------------------------
# F0 estimation (autocorrelation-based)
# ---------------------------------------------------------------------------
def estimate_f0(audio: np.ndarray, sr: int = SAMPLE_RATE) -> float:
    """Estimate mean fundamental frequency using autocorrelation."""
    if len(audio) < sr * 0.05:
        return 0.0

    # Use pyworld if available (much better)
    if HAS_PYWORLD:
        audio_64 = audio.astype(np.float64)
        f0, _ = pw.harvest(audio_64, sr, f0_floor=50, f0_ceil=500)
        voiced = f0[f0 > 0]
        if len(voiced) > 0:
            return float(np.median(voiced))
        return 0.0

    # Fallback: autocorrelation
    frame_size = int(sr * 0.03)  # 30ms frames
    hop = frame_size // 2
    f0_values = []

    for start in range(0, len(audio) - frame_size, hop):
        frame = audio[start:start + frame_size]
        frame = frame * np.hanning(len(frame))

        corr = np.correlate(frame, frame, mode='full')
        corr = corr[len(corr) // 2:]

        # Find first peak after the initial decline
        min_lag = int(sr / 500)  # 500 Hz max
        max_lag = int(sr / 50)   # 50 Hz min

        if max_lag >= len(corr):
            continue

        search = corr[min_lag:max_lag]
        if len(search) == 0 or np.max(search) < corr[0] * 0.2:
            continue

        peak_idx = np.argmax(search) + min_lag
        if peak_idx > 0:
            f0_values.append(sr / peak_idx)

    if f0_values:
        return float(np.median(f0_values))
    return 0.0


def compute_rms(audio: np.ndarray) -> float:
    """Compute RMS energy of audio."""
    return float(np.sqrt(np.mean(audio ** 2) + 1e-10))


# ---------------------------------------------------------------------------
# Phrase-level segmentation (v2 key improvement)
# ---------------------------------------------------------------------------
def compute_rms_energy_frames(audio: np.ndarray, frame_size: int,
                              hop_size: int) -> np.ndarray:
    """Compute RMS energy per frame."""
    n_frames = max(1, (len(audio) - frame_size) // hop_size + 1)
    energy = np.zeros(n_frames)
    for i in range(n_frames):
        start = i * hop_size
        frame = audio[start:start + frame_size]
        energy[i] = np.sqrt(np.mean(frame ** 2) + 1e-10)
    return energy


def segment_words(audio: np.ndarray, expected_word_count: int) -> list[tuple[int, int]]:
    """
    Find word boundaries using energy-based detection.
    Returns list of (start_sample, end_sample) tuples — one per word.
    """
    frame_size = int(SAMPLE_RATE * FRAME_MS / 1000)
    hop_size = int(SAMPLE_RATE * HOP_MS / 1000)
    min_word_frames = int(80 / HOP_MS)       # 80ms minimum word
    min_silence_frames = int(40 / HOP_MS)    # 40ms minimum gap

    energy = compute_rms_energy_frames(audio, frame_size, hop_size)
    peak_energy = np.max(energy)
    if peak_energy < 1e-8:
        return [(0, len(audio))]

    energy_db = 20 * np.log10(energy / peak_energy + 1e-10)

    best_segments = None
    best_diff = float('inf')

    for threshold_db in np.arange(-45, -15, 1.0):
        is_speech = energy_db > threshold_db

        # Fill small silence gaps (within a word)
        smoothed = is_speech.copy()
        i = 0
        while i < len(smoothed):
            if not smoothed[i]:
                gap_start = i
                while i < len(smoothed) and not smoothed[i]:
                    i += 1
                if i - gap_start < min_silence_frames:
                    smoothed[gap_start:i] = True
            else:
                i += 1

        # Find contiguous speech regions
        segments = []
        i = 0
        while i < len(smoothed):
            if smoothed[i]:
                seg_start = i
                while i < len(smoothed) and smoothed[i]:
                    i += 1
                if i - seg_start >= min_word_frames:
                    start_sample = seg_start * hop_size
                    end_sample = min(i * hop_size + frame_size, len(audio))
                    segments.append((start_sample, end_sample))
            else:
                i += 1

        diff = abs(len(segments) - expected_word_count)
        if diff < best_diff:
            best_diff = diff
            best_segments = segments
        if diff == 0:
            break

    if not best_segments:
        return [(0, len(audio))]

    # Merge if too many segments
    while len(best_segments) > expected_word_count and len(best_segments) > 1:
        min_gap = float('inf')
        min_idx = 0
        for i in range(len(best_segments) - 1):
            gap = best_segments[i + 1][0] - best_segments[i][1]
            if gap < min_gap:
                min_gap = gap
                min_idx = i
        merged = (best_segments[min_idx][0], best_segments[min_idx + 1][1])
        best_segments = best_segments[:min_idx] + [merged] + best_segments[min_idx + 2:]

    # Split if too few segments
    while len(best_segments) < expected_word_count and len(best_segments) > 0:
        lengths = [e - s for s, e in best_segments]
        longest = np.argmax(lengths)
        s, e = best_segments[longest]
        mid = (s + e) // 2
        search_start = max(s, mid - SAMPLE_RATE // 10)
        search_end = min(e, mid + SAMPLE_RATE // 10)
        if search_end - search_start > frame_size:
            local_e = compute_rms_energy_frames(
                audio[search_start:search_end], frame_size, hop_size)
            split_frame = np.argmin(local_e)
            split_sample = search_start + split_frame * hop_size
            seg1 = (s, split_sample)
            seg2 = (split_sample, e)
            min_len = int(80 * SAMPLE_RATE / 1000)
            if seg1[1] - seg1[0] > min_len and seg2[1] - seg2[0] > min_len:
                best_segments = (best_segments[:longest] + [seg1, seg2]
                                 + best_segments[longest + 1:])
                continue
        break

    # Add 5ms padding
    pad = int(SAMPLE_RATE * 5 / 1000)
    return [(max(0, s - pad), min(len(audio), e + pad))
            for s, e in best_segments]


# ---------------------------------------------------------------------------
# Build the v2 voice DNA library
# ---------------------------------------------------------------------------
def clean_text(text: str) -> list[str]:
    """Clean text and split into words."""
    for ch in ".,!?;:\"'()-":
        text = text.replace(ch, "")
    return text.lower().split()


def build_voice_dna_v2(sources_dir: Path, manifest: dict,
                       v1_dir: Path | None = None,
                       v1_manifest: dict | None = None) -> VoiceDNAv2:
    """
    Build phrase-level voice DNA library.

    Strategy:
    1. Segment each source sentence into individual words
    2. For each consecutive span of 1-4 words, create a PhraseChunk using
       the ORIGINAL audio between word boundaries (preserves coarticulation)
    3. Index by phrase text for lookup during assembly
    """
    dna = VoiceDNAv2()
    total_phrases = 0

    def process_segment(seg_id: str, text: str, wav_path: Path):
        nonlocal total_phrases

        if not wav_path.exists():
            return

        words = clean_text(text)
        if not words:
            return

        audio = load_wav(wav_path)
        if len(audio) < SAMPLE_RATE * 0.1:
            return

        # Step 1: word-level segmentation
        word_bounds = segment_words(audio, len(words))
        n_matched = min(len(word_bounds), len(words))

        # Step 2: create phrase chunks for spans of 1-4 consecutive words
        for span in range(1, 5):  # 1, 2, 3, 4 word spans
            for start_idx in range(n_matched - span + 1):
                end_idx = start_idx + span
                phrase_words = words[start_idx:end_idx]
                phrase_text = " ".join(phrase_words)

                # Audio span: from start of first word to end of last word
                # This preserves natural coarticulation between words!
                audio_start = word_bounds[start_idx][0]
                audio_end = word_bounds[end_idx - 1][1]
                chunk_audio = audio[audio_start:audio_end].copy()

                if len(chunk_audio) < int(SAMPLE_RATE * 0.04):
                    continue

                # Gentle fade in/out
                fade = min(int(SAMPLE_RATE * 5 / 1000), len(chunk_audio) // 4)
                if fade > 0:
                    chunk_audio[:fade] *= np.linspace(0, 1, fade)
                    chunk_audio[-fade:] *= np.linspace(1, 0, fade)

                # Defer F0 estimation — only compute RMS during build
                # F0 is expensive; we compute it lazily during normalization
                rms = compute_rms(chunk_audio)

                chunk = PhraseChunk(
                    audio=chunk_audio,
                    sample_rate=SAMPLE_RATE,
                    source_id=seg_id,
                    words=phrase_words,
                    phrase_text=phrase_text,
                    word_indices=(start_idx, end_idx),
                    mean_f0=0.0,  # computed lazily
                    rms_energy=rms,
                )

                dna.phrase_index[phrase_text].append(chunk)
                total_phrases += 1

                # Also index single words for fallback
                if span == 1:
                    dna.word_index[phrase_text].append(chunk)

    # Process v2 sources
    print("  Loading v2 sources...")
    for seg_id, info in sorted(manifest.items()):
        wav_path = sources_dir / info.get("file", f"{seg_id}.wav")
        process_segment(seg_id, info["text"], wav_path)

    # Also incorporate v1 sources
    if v1_dir and v1_manifest:
        print("  Loading v1 sources for additional coverage...")
        for seg_id, info in sorted(v1_manifest.items()):
            wav_path = v1_dir / f"{seg_id}.wav"
            process_segment(f"v1_{seg_id}", info["text"], wav_path)

    unique_phrases = len([k for k in dna.phrase_index if len(k.split()) > 1])
    print(f"\n📚 Voice DNA v2 Library built:")
    print(f"   {total_phrases} phrase chunks total")
    print(f"   {unique_phrases} unique multi-word phrases")
    print(f"   {len(dna.word_index)} unique single words")
    return dna


# ---------------------------------------------------------------------------
# Pitch/energy normalization
# ---------------------------------------------------------------------------
def normalize_chunk(chunk: PhraseChunk, target_f0: float,
                    target_rms: float) -> np.ndarray:
    """
    Normalize a chunk's pitch and energy to match target values.
    Computes F0 lazily if not already computed.
    """
    audio = chunk.audio.copy()

    # RMS normalization
    current_rms = compute_rms(audio)
    if current_rms > 1e-8 and target_rms > 1e-8:
        audio *= target_rms / current_rms

    # Lazy F0 computation
    if chunk.mean_f0 == 0.0:
        chunk.mean_f0 = estimate_f0(chunk.audio)

    # F0 normalization via WORLD vocoder
    if HAS_PYWORLD and chunk.mean_f0 > 0 and target_f0 > 0:
        ratio = target_f0 / chunk.mean_f0
        if abs(ratio - 1.0) > 0.05:  # only shift if > 5% difference
            audio = world_pitch_shift(audio, ratio)

    return audio


def world_pitch_shift(audio: np.ndarray, f0_ratio: float,
                      sr: int = SAMPLE_RATE) -> np.ndarray:
    """Pitch shift using WORLD vocoder — preserves formants."""
    audio_64 = audio.astype(np.float64)
    f0, t = pw.harvest(audio_64, sr, f0_floor=50, f0_ceil=500)
    sp = pw.cheaptrick(audio_64, f0, t, sr)
    ap = pw.d4c(audio_64, f0, t, sr)

    # Shift F0
    f0_shifted = f0 * f0_ratio

    # Resynthesize
    result = pw.synthesize(f0_shifted, sp, ap, sr)

    # Match length
    if len(result) > len(audio):
        result = result[:len(audio)]
    elif len(result) < len(audio):
        result = np.pad(result, (0, len(audio) - len(result)))

    # Match RMS
    orig_rms = compute_rms(audio)
    new_rms = compute_rms(result)
    if new_rms > 1e-10:
        result *= orig_rms / new_rms

    return result


# ---------------------------------------------------------------------------
# Phrase matching — find best chunks for a target sentence
# ---------------------------------------------------------------------------
def find_phrase_coverage(dna: VoiceDNAv2, words: list[str]) -> list[PhraseChunk]:
    """
    Find the best phrase-level coverage for a sequence of words.
    Greedily matches the longest phrases first. Each chunk's audio
    contains exactly the matched words (no extra words).
    """
    n = len(words)
    chunks = []
    i = 0

    while i < n:
        best_chunk = None
        best_len = 0

        for phrase_len in range(min(4, n - i), 0, -1):
            phrase = " ".join(words[i:i + phrase_len])
            candidates = dna.phrase_index.get(phrase, [])
            if candidates:
                # Score candidates — prefer exact phrase matches
                scored = []
                for c in candidates:
                    score = 0
                    if c.phrase_text == phrase:
                        score += 20  # exact match — audio is perfect
                    elif len(c.words) == phrase_len:
                        score += 10
                    else:
                        continue  # skip non-exact matches
                    if c.mean_f0 > 0:
                        score += 1
                    scored.append((score, c))

                if scored:
                    scored.sort(key=lambda x: x[0], reverse=True)
                    best_chunk = scored[0][1]
                    best_len = phrase_len
                    break

        if best_chunk is None:
            # Single word fallback
            word = words[i]
            candidates = dna.word_index.get(word, [])
            if candidates:
                # Prefer chunks where word is the only word
                scored = [(10 if c.phrase_text == word else 0, c)
                          for c in candidates]
                scored.sort(key=lambda x: x[0], reverse=True)
                best_chunk = scored[0][1]
            else:
                best_chunk = _phoneme_fallback(dna, word)
            best_len = 1

        if best_chunk:
            chunks.append(best_chunk)
        i += best_len

    return chunks


def _phoneme_fallback(dna: VoiceDNAv2, target: str) -> PhraseChunk | None:
    """Find the closest phoneme match when exact word fails."""
    best_match = None
    best_score = 0

    for word, chunks in dna.word_index.items():
        prefix_len = sum(1 for a, b in zip(target, word) if a == b)
        suffix_len = sum(1 for a, b in zip(reversed(target), reversed(word)) if a == b)
        score = prefix_len * 2 + suffix_len
        if len(word) == len(target):
            score += 1
        if target in word or word in target:
            score += 3
        if score > best_score and score >= 2:
            best_score = score
            best_match = chunks[0]

    return best_match


# ---------------------------------------------------------------------------
# Phase-aligned crossfade stitching (v2)
# ---------------------------------------------------------------------------
def find_zero_crossing(audio: np.ndarray, near: int, search_range: int = 100) -> int:
    """Find the nearest zero crossing to position 'near'."""
    start = max(0, near - search_range)
    end = min(len(audio), near + search_range)
    if end - start < 2:
        return near

    segment = audio[start:end]
    # Find zero crossings
    signs = np.sign(segment)
    crossings = np.where(np.diff(signs))[0]

    if len(crossings) == 0:
        return near

    # Find crossing nearest to 'near'
    target = near - start
    nearest_idx = crossings[np.argmin(np.abs(crossings - target))]
    return start + nearest_idx


def stitch_phrases(chunks: list[PhraseChunk],
                   crossfade_ms: float = CROSSFADE_MS,
                   silence_ms: float = SILENCE_GAP_MS,
                   normalize: bool = True) -> np.ndarray:
    """
    Stitch phrase chunks with phase-aligned crossfade.
    Normalizes pitch and energy across chunks before stitching.
    """
    if not chunks:
        return np.array([], dtype=np.float64)

    # Compute target F0 and RMS
    # Lazily compute F0 for each chunk (only the selected chunks, not all)
    if normalize:
        for c in chunks:
            if c.mean_f0 == 0.0:
                c.mean_f0 = estimate_f0(c.audio)
    f0_values = [c.mean_f0 for c in chunks if c.mean_f0 > 0]
    rms_values = [c.rms_energy for c in chunks if c.rms_energy > 0]
    target_f0 = float(np.median(f0_values)) if f0_values else 0.0
    target_rms = float(np.median(rms_values)) if rms_values else 0.01

    crossfade_samples = int(SAMPLE_RATE * crossfade_ms / 1000)
    silence_samples = int(SAMPLE_RATE * silence_ms / 1000)

    # Prepare normalized audio for each chunk
    audio_segments = []
    for chunk in chunks:
        if normalize:
            audio = normalize_chunk(chunk, target_f0, target_rms)
        else:
            audio = chunk.audio.copy()
        audio_segments.append(audio)

    # Calculate total length
    total = sum(len(a) for a in audio_segments)
    total += silence_samples * (len(audio_segments) - 1)
    output = np.zeros(total + SAMPLE_RATE, dtype=np.float64)

    pos = 0
    for i, audio in enumerate(audio_segments):
        if i == 0:
            output[pos:pos + len(audio)] = audio
            pos += len(audio)
        else:
            # Add silence gap
            pos += silence_samples

            # Phase-aligned crossfade
            cf = min(crossfade_samples, len(audio) // 4, pos)
            if cf > 4:
                # Find zero crossings near the overlap boundaries
                overlap_start = find_zero_crossing(output, pos - cf)
                actual_cf = pos - overlap_start

                if actual_cf > 2 and actual_cf < len(audio):
                    # Raised cosine crossfade
                    fade_out = 0.5 * (1 + np.cos(np.pi * np.arange(actual_cf) / actual_cf))
                    fade_in = 0.5 * (1 - np.cos(np.pi * np.arange(actual_cf) / actual_cf))

                    output[overlap_start:pos] *= fade_out
                    audio_start = audio[:actual_cf] * fade_in
                    output[overlap_start:pos] += audio_start
                    output[pos:pos + len(audio) - actual_cf] = audio[actual_cf:]
                    pos += len(audio) - actual_cf
                else:
                    output[pos:pos + len(audio)] = audio
                    pos += len(audio)
            else:
                output[pos:pos + len(audio)] = audio
                pos += len(audio)

    output = output[:pos]

    # Gentle sentence-level prosody envelope
    n = len(output)
    if n > SAMPLE_RATE // 2:
        env = np.ones(n)
        rise = min(n // 8, SAMPLE_RATE // 4)
        fall = min(n // 5, SAMPLE_RATE // 3)
        env[:rise] = np.linspace(0.9, 1.0, rise)
        env[-fall:] = np.linspace(1.0, 0.75, fall)
        output *= env

    return output


# ---------------------------------------------------------------------------
# DSP variants using WORLD vocoder (v2 key improvement)
# ---------------------------------------------------------------------------
def world_formant_preserving_pitch(audio: np.ndarray, semitones: float,
                                    sr: int = SAMPLE_RATE) -> np.ndarray:
    """
    Pitch shift preserving formants using WORLD vocoder.
    Sounds like a different person, NOT tinny/robotic.
    """
    if not HAS_PYWORLD:
        return _fallback_pitch_shift(audio, semitones, sr)

    factor = 2.0 ** (semitones / 12.0)
    audio_64 = audio.astype(np.float64)

    # WORLD analysis
    f0, t = pw.harvest(audio_64, sr, f0_floor=50, f0_ceil=500)
    sp = pw.cheaptrick(audio_64, f0, t, sr)
    ap = pw.d4c(audio_64, f0, t, sr)

    # Shift F0 (formants in sp are unchanged → formant-preserving)
    f0_shifted = f0 * factor

    # Resynthesize
    result = pw.synthesize(f0_shifted, sp, ap, sr)

    # Match length
    if len(result) > len(audio):
        result = result[:len(audio)]
    elif len(result) < len(audio):
        result = np.pad(result, (0, len(audio) - len(result)))

    # Match RMS
    orig_rms = compute_rms(audio)
    new_rms = compute_rms(result)
    if new_rms > 1e-10:
        result *= orig_rms / new_rms

    return result


def world_time_stretch(audio: np.ndarray, rate: float,
                       sr: int = SAMPLE_RATE) -> np.ndarray:
    """
    Time stretch without pitch change using WORLD vocoder.
    rate > 1.0 = faster, rate < 1.0 = slower.
    """
    if not HAS_PYWORLD:
        return _fallback_speed(audio, rate)

    audio_64 = audio.astype(np.float64)

    # WORLD analysis
    f0, t = pw.harvest(audio_64, sr, f0_floor=50, f0_ceil=500)
    sp = pw.cheaptrick(audio_64, f0, t, sr)
    ap = pw.d4c(audio_64, f0, t, sr)

    # Time stretch by resampling the parameter tracks
    n_out = int(len(f0) / rate)
    if n_out < 2:
        return audio

    indices = np.linspace(0, len(f0) - 1, n_out)
    f0_stretched = np.interp(indices, np.arange(len(f0)), f0)
    t_stretched = np.linspace(t[0], t[-1] / rate, n_out)

    # Interpolate spectral envelope
    sp_stretched = np.zeros((n_out, sp.shape[1]))
    ap_stretched = np.zeros((n_out, ap.shape[1]))
    for j in range(sp.shape[1]):
        sp_stretched[:, j] = np.interp(indices, np.arange(len(f0)), sp[:, j])
        ap_stretched[:, j] = np.interp(indices, np.arange(len(f0)), ap[:, j])

    result = pw.synthesize(f0_stretched, sp_stretched, ap_stretched, sr)

    orig_rms = compute_rms(audio)
    new_rms = compute_rms(result)
    if new_rms > 1e-10:
        result *= orig_rms / new_rms

    return result


def world_breathy(audio: np.ndarray, amount: float = 0.3,
                  sr: int = SAMPLE_RATE) -> np.ndarray:
    """
    Create breathy voice variant using WORLD vocoder.
    Increases aperiodicity (aspiration noise) and reduces harmonic energy.
    """
    if not HAS_PYWORLD:
        return _fallback_breathy(audio, amount * 0.2)

    audio_64 = audio.astype(np.float64)

    # WORLD analysis
    f0, t = pw.harvest(audio_64, sr, f0_floor=50, f0_ceil=500)
    sp = pw.cheaptrick(audio_64, f0, t, sr)
    ap = pw.d4c(audio_64, f0, t, sr)

    # Increase aperiodicity to add breathiness
    # ap values range 0 (periodic) to 1 (aperiodic/noisy)
    ap_breathy = ap + amount * (1.0 - ap)
    ap_breathy = np.clip(ap_breathy, 0, 1)

    # Slightly reduce spectral energy in harmonics (breathier = less harmonic)
    sp_breathy = sp * (1.0 - amount * 0.3)

    result = pw.synthesize(f0, sp_breathy, ap_breathy, sr)

    if len(result) > len(audio):
        result = result[:len(audio)]
    elif len(result) < len(audio):
        result = np.pad(result, (0, len(audio) - len(result)))

    orig_rms = compute_rms(audio)
    new_rms = compute_rms(result)
    if new_rms > 1e-10:
        result *= orig_rms / new_rms

    return result


# ---------------------------------------------------------------------------
# Fallbacks when pyworld is not available
# ---------------------------------------------------------------------------
def _fallback_pitch_shift(audio: np.ndarray, semitones: float,
                          sr: int = SAMPLE_RATE) -> np.ndarray:
    factor = 2.0 ** (semitones / 12.0)
    grain_ms = 30
    hop_ms = 15
    grain_samples = int(sr * grain_ms / 1000)
    hop_samples = int(sr * hop_ms / 1000)

    n_grains = max(1, (len(audio) - grain_samples) // hop_samples + 1)
    output = np.zeros(len(audio) + grain_samples, dtype=np.float64)
    window = np.hanning(grain_samples)

    for i in range(n_grains):
        start = i * hop_samples
        end = min(start + grain_samples, len(audio))
        grain = audio[start:end].copy()
        if len(grain) < grain_samples:
            grain = np.pad(grain, (0, grain_samples - len(grain)))
        grain *= window
        new_len = int(grain_samples / factor)
        if new_len < 2:
            continue
        indices = np.linspace(0, grain_samples - 1, new_len)
        shifted = np.interp(indices, np.arange(grain_samples), grain)
        if len(shifted) < grain_samples:
            shifted = np.pad(shifted, (0, grain_samples - len(shifted)))
        elif len(shifted) > grain_samples:
            shifted = shifted[:grain_samples]
        shifted *= window[:len(shifted)]
        out_end = start + len(shifted)
        if out_end <= len(output):
            output[start:out_end] += shifted

    output = output[:len(audio)]
    orig_rms = compute_rms(audio)
    out_rms = compute_rms(output)
    if out_rms > 1e-10:
        output *= orig_rms / out_rms
    return output


def _fallback_speed(audio: np.ndarray, factor: float) -> np.ndarray:
    n_out = int(len(audio) / factor)
    if n_out < 2:
        return audio
    indices = np.linspace(0, len(audio) - 1, n_out)
    return np.interp(indices, np.arange(len(audio)), audio)


def _fallback_breathy(audio: np.ndarray, amount: float = 0.06) -> np.ndarray:
    noise = np.random.randn(len(audio)) * amount
    envelope = np.abs(audio)
    kernel_size = int(SAMPLE_RATE * 0.02)
    if kernel_size > 1:
        kernel = np.ones(kernel_size) / kernel_size
        envelope = np.convolve(envelope, kernel, mode='same')
    shaped = noise * (envelope + 0.02)
    b, a = scipy_signal.butter(4, 3000 / (SAMPLE_RATE / 2), btype='low')
    shaped = scipy_signal.filtfilt(b, a, shaped)
    return audio + shaped


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("🦊 Voice DNA v2 Assembler")
    print("   Phrase-level extraction + WORLD vocoder DSP")
    print("=" * 60)

    # Check pyworld
    if HAS_PYWORLD:
        print(f"\n✅ pyworld available — using WORLD vocoder for DSP")
    else:
        print(f"\n⚠️  pyworld not available — using fallback DSP")

    # Load v2 manifest
    v2_manifest_path = SOURCES_DIR / "manifest_v2.json"
    v2_manifest = {}
    if v2_manifest_path.exists():
        with open(v2_manifest_path) as f:
            v2_manifest = json.load(f)
        print(f"\n📋 v2 manifest: {len(v2_manifest)} segments")
    else:
        print(f"\n⚠️  No v2 manifest at {v2_manifest_path}")
        # Try alternate location
        alt_path = V2_DIR / "manifest_v2.json"
        if alt_path.exists():
            with open(alt_path) as f:
                v2_manifest = json.load(f)
            print(f"   Found at {alt_path}: {len(v2_manifest)} segments")

    # Load v1 manifest
    v1_manifest_path = V1_DIR / "manifest.json"
    v1_manifest = {}
    if v1_manifest_path.exists():
        with open(v1_manifest_path) as f:
            v1_manifest = json.load(f)
        print(f"📋 v1 manifest: {len(v1_manifest)} segments (for additional coverage)")

    # Build voice DNA library
    print("\n🔬 Building Voice DNA v2 library...")
    dna = build_voice_dna_v2(SOURCES_DIR, v2_manifest, V1_DIR, v1_manifest)

    # Show top phrases
    print(f"\n📖 Top indexed phrases (sample):")
    phrase_list = sorted(dna.phrase_index.keys(), key=lambda k: -len(k.split()))
    for phrase in phrase_list[:20]:
        n = len(dna.phrase_index[phrase])
        print(f"   \"{phrase}\" → {n} variant(s)")

    # Assemble test sentences
    ASSEMBLED_DIR.mkdir(parents=True, exist_ok=True)

    test_sentences = [
        "Let us build a big boat",
        "The forest is beautiful today",
        "Come explore the garden with me",
    ]

    print("\n" + "=" * 60)
    print("🔧 ASSEMBLING TEST SENTENCES (v2)")
    print("=" * 60)

    assembled_files = []

    for i, sentence in enumerate(test_sentences, 1):
        print(f"\n{'─' * 50}")
        print(f"  Sentence {i}: \"{sentence}\"")
        print(f"{'─' * 50}")

        words = clean_text(sentence)
        chunks = find_phrase_coverage(dna, words)

        for chunk in chunks:
            match_type = "PHRASE" if len(chunk.words) > 1 else "WORD"
            print(f"  ✅ [{match_type}] \"{chunk.phrase_text}\" ← {chunk.source_id}"
                  f" (F0={chunk.mean_f0:.0f}Hz, RMS={chunk.rms_energy:.4f})")

        audio = stitch_phrases(chunks)

        if len(audio) > 0:
            filename = f"assembled_{i:02d}_{sentence.lower().replace(' ', '_')[:40]}.wav"
            out_path = ASSEMBLED_DIR / filename
            save_wav(out_path, audio)
            assembled_files.append((sentence, out_path, audio))
        else:
            print("  ⚠️  No audio generated")

    # DSP voice variants using WORLD vocoder
    print("\n" + "=" * 60)
    print("🎛️  DSP VOICE VARIANTS (v2 — WORLD vocoder)")
    print("=" * 60)

    if assembled_files:
        base_sentence, base_path, base_audio = assembled_files[0]
        print(f"\n  Base: \"{base_sentence}\"")
        print(f"  Creating 5 formant-preserving variants...\n")

        # ~15% pitch = ~2.5 semitones
        variants = [
            ("original", base_audio),
            ("pitch_up_15pct",
             world_formant_preserving_pitch(base_audio, 2.5)),
            ("pitch_down_15pct",
             world_formant_preserving_pitch(base_audio, -2.5)),
            ("faster_115x",
             world_time_stretch(base_audio, 1.15)),
            ("breathy",
             world_breathy(base_audio, 0.3)),
        ]

        for name, audio in variants:
            out_path = ASSEMBLED_DIR / f"dsp_{name}.wav"
            save_wav(out_path, audio)

    # Summary
    print("\n" + "=" * 60)
    print("📊 v2 ASSEMBLY SUMMARY")
    print("=" * 60)

    all_outputs = sorted(ASSEMBLED_DIR.glob("*.wav"))
    print(f"\n  Output files: {len(all_outputs)}")
    for f in all_outputs:
        size_kb = f.stat().st_size / 1024
        try:
            sr, data = wavfile.read(str(f))
            dur = len(data) / sr
            print(f"  📁 {f.name:55s} {size_kb:6.1f}KB  {dur:.2f}s")
        except Exception:
            print(f"  📁 {f.name:55s} {size_kb:6.1f}KB")

    # Coverage analysis
    print(f"\n📊 PHRASE COVERAGE ANALYSIS:")
    for sent in test_sentences:
        words = clean_text(sent)
        chunks = find_phrase_coverage(dna, words)
        total_words_covered = sum(len(c.words) for c in chunks)
        phrase_chunks = [c for c in chunks if len(c.words) > 1]
        word_chunks = [c for c in chunks if len(c.words) == 1]
        print(f"  \"{sent}\"")
        print(f"    {len(phrase_chunks)} phrase chunks + {len(word_chunks)} word chunks"
              f" = {total_words_covered}/{len(words)} words covered")

    print("\n✅ Voice DNA v2 assembly complete!")
    print("   Key improvements over v1:")
    print("   • Phrase-level extraction (2-4 words kept together)")
    print("   • Pitch/energy normalization across chunks")
    print("   • 40ms phase-aligned crossfade (was 15ms)")
    if HAS_PYWORLD:
        print("   • WORLD vocoder DSP (formant-preserving, not tinny)")
    print("   Listen to assembled/ and compare with v1.\n")


if __name__ == "__main__":
    main()
