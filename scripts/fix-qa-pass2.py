import importlib.util
from pathlib import Path

import cv2
import numpy as np

spec = importlib.util.spec_from_file_location("qa1", Path(r"D:\jaukumas\scripts\fix-qa-variants.py"))
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)

load, paint, hsv_of = qa.load, qa.paint, qa.hsv_of
grabcut, poly, circle, body_mask = qa.grabcut, qa.poly, qa.circle, qa.body_mask
largest, keep_large, write_pair = qa.largest, qa.keep_large, qa.write_pair
BURGUNDY, BLUE, CREAM, GREEN, GREY = qa.BURGUNDY, qa.BLUE, qa.CREAM, qa.GREEN, qa.GREY
BLACK, SHADE, WARM, JADE, HANDLE = qa.BLACK, qa.SHADE, qa.WARM, qa.JADE, qa.HANDLE
GRAPHITE = qa.GRAPHITE


def fill_holes(sel):
    u = (sel.astype(np.uint8)) * 255
    cnts, _ = cv2.findContours(u, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    out = np.zeros_like(u)
    if cnts:
        cv2.drawContours(out, cnts, -1, 255, -1)
    return out > 0


def box(shape, x, y, w, h):
    m = np.zeros(shape[:2], bool)
    m[y : y + h, x : x + w] = True
    return m


def lamp(name):
    bgr = load(name)
    if name.endswith("-sonas.png"):
        sel = poly(bgr.shape, [(290, 500), (350, 195), (670, 185), (750, 505)])
    elif name.endswith("-virsus.png"):
        outer = np.zeros(bgr.shape[:2], np.uint8)
        inner = np.zeros(bgr.shape[:2], np.uint8)
        cv2.ellipse(outer, (490, 430), (210, 205), 0, 0, 360, 255, -1)
        cv2.ellipse(inner, (485, 285), (105, 85), 0, 0, 360, 255, -1)
        sel = (outer > 0) & ~(inner > 0)
        yy = np.arange(bgr.shape[0])[:, None]
        sel = sel & (yy < 640)
    else:
        sel = poly(bgr.shape, [(240, 450), (300, 360), (640, 340), (700, 400), (810, 770), (190, 790)])
    hsv = hsv_of(bgr)
    gold = (hsv[:, :, 0] > 8) & (hsv[:, :, 0] < 38) & (hsv[:, :, 1] > 95) & (hsv[:, :, 2] > 80)
    sel = fill_holes(sel & ~gold)
    return sel


def silk(name):
    bgr = load(name)
    h = bgr.shape[0]
    m = body_mask(name, 25)
    yy = np.arange(h)[:, None]
    m = m & (yy > int(h * 0.27))
    m = cv2.morphologyEx(m.astype(np.uint8) * 255, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))) > 0
    return fill_holes(keep_large(m, 2000))


def bottle(name):
    sel = grabcut(load(name), (170, 40, 560, 900))
    return fill_holes(largest(sel, 3000))


def pillow_side(name):
    sel = grabcut(load(name), (30, 260, 960, 520))
    return fill_holes(largest(sel, 3000))


def pillow_hero(name):
    bgr = load(name)
    sel = body_mask(name, 40)
    hsv = hsv_of(bgr)
    gold = (hsv[:, :, 0] > 10) & (hsv[:, :, 0] < 36) & (hsv[:, :, 1] > 100)
    sel = keep_large(sel & ~gold, 3000)
    num, labels, stats, cents = cv2.connectedComponentsWithStats(sel.astype(np.uint8), connectivity=8)
    h = bgr.shape[0]
    keep = np.zeros(sel.shape, bool)
    for i in range(1, num):
        if cents[i][1] > h * 0.38 and stats[i, cv2.CC_STAT_AREA] > 3000:
            keep[labels == i] = True
    return fill_holes(keep)


