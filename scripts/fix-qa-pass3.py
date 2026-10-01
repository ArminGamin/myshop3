import importlib.util
from pathlib import Path

import cv2
import numpy as np

spec = importlib.util.spec_from_file_location("qa1", Path(r"D:\jaukumas\scripts\fix-qa-variants.py"))
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)

load, paint, hsv_of = qa.load, qa.paint, qa.hsv_of
poly, circle, write_pair = qa.poly, qa.circle, qa.write_pair
BURGUNDY, BLUE, GREEN, GREY = qa.BURGUNDY, qa.BLUE, qa.GREEN, qa.GREY
SHADE, GRAPHITE, WARM, JADE, HANDLE = qa.SHADE, qa.GRAPHITE, qa.WARM, qa.JADE, qa.HANDLE
BLACK = qa.BLACK

IVORY = (18, 68, 0.7, 48, 115, 232)


def ellipse(shape, c, axes, angle=0):
    m = np.zeros(shape[:2], np.uint8)
    cv2.ellipse(m, c, axes, angle, 0, 360, 255, -1)
    return m > 0


def lamp(name):
    bgr = load(name)
    if name.endswith("-sonas.png"):
        return poly(bgr.shape, [(320, 195), (650, 170), (780, 485), (260, 515)])
    if name.endswith("-virsus.png"):
        outer = ellipse(bgr.shape, (500, 400), (225, 225))
        inner = ellipse(bgr.shape, (500, 255), (95, 68))
        return outer & ~inner
    return poly(bgr.shape, [(265, 395), (690, 375), (825, 560), (845, 755), (155, 785), (195, 560)])


def silk(name):
    bgr = load(name)
    mask = poly(bgr.shape, [(150, 300), (480, 245), (760, 275), (825, 410), (700, 540), (280, 590), (130, 470)])
    strap = poly(bgr.shape, [(15, 555), (165, 515), (215, 705), (45, 745)])
    pouch = poly(bgr.shape, [(150, 500), (240, 785), (500, 730), (720, 490)])
    scrunchie = ellipse(bgr.shape, (710, 705), (160, 135)) & ~ellipse(bgr.shape, (720, 715), (50, 42))
    return mask | strap | pouch | scrunchie


def bottle(name):
    bgr = load(name)
    neck = poly(bgr.shape, [(190, 190), (270, 70), (490, 65), (530, 190), (430, 290), (250, 270)])
    body = poly(bgr.shape, [(175, 280), (210, 520), (270, 820), (520, 870), (730, 790), (770, 500), (700, 270), (480, 240)])
    return neck | body


def pillow_side(name):
    return poly(load(name).shape, [(15, 510), (180, 400), (520, 300), (820, 270), (1000, 390), (1010, 560), (620, 770), (340, 910), (70, 690)])


def pillow_hero(name):
    return poly(load(name).shape, [(30, 730), (180, 580), (480, 500), (780, 520), (980, 650), (960, 980), (700, 1120), (180, 1160), (40, 980)])


def thermos(name):
    return poly(load(name).shape, [(470, 385), (660, 385), (690, 520), (675, 720), (605, 775), (505, 775), (450, 680), (450, 490)])


