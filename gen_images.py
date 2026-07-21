#!/usr/bin/env python3
"""Generate all game images via the local /api/generate endpoint (SSE stream)."""
import json, os, time, concurrent.futures, requests

API = "http://localhost:3000/api/generate"
OUT = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(OUT, exist_ok=True)

# (filename, prompt) — all prompts in English for best results
IMAGES = [
    ("gate.jpg",
     "A foggy abandoned Chinese mansion entrance gate at night, rusted iron gate, "
     "stone lions covered in moss, dead wisteria, pale moonlight, horror atmosphere, "
     "cinematic lighting, volumetric fog, dark and eerie, photorealistic"),

    ("hall.jpg",
     "Dark entrance hall of an abandoned Chinese mansion, dusty marble floor, "
     "a large fogged vintage mirror on the wall, old coat rack with hanging coats, "
     "faded wallpaper peeling, cobwebs, dim candlelight, horror atmosphere, "
     "cinematic, photorealistic"),

    ("living.jpg",
     "Dusty living room of an abandoned Chinese mansion, old fireplace with ashes, "
     "a large oil painting hanging on cracked wall, worn velvet sofa, "
     "cobwebs and peeling wallpaper, moonlight through broken blinds, "
     "horror atmosphere, cinematic lighting, photorealistic"),

    ("dining.jpg",
     "Dining room of an abandoned Chinese mansion, long wooden table set for five "
     "with dusty plates and rotten food, a stopped grandfather clock on wall, "
     "broken chandelier, cobwebs, dim eerie light, horror atmosphere, "
     "cinematic, photorealistic"),

    ("kitchen.jpg",
     "Kitchen of an abandoned Chinese mansion, rusty stove, wooden cabinets, "
     "broken tiles, old recipe book on counter, dusty jars, "
     "a single bare bulb, horror atmosphere, cinematic lighting, photorealistic"),

    ("study.jpg",
     "Study room of an abandoned Chinese mansion, wooden desk with locked drawers, "
     "bookshelves full of old books, scattered papers, an inkwell, "
     "green banker's lamp, dust motes in dim light, horror atmosphere, "
     "cinematic, photorealistic"),

    ("bedroom.jpg",
     "Master bedroom of an abandoned Chinese mansion, unmade four-poster bed with "
     "torn curtains, old wardrobe, dusty vanity table with cracked mirror, "
     "peeling wallpaper, moonlight through dirty window, horror atmosphere, "
     "cinematic lighting, photorealistic"),

    ("basement.jpg",
     "Dark basement of an abandoned Chinese mansion, stone walls with damp, "
     "wooden stairs going up, old boxes and junk, a single flickering bulb, "
     "deep shadows, very dark and claustrophobic, horror atmosphere, "
     "cinematic, photorealistic"),

    ("attic.jpg",
     "Attic of an abandoned Chinese mansion, slanted wooden beams, dusty trunks, "
     "old furniture covered with sheets, a large telescope pointed at a skylight, "
     "cobwebs everywhere, moonbeam through dirty glass, horror atmosphere, "
     "cinematic lighting, photorealistic"),

    ("mirror_truth.jpg",
     "A tall antique Chinese mirror in a dark attic, the mirror surface showing "
     "not a reflection but a swirling vortex of stars and darkness, "
     "pale ghostly hands pressing against glass from inside, "
     "eerie blue glow, surreal horror, cinematic, photorealistic"),
]


def generate(name, prompt):
    print(f"[START] {name}")
    try:
        resp = requests.post(API, json={"prompt": prompt}, stream=True, timeout=300)
        reader = resp.body.getReader() if hasattr(resp, "body") else None
        # fallback to iter_lines
        buf = ""
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
                        # download the image
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
