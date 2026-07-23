#!/usr/bin/env python3
"""Generate images for two new games: Star Drift (sci-fi) and Tomb Quest (adventure).
10 images total, 5 per game.
"""
import json, os, concurrent.futures, requests

API = "http://localhost:3000/api/generate"
OUT = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(OUT, exist_ok=True)

IMAGES = [
    # ================================================================
    # STAR DRIFT — Sci-fi survival on a derelict space station
    # ================================================================
    # 1. Cryolab — wake up here
    #   Hotspots: cryo_pod(center), console(right), locker(left)
    ("star_cryo.jpg",
     "A cinematic wide-angle photograph of a futuristic cryosleep laboratory on a derelict space station. "
     "COMPOSITION: In the center of the image (25-70% horizontal, 15-75% vertical), "
     "there is a large open cryosleep pod/capsule with frost and condensation, its glass lid open. "
     "On the right side (68-92% horizontal, 30-65% vertical), "
     "there is a wall-mounted computer console with a flickering screen showing error messages. "
     "On the far left (2-22% horizontal, 25-65% vertical), "
     "there is a metal storage locker, partially open. "
     "Emergency red lighting, sparking cables, frost on walls, zero-gravity debris floating, "
     "dark and claustrophobic sci-fi horror atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # 2. Bridge — control room
    #   Hotspots: main_console(center), captain_chair(left), viewscreen(top)
    ("star_bridge.jpg",
     "A cinematic photograph of a dark spaceship bridge/control room with shattered windows showing stars. "
     "COMPOSITION: In the upper-center (20-75% horizontal, 5-40% vertical), "
     "there is a large cracked viewscreen showing static and partial star charts. "
     "In the center-lower area (25-65% horizontal, 38-78% vertical), "
     "there is a curved main control console with holographic displays, some flickering. "
     "On the left side (2-22% horizontal, 30-70% vertical), "
     "there is a captain's chair, tilted, with a body outline in dust. "
     "Emergency lights, floating debris, cracked glass, dark blue and orange warning lights, "
     "sci-fi atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # 3. Engine Room — power systems
    #   Hotspots: reactor(center-left), fuse_box(right), tool_rack(left)
    ("star_engine.jpg",
     "A cinematic photograph of a dark spaceship engine room with massive machinery. "
     "COMPOSITION: On the left-center (5-45% horizontal, 10-75% vertical), "
     "there is a large cylindrical fusion reactor core, dark and inactive, with exposed wiring. "
     "On the right side (65-92% horizontal, 30-70% vertical), "
     "there is an electrical fuse box panel with switches and burnt-out circuits, sparks coming from it. "
     "On the far left (0-12% horizontal, 40-75% vertical), "
     "there is a metal tool rack with wrenches and a multitool hanging on it. "
     "Pipes, coolant leaks, dim industrial lighting, steam, dark and gritty, "
     "sci-fi industrial atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # 4. Medical Bay — crew logs
    #   Hotspots: med_bed(center), cabinet(left), terminal(right)
    ("star_medical.jpg",
     "A cinematic photograph of a spaceship medical bay, dark and abandoned. "
     "COMPOSITION: In the center (20-65% horizontal, 30-75% vertical), "
     "there is a medical examination bed with restraints, stained with dried dark fluid. "
     "On the left wall (0-18% horizontal, 20-65% vertical), "
     "there is a glass-front medicine cabinet, some vials missing. "
     "On the right side (68-93% horizontal, 25-65% vertical), "
     "there is a medical computer terminal with a glowing blue screen showing patient data. "
     "Cold blue lighting, medical instruments scattered, dark stains on floor, "
     "creepy sci-fi medical horror atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # 5. Escape Pod Bay — final escape
    #   Hotspots: escape_pod(center), control_panel(right), debris(left)
    ("star_escape.jpg",
     "A cinematic photograph of a spaceship escape pod bay with an airlock. "
     "COMPOSITION: In the center (20-70% horizontal, 15-75% vertical), "
     "there is a small white escape pod spacecraft with a closed hatch door, "
     "docking clamps still attached, warning lights blinking. "
     "On the right side (72-95% horizontal, 35-70% vertical), "
     "there is a control panel with a keypad and lever for pod launch. "
     "On the far left (0-15% horizontal, 40-72% vertical), "
     "there is a pile of debris and a spacesuit helmet on the floor. "
     "Red warning lights, airlock door, stars visible through a small window, "
     "urgency and tension, sci-fi atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # ================================================================
    # TOMB QUEST — Adventure in an ancient Egyptian tomb
    # ================================================================
    # 1. Entrance Hall — collapsed entrance
    #   Hotspots: rubble(center), wall_relief(left), torch_holder(right)
    ("tomb_entrance.jpg",
     "A cinematic photograph of an ancient Egyptian tomb entrance hall with a collapsed stone doorway. "
     "COMPOSITION: In the center (15-75% horizontal, 30-80% vertical), "
     "there is a massive pile of collapsed stone blocks and rubble blocking the exit doorway. "
     "On the left wall (0-20% horizontal, 10-65% vertical), "
     "there are colorful ancient Egyptian wall reliefs depicting gods and pharaohs, partially visible. "
     "On the right side (75-95% horizontal, 25-60% vertical), "
     "there is a bronze torch holder mounted on the wall, with an unlit torch. "
     "Dust particles in shafts of light from cracks, sandy floor, dim and ancient atmosphere, "
     "adventure archaeology mood, cinematic, photorealistic, 16:9 widescreen"),

    # 2. Burial Chamber — sarcophagus
    #   Hotspots: sarcophagus(center), canopic_jars(left), wall_painting(right)
    ("tomb_burial.jpg",
     "A cinematic photograph of an ancient Egyptian burial chamber with a stone sarcophagus. "
     "COMPOSITION: In the center (25-65% horizontal, 25-78% vertical), "
     "there is a large ornate stone sarcophagus with a carved pharaoh's face on the lid, "
     "gold and blue paint, lid slightly ajar. "
     "On the left side (0-20% horizontal, 35-70% vertical), "
     "there is a stone table with four canopic jars, each with a different animal head. "
     "On the right wall (72-95% horizontal, 10-60% vertical), "
     "there is a vivid wall painting showing the weighing of the heart ceremony. "
     "Golden artifacts, hieroglyphs on walls, flickering torchlight, ancient and mysterious, "
     "adventure atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # 3. Hieroglyph Corridor — puzzles on walls
    #   Hotspots: left_wall(left), right_wall(right), floor_trap(center)
    ("tomb_corridor.jpg",
     "A cinematic photograph of a narrow ancient Egyptian tomb corridor covered in hieroglyphs. "
     "COMPOSITION: The corridor stretches into darkness in the center background. "
     "On the left wall (0-30% horizontal, 5-80% vertical), "
     "there are dense hieroglyphic inscriptions with a circular zodiac-like carving, "
     "some symbols glowing faintly. "
     "On the right wall (70-100% horizontal, 5-80% vertical), "
     "there is a series of carved panels depicting a journey through the underworld, "
     "with a lever mechanism hidden among the carvings. "
     "In the center-lower floor (30-65% horizontal, 60-85% vertical), "
     "there is a section of floor with suspicious gaps — a trap. "
     "Narrow, claustrophobic, torchlit, sandy, ancient Egyptian adventure atmosphere, "
     "cinematic, photorealistic, 16:9 widescreen"),

    # 4. Underground River — water puzzle
    #   Hotspots: water(center), boat(left), mechanism(right)
    ("tomb_river.jpg",
     "A cinematic photograph of an underground river inside an ancient Egyptian tomb cave. "
     "COMPOSITION: In the center (15-80% horizontal, 35-80% vertical), "
     "there is dark flowing underground water with faint reflections of torchlight. "
     "On the left side (0-18% horizontal, 30-70% vertical), "
     "there is an old wooden reed boat tied to a stone post, partially decayed. "
     "On the right wall (75-95% horizontal, 20-60% vertical), "
     "there is a stone mechanism with a wheel and chains controlling a portcullis gate. "
     "Stalactites, cave formations, bioluminescent glow on water, ancient stone bridge in background, "
     "mysterious underground atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # 5. Sun Altar — final exit
    #   Hotspots: altar(center), sun_dial(left), exit_door(right)
    ("tomb_altar.jpg",
     "A cinematic photograph of an ancient Egyptian sun altar chamber with a beam of sunlight. "
     "COMPOSITION: In the center (25-65% horizontal, 30-78% vertical), "
     "there is a stone altar with a golden sun disk on top, catching a beam of light from above. "
     "On the left side (0-22% horizontal, 25-70% vertical), "
     "there is a stone sundial / calendar mechanism with movable parts. "
     "On the right side (72-95% horizontal, 20-72% vertical), "
     "there is a massive stone door covered in hieroglyphs, partially open, "
     "bright sunlight streaming through the gap. "
     "Golden light, dust motes, sacred atmosphere, ancient Egyptian grandeur, "
     "adventure climax mood, cinematic, photorealistic, 16:9 widescreen"),
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


# Run in two batches of 5
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
