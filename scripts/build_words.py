"""Flatten a Whisper transcript into a words.json for captions, with spelling fixes.
Usage: python3 scripts/build_words.py src/projects/<name>"""
import json, re, os, sys

FIX = {
    # video 1
    "train": "trade", "gilat": "gilap", "pembaikian": "pembaikan",
    # video 2
    "whatsapp": "WhatsApp", "seratus": "RM100", "handphone": "handphone",
}

folder = sys.argv[1]
out = []
for seg in json.load(open(os.path.join(folder, "transcript.json"))):
    for w in seg["words"]:
        raw = w["w"].strip()
        if raw[:1] == "," and out and re.fullmatch(r",\d{3}[.,?!]?", raw):  # "RM7" + ",000." -> "RM7,000"
            out[-1]["w"] += raw.rstrip(".,?!"); out[-1]["e"] = w["e"]; out[-1]["p"] = raw[-1] in ".?!"; continue
        core = re.sub(r"[^\w\-]", "", raw)
        if not core:
            continue
        txt = FIX.get(core.lower(), core)
        if core.startswith("-") and out:  # merge "berganda" + "-gandalah"
            out[-1]["w"] += txt; out[-1]["e"] = w["e"]; continue
        out.append({"w": txt, "s": w["s"], "e": w["e"], "p": raw[-1] in ".,?!"})
# Per-video fixes for words Whisper mishears in context (e.g. brand names):
# fixes.json = [{"s": <word start in source seconds>, "w": "<correct text>"}]
fx_path = os.path.join(folder, "fixes.json")
if os.path.exists(fx_path):
    for fx in json.load(open(fx_path)):
        for w in out:
            if abs(w["s"] - fx["s"]) < 0.03:
                w["w"] = fx["w"]
    out = [w for w in out if w["w"]]  # an empty fix drops the word
json.dump(out, open(os.path.join(folder, "words.json"), "w"), ensure_ascii=False)
print(len(out), "words ->", os.path.join(folder, "words.json"))
