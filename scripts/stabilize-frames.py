"""Measure per-frame camera drift of the machine (sub-pixel, both axes) and write
public/frames/stabilize.json = {"shiftX": [...], "shiftY": [...]} in source pixels.
The runtime subtracts it so the machine stays put while scrolling.
Run after `npm run frames` (needs pillow + numpy)."""
import glob, json
import numpy as np
from PIL import Image

fs = sorted(glob.glob("public/frames/frame_*.jpg"))
load = lambda f: np.asarray(Image.open(f).convert("L"), dtype=float)
R = load(fs[0])[150:700, 300:700]  # static machine body

def p3(l, c, r):
    d = l - 2 * c + r
    return 0.0 if d == 0 else 0.5 * (l - r) / d

def measure(f):
    a = load(f)
    res = {(dx, dy): np.abs(a[150 + dy:700 + dy, 300 + dx:700 + dx] - R).mean()
           for dy in range(-10, 11) for dx in range(-14, 15)}
    dx, dy = min(res, key=res.get)
    c = res[(dx, dy)]
    return (dx + p3(res.get((dx - 1, dy), c), c, res.get((dx + 1, dy), c)),
            dy + p3(res.get((dx, dy - 1), c), c, res.get((dx, dy + 1), c)))

m = np.array([measure(f) for f in fs])
def smooth(v, k=2):
    return [round(float(np.mean(v[max(0, i - k):i + k + 1])), 2) for i in range(len(v))]
json.dump({"shiftX": smooth(m[:, 0]), "shiftY": smooth(m[:, 1])}, open("public/frames/stabilize.json", "w"))
print("x", smooth(m[:, 0])[::20]); print("y", smooth(m[:, 1])[::20])
