#!/usr/bin/env python3
"""Generate images for 2 new games: Isekai Academy (anime) and Eggy Party Island.
10 images total, 5 per game.
"""
import json, os, concurrent.futures, requests

API = "http://localhost:3000/api/generate"
OUT = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(OUT, exist_ok=True)

IMAGES = [
    # ================================================================
    # ISEKAI ACADEMY — Anime-style school mystery
    # ================================================================
    # 1. Classroom
    ("anime_classroom.jpg",
     "A beautiful anime-style illustration of a Japanese high school classroom at sunset. "
     "COMPOSITION: In the center (20-65% horizontal, 25-75% vertical), "
     "there are rows of wooden desks, one with a mysterious letter on it. "
     "On the left (0-18% horizontal, 20-65% vertical), "
     "there is a teacher's desk with a glowing crystal orb. "
     "On the right (72-95% horizontal, 15-65% vertical), "
     "there are windows showing a purple-orange sunset sky with floating magical particles. "
     "Anime art style, cel shading, vibrant colors, sakura petals outside windows, "
     "mysterious atmosphere, wide angle, 16:9 widescreen"),

    # 2. Library
    ("anime_library.jpg",
     "A beautiful anime-style illustration of a magical school library with towering bookshelves. "
     "COMPOSITION: In the center (20-65% horizontal, 20-75% vertical), "
     "there is a large wooden reading table with glowing books and a key on top. "
     "On the left (0-18% horizontal, 10-70% vertical), "
     "there are massive bookshelves reaching to the ceiling, one book glowing blue. "
     "On the right (72-95% horizontal, 20-65% vertical), "
     "there is a stained glass window depicting a magical symbol, moonlight streaming through. "
     "Anime art style, cel shading, floating dust particles, warm and cool color contrast, "
     "magical library atmosphere, 16:9 widescreen"),

    # 3. Rooftop
    ("anime_rooftop.jpg",
     "A beautiful anime-style illustration of a school rooftop at night with starry sky. "
     "COMPOSITION: In the center (25-65% horizontal, 30-75% vertical), "
     "there is a chain-link fence with a lock, and a small altar with candles. "
     "On the left (0-20% horizontal, 15-65% vertical), "
     "there is a water tower with a hidden compartment. "
     "On the right (70-95% horizontal, 5-60% vertical), "
     "there is a vast starry sky with a constellation glowing, school buildings below. "
     "Anime art style, cel shading, dramatic night sky, shooting star, "
     "emotional and mysterious rooftop scene, 16:9 widescreen"),

    # 4. Club Room
    ("anime_club.jpg",
     "A beautiful anime-style illustration of a school club room filled with occult items. "
     "COMPOSITION: In the center (20-65% horizontal, 25-75% vertical), "
     "there is a round table with a Ouija board, tarot cards, and a crystal ball. "
     "On the left (0-18% horizontal, 20-65% vertical), "
     "there is a storage cabinet with potions and a sealed box. "
     "On the right (70-95% horizontal, 20-68% vertical), "
     "there is a bulletin board with photos of missing students connected by red string. "
     "Anime art style, cel shading, warm lamp light, occult mystery, "
     "cozy but eerie club room, 16:9 widescreen"),

    # 5. Principal's Office
    ("anime_office.jpg",
     "A beautiful anime-style illustration of a grand principal's office with magical elements. "
     "COMPOSITION: In the center (25-65% horizontal, 25-75% vertical), "
     "there is a large ornate desk with a portal mirror and an ancient grimoire. "
     "On the left (0-20% horizontal, 15-70% vertical), "
     "there is a tall grandfather clock stopped at 11:45, glowing faintly. "
     "On the right (70-95% horizontal, 20-65% vertical), "
     "there is a painting of the school founder that hides a safe behind it. "
     "Anime art style, cel shading, dramatic lighting, grand office, magical mystery, "
     "climactic atmosphere, 16:9 widescreen"),

    # ================================================================
    # EGGY PARTY ISLAND — Cute 3D party adventure
    # ================================================================
    # 1. Party Plaza
    ("eggy_plaza.jpg",
     "A colorful 3D render illustration of a cute party plaza on a floating island. "
     "COMPOSITION: In the center (20-65% horizontal, 20-75% vertical), "
     "there is a large round party stage with colorful bunting, balloons, and a locked treasure chest. "
     "On the left (0-18% horizontal, 20-65% vertical), "
     "there is a ticket booth with a cute egg-shaped NPC behind the counter. "
     "On the right (72-95% horizontal, 25-65% vertical), "
     "there are three colorful doors (red, blue, yellow) leading to different areas. "
     "Cute 3D render style, bright pastel colors, rounded shapes, floating clouds, "
     "rainbow sprinkles, playful party game atmosphere, 16:9 widescreen"),

    # 2. Jelly Stage
    ("eggy_jelly.jpg",
     "A colorful 3D render illustration of a bouncy jelly stage in a candy world. "
     "COMPOSITION: In the center (20-65% horizontal, 25-75% vertical), "
     "there is a large wobbly jelly platform with a star button in the middle and confetti. "
     "On the left (0-18% horizontal, 25-65% vertical), "
     "there is a giant gummy bear holding a key. "
     "On the right (70-95% horizontal, 20-65% vertical), "
     "there is a cotton candy machine that acts as a trampoline, with a flag on top. "
     "Cute 3D render style, bright pink and green colors, glossy jelly textures, "
     "bouncy and fun atmosphere, playful, 16:9 widescreen"),

    # 3. Cake Factory
    ("eggy_cake.jpg",
     "A colorful 3D render illustration of a whimsical cake factory with conveyor belts. "
     "COMPOSITION: In the center (20-65% horizontal, 25-75% vertical), "
     "there is a conveyor belt carrying cake slices, with a control panel in front. "
     "On the left (0-18% horizontal, 20-65% vertical), "
     "there is a giant mixing bowl with a whisk, and a ladder going up to a platform. "
     "On the right (70-95% horizontal, 20-68% vertical), "
     "there is a frosting machine with a lever, and a pipe leading to the next room. "
     "Cute 3D render style, warm cream and chocolate colors, glossy 3D surfaces, "
     "factory but playful, whimsical, 16:9 widescreen"),

    # 4. Toy Box
    ("eggy_toybox.jpg",
     "A colorful 3D render illustration of the inside of a giant toy box. "
     "COMPOSITION: In the center (20-65% horizontal, 25-75% vertical), "
     "there is a large wind-up toy robot holding a golden gear. "
     "On the left (0-18% horizontal, 20-65% vertical), "
     "there is a stack of building blocks forming stairs, with a toy plane on top. "
     "On the right (70-95% horizontal, 20-68% vertical), "
     "there is a dollhouse with its door open, revealing a tiny golden crown inside. "
     "Cute 3D render style, bright primary colors, glossy toy textures, "
     "playful and nostalgic toy box interior, 16:9 widescreen"),

    # 5. Crown Tower
    ("eggy_crown.jpg",
     "A colorful 3D render illustration of the top of a rainbow tower on a floating island. "
     "COMPOSITION: In the center (25-65% horizontal, 15-75% vertical), "
     "there is a spiral staircase leading up to a golden crown trophy on a pedestal. "
     "On the left (0-20% horizontal, 25-65% vertical), "
     "there is a colorful cannon that can launch you upward. "
     "On the right (70-95% horizontal, 15-65% vertical), "
     "there is a giant switch button that activates a rainbow bridge to the crown. "
     "Cute 3D render style, vibrant rainbow colors, confetti falling, blue sky with clouds, "
     "triumphant and festive finale atmosphere, 16:9 widescreen"),
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
