from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

ROOT = Path(r"D:\jaukumas\public\products")
SESSION = new_session()


def load(name):
    im = Image.open(ROOT / name).convert("RGB")
    return cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)


def alpha_of(name):
    im = Image.open(ROOT / name).convert("RGBA")
    cut = remove(im, session=SESSION)
    return np.array(cut.split()[-1])


def save(name, img):
    cv2.imwrite(str(ROOT / name), img)
    print("wrote", name)


def paint(bgr, sel, hue, sat, value_scale, value_add=0, lo=16, hi=245):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    hsv[sel, 0] = hue
    hsv[sel, 1] = sat
    v = hsv[sel, 2].astype(np.int16)
    hsv[sel, 2] = np.clip(v * value_scale + value_add, lo, hi).astype(np.uint8)
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)


def rose_cream(src, dst):
    bgr = load(src)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    red = (((h < 8) | (h > 172)) & (s > 100) & (v > 25)).astype(np.uint8)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(red, connectivity=8)
    sel = np.zeros(red.shape, np.uint8)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] < 400:
            continue
        comp = (labels == i).astype(np.uint8)
        contours, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        hull = cv2.convexHull(np.vstack(contours))
        cv2.drawContours(sel, [hull], -1, 255, -1)
    green = (h > 35) & (h < 95) & (s > 30)
    gold = (h > 14) & (h < 40) & (s > 80)
    use = (sel > 0) & ~green & ~gold
    out = paint(bgr, use, 22, 28, 1.02, 12, 185, 248)
    save(dst, out)


def lamp_shade(src, dst):
    bgr = load(src)
    alpha = alpha_of(src)
    mask = (alpha > 100).astype(np.uint8) * 255
    eroded = cv2.erode(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17)))
    num, labels, stats, cents = cv2.connectedComponentsWithStats(eroded, connectivity=8)
    height = bgr.shape[0]
    best = None
    for i in range(1, num):
        area = stats[i, cv2.CC_STAT_AREA]
        cy = cents[i][1]
        if cy > height * 0.55 or area < 1000:
            continue
        if best is None or area > best[0]:
            best = (area, i)
    shade = (labels == best[1]).astype(np.uint8) * 255
    shade = cv2.dilate(shade, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
    shade = cv2.bitwise_and(shade, mask)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    gold = (hsv[:, :, 0] > 10) & (hsv[:, :, 0] < 38) & (hsv[:, :, 1] > 55)
    use = (shade > 0) & ~gold
    out = paint(bgr, use, 0, 8, 0.22, 0, 8, 50)
    save(dst, out)
    print(" shade", int(use.sum()))


def silk_sonas():
    bgr = load("silkas-miegas-sonas.png")
    alpha = alpha_of("silkas-miegas-sonas.png")
    mask = (alpha > 12).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21)))
    num, labels, stats, cents = cv2.connectedComponentsWithStats(mask, connectivity=8)
    h = bgr.shape[0]
    keep = np.zeros(mask.shape, np.uint8)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] < 1500:
            continue
        if cents[i][1] < h * 0.28:
            continue
        keep[labels == i] = 255
    use = keep > 0
    out = paint(bgr, use, 0, 150, 0.64, 0, 30, 210)
    save("silkas-miegas-vyndaris-sonas-v3.png", out)
    print(" silk sonas", int(use.sum()))


def pillow_sonas():
    bgr = load("silkinis-uzvalkalas-sonas.png")
    alpha = alpha_of("silkinis-uzvalkalas-sonas.png")
    faint = (alpha > 5).astype(np.uint8) * 255
    # Drop the solid ornament before filling the faint pillow outline.
    solid = (alpha > 180).astype(np.uint8) * 255
    solid = cv2.dilate(solid, np.ones((25, 25), np.uint8))
    faint[solid > 0] = 0
    faint = cv2.morphologyEx(faint, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    num, labels, stats, _ = cv2.connectedComponentsWithStats(faint, connectivity=8)
    best = 1 + np.argmax([stats[i, cv2.CC_STAT_AREA] if i else 0 for i in range(num)])
    use = labels == best
    out = paint(bgr, use, 0, 145, 0.72, 0, 40, 220)
    save("silkinis-uzvalkalas-vyndaris-sonas-v3.png", out)
    Image.fromarray((use.astype(np.uint8) * 255)).save(ROOT / "_mask-pillow.png")
    print(" pillow", int(use.sum()))


for angle in ["", "-sonas", "-virsus"]:
    rose_cream(f"amzinoji-roze{angle}.png", f"amzinoji-roze-kremine{angle}-v3.png")
    lamp_shade(f"zvakiu-sildymo-lempa{angle}.png", f"zvakiu-sildymo-lempa-juodas{angle}-v3.png")

silk_sonas()
pillow_sonas()
