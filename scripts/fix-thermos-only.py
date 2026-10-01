import importlib.util
from pathlib import Path

import cv2
import numpy as np

SPEC = importlib.util.spec_from_file_location(
    "qa1", Path(r"D:\jaukumas\scripts\fix-qa-variants.py")
)
qa = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(qa)

ROOT = Path(r"D:\jaukumas\public\products")
ALPHA = Path(r"D:\jaukumas\.tmp-qa\alpha")
PREV = qa.PREV
PREV.mkdir(parents=True, exist_ok=True)


def virsus_mask(name):
    a = qa.alpha_of(name) > 80
    num, lab, st, cents = cv2.connectedComponentsWithStats(a.astype(np.uint8), 8)
    sel = np.zeros(a.shape, bool)
    for i in range(1, num):
        if cents[i][0] > 400 and st[i, cv2.CC_STAT_AREA] > 20000:
            sel[lab == i] = True
    return sel


def upright_mask(name):
    src = qa.load(name)
    raw = (qa.alpha_of(name) > 80).astype(np.uint8) * 255
    er = cv2.erode(raw, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    num, lab, st, cents = cv2.connectedComponentsWithStats(er, 8)
    h, w = src.shape[:2]
    best = None
    for i in range(1, num):
        area = st[i, cv2.CC_STAT_AREA]
        bw, bh = st[i, cv2.CC_STAT_WIDTH], st[i, cv2.CC_STAT_HEIGHT]
        cx, cy = cents[i]
        if area < 5000:
            continue
        aspect = bh / max(bw, 1)
        if aspect < 1.6:
            continue
        if name.endswith("sonas.png") and cx > w * 0.62:
            continue
        if (not name.endswith("sonas.png")) and cx < w * 0.38:
            continue
        score = area * aspect
        if best is None or score > best[0]:
            best = (score, i, area, aspect, cx)
    if best is None:
        raise RuntimeError("no bottle " + name)
    print(name, "core", best[2], "asp", round(best[3], 2), "cx", round(best[4], 1))
    core = (lab == best[1]).astype(np.uint8) * 255
    grown = cv2.dilate(core, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (33, 33)))
    sel = (grown > 0) & (raw > 0)
    hsv = qa.hsv_of(src)
    cupish = (hsv[:, :, 2] > 185) & (hsv[:, :, 1] < 55)
    # drop very bright linen folds that rembg may attach at bottle foot
    linen = (hsv[:, :, 2] > 175) & (hsv[:, :, 1] < 70) & (hsv[:, :, 0] > 10) & (hsv[:, :, 0] < 40)
    yy = np.arange(h)[:, None]
    foot = yy > int(h * 0.78)
    sel = sel & ~cupish & ~(linen & foot)
    fill = cv2.morphologyEx(
        sel.astype(np.uint8) * 255,
        cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)),
    )
    return fill > 0


def enhance_hero_from_backup():
    bak = Path(r"D:\jaukumas\.tmp-qa\termosas-kelionems-old-base.png")
    src = cv2.imread(str(bak))
    # write backup as current so alpha/cache uses it
    cv2.imwrite(str(ROOT / "termosas-kelionems.png"), src)
    cache = ALPHA / "termosas-kelionems.png.npy"
    if cache.exists():
        cache.unlink()
    sel = upright_mask("termosas-kelionems.png")
    print("enhance mask", int(sel.sum()))
    hsv = qa.hsv_of(src)
    out = hsv.copy()
    v = hsv[:, :, 2].astype(np.float32)
    s = hsv[:, :, 1].astype(np.float32)
    vv = v.copy()
    # denser matte graphite body
    vv[sel] = vv[sel] * 0.72 + 6
    # crush blown foggy highlight
    hi = sel & (v > 125)
    vv[hi] = 95 + (v[hi] - 125) * 0.22
    out[:, :, 2] = np.clip(vv, 8, 195).astype(np.uint8)
    ss = s.copy()
    ss[sel] = np.clip(ss[sel] * 0.55 + 4, 0, 40)
    out[:, :, 1] = ss.astype(np.uint8)
    painted = cv2.cvtColor(out, cv2.COLOR_HSV2BGR)
    blur = cv2.GaussianBlur(painted, (0, 0), 0.9)
    sharp = cv2.addWeighted(painted, 1.55, blur, -0.55, 0)
    # subtle dark rim for real edge
    edge = cv2.Canny(cv2.cvtColor(src, cv2.COLOR_BGR2GRAY), 40, 120)
    edge = cv2.dilate(edge, np.ones((2, 2), np.uint8))
    rim = sel & (edge > 0)
    sharp[rim] = (sharp[rim].astype(np.float32) * 0.75).astype(np.uint8)
    a = cv2.GaussianBlur(sel.astype(np.float32), (0, 0), 0.9)
    blended = sharp * a[..., None] + src * (1 - a[..., None])
    out_bgr = blended.astype(np.uint8)
    cv2.imwrite(str(ROOT / "termosas-kelionems.png"), out_bgr)
    if cache.exists():
        cache.unlink()
    qa.save_preview("termosas-kelionems-enhanced", src, out_bgr, sel)
    return out_bgr


def main():
    enhance_hero_from_backup()
    jobs = [
        ("termosas-kelionems-virsus.png", "termosas-kelionems-kreminis-virsus-v3.png", virsus_mask, qa.CREAM),
        ("termosas-kelionems-virsus.png", "termosas-kelionems-zalias-virsus-v3.png", virsus_mask, qa.GREEN),
        ("termosas-kelionems-sonas.png", "termosas-kelionems-kreminis-sonas-v3.png", upright_mask, qa.CREAM),
        ("termosas-kelionems-sonas.png", "termosas-kelionems-zalias-sonas-v3.png", upright_mask, qa.GREEN),
        ("termosas-kelionems.png", "termosas-kelionems-kreminis-v3.png", upright_mask, qa.CREAM),
        ("termosas-kelionems.png", "termosas-kelionems-zalias-v3.png", upright_mask, qa.GREEN),
    ]
    for src, dst, fn, style in jobs:
        sel = fn(src)
        print("WRITE", dst, int(sel.sum()))
        qa.write_pair(src, dst, sel, style)


if __name__ == "__main__":
    main()
