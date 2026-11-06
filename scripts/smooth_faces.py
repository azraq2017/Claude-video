"""Turn raw YuNet detections into the [t,x,y,w,h] track the layout engine uses.
Short gaps carry the last box; long gaps (head down, out of frame) fall back to a
conservative 'face somewhere in this band' box so graphics stay clear of it.
Usage: python3 scripts/smooth_faces.py raw_faces.json out.json [max_y] [fallback x,y,w,h]"""
import json, sys
raw = json.load(open(sys.argv[1]))
max_y = float(sys.argv[3]) if len(sys.argv) > 3 else 0.7
fallback = [float(v) for v in sys.argv[4].split(",")] if len(sys.argv) > 4 else [0.3, 0.3, 0.4, 0.2]
out, last, miss = [], None, 0
for o in raw:
    b = o["box"]
    if b and b[1] + b[3] > max_y:  # mis-detections low in frame (phones, hands, posters)
        b = None
    if b:
        last, miss = b, 0
    else:
        miss += 1
    use = b or (last if last and miss <= 3 else fallback)
    out.append([o["t"]] + [round(v, 3) for v in use])
json.dump(out, open(sys.argv[2], "w"))
print(len(out), "samples,", sum(1 for o in raw if o["box"]), "detected")
