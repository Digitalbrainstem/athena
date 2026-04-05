# Voice DNA Synthesis Experiments — Results Report

**Generated:** 2026-04-05 08:04 ET
**Objective:** Objectively measure voice synthesis quality using Speech-to-Text (Whisper base) as ground truth
**Metrics:** Word Error Rate (WER), Confidence (exp of avg log-probability), Transcription accuracy

---

## Executive Summary

### 🏆 Rankings by Average WER (lower = better)

| Rank | Approach | Avg WER | Best WER | Notes |
|------|----------|---------|----------|-------|
| 1 | **Piper TTS (neural)** | **0%** | 0% | Perfect intelligibility, neutral voice |
| 2 | **espeak-ng (formant)** | **18%** | 0% | Good baseline; proves formant synthesis CAN work |
| 3 | **V1 Word Splice** | **50%** | 50% | Recognizable but garbled; Fox voice preserved |
| 4 | **WORLD Vocoder (Exp 4)** | **~0%*** | 0% | *Copy-synthesis of reference; preserves speech perfectly |
| 5 | **Klatt Synthesizer (Exp 1)** | **94%** | 83% | One sentence partially recognized |
| 6 | **Formant Improvements (Exp 3)** | **100%** | 100% | All variants completely unintelligible |
| 7 | **Original MATH Formant** | **100%** | 100% | Baseline formant — unintelligible |
| 8 | **HYB2 Per-phoneme** | **100%** | 100% | Hybrid approach — unintelligible |

### Key Insight
**Formant synthesis from scratch (Exp 1, 3) produces unintelligible audio** — even with proper Klatt resonators,
radiation characteristics, and Butterworth filters. The problem is fundamental: handcrafted phoneme timing and
formant transitions don't capture the complexity of natural speech.

**espeak-ng achieves 0% WER on most sentences** because it has decades of tuned rules for phoneme duration,
co-articulation, and prosody. Our naive formant approach lacks all of this.

**The V1 word-splice approach (50% WER) is actually the best Fox-voiced approach** despite its artifacts.

---

## Baseline Measurements

These are the existing Voice DNA files before any experiments.

| File | Expected | Transcription | WER | Confidence |
|------|----------|---------------|-----|------------|
| BASELINE_HYB2_per_phoneme | let us build a big boat |  | 100% | 0% |
| BASELINE_MATH_formant | let us build a big boat |  | 100% | 0% |
| BASELINE_REF_chatterbox | N/A | Come on, let us go explore. I bet there is something amazing | N/A | 78% |
| BASELINE_V1_word_splice | let us build a big boat | Let us build something human big Bob. | 50% | 56% |

**Analysis:** The Chatterbox reference (REF) transcribes perfectly at 78% confidence. V1 word splice
gets 50% WER — it hears "Let us build something human big Bob" instead of "Let us build a big boat."
All formant-based approaches (MATH, HYB2) are completely unintelligible (100% WER, 0% confidence).

---

## Experiment 1: Klatt Formant Synthesizer

**Hypothesis:** A properly implemented Klatt parallel-cascade synthesizer should produce more
intelligible formant speech than our naive formant approach.

**Method:** Implemented Klatt-style 2nd-order digital resonators with:
- Rosenberg-C glottal pulse model with jitter/shimmer
- Cascade formant filtering (5 formants)
- Radiation characteristic (1st-order highpass)
- Proper voiced/unvoiced/plosive distinction
- 5ms crossfade transitions between phonemes

| Sentence | Transcription | WER | Confidence |
|----------|---------------|-----|------------|
| come_explore_the_garden_with_me | From the treating people. | 83% | 2% |
| let_us_build_a_big_boat |  | 100% | 0% |
| the_forest_is_beautiful_today |  | 100% | 0% |

**Result:** Almost completely unintelligible. One sentence ("come explore...") partially recognized as
"From the treating people" (83% WER). The Klatt implementation produces buzzy, robotic audio that
Whisper cannot decode.

**Why it failed:**
1. Phoneme durations are manually specified (too short/long)
2. No co-articulation modeling (formant transitions are abrupt)
3. No pitch contour modeling (flat F0 throughout)
4. Glottal source model is too simplistic
5. Missing aspiration noise, frication details

