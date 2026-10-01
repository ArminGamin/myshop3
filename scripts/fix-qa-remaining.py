from pathlib import Path
import importlib.util

import cv2
import numpy as np

SPEC = importlib.util.spec_from_file_location(
    "qa1", Path(r"D:\jaukumas\scripts\fix-qa-variants.py")
)
qa = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(qa)

MASKS = Path(r"D:\jaukumas\.tmp-qa\masks")
MASKS.mkdir(parents=True, exist_ok=True)
ALPHA = Path(r"D:\jaukumas\.tmp-qa\alpha")

BURGUNDY = qa.BURGUNDY
GREY = qa.GREY
SHADE = qa.SHADE


def overlay(tag, im, sel):
    vis = im.copy()
    vis[sel] = (vis[sel] * 0.35 + np.array([20, 20, 230]) * 0.65).astype(np.uint8)
    h = 460
    w = int(vis.shape[1] * h / vis.shape[0])
    cv2.imwrite(
        str(MASKS / f"r6-{tag}.jpg"),
        cv2.resize(vis, (w, h)),
        [int(cv2.IMWRITE_JPEG_QUALITY), 82],
    )
    print(f"overlay {tag:28s} {int(sel.sum()):8d}")


def fill_holes(mask):
    m = mask.astype(np.uint8) * 255
    ff = m.copy()
    flood = np.zeros((m.shape[0] + 2, m.shape[1] + 2), np.uint8)
    cv2.floodFill(ff, flood, (0, 0), 255)
    return mask | (ff == 0)


def color_flood(bgr, seeds, lo=20, hi=28):
    h, w = bgr.shape[:2]
    mask = np.zeros((h + 2, w + 2), np.uint8)
    for sx, sy in seeds:
        if not (0 <= sx < w and 0 <= sy < h):
            continue
        cv2.floodFill(
            bgr,
            mask,
            (int(sx), int(sy)),
            (255, 255, 255),
            (lo, lo, lo),
            (hi, hi, hi),
            4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8),
        )
    return mask[1:-1, 1:-1] > 0


def pillow_hero_mask(name):
    im = qa.load(name)
    hsv = qa.hsv_of(im)
    yy, xx = np.indices(im.shape[:2])
    a = qa.alpha_of(name) > 80
    # Confident silk core; rembg fringe near bauble drops out.
    core = (
        cv2.erode(
            a.astype(np.uint8) * 255,
            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17)),
        )
        > 0
    )
    core = qa.largest(core, 30000)
    seeds = []
    ys, xs = np.where(core)
    step = max(1, len(xs) // 50)
    for i in range(0, len(xs), step):
        seeds.append((int(xs[i]), int(ys[i])))
    for pt in [
        (95, 880),
        (110, 820),
        (130, 760),
        (160, 700),
        (200, 650),
        (280, 600),
        (400, 575),
        (550, 560),
        (700, 575),
        (850, 640),
        (920, 720),
        (180, 920),
        (250, 1000),
        (450, 1080),
        (700, 1050),
        (120, 980),
        (90, 920),
    ]:
        seeds.append(pt)
    flood = color_flood(im.copy(), seeds, lo=18, hi=26)
    gold = (
        (hsv[:, :, 0] > 8)
        & (hsv[:, :, 0] < 40)
        & (hsv[:, :, 1] > 95)
        & (hsv[:, :, 2] > 70)
    )
    bauble = ((xx - 200) ** 2 + (yy - 360) ** 2) < 160**2
    # Loose clip around the stacked silk — not a tight sticker polygon.
    clip = qa.poly(
        im.shape,
        [
            (40, 780),
            (80, 640),
            (180, 560),
            (350, 520),
            (550, 505),
            (780, 530),
            (980, 600),
            (1020, 740),
            (1010, 1000),
            (850, 1200),
            (450, 1240),
            (120, 1120),
            (40, 920),
        ],
    )
    plants = (yy < 500) & (xx < 420)
    flower = (yy > 1050) & (xx < 220) & (hsv[:, :, 1] > 40)
    sel = (core | (flood & a) | (a & clip & (yy > 540))) & clip
    sel = sel & ~gold & ~bauble & ~plants & ~flower
    sel = qa.keep_large(sel, 8000)
    sel = fill_holes(sel)
    sel = sel & clip & ~gold & ~bauble & ~plants
    # Soften jagged rembg top without chopping the real curve.
    sel = (
        cv2.morphologyEx(
            sel.astype(np.uint8) * 255,
            cv2.MORPH_CLOSE,
            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)),
        )
        > 0
    )
    return sel & clip & ~gold & ~bauble


