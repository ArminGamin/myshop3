from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

ROOT = Path(r"D:\jaukumas\public\products")
PREV = Path(r"D:\jaukumas\.tmp-qa\fixpreview")
ALPHA = Path(r"D:\jaukumas\.tmp-qa\alpha")
PREV.mkdir(parents=True, exist_ok=True)
ALPHA.mkdir(parents=True, exist_ok=True)
SESSION = new_session()


def load(name):
    bgr = cv2.imread(str(ROOT / name))
    if bgr is None:
        raise FileNotFoundError(name)
    return bgr


def hsv_of(bgr):
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)


def alpha_of(name):
    cache = ALPHA / f"{name}.npy"
    if cache.exists():
        return np.load(cache)
    im = Image.open(ROOT / name).convert("RGBA")
    cut = remove(im, session=SESSION)
    alpha = np.array(cut.split()[-1])
    np.save(cache, alpha)
    return alpha


def body_mask(name, thresh=80):
    m = (alpha_of(name) > thresh).astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k, iterations=2)
    return m > 0


def largest(sel, min_area=800):
    sel = sel.astype(np.uint8)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(sel, connectivity=8)
    keep = np.zeros(sel.shape, bool)
    best = None
    for i in range(1, num):
        area = stats[i, cv2.CC_STAT_AREA]
        if area < min_area:
            continue
        if best is None or area > best[0]:
            best = (area, i)
    if best:
        keep[labels == best[1]] = True
    return keep


def keep_large(sel, min_area=1500):
    sel = sel.astype(np.uint8)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(sel, connectivity=8)
    keep = np.zeros(sel.shape, bool)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            keep[labels == i] = True
    return keep


def paint(bgr, sel, hue, sat, vscale=1.0, vadd=0, lo=8, hi=245):
    if not np.any(sel):
        return bgr
    hsv = hsv_of(bgr)
    out = hsv.copy()
    out[sel, 0] = np.uint8(hue)
    out[sel, 1] = np.uint8(np.clip(sat, 0, 255))
    v = hsv[sel, 2].astype(np.int16)
    out[sel, 2] = np.clip(v * vscale + vadd, lo, hi).astype(np.uint8)
    painted = cv2.cvtColor(out, cv2.COLOR_HSV2BGR)
    a = cv2.GaussianBlur(sel.astype(np.float32), (0, 0), 0.8)
    blended = painted * a[..., None] + bgr * (1 - a[..., None])
    return blended.astype(np.uint8)


