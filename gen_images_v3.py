#!/usr/bin/env python3
"""Generate 5 NEW game scene images via the local /api/generate endpoint.
Version 3: New scenes to expand the game — courtyard, shrine, well, secret passage, mirror world.
"""
import json, os, concurrent.futures, requests

API = "http://localhost:3000/api/generate"
OUT = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(OUT, exist_ok=True)

IMAGES = [
    # ================================================================
    # 1. COURTYARD — 庭院
    #   Hotspots:
    #     dead_tree:   x:2  y:10 w:22 h:55  → far left, tall (dead tree with rope)
    #     well:        x:55 y:42 w:25 h:32  → center-right (stone well)
    #     stone_bench: x:75 y:55 w:20 h:25  → right-lower (stone bench)
    # ================================================================
    ("courtyard.jpg",
     "A cinematic wide-angle photograph of an abandoned Chinese mansion courtyard at night. "
     "COMPOSITION: On the far left edge (0-24% horizontal, 5-65% vertical), "
     "there is a large dead twisted tree, bare branches reaching upward, with a frayed rope hanging from a branch. "
     "In the center-right area (52-80% horizontal, 40-74% vertical), "
     "there is an old stone well with a wooden frame and a rusty bucket, clearly visible. "
     "On the right-lower area (72-95% horizontal, 50-80% vertical), "
     "there is an old stone bench with moss growing on it. "
     "The dead tree is far left, the well is center-right, the bench is right-bottom. "
     "Three objects are clearly separated in distinct zones. "
     "Overgrown weeds, cracked stone path, thick fog, pale moonlight, "
     "horror atmosphere, cinematic lighting, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 2. SHRINE — 祠堂
    #   Hotspots:
    #     spirit_tablets: x:30 y:12 w:40 h:35  → center-top (row of spirit tablets)
    #     incense_burner:  x:35 y:48 w:30 h:32  → center-bottom (large incense burner)
    #     ancestor_painting: x:1 y:8 w:20 h:52 → far left (ancestor portrait painting)
    # ================================================================
    ("shrine.jpg",
     "A cinematic photograph of an ancestral shrine hall in an abandoned Chinese mansion. "
     "COMPOSITION: In the upper-center of the back wall (28-72% horizontal, 8-47% vertical), "
     "there is a row of wooden spirit tablets on a high altar shelf, each with Chinese characters. "
     "In the center-lower area (32-66% horizontal, 45-82% vertical), "
     "there is a large bronze incense burner on a table, with old incense sticks. "
     "On the far left wall (0-21% horizontal, 5-60% vertical), "
     "there is a large faded ancestor portrait painting hanging on the wall, depicting a formal Chinese family. "
     "The spirit tablets are upper-center, the incense burner is center-bottom, the painting is far left. "
     "Dim candlelight, red lanterns faded, dust, cobwebs, incense ash, "
     "horror atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 3. WELL — 古井（井内视角）
    #   Hotspots:
    #     well_opening: x:15 y:25 w:55 h:50  → center, large (looking down into well)
    #     well_wall:     x:1  y:5  w:18 h:60 → far left (carvings on well wall)
    #     well_bucket:   x:72 y:40 w:18 h:30 → right (bucket and rope mechanism)
    # ================================================================
    ("well.jpg",
     "A cinematic photograph looking down into an old abandoned stone well in a dark courtyard. "
     "COMPOSITION: The well opening occupies the center of the image (12-72% horizontal, 20-78% vertical), "
     "showing dark water far below with a faint glimmer of something shiny at the bottom. "
     "The inner stone walls of the well are visible, mossy and wet. "
     "On the far left edge (0-19% horizontal, 3-65% vertical), "
     "the outer well wall has ancient carved symbols barely visible under moss. "
     "On the right side (70-92% horizontal, 35-70% vertical), "
     "there is a wooden bucket on a rope-pulley mechanism, the rope hanging down into the well. "
     "The well opening is center, the carved wall is far left, the bucket is right. "
     "Dark, claustrophobic, eerie greenish light from below, dripping water, "
     "horror atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 4. SECRET PASSAGE — 密道
    #   Hotspots:
    #     passage_wall:  x:1  y:5  w:25 h:60  → far left (wall with symbols)
    #     passage_box:    x:68 y:38 w:22 h:32 → right-lower (hidden box)
    #     passage_door:   x:30 y:30 w:35 h:45 → center (door at end)
    # ================================================================
    ("secret_passage.jpg",
     "A cinematic photograph of a narrow secret underground stone passage beneath an old Chinese mansion. "
     "COMPOSITION: On the far left wall (0-26% horizontal, 3-65% vertical), "
     "the stone wall has ancient carved symbols and a mechanism, clearly visible. "
     "In the center of the image (28-67% horizontal, 25-78% vertical), "
     "there is a heavy old wooden door at the end of the passage, partially open, showing light beyond. "
     "In the right-lower area (66-92% horizontal, 33-72% vertical), "
     "there is a small hidden stone box embedded in the wall at floor level. "
     "The symbol wall is far left, the door is center, the hidden box is right-bottom. "
     "Narrow stone corridor, dripping water, single torch on wall, deep shadows, "
     "very dark and claustrophobic, horror atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # ================================================================
    # 5. MIRROR WORLD — 镜中世界
    #   Hotspots:
    #     mirror_self:  x:28 y:15 w:40 h:55  → center (your mirror self / apparitions)
    #     mirror_altar:  x:1  y:38 w:25 h:38  → left-lower (altar with offering)
    #     mirror_exit:   x:72 y:25 w:20 h:45  → right (crack in mirror / exit)
    # ================================================================
    ("mirror_world.jpg",
     "A cinematic photograph of an eerie parallel world seen through a dark mirror in an attic. "
     "The entire scene has an unnatural blue-cyan color tint with ghostly luminescence. "
     "COMPOSITION: In the center of the image (25-70% horizontal, 10-72% vertical), "
     "there are five translucent ghostly human figures standing in a row, their faces blurred, "
     "wearing old Chinese clothing from the Qing dynasty era. They appear to be looking outward. "
     "On the left-lower area (0-26% horizontal, 35-78% vertical), "
     "there is a stone altar with a strange glowing object on it. "
     "On the right side (70-93% horizontal, 20-70% vertical), "
     "there is a jagged crack in the air itself, like a fracture in reality, "
     "through which warm golden light leaks from the real world outside. "
     "The ghost figures are center, the altar is left-bottom, the crack is right. "
     "Surreal, dreamlike, blue mist, floating dust particles, otherworldly glow, "
     "surreal horror, cinematic, photorealistic, 16:9 widescreen"),
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


# Run all 5 at once (API supports concurrency of 5)
print(f"=== Generating 5 new scenes: {[n for n,_ in IMAGES]} ===")
done = 0
fail = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    futures = {ex.submit(generate, n, p): n for n, p in IMAGES}
    for f in concurrent.futures.as_completed(futures):
        name, ok = f.result()
        if ok:
            done += 1
        else:
            fail += 1

print(f"\n===== Result: {done} done, {fail} failed =====")