def blanket(name):
    bgr = load(name)
    sel = grabcut(bgr, (30, 120, 900, 820))
    sel = cv2.dilate(sel.astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (23, 23))) > 0
    h, w = bgr.shape[:2]
    yy, xx = np.indices((h, w))
    sel = sel & ~((xx > 840) & (yy < 460)) & (yy > 80)
    return largest(sel, 5000)


def thermos(name):
    return fill_holes(grabcut(load(name), (455, 405, 230, 380)))


def tea(name):
    bgr = load(name)
    hsv = hsv_of(bgr)
    sel = body_mask(name, 40)
    liquid = (hsv[:, :, 1] > 155) & (hsv[:, :, 0] < 25)
    if name.endswith("-sonas.png"):
        skip = box(bgr.shape, 490, 630, 300, 270) | box(bgr.shape, 740, 740, 284, 200)
    elif name.endswith("-virsus.png"):
        skip = box(bgr.shape, 410, 560, 330, 310) | box(bgr.shape, 700, 740, 324, 220)
    else:
        skip = box(bgr.shape, 470, 1000, 340, 380) | box(bgr.shape, 760, 1120, 264, 250)
    return keep_large(sel & ~liquid & ~skip, 600)


def rain(name):
    bgr = load(name)
    if name.endswith("-sonas.png"):
        cloud = fill_holes(grabcut(bgr, (230, 130, 560, 310)))
        stem = box(bgr.shape, 470, 420, 80, 330)
        hsv = hsv_of(bgr)
        stem = stem & (hsv[:, :, 2] > 150) & (hsv[:, :, 1] < 80)
        return cloud | stem
    return fill_holes(grabcut(bgr, (240, 150, 540, 430)))


def galaxy(name):
    bgr = load(name)
    if name.endswith("-sonas.png"):
        rect = (330, 230, 440, 570)
    elif name.endswith("-nugara.png"):
        rect = (280, 180, 450, 660)
    else:
        rect = (230, 360, 490, 880)
    sel = fill_holes(grabcut(bgr, rect))
    hsv = hsv_of(bgr)
    protect = (hsv[:, :, 1] > 100) | (hsv[:, :, 2] < 80)
    return sel & ~protect


def frother(name):
    bgr = load(name)
    if name.endswith("-sonas.png"):
        rect = (625, 55, 155, 510)
    else:
        rect = (190, 270, 340, 500)
    sel = grabcut(bgr, rect)
    hsv = hsv_of(bgr)
    plastic = (hsv[:, :, 1] < 100) & (hsv[:, :, 2] > 130)
    return largest(sel & plastic, 800)


def massage(name):
    bgr = load(name)
    sel = body_mask(name, 35)
    h = bgr.shape[0]
    yy = np.arange(h)[:, None]
    if name.endswith("-sonas.png"):
        sel = sel & (yy < 730)
    elif name.endswith("-nugara.png"):
        sel = sel & (yy < 770)
    else:
        sel = sel & (yy < 1050)
    opened = cv2.morphologyEx(sel.astype(np.uint8) * 255, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    return opened > 0


def strap(name):
    bgr = load(name)
    if "sonas" in name:
        sel = fill_holes(grabcut(bgr, (145, 300, 330, 540)))
        snap = circle(bgr.shape, (330, 420), 28)
    else:
        sel = fill_holes(grabcut(bgr, (545, 490, 420, 660)))
        snap = circle(bgr.shape, (640, 650), 30)
    hsv = hsv_of(bgr)
    brass = (hsv[:, :, 1] > 80) & (hsv[:, :, 2] > 90) & (hsv[:, :, 0] > 8) & (hsv[:, :, 0] < 30)
    return sel & ~snap & ~brass


def gua(name):
    bgr = load(name)
    hsv = hsv_of(bgr)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    pink = ((h < 16) | (h > 168)) & (s > 40) & (s < 170) & (v > 135)
    if name.endswith("-sonas.png"):
        pink = pink & box(bgr.shape, 80, 140, 760, 680)
    else:
        pink = pink & box(bgr.shape, 180, 120, 720, 760)
    pink = cv2.morphologyEx(pink.astype(np.uint8) * 255, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))) > 0
    return keep_large(pink, 500)