def tea(name):
    bgr = load(name)
    if name.endswith("-sonas.png"):
        cup = poly(bgr.shape, [(60, 530), (170, 500), (310, 560), (315, 730), (240, 835), (80, 825), (40, 680)])
        tea = ellipse(bgr.shape, (175, 595), (95, 42))
        lid = ellipse(bgr.shape, (620, 305), (155, 58))
        handle = poly(bgr.shape, [(270, 350), (430, 330), (460, 530), (290, 545)])
        spout = poly(bgr.shape, [(770, 310), (990, 350), (970, 450), (750, 420)])
        body = poly(bgr.shape, [(420, 350), (390, 560), (470, 690), (760, 690), (830, 540), (790, 370)])
        wicker = poly(bgr.shape, [(500, 640), (790, 640), (800, 890), (500, 900)])
        return (cup & ~tea) | ((lid | handle | spout | body) & ~wicker)
    if name.endswith("-virsus.png"):
        cup = poly(bgr.shape, [(25, 510), (130, 475), (225, 545), (215, 750), (70, 790), (15, 640)])
        tea = ellipse(bgr.shape, (125, 565), (85, 42))
        body = poly(bgr.shape, [(270, 250), (360, 170), (640, 170), (760, 280), (770, 510), (660, 610), (380, 610), (240, 470)])
        spout = poly(bgr.shape, [(160, 410), (260, 390), (290, 510), (180, 520)])
        handle = poly(bgr.shape, [(690, 410), (920, 470), (870, 590), (670, 520)])
        wicker = poly(bgr.shape, [(450, 580), (780, 580), (790, 870), (460, 880)])
        return (cup & ~tea) | ((body | spout | handle) & ~wicker)
    cup = poly(bgr.shape, [(0, 980), (90, 920), (260, 980), (285, 1120), (230, 1280), (40, 1290), (0, 1160)])
    tea = ellipse(bgr.shape, (145, 1025), (110, 50))
    lid = ellipse(bgr.shape, (640, 655), (175, 62))
    spout = poly(bgr.shape, [(440, 690), (240, 690), (260, 810), (470, 840)])
    body = poly(bgr.shape, [(440, 730), (390, 930), (470, 1090), (800, 1090), (910, 920), (890, 760), (740, 670)])
    handle = poly(bgr.shape, [(850, 750), (1023, 730), (1023, 930), (830, 910)])
    wicker = poly(bgr.shape, [(490, 1040), (780, 1040), (790, 1340), (500, 1340)])
    return (cup & ~tea) | ((lid | spout | body | handle) & ~wicker)


def rain(name):
    bgr = load(name)
    if name.endswith("-sonas.png"):
        cloud = poly(bgr.shape, [(370, 210), (500, 135), (650, 165), (750, 255), (755, 345), (670, 405), (500, 415), (340, 385), (265, 310), (285, 225)])
        stem = poly(bgr.shape, [(498, 400), (548, 400), (538, 755), (508, 755)])
        return cloud | stem
    return poly(bgr.shape, [(370, 210), (520, 155), (690, 215), (750, 360), (730, 520), (610, 625), (440, 635), (310, 540), (260, 390), (295, 250)])


def galaxy(name):
    bgr = load(name)
    if name.endswith("-sonas.png"):
        body = poly(bgr.shape, [(530, 255), (670, 350), (730, 520), (755, 690), (640, 790), (410, 800), (330, 700), (355, 540), (420, 400), (395, 310)])
        visor = ellipse(bgr.shape, (495, 400), (110, 95))
        ball = circle(bgr.shape, (410, 625), 105)
    elif name.endswith("-nugara.png"):
        body = poly(bgr.shape, [(500, 225), (650, 295), (730, 450), (750, 650), (680, 810), (440, 840), (330, 720), (355, 510), (420, 330)])
        visor = ellipse(bgr.shape, (600, 340), (40, 55))
        ball = circle(bgr.shape, (650, 505), 85)
    else:
        body = poly(bgr.shape, [(500, 365), (670, 470), (700, 640), (735, 860), (750, 1020), (680, 1180), (470, 1220), (310, 1170), (250, 980), (240, 760), (300, 620), (350, 490), (375, 400)])
        visor = ellipse(bgr.shape, (510, 560), (130, 115))
        ball = circle(bgr.shape, (540, 910), 125)
    return body & ~visor & ~ball


def frother(name):
    return poly(load(name).shape, [(335, 355), (470, 295), (525, 470), (495, 650), (395, 715), (305, 520)])


def strap(name):
    bgr = load(name)
    if "sonas" in name:
        sel = poly(bgr.shape, [(385, 335), (505, 395), (295, 805), (165, 725)])
        snap = circle(bgr.shape, (345, 415), 34)
    else:
        sel = poly(bgr.shape, [(545, 530), (710, 480), (990, 1050), (830, 1120)])
        snap = circle(bgr.shape, (650, 645), 34)
    return sel & ~snap


