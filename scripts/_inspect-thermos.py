import cv2
from pathlib import Path

PREV = Path(r"D:\jaukumas\.tmp-qa\fixpreview")
ROOT = Path(r"D:\jaukumas\public\products")

for name in [
    "termosas-kelionems-zalias-virsus-v3.jpg",
    "termosas-kelionems-kreminis-virsus-v3.jpg",
    "termosas-kelionems-zalias-sonas-v3.jpg",
    "termosas-kelionems-kreminis-sonas-v3.jpg",
    "termosas-kelionems-zalias-v3.jpg",
    "termosas-kelionems-kreminis-v3.jpg",
    "termosas-kelionems-enhanced.jpg",
]:
    im = cv2.imread(str(PREV / name))
    h, w = im.shape[:2]
    third = w // 3
    mid = im[:, third : 2 * third]
    right = im[:, 2 * third :]
    cv2.imwrite(str(PREV / f"_mid-{name}"), mid, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    cv2.imwrite(str(PREV / f"_mask-{name}"), right, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    print(name, im.shape)

for n in [
    "termosas-kelionems-zalias-virsus-v3.png",
    "termosas-kelionems-kreminis-virsus-v3.png",
    "termosas-kelionems-virsus.png",
    "termosas-kelionems.png",
    "termosas-kelionems-zalias-v3.png",
    "termosas-kelionems-kreminis-v3.png",
    "termosas-kelionems-zalias-sonas-v3.png",
    "termosas-kelionems-kreminis-sonas-v3.png",
]:
    im = cv2.imread(str(ROOT / n))
    if "virsus" in n:
        crop = im[340:780, 380:780]
    elif "sonas" in n:
        crop = im[80:900, 250:720]
    else:
        crop = im[150:900, 300:720]
    out = PREV / f"_prod-{n.replace('.png', '.jpg')}"
    cv2.imwrite(str(out), crop, [int(cv2.IMWRITE_JPEG_QUALITY), 93])
    print("wrote", out.name)