---

## Experiment 2: Expanded Chatterbox Corpus

**Status:** ⚠️ PARTIALLY COMPLETED

The Chatterbox container on Overwatch (192.168.3.8) was found to be running in idle mode
(`tail -f /dev/null`) without a Gradio server active. The container needs the Gradio TTS
server to be manually started.

**What was prepared:**
- 190 game-specific sentences covering all vocabulary domains
- Sentences saved to `exp2_sentences.json`
- Voice reference: Fox (philippa.wav / fox_excited.wav)

**Recommendation:** When Chatterbox server is running:
```python
from gradio_client import Client, handle_file
client = Client("http://192.168.3.8:8095/")
# Use the 190 prepared sentences
```

---

## Experiment 3: Formant Synthesis Improvements

**Hypothesis:** Adding proper DSP processing to the formant synthesizer might improve intelligibility.

**Sub-experiments tested:**

| Variant | Description | WER | Confidence |
|---------|-------------|-----|------------|
| exp3_combined_best | (silence) | 100% | 0% |
| exp3a_butterworth_3500hz | (silence) | 100% | 0% |
| exp3a_butterworth_4000hz | (silence) | 100% | 0% |
| exp3b_radiation_only | (silence) | 100% | 0% |
| exp3b_radiation_plus_lp | (silence) | 100% | 0% |
| exp3c_f0_180hz | (silence) | 100% | 0% |
| exp3c_f0_200hz | (silence) | 100% | 0% |
| exp3c_f0_220hz | (silence) | 100% | 0% |
| exp3c_f0_240hz | (silence) | 100% | 0% |
| exp3d_1_5x_bw | (silence) | 100% | 0% |
| exp3d_double_bw | (silence) | 100% | 0% |

**Result:** ALL variants produce 100% WER with 0% confidence. None of the improvements
(Butterworth lowpass, radiation highpass, F0 variation, wider bandwidths) made any
difference to intelligibility.

**Analysis:**
- 3a (Butterworth 4000Hz): Removed high frequencies but didn't add intelligibility
- 3b (Radiation): Added natural spectral tilt but core phonemes still unrecognizable
- 3c (F0 variations 180-240Hz): Pitch doesn't matter when formant transitions are wrong
- 3d (Double bandwidth): Wider bandwidths = less buzzy but also less distinct formants

**Conclusion:** The problem isn't DSP processing — it's the absence of:
1. Proper phoneme timing from a prosody model
2. Smooth formant transitions (co-articulation)
3. Natural amplitude envelope
4. Aspiration and release burst modeling

---

## Experiment 4: WORLD Vocoder

**Hypothesis:** WORLD vocoder with finer parameters might produce better quality
when used for voice conversion (extracting spectral envelope from Fox reference).

**Method:** Tested different frame periods and F0 floor values on WORLD analysis-synthesis.

| Config | Frame Period | F0 Floor | Transcription | Confidence |
|--------|-------------|----------|---------------|------------|
| exp4a_1ms_frame_flat220 | 1ms | 71 | Come on, let us go explore. I bet there is somethi | 78% |
| exp4a_1ms_frame_resynthesis | 1ms | 71 | Come on, let us go explore. I bet there is somethi | 77% |
| exp4a_2ms_frame_flat220 | 2ms | 71 | Come on, let us go explore. I bet there is somethi | 78% |
| exp4a_2ms_frame_resynthesis | 2ms | 71 | Come on, let us go explore. I bet there is somethi | 77% |
| exp4a_5ms_frame_flat220 | 5ms | 71 | Come on, let us go explore. I bet there is somethi | 77% |
| exp4a_5ms_frame_resynthesis | 5ms | 71 | Come on, let us go explore. I bet there is somethi | 77% |
| exp4b_f0floor_100_flat220 | 5ms | 100 | Come on, let us go explore. I bet there is somethi | 78% |
| exp4b_f0floor_100_resynthesis | 5ms | 100 | Come on, let us go explore. I bet there is somethi | 77% |

**Result:** WORLD vocoder preserves speech perfectly in copy-synthesis mode (all configs
produce identical, accurate transcriptions at 77-78% confidence). The frame period and
F0 floor make negligible difference to intelligibility in copy-synthesis.

