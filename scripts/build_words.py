"""Flatten the Whisper transcript into src/data/words.json with spelling fixes.
Run: python3 scripts/build_words.py"""
import json, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIX = {
    "train": "trade", "gilat": "gilap", "pembaikian": "pembaikan", "maksimum": "maksimum",
    "-gandalah": "-gandalah", "cai": "cai", "condition": "condition",
}
out = []
for seg in json.load(open(os.path.join(ROOT, "scripts/transcript.json"))):
    for w in seg["words"]:
        raw = w["w"].strip()
        core = re.sub(r"[^\w\-]", "", raw)
        if not core:
            continue
        txt = FIX.get(core.lower(), core)
        if core.startswith("-") and out:  # merge "berganda" + "-gandalah"
            out[-1]["w"] += txt; out[-1]["e"] = w["e"]; continue
        out.append({"w": txt, "s": w["s"], "e": w["e"], "p": raw[-1] in ".,?!"})
json.dump(out, open(os.path.join(ROOT, "src/data/words.json"), "w"), ensure_ascii=False)
print(len(out), "words")