def pillow_sonas_mask(name):
    im = qa.load(name)
    hsv = qa.hsv_of(im)
    yy, xx = np.indices(im.shape[:2])
    # Sonas rembg cache is unreliable — rebuild from color flood + loose clip.
    seeds = [
        (420, 520),
        (500, 500),
        (580, 520),
        (350, 560),
        (650, 560),
        (400, 620),
        (560, 640),
        (480, 700),
        (300, 600),
        (700, 600),
        (450, 480),
        (550, 480),
        (380, 540),
        (620, 540),
    ]
    flood = color_flood(im.copy(), seeds, lo=16, hi=24)
    gold = (
        (hsv[:, :, 0] > 8)
        & (hsv[:, :, 0] < 40)
        & (hsv[:, :, 1] > 90)
        & (hsv[:, :, 2] > 70)
    )
    bauble = ((xx - 160) ** 2 + (yy - 380) ** 2) < 130**2
    clip = qa.poly(
        im.shape,
        [
            (140, 420),
            (280, 360),
            (480, 340),
            (720, 370),
            (880, 460),
            (920, 620),
            (860, 780),
            (620, 860),
            (320, 850),
            (140, 700),
            (110, 540),
        ],
    )
    a = qa.alpha_of(name) > 20
    sel = (flood | a) & clip & ~gold & ~bauble & (yy > 330)
    sel = qa.keep_large(sel, 5000)
    sel = fill_holes(sel)
    sel = (
        cv2.morphologyEx(
            sel.astype(np.uint8) * 255,
            cv2.MORPH_CLOSE,
            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)),
        )
        > 0
    )
    return sel & clip & ~gold & ~bauble


def lamp_sonas_mask(name):
    im = qa.load(name)
    hsv = qa.hsv_of(im)
    yy, xx = np.indices(im.shape[:2])
    a = qa.alpha_of(name) > 60
    # Full shade outline including top hem under the finial.
    shade = qa.poly(
        im.shape,
        [
            (340, 255),
            (365, 195),
            (410, 150),
            (460, 132),
            (510, 125),
            (555, 130),
            (595, 150),
            (635, 190),
            (675, 250),
            (705, 320),
            (722, 390),
            (720, 455),
            (695, 505),
            (640, 532),
            (560, 545),
            (470, 542),
            (395, 518),
            (345, 475),
            (320, 410),
            (318, 340),
            (328, 290),
        ],
    )
    arm = np.zeros(im.shape[:2], np.uint8)
    pts = np.array(
        [
            [555, 168],
            [590, 178],
            [635, 215],
            [680, 270],
            [720, 340],
            [745, 410],
            [755, 480],
            [745, 560],
            [720, 650],
            [690, 750],
        ],
        np.int32,
    )
    cv2.polylines(arm, [pts], False, 255, 34)
    cv2.circle(arm, (512, 145), 44, 255, -1)
    cv2.circle(arm, (538, 155), 30, 255, -1)
    cv2.circle(arm, (565, 168), 22, 255, -1)
    brass = (
        (hsv[:, :, 0] > 8)
        & (hsv[:, :, 0] < 38)
        & (hsv[:, :, 1] > 115)
        & (hsv[:, :, 2] > 55)
    )
    arm_d = cv2.dilate(arm, np.ones((11, 11), np.uint8))
    sel = a & shade & ~(arm > 0) & ~((arm_d > 0) & brass)
    # Drop candle / glow under hem.
    sel = sel & (yy < 538) & (yy > 120)
    sel = fill_holes(sel)
    sel = sel & shade & ~(arm > 0) & ~((arm_d > 0) & brass)
    return sel


