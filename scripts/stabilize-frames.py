"""Measure per-frame horizontal drift of the machine (camera sway in the footage)
and write public/frames/stabilize.json = {"shiftX": [...]} in source pixels.
The runtime subtracts it so the machine stays put while scrolling.
Run after `npm run frames` (needs pillow + numpy)."""
import glob, json
import numpy as np
from PIL import Image

fs = sorted(glob.glob("public/frames/frame_*.jpg"))
load = lambda f: np.asarray(Image.open(f).convert("L"), dtype=float)
ref = load(fs[0])[:, 250:480]
out = []
for f in fs:
    a = load(f)
    errs = [(np.abs(a[:, 250 + s:480 + s] - ref).mean(), s) for s in range(-12, 13)]
    out.append(min(errs)[1])
# 5-frame median smoothing to drop single-frame mismatches
sm = [int(np.median(out[max(0, i - 2):i + 3])) for i in range(len(out))]
json.dump({"shiftX": sm}, open("public/frames/stabilize.json", "w"))
print(sm[::10])