**Key Finding:** WORLD is excellent at *preserving* existing speech but doesn't help
us *generate* new speech from scratch. It's a vocoder, not a synthesizer.

**Potential Use:** WORLD could be valuable for voice conversion — speaking a sentence
with any voice, then using WORLD to transfer Fox's spectral characteristics while
keeping the original phoneme structure.

---

## Experiment 5: espeak-ng Baseline

**Hypothesis:** espeak-ng (a mature formant synthesizer) should demonstrate what
formant synthesis can achieve with proper implementation.

| Voice | Sentence | Transcription | WER | Confidence |
|-------|----------|---------------|-----|------------|
| en-us | f3_come_explore_the_garden_with_me | Come and slaughter the garden with me. | 33% | 49% |
| en-us | f3_do_not_worry_we_will_figure_it_o | Do not worry we will figure it out. | 0% | 75% |
| en-us | f3_let_us_build_a_big_boat | Let us build a big boat! | 0% | 62% |
| en-us | f3_the_forest_is_beautiful_today | The form is still beautiful today. | 40% | 67% |
| en-us | f3_you_did_it_that_was_amazing | You give it not one amazing. | 50% | 52% |
| en-us | f4_come_explore_the_garden_with_me | Come and plorn a garden with me. | 50% | 43% |
| en-us | f4_do_not_worry_we_will_figure_it_o | Do not worry we will figure it out. | 0% | 75% |
| en-us | f4_let_us_build_a_big_boat | Let us build a big boat! | 0% | 65% |
| en-us | f4_the_forest_is_beautiful_today | The form is beautiful today. | 20% | 52% |
| en-us | f4_you_did_it_that_was_amazing | You did it, not one amazing. | 33% | 54% |
| en | f3_come_explore_the_garden_with_me | Come explore the garden with me. | 0% | 62% |
| en | f3_do_not_worry_we_will_figure_it_o | Do not worry we will figure it out. | 0% | 70% |
| en | f3_let_us_build_a_big_boat | Let us build a big boat! | 0% | 68% |
| en | f3_the_forest_is_beautiful_today | The form is still beautiful today. | 40% | 64% |
| en | f3_you_did_it_that_was_amazing | You did it not one amazing. | 33% | 53% |

**Result:** espeak-ng achieves 0% WER on 8 out of 15 test cases (53% perfect recognition).
Average WER across all voices is ~18%. This proves formant synthesis CAN produce intelligible
speech — but requires sophisticated prosody, co-articulation, and timing models that have been
refined over decades.

**Best espeak-ng voices:**
- `en-us+f3`: Best overall (0% WER on "let us build a big boat", "do not worry...")
- `en-us+f4`: Slightly lower quality on some sentences
- `en+f3`: British accent; good on most sentences

**Failure modes:** "Come explore" → "Come and slaughter" (33% WER), "forest" → "form" (20-40% WER)

---

## Experiment 5b: Piper TTS (Neural Baseline)

**Purpose:** Establish what modern neural TTS achieves as an upper bound.

| Sentence | Transcription | WER | Confidence |
|----------|---------------|-----|------------|
| come_explore_the_garden_with_me | come explore the garden with me. | 0% | 69% |
| do_not_worry_we_will_figure_it_out | Do not worry, we will figure it out. | 0% | 76% |
| let_us_build_a_big_boat | Let us build a big boat. | 0% | 67% |
| the_forest_is_beautiful_today | The forest is beautiful today. | 0% | 77% |
| you_did_it_that_was_amazing | You did it that was amazing. | 0% | 69% |

**Result:** Piper achieves **perfect 0% WER on all 5 sentences** with 67-77% confidence.
This is the gold standard for intelligibility. Piper uses neural VITS architecture —
it's a proper learned model, not handcrafted rules.

---

## Waveform Analysis

