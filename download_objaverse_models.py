"""Download and filter 3D models from Objaverse for Nexus Academy.

Loads annotations, filters for game-relevant categories, scores models
by quality/style, downloads top 200 static + 50 animated models,
organizes by category, and generates a manifest.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import sys
from collections import defaultdict
from pathlib import Path

import objaverse

# ── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR = Path("/home/blue/repo/athena/content/models/objaverse")
ANIMATED_DIR = BASE_DIR / "animated"
MANIFEST_PATH = BASE_DIR / "manifest.json"

STATIC_LIMIT = 200
ANIMATED_LIMIT = 50

# ── Category definitions ───────────────────────────────────────────────────
# Each category maps to keywords matched against name, tags, and categories.
CATEGORIES = {
    "vegetation": {
        "keywords": [
            "tree", "plant", "flower", "bush", "shrub", "fern", "vine",
            "grass", "leaf", "leaves", "oak", "pine", "birch", "willow",
            "mushroom", "moss", "hedge", "sapling", "stump",
        ],
        "sketchfab_cats": ["nature", "plants"],
    },
    "rocks": {
        "keywords": [
            "rock", "boulder", "crystal", "stone", "mineral", "gem",
            "gemstone", "pebble", "cliff", "stalactite", "stalagmite",
            "ore", "amethyst", "quartz",
        ],
        "sketchfab_cats": ["nature"],
    },
    "buildings": {
        "keywords": [
            "building", "house", "castle", "tower", "cabin",
            "cottage", "temple", "church", "ruins", "bridge",
            "fortress", "tavern", "windmill", "lighthouse",
            "hut", "medieval-building", "village", "inn",
        ],
        "sketchfab_cats": ["architecture"],
    },
    "furniture": {
        "keywords": [
            "table", "chair", "shelf", "shelves", "workbench", "desk",
            "bed", "bench", "stool", "cabinet", "drawer", "wardrobe",
            "bookshelf", "throne", "couch", "carpet", "rug",
        ],
        "sketchfab_cats": ["furniture-home"],
    },
    "tools": {
        "keywords": [
            "hammer", "saw", "wrench", "anvil", "pickaxe", "axe",
            "shovel", "hoe", "rake", "tongs", "chisel", "pliers",
            "bellows", "forge", "toolbox",
        ],
        "sketchfab_cats": [],
    },
    "food": {
        "keywords": [
            "fruit", "apple", "berry", "bread", "vegetable", "carrot",
            "potato", "tomato", "cheese", "pie", "cake", "fish-food",
            "meat", "grape", "pear", "banana", "watermelon", "pumpkin",
            "corn", "wheat",
        ],
        "sketchfab_cats": ["food-drink"],
    },
    "animals": {
        "keywords": [
            "bird", "fish", "butterfly", "deer", "rabbit", "cat", "dog",
            "fox", "owl", "wolf", "bear", "horse", "eagle", "hawk",
            "frog", "turtle", "snake", "squirrel", "chicken", "cow",
            "sheep", "pig", "dragon", "phoenix",
        ],
        "sketchfab_cats": ["animals-pets"],
    },
    "vehicles": {
        "keywords": [
            "cart", "boat", "wagon", "ship", "canoe", "raft", "sled",
            "carriage", "sailboat",
        ],
        "sketchfab_cats": ["cars-vehicles"],
    },
    "weapons": {
        "keywords": [
            "sword", "bow", "shield", "arrow", "spear", "dagger",
            "mace", "staff-weapon", "crossbow", "quiver", "scabbard",
            "battle-axe", "halberd",
        ],
        "sketchfab_cats": ["weapons-military"],
    },
    "containers": {
        "keywords": [
            "chest", "treasure-chest", "crate", "barrel", "box",
            "sack", "bag", "basket", "urn", "jar", "pot",
        ],
        "sketchfab_cats": [],
    },
    "lighting": {
        "keywords": [
            "torch", "lantern", "candle", "lamp", "campfire",
            "fire", "chandelier", "sconce", "brazier",
        ],
        "sketchfab_cats": [],
    },
    "knowledge": {
        "keywords": [
            "book", "scroll", "potion", "bottle", "vial", "quill",
            "inkwell", "parchment", "tome", "library", "map",
        ],
        "sketchfab_cats": [],
    },
    "instruments": {
        "keywords": [
            "lute", "harp", "drum", "flute", "guitar", "violin",
            "trumpet", "piano", "instrument", "music-box", "bell",
            "tambourine", "lyre",
        ],
        "sketchfab_cats": ["music"],
    },
    "magical": {
        "keywords": [
            "wand", "orb", "magic", "crystal-ball", "enchanted",
            "rune", "spell", "amulet", "talisman", "wizard",
            "witch", "magical", "mystic", "arcane", "sorcerer",
        ],
        "sketchfab_cats": [],
    },
}

# Style bonus keywords (prefer stylized/low-poly for our art direction)
STYLE_BONUS_KEYWORDS = {
    "lowpoly", "low-poly", "low_poly", "stylized", "cartoon",
    "fantasy", "game-ready", "gameready", "handpainted", "hand-painted",
    "toon", "cute", "chibi", "voxel", "pixel",
}

# Photorealistic penalty keywords
REALISTIC_PENALTY_KEYWORDS = {
    "photorealistic", "realistic", "photogrammetry", "scan", "scanned",
    "photoscan", "3dscan", "reality-capture",
}

# Preferred licenses (higher = better)
LICENSE_SCORES = {
    "cc0": 10,
    "by": 8,
    "by-sa": 7,
    "by-nc": 5,
    "by-nc-sa": 4,
    "by-nd": 3,
    "by-nc-nd": 2,
}


def get_text_fields(obj: dict) -> str:
    """Combine name, tags, categories, description into searchable text."""
    parts = [obj.get("name", "").lower()]
    for tag in obj.get("tags", []):
        parts.append(tag.get("name", "").lower())
        parts.append(tag.get("slug", "").lower())
    for cat in obj.get("categories", []):
        parts.append(cat.get("name", "").lower())
    desc = obj.get("description", "") or ""
    parts.append(desc.lower()[:500])
    return " ".join(parts)


def classify_object(obj: dict) -> list[tuple[str, int]]:
    """Return list of (category, match_strength) for the object."""
    text = get_text_fields(obj)
    tag_names = {t.get("slug", "").lower() for t in obj.get("tags", [])}
    cat_names = {c.get("name", "").lower() for c in obj.get("categories", [])}
    name_lower = obj.get("name", "").lower()

    matches = []
    for category, cfg in CATEGORIES.items():
        score = 0
        for kw in cfg["keywords"]:
            # Exact word boundary match in name gets highest score
            pattern = r'\b' + re.escape(kw) + r'\b'
            if re.search(pattern, name_lower):
                score += 10
            elif kw in tag_names or any(re.search(pattern, t) for t in tag_names):
                score += 7
            elif re.search(pattern, text):
                score += 3

        # Sketchfab category match
        for sf_cat in cfg["sketchfab_cats"]:
            if sf_cat in cat_names:
                score += 5

        if score > 0:
            matches.append((category, score))

    return sorted(matches, key=lambda x: -x[1])


def score_object(obj: dict, category_score: int) -> float:
    """Score an object for download priority. Higher = better."""
    score = float(category_score)
    text = get_text_fields(obj)
    tag_names = {t.get("slug", "").lower() for t in obj.get("tags", [])}

    # License score
    license_key = (obj.get("license") or "").lower().replace("_", "-")
    score += LICENSE_SCORES.get(license_key, 0)

    # Style bonus
    all_tags = tag_names | {obj.get("name", "").lower()}
    style_hits = sum(1 for kw in STYLE_BONUS_KEYWORDS if kw in text)
    score += style_hits * 3

    # Realistic penalty
    realism_hits = sum(1 for kw in REALISTIC_PENALTY_KEYWORDS if kw in text)
    score -= realism_hits * 5

    # Face count scoring: prefer 500-50K faces
    faces = obj.get("faceCount") or 0
    if 500 <= faces <= 50000:
        # Sweet spot: 2K-20K for stylized game assets
        if 2000 <= faces <= 20000:
            score += 8
        else:
            score += 4
    elif faces > 50000:
        score -= 5  # Too heavy for game
    elif faces > 0 and faces < 500:
        score += 1  # Very low poly, still okay

    # Animation bonus (slight preference for animated content)
    anim_count = obj.get("animationCount") or 0
    if anim_count > 0:
        score += 3

    # Popularity bonus (some signal of quality)
    views = obj.get("viewCount") or 0
    likes = obj.get("likeCount") or 0
    if likes >= 10:
        score += 3
    elif likes >= 3:
        score += 1
    if views >= 1000:
        score += 2
    elif views >= 100:
        score += 1

    # Staff pick bonus
    if obj.get("staffpickedAt"):
        score += 5

    # Age restriction penalty
    if obj.get("isAgeRestricted"):
        score -= 100

    return score


def main():
    print("=" * 60)
    print("Nexus Academy — Objaverse Model Downloader")
    print("=" * 60)

    # ── Step 1: Load annotations ───────────────────────────────────────
    print("\n[1/6] Loading Objaverse annotations...")
    annotations = objaverse.load_annotations()
    print(f"  Loaded {len(annotations):,} object annotations")

    # ── Step 2: Filter and classify ────────────────────────────────────
    print("\n[2/6] Filtering and classifying objects...")
    candidates = []  # (uid, best_category, score, obj)
    animated_candidates = []  # same structure, for animated models

    for uid, obj in annotations.items():
        # Skip non-downloadable or age-restricted
        if not obj.get("isDownloadable", True):
            continue
        if obj.get("isAgeRestricted"):
            continue

        classifications = classify_object(obj)
        if not classifications:
            continue

        best_cat, cat_score = classifications[0]
        total_score = score_object(obj, cat_score)

        entry = (uid, best_cat, total_score, obj)
        candidates.append(entry)

        # Animated models bucket
        anim_count = obj.get("animationCount") or 0
        if anim_count > 0:
            # Extra boost for animated animals, creatures, humanoids
            anim_score = total_score + 10
            text = get_text_fields(obj)
            creature_keywords = [
                "animal", "creature", "character", "humanoid",
                "dragon", "wolf", "deer", "bird", "fish", "horse",
                "walk", "run", "idle", "attack", "npc", "monster",
                "golem", "skeleton", "ghost", "fairy", "sprite",
                "guardian", "knight", "villager", "merchant",
            ]
            for kw in creature_keywords:
                if kw in text:
                    anim_score += 5
            animated_candidates.append((uid, best_cat, anim_score, obj))

    print(f"  Found {len(candidates):,} category-matched objects")
    print(f"  Found {len(animated_candidates):,} animated objects in categories")

    # ── Step 3: Rank and select ────────────────────────────────────────
    print("\n[3/6] Ranking and selecting top models...")

    # For static models: ensure category diversity
    candidates.sort(key=lambda x: -x[2])

    # Pick top models with category balancing
    # First ensure at least a few per category, then fill by score
    selected_uids = set()
    selected = []  # (uid, category, score, obj)
    cat_counts = defaultdict(int)

    MIN_PER_CAT = 5
    MAX_PER_CAT = 30

    # First pass: guarantee minimum per category
    by_category = defaultdict(list)
    for uid, cat, score, obj in candidates:
        by_category[cat].append((uid, cat, score, obj))

    for cat in CATEGORIES:
        cat_list = by_category.get(cat, [])
        for entry in cat_list[:MIN_PER_CAT]:
            if entry[0] not in selected_uids and len(selected) < STATIC_LIMIT:
                selected.append(entry)
                selected_uids.add(entry[0])
                cat_counts[cat] += 1

    # Second pass: fill remaining slots by global score
    for uid, cat, score, obj in candidates:
        if len(selected) >= STATIC_LIMIT:
            break
        if uid in selected_uids:
            continue
        if cat_counts[cat] >= MAX_PER_CAT:
            continue
        selected.append((uid, cat, score, obj))
        selected_uids.add(uid)
        cat_counts[cat] += 1

    # Animated selection
    animated_candidates.sort(key=lambda x: -x[2])
    anim_selected = []
    anim_uids = set()
    for uid, cat, score, obj in animated_candidates:
        if len(anim_selected) >= ANIMATED_LIMIT:
            break
        if uid not in anim_uids:
            anim_selected.append((uid, cat, score, obj))
            anim_uids.add(uid)

    print(f"  Selected {len(selected)} static models:")
    for cat in sorted(cat_counts):
        print(f"    {cat}: {cat_counts[cat]}")
    print(f"  Selected {len(anim_selected)} animated models")

    # ── Step 4: Create directories ─────────────────────────────────────
    print("\n[4/6] Creating directory structure...")
    for cat in CATEGORIES:
        (BASE_DIR / cat).mkdir(parents=True, exist_ok=True)
    ANIMATED_DIR.mkdir(parents=True, exist_ok=True)
    print(f"  Created {len(CATEGORIES)} category directories + animated/")

    # ── Step 5: Download models ────────────────────────────────────────
    print("\n[5/6] Downloading models...")

    # Collect all UIDs to download
    all_download_uids = list(selected_uids | anim_uids)
    print(f"  Total unique models to download: {len(all_download_uids)}")

    # Download with objaverse (handles caching automatically)
    downloaded = objaverse.load_objects(
        uids=all_download_uids,
        download_processes=4,
    )
    print(f"  Downloaded/cached {len(downloaded)} models")

    # ── Step 6: Copy to category folders and build manifest ────────────
    print("\n[6/6] Organizing models and building manifest...")
    manifest = {
        "version": "1.0",
        "description": "Objaverse 3D models filtered for Nexus Academy",
        "art_style": "stylized 3D — BotW meets Monument Valley meets Spiderverse",
        "static_models": [],
        "animated_models": [],
        "category_counts": {},
        "total_static": 0,
        "total_animated": 0,
    }

    # Copy static models
    final_cat_counts = defaultdict(int)
    for uid, cat, score, obj in selected:
        src = downloaded.get(uid)
        if not src or not os.path.exists(src):
            print(f"  WARN: {uid} ({obj.get('name')}) not downloaded, skipping")
            continue

        safe_name = re.sub(r'[^\w\-.]', '_', obj.get("name", uid)[:60]).strip("_")
        dest = BASE_DIR / cat / f"{safe_name}__{uid[:8]}.glb"

        shutil.copy2(src, dest)
        final_cat_counts[cat] += 1

        manifest["static_models"].append({
            "uid": uid,
            "name": obj.get("name", ""),
            "category": cat,
            "license": obj.get("license", "unknown"),
            "faceCount": obj.get("faceCount", 0),
            "vertexCount": obj.get("vertexCount", 0),
            "hasAnimation": (obj.get("animationCount") or 0) > 0,
            "animationCount": obj.get("animationCount") or 0,
            "score": round(score, 1),
            "viewerUrl": obj.get("viewerUrl", ""),
            "file": str(dest.relative_to(BASE_DIR)),
        })

    # Copy animated models
    for uid, cat, score, obj in anim_selected:
        src = downloaded.get(uid)
        if not src or not os.path.exists(src):
            print(f"  WARN animated: {uid} ({obj.get('name')}) not downloaded, skipping")
            continue

        safe_name = re.sub(r'[^\w\-.]', '_', obj.get("name", uid)[:60]).strip("_")
        dest = ANIMATED_DIR / f"{safe_name}__{uid[:8]}.glb"

        shutil.copy2(src, dest)

        manifest["animated_models"].append({
            "uid": uid,
            "name": obj.get("name", ""),
            "category": cat,
            "license": obj.get("license", "unknown"),
            "faceCount": obj.get("faceCount", 0),
            "vertexCount": obj.get("vertexCount", 0),
            "animationCount": obj.get("animationCount") or 0,
            "score": round(score, 1),
            "viewerUrl": obj.get("viewerUrl", ""),
            "file": f"animated/{safe_name}__{uid[:8]}.glb",
        })

    manifest["category_counts"] = dict(final_cat_counts)
    manifest["total_static"] = len(manifest["static_models"])
    manifest["total_animated"] = len(manifest["animated_models"])

    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2)

    # ── Summary ────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("DOWNLOAD COMPLETE")
    print("=" * 60)
    print(f"Static models:   {manifest['total_static']}")
    print(f"Animated models: {manifest['total_animated']}")
    print(f"Manifest:        {MANIFEST_PATH}")
    print("\nCategory breakdown:")
    for cat in sorted(final_cat_counts):
        print(f"  {cat:15s}: {final_cat_counts[cat]:3d} models")
    print(f"\nFiles saved to: {BASE_DIR}")


if __name__ == "__main__":
    main()
