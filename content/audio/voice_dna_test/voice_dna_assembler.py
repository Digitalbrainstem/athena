#!/usr/bin/env python3
"""
Voice DNA Assembly Prototype
=============================
Loads pre-generated Fox voice segments, extracts individual words via
energy-based segmentation, builds a word→audio index, and stitches
new sentences from the extracted chunks with crossfade blending.

Also demonstrates DSP voice modification (pitch shift, speed, breathy).

Usage:
    python3 voice_dna_assembler.py
"""
from __future__ import annotations

import json
import os
import wave
import struct
import math
import sys
from pathlib import Path
from dataclasses import dataclass, field
from collections import defaultdict

import numpy as np
from scipy import signal as scipy_signal
from scipy.io import wavfile

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
AUDIO_DIR = Path(__file__).parent
MANIFEST_PATH = AUDIO_DIR / "manifest.json"
ASSEMBLED_DIR = AUDIO_DIR / "assembled"
SAMPLE_RATE = 24000
CROSSFADE_MS = 15          # milliseconds of raised-cosine crossfade
SILENCE_GAP_MS = 60        # silence between stitched words
INTER_PHRASE_MS = 140       # longer pause at commas / phrase boundaries

# Energy segmentation parameters
FRAME_MS = 10               # analysis frame size
HOP_MS = 5                  # hop between frames
ENERGY_THRESHOLD_DB = -35   # RMS threshold (dB below peak) for silence
MIN_WORD_MS = 80            # minimum word duration
MIN_SILENCE_MS = 40         # minimum silence gap between words

# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------
@dataclass
class AudioChunk:
    """A slice of audio associated with a word."""
    audio: np.ndarray       # float64 samples, mono
    sample_rate: int
    source_segment: str     # e.g. "ba", "full_hello"
    word: str               # the word this chunk represents
    word_index: int         # position in carrier sentence

@dataclass
class VoiceDNA:
    """The assembled voice library."""
    word_index: dict[str, list[AudioChunk]] = field(default_factory=lambda: defaultdict(list))
    sample_rate: int = SAMPLE_RATE

# ---------------------------------------------------------------------------
# Audio I/O helpers
# ---------------------------------------------------------------------------
def load_wav(path: Path) -> np.ndarray:
    """Load a WAV file as float64 numpy array normalized to [-1, 1]."""
    sr, data = wavfile.read(str(path))
    assert sr == SAMPLE_RATE, f"Expected {SAMPLE_RATE}Hz, got {sr}Hz for {path.name}"
    if data.dtype == np.int16:
        return data.astype(np.float64) / 32768.0
    elif data.dtype == np.float32:
        return data.astype(np.float64)
    return data.astype(np.float64)


def save_wav(path: Path, audio: np.ndarray, sr: int = SAMPLE_RATE):
    """Save float64 audio as 16-bit WAV."""
    peak = np.max(np.abs(audio)) if len(audio) > 0 else 1.0
    if peak > 1.0:
        audio = audio / peak
    elif peak > 0 and peak < 0.5:
        # Normalize to -3dB
        audio = audio * (0.707 / peak)
    int_data = np.clip(audio * 32767, -32768, 32767).astype(np.int16)
    wavfile.write(str(path), sr, int_data)
    print(f"  💾 Saved: {path.name} ({len(audio)/sr:.2f}s)")