def tea_mask(name):
    im = qa.load(name)
    hsv = qa.hsv_of(im)
    s = hsv[:, :, 1]
    h = hsv[:, :, 0]
    v = hsv[:, :, 2]
    yy, xx = np.indices(im.shape[:2])
    a = qa.alpha_of(name) > 70
    # High-sat wicker / wood stick (do not use low-sat gate on ceramic).
    hot = s > 150
    # Wicker connected components that are mostly hot.
    num, lab, st, _ = cv2.connectedComponentsWithStats(
        (a & hot).astype(np.uint8), 8
    )
    wicker = np.zeros(a.shape, bool)
    for i in range(1, num):
        if st[i, cv2.CC_STAT_AREA] < 400:
            continue
        comp = lab == i
        if (hot & comp).sum() / max(1, comp.sum()) > 0.35:
            wicker |= comp
    # Dilate wicker slightly to catch rim binding.
    wicker = (
        cv2.dilate(wicker.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    )
    # Wooden stick: thin high-value warm strip.
    if name.endswith("-virsus.png"):
        stick = (xx > 700) & (yy > 720) & (s > 40) & (v > 100)
        tea = (
            (xx > 160)
            & (xx < 380)
            & (yy > 560)
            & (yy < 720)
            & (s > 100)
            & (((h < 30) | (h > 160)) | ((h > 8) & (h < 35)))
        )
        tea_disk = np.zeros(a.shape, np.uint8)
        cv2.ellipse(tea_disk, (270, 640), (95, 78), 0, 0, 360, 255, -1)
        tea = tea | ((tea_disk > 0) & (s > 90) & (yy < 700))
    elif name.endswith("-sonas.png"):
        stick = (xx > 680) & (yy > 680) & (s > 35) & (v > 90)
        tea_disk = np.zeros(a.shape, np.uint8)
        cv2.ellipse(tea_disk, (210, 610), (100, 65), 0, 0, 360, 255, -1)
        tea = (tea_disk > 0) & (s > 70) & (yy < 675)
    else:
        stick = (xx > 780) & (yy > 1080) & (s > 35) & (v > 90)
        tea_disk = np.zeros(a.shape, np.uint8)
        cv2.ellipse(tea_disk, (175, 1030), (105, 85), 0, 0, 360, 255, -1)
        tea = (tea_disk > 0) & (
            ((s > 90) & (h > 8) & (h < 30) & (v > 40) & (v < 200))
            | ((yy > 1005) & (yy < 1090) & (s > 60))
        )
        pool = np.zeros(a.shape, np.uint8)
        cv2.ellipse(pool, (175, 1038), (85, 50), 0, 0, 360, 255, -1)
        tea = tea | ((pool > 0) & (yy > 1000) & (yy < 1090))

    # Metal strainer rim / mesh: mid-grey low-sat near wicker, keep unpainted.
    metal = (s < 55) & (v > 90) & (v < 200) & wicker
    metal = (
        cv2.dilate(metal.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    )

    sel = a & ~wicker & ~stick & ~tea & ~metal
    # Close small holes so cup rim / body stay filled.
    closed = cv2.morphologyEx(
        sel.astype(np.uint8) * 255,
        cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)),
    )
    holes = (closed > 0) & ~sel
    num, lab, st, _ = cv2.connectedComponentsWithStats(holes.astype(np.uint8), 8)
    add = np.zeros(sel.shape, bool)
    for i in range(1, num):
        if st[i, cv2.CC_STAT_AREA] < 4000:
            add[lab == i] = True
    sel = sel | add
    # Re-cut props after close.
    sel = sel & ~wicker & ~stick & ~tea & ~metal
    sel = qa.keep_large(sel, 1500)
    return sel


def preview_masks():
    jobs = [
        ("pillow-hero", "silkinis-uzvalkalas.png", pillow_hero_mask),
        ("pillow-sonas", "silkinis-uzvalkalas-sonas.png", pillow_sonas_mask),
        ("lamp-sonas", "zvakiu-sildymo-lempa-sonas.png", lamp_sonas_mask),
        ("tea", "keramikos-arbata.png", tea_mask),
        ("tea-sonas", "keramikos-arbata-sonas.png", tea_mask),
        ("tea-virsus", "keramikos-arbata-virsus.png", tea_mask),
    ]
    for tag, src, fn in jobs:
        im = qa.load(src)
        sel = fn(src)
        overlay(tag, im, sel)


def write_all():
    jobs = [
        (
            "silkinis-uzvalkalas.png",
            "silkinis-uzvalkalas-vyndaris-v3.png",
            pillow_hero_mask,
            BURGUNDY,
        ),
        (
            "silkinis-uzvalkalas-sonas.png",
            "silkinis-uzvalkalas-vyndaris-sonas-v3.png",
            pillow_sonas_mask,
            BURGUNDY,
        ),
        (
            "zvakiu-sildymo-lempa-sonas.png",
            "zvakiu-sildymo-lempa-juodas-sonas-v3.png",
            lamp_sonas_mask,
            SHADE,
        ),
        (
            "keramikos-arbata.png",
            "keramikos-arbata-vyndaris-v3.png",
            tea_mask,
            BURGUNDY,
        ),
        (
            "keramikos-arbata-sonas.png",
            "keramikos-arbata-vyndaris-sonas-v3.png",
            tea_mask,
            BURGUNDY,
        ),
        (
            "keramikos-arbata-virsus.png",
            "keramikos-arbata-vyndaris-virsus-v3.png",
            tea_mask,
            BURGUNDY,
        ),
        (
            "keramikos-arbata.png",
            "keramikos-arbata-pilkelis-v3.png",
            tea_mask,
            GREY,
        ),
        (
            "keramikos-arbata-sonas.png",
            "keramikos-arbata-pilkelis-sonas-v3.png",
            tea_mask,
            GREY,
        ),
        (
            "keramikos-arbata-virsus.png",
            "keramikos-arbata-pilkelis-virsus-v3.png",
            tea_mask,
            GREY,
        ),
    ]
    for src, dst, fn, style in jobs:
        qa.write_pair(src, dst, fn(src), style)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "write":
        write_all()
    else:
        preview_masks()
