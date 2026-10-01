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

BURGUNDY = qa.BURGUNDY
CREAM = qa.CREAM
GREEN = qa.GREEN
GREY = qa.GREY
BLACK = qa.BLACK
SHADE = qa.SHADE
GRAPHITE = qa.GRAPHITE
WARM = qa.WARM
JADE = qa.JADE
HANDLE = qa.HANDLE
IVORY = (22, 26, 1.05, 110, 155, 252)


def overlay(tag, im, sel):
    vis = im.copy()
    vis[sel] = (vis[sel] * 0.35 + np.array([20, 20, 230]) * 0.65).astype(np.uint8)
    h = 460
    w = int(vis.shape[1] * h / vis.shape[0])
    cv2.imwrite(
        str(MASKS / f"p4b-{tag}.jpg"),
        cv2.resize(vis, (w, h)),
        [int(cv2.IMWRITE_JPEG_QUALITY), 80],
    )
    print(f"overlay {tag:32s} {int(sel.sum()):8d}")


def fill_holes(mask):
    m = mask.astype(np.uint8) * 255
    ff = m.copy()
    flood = np.zeros((m.shape[0] + 2, m.shape[1] + 2), np.uint8)
    cv2.floodFill(ff, flood, (0, 0), 255)
    return mask | (ff == 0)


def edge_flood(bgr, seeds, lo=20, hi=70, dilate_edges=1):
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 5, 40, 40)
    edges = cv2.Canny(gray, lo, hi)
    if dilate_edges:
        edges = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=dilate_edges)
    acc = np.zeros(bgr.shape[:2], bool)
    for seed in seeds:
        mask = np.zeros((bgr.shape[0] + 2, bgr.shape[1] + 2), np.uint8)
        mask[1:-1, 1:-1][edges > 0] = 128
        flags = 4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8)
        cv2.floodFill(bgr.copy(), mask, seed, (0, 0, 0), (255, 255, 255), (255, 255, 255), flags)
        acc |= mask[1:-1, 1:-1] == 255
    return acc


def galaxy_mask(name):
    im = qa.load(name)
    hsv = qa.hsv_of(im)
    a = qa.alpha_of(name) > 80
    v = hsv[:, :, 2]
    h, s = hsv[:, :, 0], hsv[:, :, 1]
    dark = (a & (v < 85)).astype(np.uint8)
    dark = cv2.morphologyEx(
        dark, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    )
    num, lab, st, _ = cv2.connectedComponentsWithStats(dark, 8)
    n_keep = 1 if "nugara" in name else 2
    min_area = 3000 if "nugara" in name else 2000
    order = sorted(
        [
            (st[i, cv2.CC_STAT_AREA], i)
            for i in range(1, num)
            if st[i, cv2.CC_STAT_AREA] >= min_area
        ],
        reverse=True,
    )[:n_keep]
    cut = np.zeros(a.shape, bool)
    for _, i in order:
        comp = lab == i
        comp = cv2.dilate(comp.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
        cut |= fill_holes(comp)
    blue = a & (h > 90) & (h < 150) & (s > 40)
    blue = blue & (cv2.dilate(cut.astype(np.uint8), np.ones((21, 21), np.uint8)) > 0)
    cut = cut | blue
    # exclude Christmas baubles (gold/red ornaments outside the suit)
    yy, xx = np.indices(im.shape[:2])
    if "sonas" in name:
        bauble = ((xx - 120) ** 2 + (yy - 560) ** 2) < 130**2
    elif "nugara" in name:
        bauble = ((xx - 860) ** 2 + (yy - 520) ** 2) < 120**2
    else:
        bauble = ((xx - 820) ** 2 + (yy - 560) ** 2) < 130**2
        bauble = bauble | ((xx > 740) & (yy > 520) & (yy < 720) & (xx < 980))
    return a & ~cut & ~bauble


def pillow_hero_mask(name):
    im = qa.load(name)
    hsv = qa.hsv_of(im)
    yy, xx = np.indices(im.shape[:2])
    clip = qa.poly(
        im.shape,
        [
            (70, 760),
            (190, 600),
            (400, 535),
            (700, 525),
            (970, 580),
            (1010, 740),
            (990, 1000),
            (800, 1180),
            (400, 1210),
            (90, 1040),
            (45, 860),
        ],
    )
    body = qa.largest(qa.body_mask(name, 40), 50000)
    gold = (hsv[:, :, 0] > 8) & (hsv[:, :, 0] < 40) & (hsv[:, :, 1] > 70) & (hsv[:, :, 2] > 70)
    bauble = ((xx - 200) ** 2 + (yy - 360) ** 2) < 130**2
    # hard cut anything above the top silk fold
    top_cut = yy < 530
    plants = (yy < 560) & (xx < 450)
    sel = body & clip & ~gold & ~bauble & ~plants & ~top_cut
    sel = cv2.morphologyEx(
        sel.astype(np.uint8) * 255,
        cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)),
    ) > 0
    # re-trim after close so close can't re-add spill
    return sel & clip & ~gold & ~bauble & ~plants & (yy >= 530)