def grabcut(bgr, rect):
    small = cv2.resize(bgr, (bgr.shape[1] // 2, bgr.shape[0] // 2), interpolation=cv2.INTER_AREA)
    sx = small.shape[1] / bgr.shape[1]
    sy = small.shape[0] / bgr.shape[0]
    r = (int(rect[0] * sx), int(rect[1] * sy), max(8, int(rect[2] * sx)), max(8, int(rect[3] * sy)))
    mask = np.zeros(small.shape[:2], np.uint8)
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(small, mask, r, bgd, fgd, 4, cv2.GC_INIT_WITH_RECT)
    sel = ((mask == 1) | (mask == 3)).astype(np.uint8) * 255
    sel = cv2.resize(sel, (bgr.shape[1], bgr.shape[0]), interpolation=cv2.INTER_NEAREST)
    return sel > 127


def poly(shape, pts):
    m = np.zeros(shape[:2], np.uint8)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 255)
    return m > 0


def circle(shape, c, r):
    m = np.zeros(shape[:2], np.uint8)
    cv2.circle(m, c, r, 255, -1)
    return m > 0


def save_preview(tag, src, out, sel):
    vis = src.copy()
    vis[sel] = (vis[sel] * 0.45 + np.array([30, 30, 220]) * 0.55).astype(np.uint8)

    def fit(im):
        h = 420
        w = int(im.shape[1] * h / im.shape[0])
        return cv2.resize(im, (w, h), interpolation=cv2.INTER_AREA)

    row = np.hstack([fit(src), fit(out), fit(vis)])
    cv2.imwrite(str(PREV / f"{tag}.jpg"), row, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
    print(tag, int(sel.sum()))


def write_pair(src_name, dst_name, sel, style):
    src = load(src_name)
    out = paint(src, sel, *style)
    cv2.imwrite(str(ROOT / dst_name), out)
    save_preview(dst_name.replace(".png", ""), src, out, sel)


BURGUNDY = (0, 155, 0.58, 0, 22, 210)
BLUE = (105, 48, 0.95, 0, 40, 245)
CREAM = (22, 28, 0.35, 150, 165, 242)
GREEN = (72, 95, 0.72, 0, 20, 210)
GREY = (20, 14, 0.88, 0, 30, 230)
BLACK = (0, 12, 0.28, 0, 8, 70)
SHADE = (0, 8, 0.22, 0, 10, 48)
GRAPHITE = (0, 8, 0.32, 0, 14, 85)
WARM = (22, 24, 1.0, 8, 40, 245)
JADE = (78, 90, 0.85, 0, 30, 230)
HANDLE = (22, 32, 0.45, 130, 165, 242)
ROSE = (20, 32, 1.0, 6, 80, 248)


def lamp_shade(name):
    bgr = load(name)
    h, w = bgr.shape[:2]
    raw = (alpha_of(name) > 90).astype(np.uint8) * 255
    eroded = cv2.erode(raw, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21)))
    num, labels, stats, cents = cv2.connectedComponentsWithStats(eroded, connectivity=8)
    best = None
    for i in range(1, num):
        area = stats[i, cv2.CC_STAT_AREA]
        cy = cents[i][1]
        if cy > h * 0.58 or area < 2500:
            continue
        if best is None or area > best[0]:
            best = (area, i)
    if best is None:
        return np.zeros((h, w), bool)
    shade = (labels == best[1]).astype(np.uint8) * 255
    shade = cv2.dilate(shade, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (23, 23)))
    shade = cv2.bitwise_and(shade, raw)
    hsv = hsv_of(bgr)
    gold = (hsv[:, :, 0] > 8) & (hsv[:, :, 0] < 40) & (hsv[:, :, 1] > 70) & (hsv[:, :, 2] > 90)
    return (shade > 0) & ~gold


def silk_sonas(name):
    bgr = load(name)
    h, w = bgr.shape[:2]
    m = body_mask(name, 30)
    yy = np.arange(h)[:, None]
    m = m & (yy > int(h * 0.27))
    m = cv2.morphologyEx(m.astype(np.uint8) * 255, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
    return keep_large(m > 0, 2500)


def blanket_top(name):
    bgr = load(name)
    sel = grabcut(bgr, (30, 120, 900, 820))
    sel = cv2.dilate(sel.astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17))) > 0
    h, w = bgr.shape[:2]
    yy, xx = np.indices((h, w))
    sel = sel & ~((xx > 860) & (yy < 420))
    sel = sel & (yy > 90)
    return largest(sel, 5000)


def bottle_side(name):
    bgr = load(name)
    sel = grabcut(bgr, (150, 60, 680, 860))
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    energy = cv2.GaussianBlur(np.abs(gx), (0, 0), 7)
    knit = energy > 8
    knit = cv2.dilate(knit.astype(np.uint8) * 255, np.ones((9, 9), np.uint8)) > 0
    sel = sel & knit
    sel = cv2.morphologyEx(sel.astype(np.uint8) * 255, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21))) > 0
    return largest(sel, 4000)


def pillow_side(name):
    bgr = load(name)
    sel = grabcut(bgr, (20, 250, 980, 680))
    eroded = cv2.erode(sel.astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    core = largest(eroded > 0, 2000)
    grown = cv2.dilate(core.astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (33, 33))) > 0
    return grown & sel | cv2.dilate(core.astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))) > 0


def thermos_top(name):
    bgr = load(name)
    h, w = bgr.shape[:2]
    hsv = hsv_of(bgr)
    yy, xx = np.indices((h, w))
    dark = hsv[:, :, 2] < 150
    sel = dark & (xx > 400) & (xx < 740) & (yy > 360) & (yy < 820)
    sel = cv2.morphologyEx(sel.astype(np.uint8) * 255, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))) > 0
    return largest(sel, 2000)


def tea_mask(name):
    bgr = load(name)
    hsv = hsv_of(bgr)
    sel = body_mask(name, 60) & (hsv[:, :, 1] < 105)
    return keep_large(sel, 800)