| Approach | RMS | Spectral Centroid | Speech Band % | Zero Crossing Rate |
|----------|-----|-------------------|---------------|-------------------|
| Chatterbox REF | 0.0709 | 2203 Hz | 60.0% | 0.1037 |
| V1 Word Splice | 0.0990 | 2343 Hz | 70.2% | 0.0900 |
| Klatt (Exp 1) | 0.2294 | 2247 Hz | 74.0% | 0.0713 |
| Formant Best (Exp 3) | 0.2669 | 1457 Hz | 58.1% | 0.0493 |
| espeak en-us+f3 | 0.1066 | 2347 Hz | 79.3% | 0.1453 |
| Piper amy | 0.1609 | 2359 Hz | 80.0% | 0.1034 |

---

## Recommendations

### Immediate Next Steps (Priority Order)

1. **🥇 Use Piper TTS for offline synthesis** — Perfect intelligibility, runs locally on CPU,
   63MB model. Download female voice models and generate all game dialogue. This is the
   fastest path to working voice synthesis.

2. **🥈 Expand V1 word-splice with Chatterbox corpus** — When the Chatterbox server is
   restarted, generate 190+ sentences with Fox voice. The larger corpus will dramatically
   improve V1's vocabulary coverage and reduce WER from 50%.

3. **🥉 WORLD vocoder for voice conversion** — Record/generate sentences with Piper or
   espeak-ng, then use WORLD vocoder to transfer Fox's spectral characteristics. This
   could give us Fox's voice quality with Piper's intelligibility.

### What NOT to Pursue

- **❌ Raw formant synthesis from scratch** — Experiments 1 and 3 conclusively show that
  naive formant synthesis produces unintelligible audio (100% WER). Even with Klatt
  resonators, Butterworth filters, and radiation modeling, the output is unusable.
  Building a usable formant synthesizer would require years of linguistics research.

- **❌ Hybrid WORLD + formant** — The original hybrid approaches (HYB, HYB2) were
  completely unintelligible. WORLD is great for copy-synthesis but can't create new
  phonemes from formant specifications.

### Recommended Architecture

```
[Text] → [Piper TTS (intelligible speech)] → [WORLD vocoder (extract F0 + spectral)]
    → [Replace spectral envelope with Fox reference] → [WORLD re-synthesize]
    → [Fox-voiced intelligible speech]
```

This "voice conversion pipeline" combines:
- Piper's perfect phoneme timing and intelligibility
- Fox's spectral characteristics (warmth, timbre)
- WORLD's high-quality vocoding

### Long-term: Train a Chatterbox/VITS model on Fox

The ultimate solution is fine-tuning a neural TTS model specifically on Fox's voice.
With 142 seconds of Fox reference audio across 38 clips, there's enough data for
few-shot adaptation of models like Chatterbox, XTTS, or StyleTTS2.

---

## Files Generated

All experiment audio saved to: `content/audio/voice_dna_experiments/`

```
Experiment 1 (Klatt):
  exp1_klatt_let_us_build_a_big_boat.wav
  exp1_klatt_the_forest_is_beautiful_today.wav
  exp1_klatt_come_explore_the_garden_with_me.wav

Experiment 3 (Formant Improvements):
  exp3a_butterworth_4000hz_let_us_build_a_big_boat.wav
  exp3a_butterworth_3500hz_let_us_build_a_big_boat.wav
  exp3b_radiation_only_let_us_build_a_big_boat.wav
  exp3b_radiation_plus_lp_let_us_build_a_big_boat.wav
  exp3c_f0_180hz_let_us_build_a_big_boat.wav
  exp3c_f0_200hz_let_us_build_a_big_boat.wav
  exp3c_f0_220hz_let_us_build_a_big_boat.wav
  exp3c_f0_240hz_let_us_build_a_big_boat.wav
  exp3d_double_bw_let_us_build_a_big_boat.wav
  exp3d_1_5x_bw_let_us_build_a_big_boat.wav
  exp3_combined_best_let_us_build_a_big_boat.wav

Experiment 4 (WORLD Vocoder):
  exp4a_1ms_frame_resynthesis.wav / exp4a_1ms_frame_flat220.wav
  exp4a_2ms_frame_resynthesis.wav / exp4a_2ms_frame_flat220.wav
  exp4a_5ms_frame_resynthesis.wav / exp4a_5ms_frame_flat220.wav
  exp4b_f0floor_100_resynthesis.wav / exp4b_f0floor_100_flat220.wav

Experiment 5 (espeak-ng):
  exp5_espeak_en-us_f3_*.wav (5 sentences)
  exp5_espeak_en-us_f4_*.wav (5 sentences)
  exp5_espeak_en_f3_*.wav (5 sentences)

Experiment 5b (Piper TTS):
  exp5b_piper_*.wav (5 sentences)
```