def rose(name):
    return qa.rose_petals(name)


def rug(name):
    return body_mask(name, 30)


ROSE = (16, 50, 0.92, 30, 155, 248)

jobs = []
for ang in ["", "-sonas", "-virsus"]:
    jobs.append((f"zvakiu-sildymo-lempa{ang}.png", f"zvakiu-sildymo-lempa-juodas{ang}-v3.png", lamp, SHADE))
jobs += [
    ("silkas-miegas-sonas.png", "silkas-miegas-vyndaris-sonas-v3.png", silk, BURGUNDY),
    ("megzta-sildykle-sonas.png", "megzta-sildykle-vyndaris-sonas-v3.png", bottle, BURGUNDY),
    ("silkinis-uzvalkalas-sonas.png", "silkinis-uzvalkalas-vyndaris-sonas-v3.png", pillow_side, BURGUNDY),
    ("silkinis-uzvalkalas.png", "silkinis-uzvalkalas-vyndaris-v3.png", pillow_hero, BURGUNDY),
    ("pledas-jaukumas-virsus.png", "pledas-jaukumas-vyndaris-virsus-v3.png", blanket, BURGUNDY),
    ("pledas-jaukumas-virsus.png", "pledas-jaukumas-melynas-virsus-v3.png", blanket, BLUE),
    ("termosas-kelionems-virsus.png", "termosas-kelionems-kreminis-virsus-v3.png", thermos, CREAM),
    ("termosas-kelionems-virsus.png", "termosas-kelionems-zalias-virsus-v3.png", thermos, GREEN),
]
for ang in ["", "-sonas", "-virsus"]:
    jobs.append((f"keramikos-arbata{ang}.png", f"keramikos-arbata-vyndaris{ang}-v3.png", tea, BURGUNDY))
    jobs.append((f"keramikos-arbata{ang}.png", f"keramikos-arbata-pilkelis{ang}-v3.png", tea, GREY))
    jobs.append((f"lietaus-drekinuvas{ang}.png", f"lietaus-drekinuvas-juodas{ang}-v3.png", rain if ang else (lambda n: None), GRAPHITE))
for ang in ["", "-sonas", "-nugara"]:
    jobs.append((f"galaktikos-projektorius{ang}.png", f"galaktikos-projektorius-kreminis{ang}-v3.png", galaxy, WARM))
    jobs.append((f"masazo-pistoletas{ang}.png", f"masazo-pistoletas-kreminis{ang}-v3.png", massage, CREAM))
jobs += [
    ("pieno-plakiklis-sonas.png", "pieno-plakiklis-kreminis-sonas-v3.png", frother, HANDLE),
    ("pieno-plakiklis-virsus.png", "pieno-plakiklis-kreminis-virsus-v3.png", frother, HANDLE),
    ("raktu-pakabukas-egle.png", "raktu-pakabukas-egle-juodas-v3.png", strap, BLACK),
    ("raktu-pakabukas-egle-sonas.png", "raktu-pakabukas-egle-juodas-sonas-v3.png", strap, BLACK),
    ("gua-sha-rinkinys-sonas.png", "gua-sha-rinkinys-nefritas-sonas-v3.png", gua, JADE),
    ("gua-sha-rinkinys-virsus.png", "gua-sha-rinkinys-nefritas-virsus-v3.png", gua, JADE),
]
for ang in ["", "-sonas", "-virsus"]:
    jobs.append((f"amzinoji-roze{ang}.png", f"amzinoji-roze-kremine{ang}-v3.png", rose, ROSE))
    jobs.append((f"kilimas-kaledu-grindys{ang}.png", f"kilimas-kaledu-grindys-vyndaris{ang}-v3.png", rug, BURGUNDY))

for src, dst, fn, style in jobs:
    sel = fn(src)
    if sel is None:
        continue
    write_pair(src, dst, sel, style)
