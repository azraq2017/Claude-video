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
        core = re.sub(r"[^\w\-]", "", raw)
        if not core:
            continue
        txt = FIX.get(core.lower(), core)
        if core.startswith("-") and out:  # merge "berganda" + "-gandalah"
            out[-1]["w"] += txt; out[-1]["e"] = w["e"]; continue
        out.append({"w": txt, "s": w["s"], "e": w["e"], "p": raw[-1] in ".,?!"})
json.dump(out, open(os.path.join(folder, "words.json"), "w"), ensure_ascii=False)
print(len(out), "words ->", os.path.join(folder, "words.json"))
