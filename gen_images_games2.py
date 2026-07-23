#!/usr/bin/env python3
"""Generate images for 3 new games: Deep Abyss, Time Inn, Wasteland Express.
15 images total, 5 per game.
"""
import json, os, concurrent.futures, requests

API = "http://localhost:3000/api/generate"
OUT = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(OUT, exist_ok=True)

IMAGES = [
    # ================================================================
    # DEEP ABYSS — Deep sea underwater research station horror
    # ================================================================
    ("deep_dock.jpg",
     "A cinematic wide-angle photograph of a deep underwater research station docking bay. "
     "COMPOSITION: In the center (20-70% horizontal, 20-75% vertical), "
     "there is a large round submarine docking hatch with water pooling around it, "
     "yellow warning lights blinking. "
     "On the right side (72-95% horizontal, 30-65% vertical), "
     "there is a control panel with sonar screens and a flooding alert. "
     "On the far left (0-18% horizontal, 25-70% vertical), "
     "there is a metal locker with diving suits hanging inside, partially open. "
     "Dark teal water, bioluminescent particles, cracks leaking water, rusted metal, "
     "deep sea claustrophobic horror atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    ("deep_lab.jpg",
     "A cinematic photograph of an underwater laboratory with shattered observation windows. "
     "COMPOSITION: In the center-upper (15-75% horizontal, 5-40% vertical), "
     "there is a large cracked observation window showing dark ocean water outside, "
     "with something large moving in the depths. "
     "In the center-lower (25-65% horizontal, 38-78% vertical), "
     "there is a lab workbench with beakers, a microscope, and scattered papers. "
     "On the left (0-18% horizontal, 30-65% vertical), "
     "there is a specimen containment tank with something floating in murky liquid. "
     "Flickering lights, water dripping from ceiling, dark teal and green tones, "
     "underwater research horror, cinematic, photorealistic, 16:9 widescreen"),

    ("deep_engine.jpg",
     "A cinematic photograph of an underwater station engine room with flooding. "
     "COMPOSITION: On the left-center (5-45% horizontal, 10-75% vertical), "
     "there is a large water turbine generator, still humming, with steam rising. "
     "On the right (65-92% horizontal, 30-70% vertical), "
     "there is an electrical panel with a manual override lever and circuit breakers. "
     "On the far left (0-10% horizontal, 40-75% vertical), "
     "there is a tool crate with a crowbar sticking out. "
     "Ankle-deep water on the floor, pipes leaking, emergency lights, rusted metal, "
     "industrial underwater horror, cinematic, photorealistic, 16:9 widescreen"),

    ("deep_crew.jpg",
     "A cinematic photograph of a flooded crew quarters in an underwater station. "
     "COMPOSITION: In the center (20-65% horizontal, 25-75% vertical), "
     "there is a bunk bed area with personal items scattered, a photo frame on the pillow. "
     "On the left (0-18% horizontal, 20-65% vertical), "
     "there is a desk with a laptop showing a video log, screen still glowing. "
     "On the right (70-95% horizontal, 30-68% vertical), "
     "there is a wall-mounted first aid kit, its door hanging open, supplies missing. "
     "Water up to ankles, floating debris, dark and somber, personal items, "
     "underwater horror melancholy, cinematic, photorealistic, 16:9 widescreen"),

    ("deep_escape.jpg",
     "A cinematic photograph of an underwater escape pod bay with a single pod. "
     "COMPOSITION: In the center (20-70% horizontal, 15-75% vertical), "
     "there is a yellow spherical escape pod with a round hatch, "
     "docking clamps locked, a red light above it. "
     "On the right (72-95% horizontal, 35-70% vertical), "
     "there is a launch control console with a large red button and keypad. "
     "On the far left (0-15% horizontal, 40-72% vertical), "
     "there is a fire extinguisher and an emergency axe behind glass. "
     "Water rising on the floor, cracks in walls, desperate escape atmosphere, "
     "underwater horror climax, cinematic, photorealistic, 16:9 widescreen"),

    # ================================================================
    # TIME INN — Ancient Chinese inn with a time loop mystery
    # ================================================================
    ("inn_lobby.jpg",
     "A cinematic photograph of an ancient Chinese inn lobby at dusk. "
     "COMPOSITION: In the center (25-65% horizontal, 20-75% vertical), "
     "there is a large wooden front desk with a brass bell and a guest registry book, "
     "an oil lamp flickering on top. "
     "On the left (0-20% horizontal, 15-65% vertical), "
     "there is a wooden staircase leading upstairs, red lanterns hanging along it. "
     "On the right (72-95% horizontal, 25-65% vertical), "
     "there is a notice board with wanted posters and a cuckoo clock on the wall. "
     "Warm amber light, dust motes, wooden beams, Qing dynasty era, "
     "mysterious ancient Chinese atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    ("inn_room.jpg",
     "A cinematic photograph of a guest room in an ancient Chinese inn. "
     "COMPOSITION: In the center (20-65% horizontal, 25-75% vertical), "
     "there is a wooden bed with a sleeping mat, a small wooden table beside it "
     "with a tea cup and a folded letter. "
     "On the left (0-18% horizontal, 20-65% vertical), "
     "there is a wooden wardrobe, slightly ajar, with a mirror inside. "
     "On the right (70-95% horizontal, 20-65% vertical), "
     "there is a window with wooden lattice, moonlight streaming through, "
     "a calendar on the wall showing a specific date circled in red. "
     "Warm candlelight, mysterious shadows, Qing dynasty furniture, "
     "intriguing atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    ("inn_kitchen.jpg",
     "A cinematic photograph of an ancient Chinese inn kitchen at night. "
     "COMPOSITION: In the center (20-65% horizontal, 25-75% vertical), "
     "there is a large wood-fired stove with multiple pots, a fire still burning. "
     "On the left (0-18% horizontal, 25-65% vertical), "
     "there is a water barrel with a ladle, and a shelf with spices and herbs. "
     "On the right (70-95% horizontal, 30-68% vertical), "
     "there is a chopping block with a cleaver stuck in it, and a jar of wine. "
     "Steam rising, fire glow, hanging dried meats, rustic and warm but unsettling, "
     "ancient Chinese kitchen, cinematic, photorealistic, 16:9 widescreen"),

    ("inn_courtyard.jpg",
     "A cinematic photograph of a courtyard behind an ancient Chinese inn at midnight. "
     "COMPOSITION: In the center (20-65% horizontal, 20-75% vertical), "
     "there is a stone well with a wooden bucket, moonlight reflecting on its water. "
     "On the left (0-20% horizontal, 15-65% vertical), "
     "there is a plum blossom tree in full bloom, petals falling like snow. "
     "On the right (70-95% horizontal, 20-65% vertical), "
     "there is a stone table with two cups of tea, one still steaming, "
     "as if someone was just sitting there. "
     "Full moon, plum blossoms, mist, ethereal blue-silver moonlight, "
     "mysterious and beautiful, cinematic, photorealistic, 16:9 widescreen"),

    ("inn_cellar.jpg",
     "A cinematic photograph of a secret cellar beneath an ancient Chinese inn. "
     "COMPOSITION: In the center (25-65% horizontal, 25-75% vertical), "
     "there is an old wooden table with an hourglass, a strange mechanical device "
     "made of brass gears, and a journal open to a specific page. "
     "On the left (0-20% horizontal, 20-65% vertical), "
     "there are shelves of old wine jars, one broken on the floor. "
     "On the right (70-95% horizontal, 25-65% vertical), "
     "there is a wall with a painted mural showing the same inn in different seasons, "
     "as if time is repeating. "
     "Dim candlelight, cobwebs, dust, brass reflections, ancient mystery, "
     "time loop revelation atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    # ================================================================
    # WASTELAND EXPRESS — Post-apocalyptic survival on a moving train
    # ================================================================
    ("waste_cabin.jpg",
     "A cinematic wide-angle photograph of a rusted train passenger cabin in a post-apocalyptic wasteland. "
     "COMPOSITION: In the center (20-65% horizontal, 20-75% vertical), "
     "there is a row of torn seats with a survival backpack left on one seat. "
     "On the right (68-92% horizontal, 25-65% vertical), "
     "there is a door with a broken electronic lock and a crudely drawn map taped to it. "
     "On the far left (0-18% horizontal, 30-68% vertical), "
     "there is an emergency axe in a case with cracked glass. "
     "Dust, rust, sand on the floor, cracked windows showing desert outside, "
     "grimy orange and brown tones, post-apocalyptic, cinematic, photorealistic, 16:9 widescreen"),

    ("waste_engine.jpg",
     "A cinematic photograph of a rusted train locomotive engine room. "
     "COMPOSITION: On the left-center (5-50% horizontal, 10-75% vertical), "
     "there is a massive diesel engine with exposed pipes and steam valves, "
     "barely running, making grinding noises. "
     "On the right (60-92% horizontal, 25-68% vertical), "
     "there is an engineer's control panel with throttle levers, gauges, "
     "and a logbook chained to the desk. "
     "On the far left (0-8% horizontal, 40-75% vertical), "
     "there is a red jerrycan of fuel. "
     "Grease, steam, sparks, industrial grime, warning lights, "
     "post-apocalyptic industrial, cinematic, photorealistic, 16:9 widescreen"),

    ("waste_cargo.jpg",
     "A cinematic photograph of a train cargo car filled with scavenged supplies. "
     "COMPOSITION: In the center (20-65% horizontal, 25-75% vertical), "
     "there are stacked crates and boxes, one open showing canned food and water bottles. "
     "On the left (0-18% horizontal, 25-65% vertical), "
     "there is a locked gun cabinet with a keypad lock. "
     "On the right (70-95% horizontal, 20-68% vertical), "
     "there is a workbench with tools, a welding torch, and a radio transmitter. "
     "Dim lighting, dust particles, supply crates, post-apocalyptic resource scarcity, "
     "survival atmosphere, cinematic, photorealistic, 16:9 widescreen"),

    ("waste_rooftop.jpg",
     "A cinematic photograph of the rooftop of a moving train crossing a post-apocalyptic desert. "
     "COMPOSITION: The scene is on top of a train car, desert stretching to the horizon. "
     "In the center (20-65% horizontal, 15-70% vertical), "
     "there is a satellite dish and antenna array, partially damaged. "
     "On the left (0-18% horizontal, 30-65% vertical), "
     "there is a storage crate bolted to the roof with a flare gun inside. "
     "On the right (70-95% horizontal, 25-65% vertical), "
     "there is a ladder leading to the next car, and a wind gauge. "
     "Orange desert sky, dust storm in distance, sunset, wind blowing, "
     "post-apocalyptic vastness, cinematic, photorealistic, 16:9 widescreen"),

    ("waste_caboose.jpg",
     "A cinematic photograph of the last car (caboose) of a post-apocalyptic train. "
     "COMPOSITION: In the center (20-65% horizontal, 20-75% vertical), "
     "there is a manual brake wheel and a control console with a red button "
     "labeled EMERGENCY STOP. "
     "On the left (0-18% horizontal, 25-65% vertical), "
     "there is a first aid station with bandages and a syringe. "
     "On the right (70-95% horizontal, 20-65% vertical), "
     "there is a rear window showing the track behind, "
     "and a pair of binoculars on a hook. "
     "Rusted metal, desert visible through windows, tense atmosphere, "
     "climax of a journey, cinematic, photorealistic, 16:9 widescreen"),
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
