"""Blur the green price sticker (old RM999 tag) on the back-of-phone shots.
Usage: python3 scripts/blur_sticker.py public/src.mp4 public/src_clean.mp4
"""
import sys, subprocess, cv2, numpy as np
src, dst = sys.argv[1:3]
T0, T1 = 24.0, 31.0
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS); W = int(cap.get(3)); H = int(cap.get(4))
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                       '-i', src, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
                       '-c:a', 'copy', dst], stdin=subprocess.PIPE)
last, hold, i, log = None, 0, 0, []
while True:
    ok, f = cap.read()
    if not ok:
        break
    t = i / fps; i += 1
    if T0 <= t <= T1:
        hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
        m = cv2.inRange(hsv, (40, 90, 80), (85, 255, 255))
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(m)
        cands = [s for s in st[1:] if s[4] > 1500]
        if cands:
            x, y, w, h, _ = max(cands, key=lambda s: s[4])
            box = np.array([x, y, x + w, y + h], float)
            last = box if last is None or hold > 0 and np.abs(box - last).max() > 400 else 0.5 * box + 0.5 * last
            hold = 8
        elif hold > 0:
            hold -= 1
        else:
            last = None
        if last is not None and hold > 0:
            pad = 34
            x0, y0, x1, y1 = last.astype(int)
            x0, y0 = max(0, x0 - pad), max(0, y0 - pad); x1, y1 = min(W, x1 + pad), min(H, y1 + pad)
            mask = np.zeros((H, W), np.float32)
            cv2.rectangle(mask, (x0, y0), (x1, y1), 1.0, -1)
            mask = cv2.GaussianBlur(mask, (0, 0), 14)[..., None]
            blurred = cv2.GaussianBlur(cv2.resize(cv2.resize(f, (W // 12, H // 12)), (W, H)), (0, 0), 9)
            f = (f * (1 - mask) + blurred * mask).astype(np.uint8)
            log.append(round(t, 2))
    ff.stdin.write(f.tobytes())
ff.stdin.close(); ff.wait()
print('blurred frames:', len(log), 'from', log[:1], 'to', log[-1:])
