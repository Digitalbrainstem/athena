#!/usr/bin/env python3
"""
Voice DNA v2 — Generate 200 carrier sentences on Chatterbox.
Designed for PHRASE-level extraction (2-4 word runs).
Uses Fox voice (philippa.wav, exag 0.8).
"""
from __future__ import annotations

import os
import sys
import time
import json
import torch
import soundfile as sf

# ---------------------------------------------------------------------------
# 200 carrier sentences grouped by category
# Each sentence is designed so that useful 2-4 word phrases can be extracted.
# ---------------------------------------------------------------------------
SENTENCES = {
    # -- EXPLORATION (50) --
    "explore": [
        ("exp-01", "Let us go explore the world together."),
        ("exp-02", "Look over there, I see something shining."),
        ("exp-03", "What is that behind the big tree?"),
        ("exp-04", "Come with me, I know the way."),
        ("exp-05", "Follow me this way through the forest."),
        ("exp-06", "I see something interesting over there."),
        ("exp-07", "Let us find out what is hidden here."),
        ("exp-08", "Where does this path lead to?"),
        ("exp-09", "There is a secret in this cave."),
        ("exp-10", "Can you see the light ahead?"),
        ("exp-11", "Let us go this way and explore."),
        ("exp-12", "I wonder what is around that corner."),
        ("exp-13", "Come on, let us keep going forward."),
        ("exp-14", "Look at what I found over here."),
        ("exp-15", "This is a new place we have not seen."),
        ("exp-16", "The path goes through the dark woods."),
        ("exp-17", "I think there is something up ahead."),
        ("exp-18", "Let us cross the bridge together."),
        ("exp-19", "Do you hear that sound coming from here?"),
        ("exp-20", "We should explore the other side too."),
        ("exp-21", "This way leads to the mountain top."),
        ("exp-22", "I can see a village in the distance."),
        ("exp-23", "There might be treasure hidden underground."),
        ("exp-24", "Let us go find the hidden path."),
        ("exp-25", "Follow the river and it will lead us."),
        ("exp-26", "Look, footprints in the sand over here."),
        ("exp-27", "We are getting closer, I can feel it."),
        ("exp-28", "This cave goes deeper than I thought."),
        ("exp-29", "The map says to go north from here."),
        ("exp-30", "I have never been to this part before."),
        ("exp-31", "Let us climb up and look around."),
        ("exp-32", "Something is moving in the tall grass."),
        ("exp-33", "Come explore the garden with me today."),
        ("exp-34", "We need to find another way across."),
        ("exp-35", "I bet there is more to discover here."),
        ("exp-36", "The trail continues beyond the waterfall."),
        ("exp-37", "Let us see what is on the other side."),
        ("exp-38", "I can hear water running nearby us."),
        ("exp-39", "Watch your step, the ground is uneven."),
        ("exp-40", "This is the perfect spot to rest."),
        ("exp-41", "Look how far we have come already."),
        ("exp-42", "The view from up here is incredible."),
        ("exp-43", "I spy something new in the clearing."),
        ("exp-44", "Shall we go left or go right?"),
        ("exp-45", "There is a door hidden in the wall."),
        ("exp-46", "We made it to the top at last."),
        ("exp-47", "I wonder who lived here long ago."),
        ("exp-48", "Let us rest here for just a moment."),
        ("exp-49", "The wind is blowing from the east."),
        ("exp-50", "Come closer and take a good look."),
    ],
    # -- BUILDING / CRAFTING (50) --
    "building": [
        ("bld-01", "Let us build something amazing right now."),
        ("bld-02", "We need to find the right pieces."),
        ("bld-03", "Try putting it here, I think it fits."),
        ("bld-04", "That fits perfectly, great job on that."),
        ("bld-05", "Almost done, just one more piece to go."),
        ("bld-06", "Let us build a big boat today."),
        ("bld-07", "We need more wood for the wall."),
        ("bld-08", "This goes on top of that piece."),
        ("bld-09", "Can you hand me that red block?"),
        ("bld-10", "The tower needs to be much stronger."),
        ("bld-11", "Let us make it taller and wider."),
        ("bld-12", "I think we need a better plan."),
        ("bld-13", "Try turning it the other way around."),
        ("bld-14", "That is not quite right, let us fix it."),
        ("bld-15", "We built it, and it actually works!"),
        ("bld-16", "The bridge needs support in the middle."),
        ("bld-17", "Let us add some color to it."),
        ("bld-18", "This part connects to that part there."),
        ("bld-19", "We are building something really special here."),
        ("bld-20", "The foundation has to be strong and flat."),
        ("bld-21", "Mix these together and see what happens."),
        ("bld-22", "I know how to make it even better."),
        ("bld-23", "Let us craft a new tool for this."),
        ("bld-24", "We need to measure before we cut."),
        ("bld-25", "The roof goes right on top like this."),
        ("bld-26", "Hold it steady while I put this here."),
        ("bld-27", "That was the last piece we needed!"),
        ("bld-28", "Let us test if it is strong enough."),
        ("bld-29", "We should start with a solid base."),
        ("bld-30", "Look at what we made together today!"),
        ("bld-31", "The walls are almost all the way up."),
        ("bld-32", "I think it needs a window right here."),
        ("bld-33", "Let us build a house for the animals."),
        ("bld-34", "This material is perfect for building with."),
        ("bld-35", "We can use these stones for the path."),
        ("bld-36", "The design looks really good so far."),
        ("bld-37", "Let us make the door a little bigger."),
        ("bld-38", "Try stacking them up like a pyramid."),
        ("bld-39", "We created something truly wonderful today."),
        ("bld-40", "The structure is getting taller every minute."),
        ("bld-41", "I found the missing piece right here."),
        ("bld-42", "Let us fix the broken part first."),
        ("bld-43", "It is coming together really nicely now."),
        ("bld-44", "We need to reinforce this section here."),
        ("bld-45", "The garden fence is finally complete now."),
        ("bld-46", "Let us paint it a bright color."),
        ("bld-47", "I have an idea for something new."),
        ("bld-48", "We should build it next to the river."),
        ("bld-49", "That is the strongest bridge I have seen."),
        ("bld-50", "Everything we need is right here already."),
    ],
    # -- EMOTIONAL (50) --
    "emotional": [
        ("emo-01", "That was amazing, I loved every moment!"),
        ("emo-02", "You did it, I am so proud!"),
        ("emo-03", "Do not worry, everything will be fine."),
        ("emo-04", "I believe in you, you can do it."),
        ("emo-05", "We can do this if we try together."),
        ("emo-06", "How wonderful, this is truly beautiful!"),
        ("emo-07", "I am so happy to see you!"),
        ("emo-08", "You are the bravest one I know."),
        ("emo-09", "That made me laugh so very much!"),
        ("emo-10", "I know you can figure this out."),
        ("emo-11", "We are going to have so much fun."),
        ("emo-12", "I am really proud of what you did."),
        ("emo-13", "Do not give up, you are so close!"),
        ("emo-14", "That was the best thing I ever saw."),
        ("emo-15", "You should feel really good about this."),
        ("emo-16", "I knew you could do it all along!"),
        ("emo-17", "We make a really great team together."),
        ("emo-18", "That was so much fun, let us go again!"),
        ("emo-19", "You are getting better every single time."),
        ("emo-20", "I am here with you, do not be scared."),
        ("emo-21", "We did it together, that is what matters."),
        ("emo-22", "I feel so lucky to be your friend."),
        ("emo-23", "You made my day so much brighter!"),
        ("emo-24", "That takes real courage, and you have it."),
        ("emo-25", "I will always be right here for you."),
        ("emo-26", "We never give up, no matter what happens."),
        ("emo-27", "You are stronger than you even realize."),
        ("emo-28", "That was incredible, do it one more time!"),
        ("emo-29", "I am excited to see what happens next!"),
        ("emo-30", "Nothing can stop us when we work together."),
        ("emo-31", "Great job, you should be very proud!"),
        ("emo-32", "You tried your best and that is enough."),
        ("emo-33", "I believe we can solve this problem."),
        ("emo-34", "Do not be afraid, I am right here."),
        ("emo-35", "You are amazing just the way you are."),
        ("emo-36", "That was really brave of you to try."),
        ("emo-37", "We are in this adventure together always."),
        ("emo-38", "Keep going, you are doing so well!"),
        ("emo-39", "I am so grateful we are friends!"),
        ("emo-40", "You light up everything around you today."),
        ("emo-41", "We can handle anything that comes our way."),
        ("emo-42", "That smile of yours makes everything better."),
        ("emo-43", "I trust you, and I know you will succeed."),
        ("emo-44", "You have come so far since we started."),
        ("emo-45", "This is one of the best days ever!"),
        ("emo-46", "We should celebrate what we accomplished today."),
        ("emo-47", "I have never seen anyone as brave as you."),
        ("emo-48", "Every challenge makes us stronger in the end."),
        ("emo-49", "You are my very best friend in the world."),
        ("emo-50", "Together we can do anything we dream of."),
    ],
    # -- NATURE / DESCRIPTION (50) --
    "nature": [
        ("nat-01", "The forest is beautiful today, look around."),
        ("nat-02", "Beautiful today, the flowers are blooming everywhere."),
        ("nat-03", "The water is crystal clear and sparkling."),
        ("nat-04", "Look at the sky, it is so blue!"),
        ("nat-05", "So many stars are shining up above."),
        ("nat-06", "The mountain is tall and covered in snow."),
        ("nat-07", "The sun is setting behind the hills."),
        ("nat-08", "Listen to the birds singing in the trees."),
        ("nat-09", "The leaves are turning red and gold."),
        ("nat-10", "A gentle breeze is blowing through here."),
        ("nat-11", "The river flows gently through the valley."),
        ("nat-12", "The clouds look like fluffy white pillows."),
        ("nat-13", "The grass is soft and green beneath us."),
        ("nat-14", "I can smell the flowers from over here."),
        ("nat-15", "The rain is falling softly on the ground."),
        ("nat-16", "A rainbow appeared in the sky just now!"),
        ("nat-17", "The moon is full and shining so bright."),
        ("nat-18", "The ocean waves are crashing on the shore."),
        ("nat-19", "The garden is full of colorful butterflies."),
        ("nat-20", "Snow is covering everything in white today."),
        ("nat-21", "The trees are so tall they touch the sky."),
        ("nat-22", "The sunset looks like a painting tonight."),
        ("nat-23", "Tiny little fish are swimming in the pond."),
        ("nat-24", "The wind carries the scent of pine trees."),
        ("nat-25", "Look at all the pretty wildflowers blooming."),
        ("nat-26", "The cave is dark but very interesting."),
        ("nat-27", "Mushrooms are growing by the fallen log."),
        ("nat-28", "The waterfall is making a beautiful sound."),
        ("nat-29", "I love how the fireflies glow at night."),
        ("nat-30", "The meadow stretches far as you can see."),
        ("nat-31", "Frost is sparkling on the morning leaves."),
        ("nat-32", "The lake is still and peaceful this evening."),
        ("nat-33", "Autumn colors make the forest look magical."),
        ("nat-34", "The spring flowers are starting to bloom now."),
        ("nat-35", "A deer is standing quietly by the stream."),
        ("nat-36", "The night sky is absolutely breathtaking tonight."),
        ("nat-37", "Waves of golden wheat sway in the breeze."),
        ("nat-38", "The cliff overlooks the entire green valley."),
        ("nat-39", "Snowflakes are falling gently from the clouds."),
        ("nat-40", "The cherry blossoms are pink and so pretty."),
        ("nat-41", "Lightning bugs dance across the summer field."),
        ("nat-42", "The old oak tree has been here forever."),
        ("nat-43", "Dragonflies hover above the quiet little pond."),
        ("nat-44", "The path is lined with smooth river stones."),
        ("nat-45", "Morning dew glistens on every blade of grass."),
        ("nat-46", "The horizon glows orange as the sun rises."),
        ("nat-47", "A cool mist covers the mountain this morning."),
        ("nat-48", "The forest floor is covered in soft moss."),
        ("nat-49", "Crystal clear water trickles down the rocks."),
        ("nat-50", "The air smells fresh after the morning rain."),
    ],
}