def sunset_head(name):
    bgr = load(name)
    hsv = hsv_of(bgr)
    disk = circle(bgr.shape, (512, 545), 108)
    gold = (hsv[:, :, 1] > 60) & (hsv[:, :, 2] > 70)
    return disk & gold


def rain_mask(name, kind):
    bgr = load(name)
    h, w = bgr.shape[:2]
    hsv = hsv_of(bgr)
    white = (hsv[:, :, 1] < 55) & (hsv[:, :, 2] > 150)
    yy, xx = np.indices((h, w))
    if kind == "sonas":
        cloud = white & (yy > 120) & (yy < 460) & (xx > 200) & (xx < 820)
        stem = white & (xx > 455) & (xx < 575) & (yy > 400) & (yy < 760)
        sel = cloud | stem
    else:
        sel = white & (yy > 140) & (yy < 560) & (xx > 220) & (xx < 800)
    sel = cv2.morphologyEx(sel.astype(np.uint8) * 255, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))) > 0
    return keep_large(sel, 1500)


def galaxy_mask(name):
    bgr = load(name)
    hsv = hsv_of(bgr)
    sel = body_mask(name, 70) & (hsv[:, :, 1] < 60) & (hsv[:, :, 2] > 110)
    return keep_large(sel, 2000)


def frother_mask(name):
    bgr = load(name)
    hsv = hsv_of(bgr)
    plastic = (hsv[:, :, 1] < 90) & (hsv[:, :, 2] > 145)
    if name.endswith("-sonas.png"):
        box = (xx_box(bgr, 610, 60, 180, 520))
    elif name.endswith("-virsus.png"):
        box = poly(bgr.shape, [(200, 300), (360, 280), (520, 620), (340, 760), (180, 520)])
    else:
        box = xx_box(bgr, 210, 180, 230, 680)
    sel = plastic & box
    return largest(cv2.morphologyEx(sel.astype(np.uint8) * 255, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8)) > 0, 1500)


def xx_box(bgr, x, y, w, h):
    m = np.zeros(bgr.shape[:2], bool)
    m[y : y + h, x : x + w] = True
    return m


def massage_mask(name):
    sel = body_mask(name, 40)
    opened = cv2.morphologyEx(sel.astype(np.uint8) * 255, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
    return opened > 0


def key_strap(name):
    bgr = load(name)
    if "sonas" in name:
        sel = poly(bgr.shape, [(140, 820), (250, 300), (500, 330), (390, 880)])
        snap = circle(bgr.shape, (330, 430), 32)
    else:
        sel = poly(bgr.shape, [(520, 600), (700, 490), (960, 1020), (750, 1140)])
        snap = circle(bgr.shape, (640, 650), 34)
    return sel & ~snap


def gua_mask(name):
    bgr = load(name)
    if name.endswith("-sonas.png"):
        rect = (120, 160, 700, 660)
    else:
        rect = (220, 140, 620, 720)
    return grabcut(bgr, rect)


def rug_restore(src_name, dst_name):
    src = load(src_name)
    dst = load(dst_name)
    hsv = hsv_of(src)
    wood = hsv[:, :, 1] > 115
    out = dst.copy()
    out[wood] = src[wood]
    cv2.imwrite(str(ROOT / dst_name), out)
    changed = np.abs(src.astype(np.int16) - out.astype(np.int16)).max(axis=2) > 12
    save_preview(dst_name.replace(".png", ""), src, out, changed)


def rose_petals(name):
    bgr = load(name)
    hsv = hsv_of(bgr)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    red = (((h < 10) | (h > 168)) & (s > 80) & (v > 30)).astype(np.uint8)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(red, connectivity=8)
    sel = np.zeros(red.shape, np.uint8)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] < 350:
            continue
        comp = (labels == i).astype(np.uint8)
        contours, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        hull = cv2.convexHull(np.vstack(contours))
        cv2.drawContours(sel, [hull], -1, 255, -1)
    green = (h > 35) & (h < 95) & (s > 25)
    gold = (h > 12) & (h < 42) & (s > 90) & (v > 120)
    return (sel > 0) & ~green & ~gold


def pillow_hero(name):
    sel = body_mask(name, 40)
    bgr = load(name)
    hsv = hsv_of(bgr)
    gold = (hsv[:, :, 0] > 10) & (hsv[:, :, 0] < 35) & (hsv[:, :, 1] > 110)
    sel = sel & ~gold
    return keep_large(sel, 4000)


