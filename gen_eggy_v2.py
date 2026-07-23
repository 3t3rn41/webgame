#!/usr/bin/env python3
"""Regenerate 5 Eggy Party images using the proper Chinese name '蛋仔派对'."""
import json, os, concurrent.futures, requests

API = "http://localhost:3000/api/generate"
OUT = os.path.join(os.path.dirname(__file__), "images")

IMAGES = [
    ("eggy_plaza.jpg",
     "蛋仔派对游戏风格的3D渲染插画，一个漂浮岛屿上的彩色派对广场。"
     "构图：中央(20-65%水平,20-75%垂直)有一个圆形派对舞台，挂着彩色三角旗和气球，舞台中央有一个上锁的宝箱。"
     "左侧(0-18%水平,20-65%垂直)有一个票亭，柜台后面是一个蛋仔派对风格的圆滚滚蛋形NPC角色。"
     "右侧(72-95%水平,25-65%垂直)有三扇彩色门(红、蓝、黄)通向不同区域。"
     "蛋仔派对美术风格，明亮柔和的色彩，圆润的形状，漂浮的云朵，彩虹亮片，活泼的派对氛围，16:9宽屏"),

    ("eggy_jelly.jpg",
     "蛋仔派对游戏风格的3D渲染插画，一个糖果世界中的弹弹果冻舞台。"
     "构图：中央(20-65%水平,25-75%垂直)有一个巨大的晃动的果冻平台，中间有星星按钮和彩纸碎屑。"
     "左侧(0-18%水平,25-65%垂直)有一只巨大的橡皮糖熊举着一把钥匙。"
     "右侧(70-95%水平,20-65%垂直)有一台棉花糖机，当作蹦床使用，顶部有一面旗帜。"
     "蛋仔派对美术风格，明亮的粉色和绿色，光滑的果冻质感，弹跳有趣的氛围，16:9宽屏"),

    ("eggy_cake.jpg",
     "蛋仔派对游戏风格的3D渲染插画，一个奇幻蛋糕工厂，有传送带。"
     "构图：中央(20-65%水平,25-75%垂直)有一条传送带运送蛋糕切片，前面有一个控制面板。"
     "左侧(0-18%水平,20-65%垂直)有一个巨大的搅拌碗和打蛋器，有梯子通向上方平台。"
     "右侧(70-95%水平,20-68%垂直)有一台糖霜机器带操纵杆，有管道通向下一个房间。"
     "蛋仔派对美术风格，温暖的奶油色和巧克力色，光滑的3D表面，工厂但充满趣味，16:9宽屏"),

    ("eggy_toybox.jpg",
     "蛋仔派对游戏风格的3D渲染插画，一个巨大玩具箱的内部场景。"
     "构图：中央(20-65%水平,25-75%垂直)有一个大的发条玩具机器人举着一个金色齿轮。"
     "左侧(0-18%水平,20-65%垂直)有一堆积木搭成楼梯，顶部有一架玩具飞机。"
     "右侧(70-95%水平,20-68%垂直)有一个娃娃屋，门开着，里面露出一个金色小皇冠。"
     "蛋仔派对美术风格，明亮的三原色，光滑的玩具质感，充满趣味和怀旧的玩具箱内部，16:9宽屏"),

    ("eggy_crown.jpg",
     "蛋仔派对游戏风格的3D渲染插画，漂浮岛屿上一座彩虹塔的塔顶。"
     "构图：中央(25-65%水平,15-75%垂直)有一条螺旋楼梯通向上方的金色皇冠奖杯，放在基座上。"
     "左侧(0-20%水平,25-65%垂直)有一台彩色大炮可以将蛋仔发射到上方。"
     "右侧(70-95%水平,15-65%垂直)有一个巨大的开关按钮，按下后激活通往皇冠的彩虹桥。"
     "蛋仔派对美术风格，鲜艳的彩虹色，飘落的彩纸屑，蓝天白云，胜利的庆典氛围，16:9宽屏"),
]


def generate(name, prompt):
    print(f"[START] {name}")
    try:
        resp = requests.post(API, json={"prompt": prompt}, stream=True, timeout=600)
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
print("=== Regenerating Eggy Party images with '蛋仔派对' keyword ===")
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    futures = {ex.submit(generate, n, p): n for n, p in IMAGES}
    for f in concurrent.futures.as_completed(futures):
        name, ok = f.result()
        if ok:
            done += 1
        else:
            fail += 1

print(f"\n===== Result: {done} done, {fail} failed =====")