def lamp_mask(name):
    im = qa.load(name)
    a = qa.alpha_of(name) > 80
    hsv = qa.hsv_of(im)
    yy, xx = np.indices(im.shape[:2])
    if name.endswith("-virsus.png"):
        outer = np.zeros(im.shape[:2], np.uint8)
        cv2.ellipse(outer, (505, 405), (255, 245), 0, 0, 360, 255, -1)
        gold = np.zeros(im.shape[:2], np.uint8)
        cv2.ellipse(gold, (500, 250), (100, 80), 0, 0, 360, 255, -1)
        sel = a & (outer > 0) & ~(gold > 0)
        sel = sel & (xx > 285) & (yy > 165) & (yy < 655)
        sel = sel & ~((xx > 640) & (yy < 300))
        return sel
    if name.endswith("-sonas.png"):
        shade = qa.poly(
            im.shape,
            [
                (340, 250),
                (370, 195),
                (425, 160),
                (490, 148),
                (545, 152),
                (595, 175),
                (645, 225),
                (685, 295),
                (710, 375),
                (700, 455),
                (665, 505),
                (580, 525),
                (465, 520),
                (380, 500),
                (340, 455),
                (325, 375),
                (328, 295),
            ],
        )
        arm = np.zeros(im.shape[:2], np.uint8)
        arm_pts = np.array(
            [
                [555, 175],
                [600, 185],
                [650, 220],
                [700, 280],
                [740, 360],
                [760, 450],
                [750, 560],
                [720, 680],
                [680, 780],
            ],
            np.int32,
        )
        cv2.polylines(arm, [arm_pts], False, 255, 40)
        cv2.circle(arm, (518, 155), 52, 255, -1)
        cv2.circle(arm, (560, 180), 28, 255, -1)
        cv2.circle(arm, (620, 200), 22, 255, -1)
        post = (xx > 502) & (xx < 530) & (yy > 150) & (yy < 220)
        arm[post] = 255
        top_brass = ((xx - 518) ** 2 / 65**2 + (yy - 170) ** 2 / 40**2) < 1
        arm[top_brass] = 255
        arm[((xx > 475) & (xx < 515) & (yy > 150) & (yy < 200))] = 255
        sel = shade & ~(arm > 0) & (yy > 155) & (yy < 530)
        sel = cv2.dilate(sel.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        return sel & ~(arm > 0) & (yy < 530)
    clip = qa.poly(im.shape, [(255, 375), (715, 360), (855, 790), (155, 800)])
    sel = a & clip & (yy < 815)
    arm = qa.poly(im.shape, [(640, 200), (820, 190), (880, 420), (840, 780), (720, 780), (660, 420)])
    brass = (hsv[:, :, 1] > 90) & (hsv[:, :, 0] > 8) & (hsv[:, :, 0] < 35) & (hsv[:, :, 2] > 60)
    sel = sel & ~(arm & brass)
    sel = sel & ~((xx > 700) & (yy > 450) & (yy < 900) & (xx < 780) & brass)
    return sel


def tea_mask(name):
    im = qa.load(name)
    hsv = qa.hsv_of(im)
    a = qa.alpha_of(name) > 80
    s = hsv[:, :, 1]
    yy, xx = np.indices(im.shape[:2])
    if name.endswith("-virsus.png"):
        num, lab, st, cents = cv2.connectedComponentsWithStats(a.astype(np.uint8), 8)
        for i in range(1, num):
            cx, cy = cents[i]
            if 500 < cx < 750 and 650 < cy < 850 and st[i, cv2.CC_STAT_AREA] > 15000:
                a = a & ~(lab == i)
        tea = np.zeros(a.shape, np.uint8)
        cv2.ellipse(tea, (267, 640), (90, 75), 0, 0, 360, 255, -1)
        tea = (tea > 0) & (s > 90) & (yy < 700)
        strainer = np.zeros(a.shape, np.uint8)
        cv2.ellipse(strainer, (650, 760), (130, 110), 0, 0, 360, 255, -1)
        stick = (xx > 720) & (yy > 740) & (xx < 950)
        sel = a & ~tea & ~(strainer > 0) & ~stick
    elif name.endswith("-sonas.png"):
        strainer = np.zeros(a.shape, np.uint8)
        cv2.ellipse(strainer, (640, 780), (140, 120), 0, 0, 360, 255, -1)
        stick = (xx > 700) & (yy > 700) & (xx < 950)
        tea = np.zeros(a.shape, np.uint8)
        cv2.ellipse(tea, (210, 610), (95, 60), 0, 0, 360, 255, -1)
        tea = (tea > 0) & (s > 70) & (yy < 670)
        sel = a & ~(strainer > 0) & ~tea & ~stick
    else:
        strainer = np.zeros(a.shape, np.uint8)
        cv2.ellipse(strainer, (730, 1220), (120, 115), 10, 0, 360, 255, -1)
        stick = (xx > 800) & (yy > 1100) & (xx < 1000)
        # amber tea surface in cup — color+zone, not fragile sat gate
        tea = (
            (xx > 60)
            & (xx < 280)
            & (yy > 940)
            & (yy < 1105)
            & (hsv[:, :, 0] > 8)
            & (hsv[:, :, 0] < 25)
            & (hsv[:, :, 1] > 90)
            & (hsv[:, :, 2] > 40)
            & (hsv[:, :, 2] < 190)
        )
        tea_disk = np.zeros(a.shape, np.uint8)
        cv2.ellipse(tea_disk, (180, 1025), (100, 80), 0, 0, 360, 255, -1)
        tea = tea & (tea_disk > 0)
        # hard cut liquid pool (even low-sat highlights)
        pool = np.zeros(a.shape, np.uint8)
        cv2.ellipse(pool, (175, 1035), (82, 48), 0, 0, 360, 255, -1)
        tea = tea | ((pool > 0) & (yy > 1005) & (yy < 1085))
        sel = a & ~(strainer > 0) & ~tea & ~stick
    closed = cv2.morphologyEx(
        sel.astype(np.uint8) * 255,
        cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)),
    )
    holes = (closed > 0) & ~sel
    num, lab, st, _ = cv2.connectedComponentsWithStats(holes.astype(np.uint8), 8)
    add = np.zeros(sel.shape, bool)
    for i in range(1, num):
        if st[i, cv2.CC_STAT_AREA] < 3500:
            add[lab == i] = True
    sel = sel | add
    if name.endswith("-virsus.png"):
        cut = np.zeros(sel.shape, np.uint8)
        cv2.ellipse(cut, (650, 760), (130, 110), 0, 0, 360, 255, -1)
        sel = sel & ~(cut > 0) & ~((xx > 720) & (yy > 740))
    elif name.endswith("-sonas.png"):
        cut = np.zeros(sel.shape, np.uint8)
        cv2.ellipse(cut, (640, 780), (140, 120), 0, 0, 360, 255, -1)
        sel = sel & ~(cut > 0) & ~((xx > 700) & (yy > 700))
    else:
        cut = np.zeros(sel.shape, np.uint8)
        cv2.ellipse(cut, (730, 1220), (120, 115), 10, 0, 360, 255, -1)
        sel = sel & ~(cut > 0) & ~((xx > 800) & (yy > 1100))
        sel = sel & ~tea
    return sel