# ---------------------------------------------------------------------------
# Energy-based word segmentation
# ---------------------------------------------------------------------------
def compute_rms_energy(audio: np.ndarray, frame_size: int, hop_size: int) -> np.ndarray:
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
    Returns list of (start_sample, end_sample) tuples.
    """
    frame_size = int(SAMPLE_RATE * FRAME_MS / 1000)
    hop_size = int(SAMPLE_RATE * HOP_MS / 1000)
    min_word_frames = int(MIN_WORD_MS / HOP_MS)
    min_silence_frames = int(MIN_SILENCE_MS / HOP_MS)

    energy = compute_rms_energy(audio, frame_size, hop_size)

    # Adaptive threshold: find a threshold that gives us approximately
    # the right number of word segments
    peak_energy = np.max(energy)
    if peak_energy < 1e-8:
        return [(0, len(audio))]

    energy_db = 20 * np.log10(energy / peak_energy + 1e-10)

    # Try different thresholds to find one that gives expected_word_count segments
    best_segments = None
    best_diff = float('inf')

    for threshold_db in np.arange(-45, -15, 1.0):
        is_speech = energy_db > threshold_db

        # Smooth: fill small silence gaps (likely within a word)
        smoothed = is_speech.copy()
        i = 0
        while i < len(smoothed):
            if not smoothed[i]:
                gap_start = i
                while i < len(smoothed) and not smoothed[i]:
                    i += 1
                gap_len = i - gap_start
                if gap_len < min_silence_frames:
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
                seg_end = i
                if seg_end - seg_start >= min_word_frames:
                    start_sample = seg_start * hop_size
                    end_sample = min(seg_end * hop_size + frame_size, len(audio))
                    segments.append((start_sample, end_sample))
            else:
                i += 1

        diff = abs(len(segments) - expected_word_count)
        if diff < best_diff:
            best_diff = diff
            best_segments = segments
        if diff == 0:
            break

    if best_segments is None:
        return [(0, len(audio))]

    # If we got more segments than words, merge the shortest gaps
    while len(best_segments) > expected_word_count and len(best_segments) > 1:
        # Find the smallest gap between consecutive segments
        min_gap = float('inf')
        min_gap_idx = 0
        for i in range(len(best_segments) - 1):
            gap = best_segments[i + 1][0] - best_segments[i][1]
            if gap < min_gap:
                min_gap = gap
                min_gap_idx = i
        # Merge segments at min_gap_idx and min_gap_idx + 1
        merged = (best_segments[min_gap_idx][0], best_segments[min_gap_idx + 1][1])
        best_segments = best_segments[:min_gap_idx] + [merged] + best_segments[min_gap_idx + 2:]

    # If we got fewer segments than words, try splitting the longest segment
    while len(best_segments) < expected_word_count and len(best_segments) > 0:
        # Find longest segment
        lengths = [e - s for s, e in best_segments]
        longest_idx = np.argmax(lengths)
        s, e = best_segments[longest_idx]
        mid = (s + e) // 2
        # Find a good split point near the middle (lowest energy)
        search_start = max(s, mid - SAMPLE_RATE // 10)
        search_end = min(e, mid + SAMPLE_RATE // 10)
        if search_end - search_start > frame_size:
            local_energy = compute_rms_energy(audio[search_start:search_end], frame_size, hop_size)
            split_frame = np.argmin(local_energy)
            split_sample = search_start + split_frame * hop_size
            seg1 = (s, split_sample)
            seg2 = (split_sample, e)
            if seg1[1] - seg1[0] > MIN_WORD_MS * SAMPLE_RATE // 1000 and \
               seg2[1] - seg2[0] > MIN_WORD_MS * SAMPLE_RATE // 1000:
                best_segments = best_segments[:longest_idx] + [seg1, seg2] + best_segments[longest_idx + 1:]
                continue
        break

    # Add small padding around each segment for natural attack/release
    pad_samples = int(SAMPLE_RATE * 5 / 1000)  # 5ms padding
    padded = []
    for s, e in best_segments:
        s = max(0, s - pad_samples)
        e = min(len(audio), e + pad_samples)
        padded.append((s, e))

    return padded


# ---------------------------------------------------------------------------
# Build the voice DNA library
# ---------------------------------------------------------------------------
def build_voice_dna(audio_dir: Path, manifest: dict) -> VoiceDNA:
    """Load all segments, extract words, build the index."""
    dna = VoiceDNA()
    total_words = 0

    for seg_id, seg_info in sorted(manifest.items()):
        wav_path = audio_dir / f"{seg_id}.wav"
        if not wav_path.exists():
            print(f"  ⚠️  Missing: {wav_path.name}")
            continue

        text = seg_info["text"]
        # Clean text: remove punctuation, lowercase, split into words
        clean = text.replace(".", "").replace("!", "").replace(",", "").replace("?", "")
        words = clean.lower().split()

        audio = load_wav(wav_path)

        # Segment the audio into word-level chunks
        segments = segment_words(audio, len(words))

        if len(segments) != len(words):
            print(f"  ⚠️  {seg_id}: expected {len(words)} words, got {len(segments)} segments")
            # Use what we can — zip will stop at the shorter one
            # But try to align from the start
            pass

        for i, ((start, end), word) in enumerate(zip(segments, words)):
            chunk_audio = audio[start:end].copy()

            # Apply gentle fade in/out to avoid clicks
            fade_samples = min(int(SAMPLE_RATE * 3 / 1000), len(chunk_audio) // 4)
            if fade_samples > 0:
                fade_in = np.linspace(0, 1, fade_samples)
                fade_out = np.linspace(1, 0, fade_samples)
                chunk_audio[:fade_samples] *= fade_in
                chunk_audio[-fade_samples:] *= fade_out

            chunk = AudioChunk(
                audio=chunk_audio,
                sample_rate=SAMPLE_RATE,
                source_segment=seg_id,
                word=word,
                word_index=i,
            )
            dna.word_index[word].append(chunk)
            total_words += 1

    print(f"\n📚 Voice DNA Library built:")
    print(f"   {total_words} word chunks from {len(manifest)} segments")
    print(f"   {len(dna.word_index)} unique words indexed")
    return dna


# ---------------------------------------------------------------------------
# Word matching — find the best chunk for a given target word
# ---------------------------------------------------------------------------
def find_best_chunk(dna: VoiceDNA, word: str, prev_word: str | None = None,
                    next_word: str | None = None) -> AudioChunk | None:
    """
    Find the best audio chunk for a word. Prefers chunks where surrounding
    context (previous/next word) matches for better coarticulation.
    """
    candidates = dna.word_index.get(word, [])
    if not candidates:
        return None

    if len(candidates) == 1:
        return candidates[0]

    # Score candidates by context match
    scored = []
    for chunk in candidates:
        score = 0
        # Prefer chunks from full sentences (better prosody)
        if chunk.source_segment.startswith("full_") or \
           chunk.source_segment.startswith("gn_") or \
           chunk.source_segment.startswith("cu_"):
            score += 1

        # Prefer chunks where the neighboring words match
        seg_words = _get_segment_words(chunk.source_segment)
        if seg_words:
            idx = chunk.word_index
            if prev_word and idx > 0 and idx <= len(seg_words) and seg_words[idx - 1] == prev_word:
                score += 3  # coarticulation match is very valuable
            if next_word and idx < len(seg_words) - 1 and seg_words[idx + 1] == next_word:
                score += 3

        scored.append((score, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[0][1]


_segment_words_cache: dict[str, list[str]] = {}

def _get_segment_words(seg_id: str) -> list[str]:
    """Get word list for a segment from the manifest (cached)."""
    return _segment_words_cache.get(seg_id, [])


# ---------------------------------------------------------------------------
# Sentence assembly with crossfade stitching
# ---------------------------------------------------------------------------
def raised_cosine_window(length: int) -> np.ndarray:
    """Generate a raised cosine (Hann) window for crossfading."""
    return 0.5 * (1 - np.cos(np.pi * np.arange(length) / length))


def stitch_chunks(chunks: list[AudioChunk], 
                  crossfade_ms: float = CROSSFADE_MS,
                  silence_ms: float = SILENCE_GAP_MS) -> np.ndarray:
    """
    Stitch audio chunks together with crossfade overlap and silence gaps.
    Returns assembled float64 audio.
    """
    if not chunks:
        return np.array([], dtype=np.float64)

    crossfade_samples = int(SAMPLE_RATE * crossfade_ms / 1000)
    silence_samples = int(SAMPLE_RATE * silence_ms / 1000)

    # Calculate total output length
    total = len(chunks[0].audio)
    for chunk in chunks[1:]:
        total += silence_samples + len(chunk.audio)

    output = np.zeros(total + SAMPLE_RATE, dtype=np.float64)  # extra buffer
    pos = 0

    for i, chunk in enumerate(chunks):
        audio = chunk.audio.copy()

        if i == 0:
            output[pos:pos + len(audio)] = audio
            pos += len(audio)
        else:
            # Add silence gap
            pos += silence_samples

            # Crossfade overlap with previous audio
            cf = min(crossfade_samples, len(audio) // 4, pos)
            if cf > 2:
                fade_out = raised_cosine_window(cf)[::-1]  # 1→0
                fade_in = raised_cosine_window(cf)          # 0→1

                # Blend overlap region
                overlap_start = pos - cf
                output[overlap_start:pos] *= fade_out
                audio[:cf] *= fade_in
                output[overlap_start:pos] += audio[:cf]
                output[pos:pos + len(audio) - cf] = audio[cf:]
                pos += len(audio) - cf
            else:
                output[pos:pos + len(audio)] = audio
                pos += len(audio)

    # Trim to actual content
    output = output[:pos]

    # Apply gentle prosody curve: slight pitch rise at start, fall at end
    # (This is an amplitude envelope, true pitch would need resampling)
    n = len(output)
    if n > SAMPLE_RATE // 2:
        env = np.ones(n)
        rise_len = min(n // 6, SAMPLE_RATE // 4)
        fall_len = min(n // 4, SAMPLE_RATE // 3)
        # Gentle amplitude rise at start
        env[:rise_len] = np.linspace(0.85, 1.0, rise_len)
        # Gentle amplitude fall at end
        env[-fall_len:] = np.linspace(1.0, 0.7, fall_len)
        output *= env

    return output


def assemble_sentence(dna: VoiceDNA, sentence: str) -> tuple[np.ndarray, list[str]]:
    """
    Assemble a sentence from voice DNA chunks.
    Returns (audio, list_of_status_per_word).
    """
    words = sentence.lower().replace(".", "").replace("!", "").replace(",", "").replace("?", "").split()
    chunks = []
    status = []

    for i, word in enumerate(words):
        prev_w = words[i - 1] if i > 0 else None
        next_w = words[i + 1] if i < len(words) - 1 else None

        chunk = find_best_chunk(dna, word, prev_w, next_w)
        if chunk:
            chunks.append(chunk)
            status.append(f"✅ '{word}' ← {chunk.source_segment}[{chunk.word_index}]")
        else:
            # Try phoneme-level fallback: find chunks that start with same sound
            fallback = _phoneme_fallback(dna, word)
            if fallback:
                chunks.append(fallback)
                status.append(f"🔶 '{word}' ≈ '{fallback.word}' (phoneme match from {fallback.source_segment})")
            else:
                status.append(f"❌ '{word}' — NO MATCH")

    audio = stitch_chunks(chunks)
    return audio, status


def _phoneme_fallback(dna: VoiceDNA, target: str) -> AudioChunk | None:
    """
    When exact word match fails, find the closest phoneme match.
    Strategy: look for words sharing the longest common prefix or suffix.
    """
    best_match = None
    best_score = 0

    for word, chunks in dna.word_index.items():
        # Score by shared prefix length
        prefix_len = 0
        for a, b in zip(target, word):
            if a == b:
                prefix_len += 1
            else:
                break

        # Score by shared suffix length
        suffix_len = 0
        for a, b in zip(reversed(target), reversed(word)):
            if a == b:
                suffix_len += 1
            else:
                break

        # Combined score weighted toward prefix (onset matters more)
        score = prefix_len * 2 + suffix_len
        # Bonus if same length
        if len(word) == len(target):
            score += 1
        # Bonus if word contains target or vice versa
        if target in word or word in target:
            score += 3

        if score > best_score and score >= 2:
            best_score = score
            best_match = chunks[0]

    return best_match


# ---------------------------------------------------------------------------
# DSP Voice Modifications
# ---------------------------------------------------------------------------
def pitch_shift(audio: np.ndarray, semitones: float, sr: int = SAMPLE_RATE) -> np.ndarray:
    """
    Pitch shift using resampling approach.
    Positive semitones = higher pitch, negative = lower.
    """
    factor = 2.0 ** (semitones / 12.0)
    # Resample to change pitch, then resample back to original length
    n_samples = len(audio)
    # Stretch by resampling at different rate
    stretched_len = int(n_samples / factor)
    if stretched_len < 2:
        return audio
    indices = np.linspace(0, n_samples - 1, stretched_len)
    shifted = np.interp(indices, np.arange(n_samples), audio)
    # Resample back to original sample rate (this changes duration; 
    # for true pitch shift without duration change, use overlap-add)
    # For this prototype, we accept slight duration change
    return shifted


def change_speed(audio: np.ndarray, factor: float) -> np.ndarray:
    """Change playback speed by resampling. factor > 1 = faster."""
    n_out = int(len(audio) / factor)
    if n_out < 2:
        return audio
    indices = np.linspace(0, len(audio) - 1, n_out)
    return np.interp(indices, np.arange(len(audio)), audio)


def add_breathiness(audio: np.ndarray, amount: float = 0.08) -> np.ndarray:
    """Add a subtle breath noise layer for warmth."""
    noise = np.random.randn(len(audio)) * amount
    # Shape noise to follow audio envelope (louder where speech is)
    envelope = np.abs(audio)
    # Smooth envelope
    kernel_size = int(SAMPLE_RATE * 0.02)  # 20ms smoothing
    if kernel_size > 1:
        kernel = np.ones(kernel_size) / kernel_size
        envelope = np.convolve(envelope, kernel, mode='same')
    shaped_noise = noise * (envelope + 0.02)  # small baseline
    # Apply low-pass to noise (breath is mostly low-frequency)
    b, a = scipy_signal.butter(4, 3000 / (SAMPLE_RATE / 2), btype='low')
    shaped_noise = scipy_signal.filtfilt(b, a, shaped_noise)
    return audio + shaped_noise


def pitch_shift_preserving_duration(audio: np.ndarray, semitones: float,
                                     sr: int = SAMPLE_RATE) -> np.ndarray:
    """
    Pitch shift with PSOLA-like approach preserving duration.
    Uses overlap-add with resampled grains.
    """
    factor = 2.0 ** (semitones / 12.0)
    grain_ms = 30  # 30ms grains
    hop_ms = 15    # 50% overlap
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

        # Apply window
        grain *= window

        # Resample grain for pitch shift
        new_len = int(grain_samples / factor)
        if new_len < 2:
            continue
        indices = np.linspace(0, grain_samples - 1, new_len)
        shifted_grain = np.interp(indices, np.arange(grain_samples), grain)

        # Re-window to original size
        if len(shifted_grain) < grain_samples:
            shifted_grain = np.pad(shifted_grain, (0, grain_samples - len(shifted_grain)))
        elif len(shifted_grain) > grain_samples:
            shifted_grain = shifted_grain[:grain_samples]

        shifted_grain *= window[:len(shifted_grain)]

        # Overlap-add
        out_start = start
        out_end = out_start + len(shifted_grain)
        if out_end <= len(output):
            output[out_start:out_end] += shifted_grain

    # Trim to original length
    output = output[:len(audio)]

    # Normalize to match original level
    orig_rms = np.sqrt(np.mean(audio ** 2) + 1e-10)
    out_rms = np.sqrt(np.mean(output ** 2) + 1e-10)
    if out_rms > 1e-10:
        output *= orig_rms / out_rms

    return output


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("🦊 Voice DNA Assembly Prototype")
    print("=" * 60)

    # Load manifest
    with open(MANIFEST_PATH) as f:
        manifest = json.load(f)
    print(f"\n📋 Loaded manifest: {len(manifest)} segments")

    # Pre-cache segment word lists
    for seg_id, seg_info in manifest.items():
        text = seg_info["text"]
        clean = text.replace(".", "").replace("!", "").replace(",", "").replace("?", "")
        _segment_words_cache[seg_id] = clean.lower().split()

    # Build voice DNA library
    print("\n🔬 Building Voice DNA library...")
    dna = build_voice_dna(AUDIO_DIR, manifest)

    # Show vocabulary
    print(f"\n📖 Vocabulary ({len(dna.word_index)} words):")
    for word in sorted(dna.word_index.keys()):
        sources = [c.source_segment for c in dna.word_index[word]]
        print(f"   {word:15s} → {len(sources)} variant(s) from: {', '.join(sources[:5])}")

    # Assemble test sentences
    ASSEMBLED_DIR.mkdir(parents=True, exist_ok=True)

    test_sentences = [
        "Let us build a big boat",
        "The forest is beautiful today",
        "Come explore the garden with me",
    ]

    print("\n" + "=" * 60)
    print("🔧 ASSEMBLING TEST SENTENCES")
    print("=" * 60)

    assembled_files = []

    for i, sentence in enumerate(test_sentences, 1):
        print(f"\n{'─' * 50}")
        print(f"  Sentence {i}: \"{sentence}\"")
        print(f"{'─' * 50}")

        audio, status = assemble_sentence(dna, sentence)

        for s in status:
            print(f"  {s}")

        if len(audio) > 0:
            filename = f"assembled_{i:02d}_{sentence.lower().replace(' ', '_')[:40]}.wav"
            out_path = ASSEMBLED_DIR / filename
            save_wav(out_path, audio)
            assembled_files.append((sentence, out_path, audio))
        else:
            print("  ⚠️  No audio generated — too many missing words")

    # DSP voice modification test
    print("\n" + "=" * 60)
    print("🎛️  DSP VOICE MODIFICATION TEST")
    print("=" * 60)

    if assembled_files:
        base_sentence, base_path, base_audio = assembled_files[0]
        print(f"\n  Base sentence: \"{base_sentence}\"")
        print(f"  Creating 5 variants...\n")

        variants = [
            ("original",       base_audio),
            ("pitch_up_15pct", pitch_shift_preserving_duration(base_audio, 2.5)),   # ~15% up ≈ 2.5 semitones
            ("pitch_down_15pct", pitch_shift_preserving_duration(base_audio, -2.5)), # ~15% down
            ("faster_115x",    change_speed(base_audio, 1.15)),
            ("breathy",        add_breathiness(base_audio, 0.06)),
        ]

        for name, audio in variants:
            filename = f"dsp_{name}.wav"
            out_path = ASSEMBLED_DIR / filename
            save_wav(out_path, audio)

    # Summary
    print("\n" + "=" * 60)
    print("📊 ASSEMBLY SUMMARY")
    print("=" * 60)

    all_outputs = list(ASSEMBLED_DIR.glob("*.wav"))
    print(f"\n  Total output files: {len(all_outputs)}")
    for f in sorted(all_outputs):
        size_kb = f.stat().st_size / 1024
        try:
            sr, data = wavfile.read(str(f))
            dur = len(data) / sr
            print(f"  📁 {f.name:50s} {size_kb:6.1f}KB  {dur:.2f}s")
        except Exception:
            print(f"  📁 {f.name:50s} {size_kb:6.1f}KB")

    # Coverage analysis for target sentences
    print(f"\n📊 WORD COVERAGE ANALYSIS:")
    all_target_words = set()
    for s in test_sentences:
        all_target_words.update(s.lower().split())

    found = sum(1 for w in all_target_words if w in dna.word_index)
    print(f"  Target words: {len(all_target_words)}")
    print(f"  Exact matches: {found}/{len(all_target_words)}")
    missing = [w for w in sorted(all_target_words) if w not in dna.word_index]
    if missing:
        print(f"  Missing (need phoneme fallback): {', '.join(missing)}")

    print("\n✅ Voice DNA assembly prototype complete!")
    print("   Listen to the WAVs in assembled/ to evaluate quality.")
    print("   Key question: Does stitched output sound natural or robotic?\n")


if __name__ == "__main__":
    main()