def gua(name):
    bgr = load(name)
    if name.endswith("-sonas.png"):
        top = ellipse(bgr.shape, (455, 248), (78, 42), -25)
        bot = ellipse(bgr.shape, (715, 748), (88, 48), 18)
        handle = poly(bgr.shape, [(495, 330), (545, 300), (660, 590), (600, 625)])
        heart = poly(bgr.shape, [(315, 530), (400, 445), (510, 520), (485, 690), (375, 745), (275, 640)])
        return top | bot | handle | heart
    top = ellipse(bgr.shape, (545, 225), (125, 52), -12)
    bot = ellipse(bgr.shape, (325, 815), (78, 44), 8)
    handle = poly(bgr.shape, [(415, 255), (470, 215), (355, 700), (295, 745)])
    heart = poly(bgr.shape, [(515, 395), (690, 370), (785, 530), (700, 705), (535, 665), (475, 520)])
    return top | bot | handle | heart


def rose(name):
    return qa.rose_petals(name)


jobs = []
for ang in ["", "-sonas", "-virsus"]:
    jobs.append((f"zvakiu-sildymo-lempa{ang}.png", f"zvakiu-sildymo-lempa-juodas{ang}-v3.png", lamp, SHADE))
    jobs.append((f"amzinoji-roze{ang}.png", f"amzinoji-roze-kremine{ang}-v3.png", rose, IVORY))
jobs += [
    ("silkas-miegas-sonas.png", "silkas-miegas-vyndaris-sonas-v3.png", silk, BURGUNDY),
    ("megzta-sildykle-sonas.png", "megzta-sildykle-vyndaris-sonas-v3.png", bottle, BURGUNDY),
    ("silkinis-uzvalkalas-sonas.png", "silkinis-uzvalkalas-vyndaris-sonas-v3.png", pillow_side, BURGUNDY),
    ("silkinis-uzvalkalas.png", "silkinis-uzvalkalas-vyndaris-v3.png", pillow_hero, BURGUNDY),
    ("termosas-kelionems-virsus.png", "termosas-kelionems-kreminis-virsus-v3.png", thermos, qa.CREAM),
    ("termosas-kelionems-virsus.png", "termosas-kelionems-zalias-virsus-v3.png", thermos, GREEN),
    ("pieno-plakiklis-virsus.png", "pieno-plakiklis-kreminis-virsus-v3.png", frother, HANDLE),
    ("raktu-pakabukas-egle.png", "raktu-pakabukas-egle-juodas-v3.png", strap, BLACK),
    ("raktu-pakabukas-egle-sonas.png", "raktu-pakabukas-egle-juodas-sonas-v3.png", strap, BLACK),
    ("gua-sha-rinkinys-sonas.png", "gua-sha-rinkinys-nefritas-sonas-v3.png", gua, JADE),
    ("gua-sha-rinkinys-virsus.png", "gua-sha-rinkinys-nefritas-virsus-v3.png", gua, JADE),
    ("lietaus-drekinuvas-sonas.png", "lietaus-drekinuvas-juodas-sonas-v3.png", rain, GRAPHITE),
    ("lietaus-drekinuvas-virsus.png", "lietaus-drekinuvas-juodas-virsus-v3.png", rain, GRAPHITE),
]
for ang in ["", "-sonas", "-virsus"]:
    jobs.append((f"keramikos-arbata{ang}.png", f"keramikos-arbata-vyndaris{ang}-v3.png", tea, BURGUNDY))
    jobs.append((f"keramikos-arbata{ang}.png", f"keramikos-arbata-pilkelis{ang}-v3.png", tea, GREY))
for ang in ["", "-sonas", "-nugara"]:
    jobs.append((f"galaktikos-projektorius{ang}.png", f"galaktikos-projektorius-kreminis{ang}-v3.png", galaxy, WARM))

for src, dst, fn, style in jobs:
    write_pair(src, dst, fn(src), style)