def rain_mask(name):
    im = qa.load(name)
    hsv = qa.hsv_of(im)
    a = qa.alpha_of(name) > 80
    yy, xx = np.indices(im.shape[:2])
    s, v = hsv[:, :, 1], hsv[:, :, 2]
    if name.endswith("-sonas.png"):
        cloud = a & (yy > 120) & (yy < 405) & (xx > 300) & (xx < 820)
        # keep stem join clean — no cloud below y=400 near stem
        cloud = cloud & ~((yy > 395) & (xx > 470) & (xx < 560))
        stem = (
            (xx > 495)
            & (xx < 545)
            & (yy > 405)
            & (yy < 760)
            & (v > 155)
            & (s < 50)
        )
        drops = (yy > 395) & (yy < 530) & (v > 180) & (s < 40) & (xx > 350) & (xx < 700)
        drops = drops & ~((xx > 495) & (xx < 545) & (yy > 405))
        sel = (cloud | stem) & ~drops
    else:
        cloud = a & (yy > 150) & (yy < 640) & (xx > 250) & (xx < 770)
        cloud = cloud & (v > 130) & (s < 75)
        cloud = cloud & ~((yy > 580) & (s > 35) & (v < 180))
        sel = cloud
    sel = cv2.morphologyEx(
        sel.astype(np.uint8) * 255,
        cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)),
    ) > 0
    return qa.keep_large(sel, 3000)