JOBS = []


def add(src, dst, mask_fn, style):
    JOBS.append((src, dst, mask_fn, style))


for ang in ["", "-sonas", "-virsus"]:
    add(f"zvakiu-sildymo-lempa{ang}.png", f"zvakiu-sildymo-lempa-juodas{ang}-v3.png", lamp_shade, SHADE)

add("silkas-miegas-sonas.png", "silkas-miegas-vyndaris-sonas-v3.png", silk_sonas, BURGUNDY)
add("megzta-sildykle-sonas.png", "megzta-sildykle-vyndaris-sonas-v3.png", bottle_side, BURGUNDY)
add("silkinis-uzvalkalas-sonas.png", "silkinis-uzvalkalas-vyndaris-sonas-v3.png", pillow_side, BURGUNDY)
add("silkinis-uzvalkalas.png", "silkinis-uzvalkalas-vyndaris-v3.png", pillow_hero, BURGUNDY)
add("pledas-jaukumas-virsus.png", "pledas-jaukumas-vyndaris-virsus-v3.png", blanket_top, BURGUNDY)
add("pledas-jaukumas-virsus.png", "pledas-jaukumas-melynas-virsus-v3.png", blanket_top, BLUE)

for ang in ["", "-sonas", "-virsus"]:
    add(f"termosas-kelionems{ang}.png", f"termosas-kelionems-kreminis{ang}-v3.png", thermos_top if ang == "-virsus" else (lambda n: None), CREAM)

# thermos hero/sonas stay; only virsus is replaced. Filter Nones below.

for ang in ["", "-sonas", "-virsus"]:
    add(f"keramikos-arbata{ang}.png", f"keramikos-arbata-vyndaris{ang}-v3.png", tea_mask, BURGUNDY)
    add(f"keramikos-arbata{ang}.png", f"keramikos-arbata-pilkelis{ang}-v3.png", tea_mask, GREY)

add("saulelydzio-lempa-sonas.png", "saulelydzio-lempa-juodas-sonas-v3.png", sunset_head, SHADE)

add("lietaus-drekinuvas-sonas.png", "lietaus-drekinuvas-juodas-sonas-v3.png", lambda n: rain_mask(n, "sonas"), GRAPHITE)
add("lietaus-drekinuvas-virsus.png", "lietaus-drekinuvas-juodas-virsus-v3.png", lambda n: rain_mask(n, "virsus"), GRAPHITE)

for ang in ["", "-sonas", "-nugara"]:
    add(f"galaktikos-projektorius{ang}.png", f"galaktikos-projektorius-kreminis{ang}-v3.png", galaxy_mask, WARM)

for ang in ["", "-sonas", "-virsus"]:
    add(f"pieno-plakiklis{ang}.png", f"pieno-plakiklis-kreminis{ang}-v3.png", frother_mask, HANDLE)

for ang in ["", "-sonas", "-nugara"]:
    add(f"masazo-pistoletas{ang}.png", f"masazo-pistoletas-kreminis{ang}-v3.png", massage_mask, CREAM)

add("raktu-pakabukas-egle.png", "raktu-pakabukas-egle-juodas-v3.png", key_strap, BLACK)
add("raktu-pakabukas-egle-sonas.png", "raktu-pakabukas-egle-juodas-sonas-v3.png", key_strap, BLACK)

add("gua-sha-rinkinys-sonas.png", "gua-sha-rinkinys-nefritas-sonas-v3.png", gua_mask, JADE)
add("gua-sha-rinkinys-virsus.png", "gua-sha-rinkinys-nefritas-virsus-v3.png", gua_mask, JADE)

for ang in ["", "-sonas", "-virsus"]:
    add(f"amzinoji-roze{ang}.png", f"amzinoji-roze-kremine{ang}-v3.png", rose_petals, ROSE)


def main():
    for src, dst, fn, style in JOBS:
        sel = fn(src)
        if sel is None:
            continue
        write_pair(src, dst, sel, style)
    for ang in ["", "-sonas", "-virsus"]:
        rug_restore(f"kilimas-kaledu-grindys{ang}.png", f"kilimas-kaledu-grindys-vyndaris{ang}-v3.png")


if __name__ == "__main__":
    main()
