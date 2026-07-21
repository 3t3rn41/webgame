#!/usr/bin/env python3
"""Generate all game images via the local /api/generate endpoint (SSE stream).
Version 2: Precise composition prompts that match hotspot click positions exactly.

Hotspot coordinate system (percentages of image):
  x: left position (0% = far left, 100% = far right)
  y: top position  (0% = top,      100% = bottom)
  w: width  (%)
  h: height (%)

All images are 16:9 landscape (1536x1024) to match the CSS aspect-ratio.
"""
import json, os, time, concurrent.futures, requests

API = "http://localhost:3000/api/generate"
OUT = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(OUT, exist_ok=True)

# Each prompt includes EXACT spatial layout instructions matching the hotspot coordinates.
# The layout description uses natural-language position terms derived from the x/y/w/h values.

IMAGES = [
    # ================================================================
    # 1. GATE — hotspots:
    #   gate_lock:  x:38 y:52 w:22 h:32  → center-lower (copper lock on the gate)
    #   gate_stone:x:1  y:68 w:20 h:22  → bottom-left corner (stone stele)
    # ================================================================
    ("gate.jpg",
     "A cinematic wide-angle photograph of a foggy abandoned Chinese mansion entrance gate at night. "
     "COMPOSITION: The large rusted iron double-gate fills the center of the frame. "
     "A prominent old copper padlock is clearly visible on the right leaf of the gate door, "
     "positioned at the lower-center area of the image (roughly 40-60% horizontal, 50-85% vertical). "
     "The copper lock is large, rusted, and clearly detailed so it stands out as a focal point. "
     "At the bottom-left corner of the image (0-20% horizontal, 65-90% vertical), "
     "there is a weathered stone stele standing on the ground, covered in moss, with faint carved Chinese characters. "
     "The stone stele is small but clearly visible in the bottom-left. "
     "Thick fog, pale moonlight, dead wisteria vines, stone lions, horror atmosphere, "
     "volumetric fog, dark and eerie, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 2. HALL — hotspots:
    #   hall_mirror: x:36 y:12 w:26 h:58 → center-left, tall (full-length mirror)
    #   hall_coat:   x:2  y:22 w:16 h:52 → far left, tall (coat rack)
    #   hall_table:  x:76 y:38 w:22 h:38 → right side, lower (altar/side table)
    # ================================================================
    ("hall.jpg",
     "A cinematic photograph of a dark, narrow entrance hall of an abandoned Chinese mansion. "
     "COMPOSITION: On the far left edge of the image (0-18% horizontal, 20-75% vertical), "
     "there is a tall old wooden coat rack standing against the wall, with a faded long gown hanging on it. "
     "In the center-left of the image (35-62% horizontal, 10-70% vertical), "
     "there is a large dusty full-length floor mirror leaning against the back wall, tall and prominent. "
     "On the right side of the image (75-98% horizontal, 35-76% vertical), "
     "there is a small dusty altar/side table against the wall with offerings. "
     "The three objects — coat rack (far left), mirror (center), table (right) — "
     "are clearly separated and each occupies its designated area. "
     "Dusty marble floor, faded peeling wallpaper, cobwebs, dim moonlight through broken lattice window, "
     "horror atmosphere, cinematic lighting, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 3. LIVING ROOM — hotspots:
    #   living_painting:  x:28 y:8  w:42 h:48 → center-top (oil painting on wall)
    #   living_fireplace: x:58 y:38 w:28 h:38 → right-lower (fireplace)
    #   living_table:     x:6  y:52 w:28 h:28 → left-lower (collapsed table)
    # ================================================================
    ("living.jpg",
     "A cinematic photograph of a dusty, dark living room of an abandoned Chinese mansion. "
     "COMPOSITION: On the upper-center of the back wall (25-70% horizontal, 5-56% vertical), "
     "there is a large oil painting hanging on the cracked wall, depicting a woman in a qipao with a blurred face. "
     "The painting is the dominant feature in the upper half of the image. "
     "On the right-lower area (55-86% horizontal, 35-76% vertical), "
     "there is a stone fireplace with cold ashes and charred wood. "
     "On the left-lower area (3-34% horizontal, 50-80% vertical), "
     "there is a collapsed square eight-immortals table on the floor, covered in dust. "
     "The painting, fireplace, and collapsed table are in three distinct non-overlapping zones. "
     "Worn velvet, peeling wallpaper, cobwebs, moonlight through broken blinds, "
     "horror atmosphere, cinematic lighting, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 4. DINING ROOM — hotspots:
    #   dining_table:   x:8  y:42 w:82 h:38 → center-bottom, wide (long dining table)
    #   dining_clock:   x:73 y:5  w:20 h:32 → top-right (grandfather clock on wall)
    #   dining_cabinet:  x:1  y:18 w:15 h:42 → far left (cabinet/cupboard)
    # ================================================================
    ("dining.jpg",
     "A cinematic photograph of a dining room in an abandoned Chinese mansion. "
     "COMPOSITION: On the far left edge (0-16% horizontal, 15-60% vertical), "
     "there is a tall wooden cabinet/cupboard against the wall. "
     "In the upper-right area of the back wall (70-93% horizontal, 3-37% vertical), "
     "there is an old grandfather wall clock, stopped, clearly visible. "
     "In the lower-center of the image spanning almost the full width (5-90% horizontal, 40-80% vertical), "
     "there is a long wooden dining table with five sets of dusty bowls and chopsticks neatly arranged. "
     "The table dominates the lower half. The clock is upper-right. The cabinet is far left. "
     "Broken chandelier, cobwebs, dim eerie light, horror atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 5. KITCHEN — hotspots:
    #   kitchen_recipe:  x:58 y:12 w:24 h:32 → upper-right (recipe board on wall)
    #   kitchen_stove:    x:2  y:32 w:32 h:42 → left side (stove)
    #   kitchen_drawer:   x:38 y:52 w:20 h:22 → center-lower (drawer/cabinet)
    # ================================================================
    ("kitchen.jpg",
     "A cinematic photograph of a kitchen in an abandoned Chinese mansion. "
     "COMPOSITION: On the left side (0-34% horizontal, 30-74% vertical), "
     "there is a large old brick stove/cooking range covered in dust. "
     "In the upper-right area of the back wall (55-82% horizontal, 10-44% vertical), "
     "there is a wooden board with a yellowed recipe pinned to the wall with thumbtacks. "
     "In the lower-center area (35-58% horizontal, 50-74% vertical), "
     "there is a wooden cabinet with drawers, low to the ground. "
     "The stove, recipe board, and drawer cabinet are in three distinct zones. "
     "Broken tiles, dusty jars, blackened firewood in corner, dry water vat, "
     "a single bare bulb, horror atmosphere, cinematic lighting, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 6. STUDY — hotspots:
    #   study_desk:      x:22 y:42 w:54 h:38 → center-lower (desk)
    #   study_bookshelf: x:1  y:2  w:24 h:58 → far left, tall (bookshelf)
    #   study_chest:      x:76 y:5  w:18 h:24 → upper-right (copper chest on high shelf)
    # ================================================================
    ("study.jpg",
     "A cinematic photograph of a study room in an abandoned Chinese mansion. "
     "COMPOSITION: On the far left (0-25% horizontal, 0-60% vertical), "
     "there is a tall wooden bookshelf full of old thread-bound books, reaching near the ceiling. "
     "In the upper-right area (75-94% horizontal, 3-29% vertical), "
     "there is a small copper chest/box sitting on a high shelf, with a faint glow. "
     "In the center-lower area (20-76% horizontal, 40-80% vertical), "
     "there is a large rosewood desk with inkstone, brush, and papers. "
     "The bookshelf is far left, the copper chest is upper-right high up, and the desk is center-bottom. "
     "Scattered papers, green banker's lamp, dust motes in dim light, "
     "horror atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 7. BEDROOM — hotspots:
    #   bedroom_bed:     x:8  y:48 w:58 h:36 → center-lower, wide (carved bed)
    #   bedroom_dresser:  x:68 y:28 w:26 h:46 → right side (vanity/dresser with cracked mirror)
    #   bedroom_wardrobe: x:1  y:12 w:20 h:58 → far left, tall (wardrobe)
    # ================================================================
    ("bedroom.jpg",
     "A cinematic photograph of a master bedroom in an abandoned Chinese mansion. "
     "COMPOSITION: On the far left (0-21% horizontal, 10-70% vertical), "
     "there is a tall wooden wardrobe/closet against the wall. "
     "In the center-lower area (7-66% horizontal, 46-84% vertical), "
     "there is a large ornate carved four-poster bed with messy bedding, taking up the lower-center. "
     "On the right side (67-94% horizontal, 26-74% vertical), "
     "there is a vanity dresser with a cracked mirror. "
     "The wardrobe is far left, the bed is center-bottom, the dresser is right side. "
     "Peeling wallpaper, moonlight through dirty window, "
     "horror atmosphere, cinematic lighting, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 8. BASEMENT — hotspots:
    #   basement_wall: x:1  y:2  w:26 h:52 → far left, tall (wall with symbols)
    #   basement_book:  x:33 y:38 w:32 h:32 → center (stone table with book)
    #   basement_box:   x:73 y:42 w:22 h:32 → right-lower (iron box)
    # ================================================================
    ("basement.jpg",
     "A cinematic photograph of a dark underground basement of an old Chinese mansion. "
     "COMPOSITION: On the far left wall (0-27% horizontal, 0-54% vertical), "
     "the stone wall is covered with carved ancient symbols and strange markings, clearly visible. "
     "In the center of the room (30-65% horizontal, 35-70% vertical), "
     "there is a stone table/platform with a thick leather-bound book resting on top. "
     "In the right-lower corner (70-95% horizontal, 38-74% vertical), "
     "there is a rusty iron box/chest sitting on the floor. "
     "The symbol wall is far left, the stone table with book is center, the iron box is right-bottom. "
     "Damp stone walls, narrow stone stairs going up, deep shadows, single flickering bulb, "
     "very dark and claustrophobic, horror atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 9. ATTIC — hotspots:
    #   attic_mirror:    x:28 y:8  w:42 h:62 → center, very tall (dark mirror)
    #   attic_letter:    x:63 y:52 w:20 h:20 → right-lower (letter on stool)
    #   attic_telescope: x:2  y:18 w:22 h:42 → far left (telescope)
    # ================================================================
    ("attic.jpg",
     "A cinematic photograph of an attic in an abandoned Chinese mansion. "
     "COMPOSITION: On the far left (0-24% horizontal, 15-60% vertical), "
     "there is an old brass telescope on a tripod, pointed toward a skylight. "
     "In the center of the image (26-70% horizontal, 5-70% vertical), "
     "there is a very tall, large antique mirror with a pitch-black mirror surface. "
     "The mirror is the dominant feature, tall and ominous. "
     "In the right-lower area (60-83% horizontal, 50-72% vertical), "
     "there is a small wooden stool with an unopened letter/envelope resting on it, in front of the mirror. "
     "The telescope is far left, the dark mirror is center-tall, the letter is right-bottom. "
     "Slanted wooden beams, dusty trunks, old furniture covered with sheets, cobwebs, "
     "moonbeam through dirty skylight glass, horror atmosphere, cinematic lighting, photorealistic, 16:9 widescreen"),
]


def generate(name, prompt):
    print(f"[START] {name}")
    try:
        resp = requests.post(API, json={"prompt": prompt}, stream=True, timeout=300)
        for line in resp.iter_lines(decode_unicode=True):
            if not line:
                continue
            if line.startswith("data:"):
                data = line[5:].strip()
                if not data:
                    continue
                try:
                    obj = json.loads(data)
                except json.JSONDecodeError:
                    continue
                if obj.get("status") == "succeeded":
                    url = obj.get("resultUrl")
                    if url:
                        r = requests.get(url, timeout=120)
                        path = os.path.join(OUT, name)
                        with open(path, "wb") as f:
                            f.write(r.content)
                        print(f"[DONE] {name} ({len(r.content)} bytes)")
                        return name, True
                elif obj.get("status") in ("failed", "error"):
                    print(f"[FAIL] {name}: {obj.get('error')}")
                    return name, False
        print(f"[TIMEOUT] {name}")
        return name, False
    except Exception as e:
        print(f"[ERROR] {name}: {e}")
        return name, False


# Run in batches of 5 (API supports concurrency of 5)
done = 0
fail = 0
for i in range(0, len(IMAGES), 5):
    batch = IMAGES[i:i+5]
    print(f"\n=== Batch {i//5+1}: {[n for n,_ in batch]} ===")
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
        futures = {ex.submit(generate, n, p): n for n, p in batch}
        for f in concurrent.futures.as_completed(futures):
            name, ok = f.result()
            if ok:
                done += 1
            else:
                fail += 1

print(f"\n===== Result: {done} done, {fail} failed =====")
