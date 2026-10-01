from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

ROOT = Path(r"D:\jaukumas\public\products")
SESSION = new_session()


def solid_mask(alpha):
    m = (alpha > 100).astype(np.uint8) * 255
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, kernel, iterations=2)
    inv = cv2.bitwise_not(m)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(inv, connectivity=8)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] < 6000 and stats[i, cv2.CC_STAT_LEFT] > 0:
            m[labels == i] = 255
    return m


def paint(hsv, sel, hue, sat, value_scale, value_add=0, value_floor=16, value_ceil=245):
    if not np.any(sel):
        return
    hsv[sel, 0] = hue
    hsv[sel, 1] = sat
    v = hsv[sel, 2].astype(np.int16)
    hsv[sel, 2] = np.clip(v * value_scale + value_add, value_floor, value_ceil).astype(np.uint8)


def select(mode, hsv, body):
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    red = body & ((h < 18) | (h > 165)) & (s > 35)
    if mode == "burgundy":
        return body
    if mode == "blue":
        return body
    if mode == "graphite":
        return body
    if mode == "cream":
        return body
    if mode == "green":
        return body
    if mode == "grey":
        return body
    if mode == "black":
        return body
    if mode == "jade":
        return body
    if mode == "warm":
        return body
    if mode == "rose_cream":
        return red
    if mode == "rose_cherry":
        return red
    if mode == "shade":
        return body & (v > 145) & (s < 90)
    if mode == "gold_head":
        return body & (h > 8) & (h < 40) & (s > 40) & (v > 80)
    if mode == "handle":
        # Colored handle, not the bright steel whisk.
        return body & ~((v > 165) & (s < 40))
    raise KeyError(mode)


def style(mode, hsv, sel):
    if mode == "burgundy":
        paint(hsv, sel, 0, 155, 0.58)
    elif mode == "blue":
        paint(hsv, sel, 105, 48, 0.95)
    elif mode == "graphite":
        paint(hsv, sel, 0, 6, 0.30, value_floor=12, value_ceil=90)
    elif mode == "cream":
        paint(hsv, sel, 22, 28, 0.35, 150, value_floor=160, value_ceil=242)
    elif mode == "green":
        paint(hsv, sel, 72, 95, 0.72)
    elif mode == "grey":
        paint(hsv, sel, 20, 14, 0.88)
    elif mode == "black":
        paint(hsv, sel, 0, 12, 0.28, value_floor=8, value_ceil=70)
    elif mode == "jade":
        paint(hsv, sel, 78, 85, 0.82)
    elif mode == "warm":
        paint(hsv, sel, 22, 22, 1.0)
    elif mode == "rose_cream":
        paint(hsv, sel, 22, 28, 1.05, 20, value_floor=170, value_ceil=245)
    elif mode == "rose_cherry":
        paint(hsv, sel, 174, 150, 0.62)
    elif mode == "shade":
        paint(hsv, sel, 0, 8, 0.26, value_floor=10, value_ceil=70)
    elif mode == "gold_head":
        paint(hsv, sel, 0, 8, 0.22, value_floor=8, value_ceil=55)
    elif mode == "handle":
        paint(hsv, sel, 22, 30, 0.4, 140, value_floor=160, value_ceil=240)


def recolor(src_name, dst_name, mode):
    im = Image.open(ROOT / src_name).convert("RGBA")
    cut = remove(im, session=SESSION)
    alpha = np.array(cut.split()[-1])
    bgr = cv2.cvtColor(np.array(im.convert("RGB")), cv2.COLOR_RGB2BGR)
    mask = solid_mask(alpha)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    sel = select(mode, hsv, mask > 0)
    style(mode, hsv, sel)
    painted = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    a = (mask.astype(np.float32) / 255.0)[..., None]
    # Only blend pixels we actually recolored, so glass, cable, and wood stay.
    blend = np.zeros_like(a)
    blend[sel] = a[sel]
    out = painted * blend + bgr * (1 - blend)
    cv2.imwrite(str(ROOT / dst_name), out.astype(np.uint8))
    print(dst_name, int(sel.sum()))