def main():
    from chatterbox.tts import ChatterboxTTS

    OUT_DIR = "/workspace/voice_dna_v2"
    REF_WAV = "/voices/philippa.wav"
    EXAG = 0.8
    SR = 24000

    os.makedirs(OUT_DIR, exist_ok=True)

    print("Loading Chatterbox TTS model...")
    model = ChatterboxTTS.from_pretrained(device=torch.device("cuda"))
    print("Model loaded!")

    manifest = {}
    total = sum(len(v) for v in SENTENCES.values())
    done = 0
    errors = 0

    for category, sentences in SENTENCES.items():
        cat_dir = os.path.join(OUT_DIR, category)
        os.makedirs(cat_dir, exist_ok=True)

        for file_id, text in sentences:
            done += 1
            out_path = os.path.join(cat_dir, f"{file_id}.wav")

            # Skip if already generated
            if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
                print(f"[{done}/{total}] SKIP {file_id} (exists)")
                entry = manifest.get(file_id)
                if not entry:
                    manifest[file_id] = {
                        "text": text,
                        "category": category,
                        "file": f"{category}/{file_id}.wav",
                        "exag": EXAG,
                    }
                continue

            print(f"[{done}/{total}] Generating {file_id}: \"{text}\"")
            sys.stdout.flush()

            try:
                wav = model.generate(
                    text,
                    audio_prompt_path=REF_WAV,
                    exaggeration=EXAG,
                    cfg_weight=0.5,
                )
                if isinstance(wav, torch.Tensor):
                    wav = wav.squeeze().cpu().numpy()

                sf.write(out_path, wav, SR)
                duration = len(wav) / SR
                print(f"         -> {duration:.2f}s saved to {out_path}")

                manifest[file_id] = {
                    "text": text,
                    "category": category,
                    "file": f"{category}/{file_id}.wav",
                    "exag": EXAG,
                    "samples": len(wav),
                    "duration": round(duration, 2),
                }
            except Exception as e:
                errors += 1
                print(f"         ERROR: {e}")

            sys.stdout.flush()

    # Save manifest
    manifest_path = os.path.join(OUT_DIR, "manifest_v2.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest saved to {manifest_path}")
    print(f"Done: {done - errors}/{total} generated, {errors} errors")


if __name__ == "__main__":
    main()