def rose_mask(name):
    return qa.rose_petals(name)


def frother_virsus_mask(name):
    im = qa.load(name)
    sel = edge_flood(im, [(400, 480)], lo=25, hi=70, dilate_edges=1)
    sel = cv2.dilate(sel.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    return sel


def silk_sonas_mask(name):
    im = qa.load(name)
    eye = edge_flood(im, [(400, 420)], lo=18, hi=55, dilate_edges=1)
    a = qa.alpha_of(name) > 40
    num, lab, st, cents = cv2.connectedComponentsWithStats(a.astype(np.uint8), 8)
    # rembg comps: mask(~435,506), tray(~819,143), scrunchie(~779,721)
    strap_or_mask = np.zeros(a.shape, bool)
    scrunchie = np.zeros(a.shape, bool)
    for i in range(1, num):
        cx, cy = cents[i]
        area = st[i, cv2.CC_STAT_AREA]
        if area < 5000:
            continue
        if cy < 280 and cx > 600:
            continue  # tray
        if 700 < cx < 900 and 650 < cy < 820:
            scrunchie[lab == i] = True
        elif 200 < cy < 650:
            strap_or_mask[lab == i] = True
    # punch linen hole in scrunchie
    if np.any(scrunchie):
        hole = qa.circle(im.shape, (720, 715), 48)
        scrunchie = scrunchie & ~hole
    # pouch: rembg may include it in mask component — keep if in rembg mask region
    sel = eye | (strap_or_mask & (np.indices(im.shape[:2])[0] > 450)) | scrunchie
    # if strap_or_mask already covers eye well, prefer rembg mask body + eye flood union
    # but reject spill onto sheet: drop pixels with very low rembg and outside eye
    # safer: eye + scrunchie + rembg mask component only (not tray)
    mask_comp = np.zeros(a.shape, bool)
    for i in range(1, num):
        cx, cy = cents[i]
        area = st[i, cv2.CC_STAT_AREA]
        if area < 50000:
            continue
        if 300 < cx < 600 and 400 < cy < 600:
            mask_comp[lab == i] = True
    # rembg mask is incomplete (highlights) — union eye flood with rembg mask & scrunchie
    sel = eye | mask_comp | scrunchie
    # also grab strap from rembg: thin left lobe of mask_comp or separate
    for i in range(1, num):
        cx, cy = cents[i]
        area = st[i, cv2.CC_STAT_AREA]
        if 5000 < area < 50000 and cx < 250 and 450 < cy < 750:
            sel = sel | (lab == i)
    # pouch under mask: flood from pouch seed if it stays in product
    pouch = edge_flood(im, [(280, 650)], lo=18, hi=55, dilate_edges=1)
    if 5000 < pouch.sum() < 120000:
        sel = sel | pouch
    return sel


def gua_mask(name):
    im = qa.load(name)
    hsv = qa.hsv_of(im)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    # pink quartz: reddish hue, moderate sat, not gold
    pink = (((h < 12) | (h > 165)) & (s > 25) & (s < 130) & (v > 80)) | (
        (h > 165) & (h < 180) & (s > 20) & (s < 140) & (v > 70)
    )
    # also lighter pink/mauve
    pink = pink | ((h < 15) & (s > 15) & (s < 100) & (v > 120) & (v < 250))
    gold = (h > 8) & (h < 35) & (s > 100) & (v > 90)
    yy, xx = np.indices(im.shape[:2])
    if name.endswith("-sonas.png"):
        zones = (
            qa.circle(im.shape, (455, 248), 95)
            | qa.circle(im.shape, (715, 748), 110)
            | qa.poly(
                im.shape,
                [(250, 450), (520, 430), (540, 740), (280, 760)],
            )
            | qa.poly(
                im.shape,
                [(470, 320), (560, 340), (640, 600), (530, 620)],
            )
        )
    else:
        zones = (
            qa.circle(im.shape, (500, 280), 110)
            | qa.circle(im.shape, (325, 815), 100)
            | qa.poly(
                im.shape,
                [(520, 380), (820, 370), (810, 740), (530, 730)],
            )
            | qa.poly(
                im.shape,
                [(400, 320), (500, 340), (480, 700), (390, 680)],
            )
        )
    sel = pink & zones & ~gold
    sel = cv2.morphologyEx(
        sel.astype(np.uint8) * 255,
        cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)),
    ) > 0
    # fill small holes inside stones
    holes = fill_holes(sel) & ~sel
    num, lab, st, _ = cv2.connectedComponentsWithStats(holes.astype(np.uint8), 8)
    add = np.zeros(sel.shape, bool)
    for i in range(1, num):
        if st[i, cv2.CC_STAT_AREA] < 2500:
            add[lab == i] = True
    sel = sel | add
    return qa.keep_large(sel, 800)