JOBS = [
    ("pledas-jaukumas.png", "pledas-jaukumas-vyndaris-v3.png", "burgundy"),
    ("pledas-jaukumas-sonas.png", "pledas-jaukumas-vyndaris-sonas-v3.png", "burgundy"),
    ("pledas-jaukumas-virsus.png", "pledas-jaukumas-vyndaris-virsus-v3.png", "burgundy"),
    ("pledas-jaukumas.png", "pledas-jaukumas-melynas-v3.png", "blue"),
    ("pledas-jaukumas-sonas.png", "pledas-jaukumas-melynas-sonas-v3.png", "blue"),
    ("pledas-jaukumas-virsus.png", "pledas-jaukumas-melynas-virsus-v3.png", "blue"),
    ("silkas-miegas.png", "silkas-miegas-vyndaris-v3.png", "burgundy"),
    ("silkas-miegas-sonas.png", "silkas-miegas-vyndaris-sonas-v3.png", "burgundy"),
    ("silkas-miegas-virsus.png", "silkas-miegas-vyndaris-virsus-v3.png", "burgundy"),
    ("termosas-kelionems.png", "termosas-kelionems-kreminis-v3.png", "cream"),
    ("termosas-kelionems-sonas.png", "termosas-kelionems-kreminis-sonas-v3.png", "cream"),
    ("termosas-kelionems-virsus.png", "termosas-kelionems-kreminis-virsus-v3.png", "cream"),
    ("termosas-kelionems.png", "termosas-kelionems-zalias-v3.png", "green"),
    ("termosas-kelionems-sonas.png", "termosas-kelionems-zalias-sonas-v3.png", "green"),
    ("termosas-kelionems-virsus.png", "termosas-kelionems-zalias-virsus-v3.png", "green"),
    ("namu-kino-projektorius-kreminis.png", "namu-kino-projektorius-grafitinis-v3.png", "graphite"),
    ("namu-kino-projektorius-kreminis-sonas.png", "namu-kino-projektorius-grafitinis-sonas-v3.png", "graphite"),
    ("namu-kino-projektorius-kreminis-nugara.png", "namu-kino-projektorius-grafitinis-nugara-v3.png", "graphite"),
    ("keramikos-arbata.png", "keramikos-arbata-vyndaris-v3.png", "burgundy"),
    ("keramikos-arbata-sonas.png", "keramikos-arbata-vyndaris-sonas-v3.png", "burgundy"),
    ("keramikos-arbata-virsus.png", "keramikos-arbata-vyndaris-virsus-v3.png", "burgundy"),
    ("keramikos-arbata.png", "keramikos-arbata-pilkelis-v3.png", "grey"),
    ("keramikos-arbata-sonas.png", "keramikos-arbata-pilkelis-sonas-v3.png", "grey"),
    ("keramikos-arbata-virsus.png", "keramikos-arbata-pilkelis-virsus-v3.png", "grey"),
    ("odinis-deklas.png", "odinis-deklas-juodas-v3.png", "black"),
    ("odinis-deklas-sonas.png", "odinis-deklas-juodas-sonas-v3.png", "black"),
    ("odinis-deklas-nugara.png", "odinis-deklas-juodas-nugara-v3.png", "black"),
    ("zvakiu-sildymo-lempa.png", "zvakiu-sildymo-lempa-juodas-v3.png", "shade"),
    ("zvakiu-sildymo-lempa-sonas.png", "zvakiu-sildymo-lempa-juodas-sonas-v3.png", "shade"),
    ("zvakiu-sildymo-lempa-virsus.png", "zvakiu-sildymo-lempa-juodas-virsus-v3.png", "shade"),
    ("amzinoji-roze.png", "amzinoji-roze-kremine-v3.png", "rose_cream"),
    ("amzinoji-roze-sonas.png", "amzinoji-roze-kremine-sonas-v3.png", "rose_cream"),
    ("amzinoji-roze-virsus.png", "amzinoji-roze-kremine-virsus-v3.png", "rose_cream"),
    ("amzinoji-roze.png", "amzinoji-roze-vysnine-v3.png", "rose_cherry"),
    ("amzinoji-roze-sonas.png", "amzinoji-roze-vysnine-sonas-v3.png", "rose_cherry"),
    ("amzinoji-roze-virsus.png", "amzinoji-roze-vysnine-virsus-v3.png", "rose_cherry"),
    ("saulelydzio-lempa.png", "saulelydzio-lempa-juodas-v3.png", "gold_head"),
    ("saulelydzio-lempa-sonas.png", "saulelydzio-lempa-juodas-sonas-v3.png", "gold_head"),
    ("saulelydzio-lempa-nugara.png", "saulelydzio-lempa-juodas-nugara-v3.png", "gold_head"),
    ("lietaus-drekinuvas.png", "lietaus-drekinuvas-juodas-v3.png", "graphite"),
    ("lietaus-drekinuvas-sonas.png", "lietaus-drekinuvas-juodas-sonas-v3.png", "graphite"),
    ("lietaus-drekinuvas-virsus.png", "lietaus-drekinuvas-juodas-virsus-v3.png", "graphite"),
    ("megzta-sildykle.png", "megzta-sildykle-vyndaris-v3.png", "burgundy"),
    ("megzta-sildykle-sonas.png", "megzta-sildykle-vyndaris-sonas-v3.png", "burgundy"),
    ("megzta-sildykle-virsus.png", "megzta-sildykle-vyndaris-virsus-v3.png", "burgundy"),
    ("galaktikos-projektorius.png", "galaktikos-projektorius-kreminis-v3.png", "warm"),
    ("galaktikos-projektorius-sonas.png", "galaktikos-projektorius-kreminis-sonas-v3.png", "warm"),
    ("galaktikos-projektorius-nugara.png", "galaktikos-projektorius-kreminis-nugara-v3.png", "warm"),
    ("pieno-plakiklis.png", "pieno-plakiklis-kreminis-v3.png", "handle"),
    ("pieno-plakiklis-sonas.png", "pieno-plakiklis-kreminis-sonas-v3.png", "handle"),
    ("pieno-plakiklis-virsus.png", "pieno-plakiklis-kreminis-virsus-v3.png", "handle"),
    ("masazo-pistoletas.png", "masazo-pistoletas-kreminis-v3.png", "cream"),
    ("masazo-pistoletas-sonas.png", "masazo-pistoletas-kreminis-sonas-v3.png", "cream"),
    ("masazo-pistoletas-nugara.png", "masazo-pistoletas-kreminis-nugara-v3.png", "cream"),
    ("silkinis-uzvalkalas.png", "silkinis-uzvalkalas-vyndaris-v3.png", "burgundy"),
    ("silkinis-uzvalkalas-sonas.png", "silkinis-uzvalkalas-vyndaris-sonas-v3.png", "burgundy"),
    ("silkinis-uzvalkalas-virsus.png", "silkinis-uzvalkalas-vyndaris-virsus-v3.png", "burgundy"),
    ("gua-sha-rinkinys.png", "gua-sha-rinkinys-nefritas-v3.png", "jade"),
    ("gua-sha-rinkinys-sonas.png", "gua-sha-rinkinys-nefritas-sonas-v3.png", "jade"),
    ("gua-sha-rinkinys-virsus.png", "gua-sha-rinkinys-nefritas-virsus-v3.png", "jade"),
    ("kilimas-kaledu-grindys.png", "kilimas-kaledu-grindys-vyndaris-v3.png", "burgundy"),
    ("kilimas-kaledu-grindys-sonas.png", "kilimas-kaledu-grindys-vyndaris-sonas-v3.png", "burgundy"),
    ("kilimas-kaledu-grindys-virsus.png", "kilimas-kaledu-grindys-vyndaris-virsus-v3.png", "burgundy"),
    ("raktu-pakabukas-egle.png", "raktu-pakabukas-egle-juodas-v3.png", "black"),
    ("raktu-pakabukas-egle-sonas.png", "raktu-pakabukas-egle-juodas-sonas-v3.png", "black"),
    ("raktu-pakabukas-egle-nugara.png", "raktu-pakabukas-egle-juodas-nugara-v3.png", "black"),
    ("ausines-kisenines.png", "ausines-kisenines-grafitas-v3.png", "graphite"),
    ("ausines-kisenines-sonas.png", "ausines-kisenines-grafitas-sonas-v3.png", "graphite"),
    ("ausines-kisenines-virsus.png", "ausines-kisenines-grafitas-virsus-v3.png", "graphite"),
    ("slepetes-minksta-peda.png", "slepetes-minksta-peda-vyndaris-v3.png", "burgundy"),
    ("slepetes-minksta-peda-sonas.png", "slepetes-minksta-peda-vyndaris-sonas-v3.png", "burgundy"),
    ("slepetes-minksta-peda-virsus.png", "slepetes-minksta-peda-vyndaris-virsus-v3.png", "burgundy"),
]

for src, dst, mode in JOBS:
    recolor(src, dst, mode)