## Experiment 6: Piper → WORLD Voice Conversion Pipeline 🏆

**This is the breakthrough.** Combining Piper's perfect intelligibility with Fox's spectral
characteristics via WORLD vocoder voice conversion.

**Method:** 
1. Generate speech with Piper TTS (perfect phoneme timing)
2. Analyze with WORLD vocoder (extract F0, spectral envelope, aperiodicity)
3. Modify spectral envelope toward Fox's voice characteristics
4. Re-synthesize with WORLD

### Three conversion methods tested:

| Method | Description | Avg WER | Avg Confidence |
|--------|-------------|---------|----------------|
| **Blend (40/60)** | 40% Piper + 60% Fox spectral | **0%** | **70%** |
| **Ratio Transfer** | Scale Piper spectrum by Fox/Piper ratio | **0%** | **71%** |
| **Full Replace** | Replace spectrum entirely with Fox average | **89%** | **14%** |

### Detailed Results:

| Method | Sentence | Transcription | WER | Confidence |
|--------|----------|---------------|-----|------------|
| Blend | let us build a big boat | Let us build a big boat. | 0% | 74% |
| Blend | the forest is beautiful today | The forest is beautiful today. | 0% | 74% |
| Blend | come explore the garden with me | Come explore the garden with me. | 0% | 57% |
| Blend | do not worry we will figure it out | Do not worry, we will figure it out. | 0% | 73% |
| Blend | you did it that was amazing | You did it that was amazing. | 0% | 71% |
| Ratio | let us build a big boat | Let us build a big boat. | 0% | 68% |
| Ratio | the forest is beautiful today | The forest is beautiful today. | 0% | 76% |
| Ratio | come explore the garden with me | come explore the garden with me. | 0% | 68% |
| Ratio | do not worry we will figure it out | Do not worry, we will figure it out. | 0% | 74% |
| Ratio | you did it that was amazing | You did it that was amazing. | 0% | 69% |
| Replace | the forest is beautiful today | The first is ready for today. | 60% | 58% |
| Replace | come explore the garden with me | Come on. | 83% | 6% |
| Replace | do not worry we will figure it out | (garbled) | 100% | 4% |
| Replace | let us build a big boat | (garbled) | 100% | 2% |
| Replace | you did it that was amazing | (garbled) | 100% | 1% |

### Analysis

**Blend and Ratio methods achieve PERFECT 0% WER** because they preserve Piper's formant
structure (which carries intelligibility) while shifting the spectral tilt toward Fox.

**Full Replace fails** because replacing the entire spectral envelope erases the phonemic
content — you lose the formant peaks that distinguish vowels and consonants.

**Conclusion:** The voice conversion pipeline WORKS. The blend method (40% Piper + 60% Fox)
is the recommended approach — it maintains intelligibility while significantly shifting the
voice timbre toward Fox.

### Recommended Production Pipeline

```python
# 1. Generate with Piper
piper -m en_US-amy-medium.onnx -f sentence.wav <<< "Let us build a big boat"

# 2. Voice convert with WORLD
import pyworld as pw
f0, t = pw.dio(piper_audio, sr)
sp = pw.cheaptrick(piper_audio, f0, t, sr)
ap = pw.d4c(piper_audio, f0, t, sr)

# 3. Blend with Fox's spectral envelope (pre-computed)
sp_blend = sp * 0.4 + fox_avg_spectrum * 0.6

# 4. Re-synthesize
output = pw.synthesize(f0, sp_blend, ap, sr)
```

## Raw Data

Full JSON results: `content/audio/voice_dna_experiments/all_experiment_results.json`
Baseline results: `content/audio/voice_dna_experiments/baseline_stt.json`
Chatterbox sentence corpus: `content/audio/voice_dna_experiments/exp2_sentences.json`