def bottle_sonas_mask(name):
    im = qa.load(name)
    a = qa.alpha_of(name) > 60
    # rembg has bottom half — use as sure FG
    sure = a.copy()
    # upper bottle polygon as probable
    upper = qa.poly(
        im.shape,
        [
            (190, 180),
            (280, 55),
            (510, 55),
            (550, 200),
            (760, 280),
            (780, 520),
            (700, 280),
            (480, 230),
            (250, 250),
        ],
    )
    # grabcut init
    small = cv2.resize(im, (im.shape[1] // 2, im.shape[0] // 2), interpolation=cv2.INTER_AREA)
    sx, sy = small.shape[1] / im.shape[1], small.shape[0] / im.shape[0]
    mask = np.full(small.shape[:2], cv2.GC_BGD, np.uint8)
    # outside bottle box = BGD
    box = qa.poly(
        im.shape,
        [(140, 40), (580, 40), (820, 280), (800, 880), (200, 880), (140, 400)],
    )
    box_s = cv2.resize(box.astype(np.uint8) * 255, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    mask[box_s > 0] = cv2.GC_PR_BGD
    upper_s = cv2.resize(upper.astype(np.uint8) * 255, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    mask[upper_s > 0] = cv2.GC_PR_FGD
    sure_s = cv2.resize(sure.astype(np.uint8) * 255, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    mask[sure_s > 0] = cv2.GC_FGD
    # far outside
    mask[box_s == 0] = cv2.GC_BGD
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(small, mask, None, bgd, fgd, 5, cv2.GC_INIT_WITH_MASK)
    sel = ((mask == 1) | (mask == 3)).astype(np.uint8) * 255
    sel = cv2.resize(sel, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_NEAREST) > 127
    # drop pine / cinnamon below
    yy, xx = np.indices(im.shape[:2])
    sel = sel & ~((yy > 880) | ((xx < 280) & (yy > 780)))
    sel = cv2.morphologyEx(
        sel.astype(np.uint8) * 255,
        cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)),
    ) > 0
    return qa.largest(sel, 20000)


def pillow_sonas_mask(name):
    return qa.pillow_side(name)


def preview_masks():
    jobs = [
        ("galaxy", "galaktikos-projektorius.png", galaxy_mask),
        ("galaxy-sonas", "galaktikos-projektorius-sonas.png", galaxy_mask),
        ("galaxy-nugara", "galaktikos-projektorius-nugara.png", galaxy_mask),
        ("pillow-hero", "silkinis-uzvalkalas.png", pillow_hero_mask),
        ("lamp", "zvakiu-sildymo-lempa.png", lamp_mask),
        ("lamp-sonas", "zvakiu-sildymo-lempa-sonas.png", lamp_mask),
        ("lamp-virsus", "zvakiu-sildymo-lempa-virsus.png", lamp_mask),
        ("tea", "keramikos-arbata.png", tea_mask),
        ("tea-sonas", "keramikos-arbata-sonas.png", tea_mask),
        ("tea-virsus", "keramikos-arbata-virsus.png", tea_mask),
        ("rain-sonas", "lietaus-drekinuvas-sonas.png", rain_mask),
        ("rain-virsus", "lietaus-drekinuvas-virsus.png", rain_mask),
        ("rose", "amzinoji-roze.png", rose_mask),
        ("pillow-sonas", "silkinis-uzvalkalas-sonas.png", pillow_sonas_mask),
    ]
    for tag, src, fn in jobs:
        im = qa.load(src)
        sel = fn(src)
        overlay(tag, im, sel)


def write_all():
    jobs = [
        ("galaktikos-projektorius.png", "galaktikos-projektorius-kreminis-v3.png", galaxy_mask, WARM),
        ("galaktikos-projektorius-sonas.png", "galaktikos-projektorius-kreminis-sonas-v3.png", galaxy_mask, WARM),
        ("galaktikos-projektorius-nugara.png", "galaktikos-projektorius-kreminis-nugara-v3.png", galaxy_mask, WARM),
        ("silkinis-uzvalkalas.png", "silkinis-uzvalkalas-vyndaris-v3.png", pillow_hero_mask, BURGUNDY),
        ("silkinis-uzvalkalas-sonas.png", "silkinis-uzvalkalas-vyndaris-sonas-v3.png", pillow_sonas_mask, BURGUNDY),
        ("zvakiu-sildymo-lempa.png", "zvakiu-sildymo-lempa-juodas-v3.png", lamp_mask, SHADE),
        ("zvakiu-sildymo-lempa-sonas.png", "zvakiu-sildymo-lempa-juodas-sonas-v3.png", lamp_mask, SHADE),
        ("zvakiu-sildymo-lempa-virsus.png", "zvakiu-sildymo-lempa-juodas-virsus-v3.png", lamp_mask, SHADE),
        ("keramikos-arbata.png", "keramikos-arbata-vyndaris-v3.png", tea_mask, BURGUNDY),
        ("keramikos-arbata-sonas.png", "keramikos-arbata-vyndaris-sonas-v3.png", tea_mask, BURGUNDY),
        ("keramikos-arbata-virsus.png", "keramikos-arbata-vyndaris-virsus-v3.png", tea_mask, BURGUNDY),
        ("keramikos-arbata.png", "keramikos-arbata-pilkelis-v3.png", tea_mask, GREY),
        ("keramikos-arbata-sonas.png", "keramikos-arbata-pilkelis-sonas-v3.png", tea_mask, GREY),
        ("keramikos-arbata-virsus.png", "keramikos-arbata-pilkelis-virsus-v3.png", tea_mask, GREY),
        ("lietaus-drekinuvas-sonas.png", "lietaus-drekinuvas-juodas-sonas-v3.png", rain_mask, GRAPHITE),
        ("lietaus-drekinuvas-virsus.png", "lietaus-drekinuvas-juodas-virsus-v3.png", rain_mask, GRAPHITE),
        ("amzinoji-roze.png", "amzinoji-roze-kremine-v3.png", rose_mask, IVORY),
        ("amzinoji-roze-sonas.png", "amzinoji-roze-kremine-sonas-v3.png", rose_mask, IVORY),
        ("amzinoji-roze-virsus.png", "amzinoji-roze-kremine-virsus-v3.png", rose_mask, IVORY),
    ]
    for src, dst, fn, style in jobs:
        sel = fn(src)
        qa.write_pair(src, dst, sel, style)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "preview":
        preview_masks()
    else:
        write_all()
