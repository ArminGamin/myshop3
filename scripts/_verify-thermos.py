import cv2
import numpy as np
from pathlib import Path

ROOT = Path(r"D:\jaukumas\public\products")
PREV = Path(r"D:\jaukumas\.tmp-qa\fixpreview")


def check(ang, cup_slice, bottle_slice, linen_slice, tag):
    base = cv2.imread(str(ROOT / f"termosas-kelionems{ang}.png")).astype(np.float32)
    for col in ["kreminis", "zalias"]:
        v = cv2.imread(str(ROOT / f"termosas-kelionems-{col}{ang}-v3.png")).astype(np.float32)
        d = np.abs(v - base).mean(axis=2)

        def md(sl):
            y0, y1, x0, x1 = sl
            return float(d[y0:y1, x0:x1].mean())

        mask = (d > 8).astype(np.uint8) * 255
        cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        c = max(cnts, key=cv2.contourArea) if cnts else None
        verts = (
            len(cv2.approxPolyDP(c, 0.01 * cv2.arcLength(c, True), True)) if c is not None else 0
        )
        area = int(cv2.contourArea(c)) if c is not None else 0
        print(
            f"{col}{ang}: cup={md(cup_slice):.2f} bottle={md(bottle_slice):.2f} "
            f"linen={md(linen_slice):.2f} area={area} verts={verts} chg={int((d > 8).sum())}"
        )
        vis = base.astype(np.uint8).copy()
        vis[mask > 0] = (vis[mask > 0] * 0.4 + np.array([40, 40, 220]) * 0.6).astype(np.uint8)
        out = PREV / f"_verify-{col}-{tag}-mask.jpg"
        cv2.imwrite(
            str(out),
            cv2.resize(vis, (512, int(512 * vis.shape[0] / vis.shape[1]))),
        )


check("-sonas", (400, 650, 650, 900), (200, 800, 350, 580), (50, 150, 50, 200), "sonas")
check("", (900, 1200, 150, 400), (300, 1000, 400, 650), (50, 200, 50, 200), "hero")

old = cv2.imread(r"D:\jaukumas\.tmp-qa\termosas-kelionems-old-base.png")
new = cv2.imread(str(ROOT / "termosas-kelionems.png"))
roi_o = old[300:1000, 400:650]
roi_n = new[300:1000, 400:650]
print("hero old V mean/std", cv2.cvtColor(roi_o, cv2.COLOR_BGR2HSV)[:, :, 2].mean(), cv2.cvtColor(roi_o, cv2.COLOR_BGR2GRAY).std())
print("hero new V mean/std", cv2.cvtColor(roi_n, cv2.COLOR_BGR2HSV)[:, :, 2].mean(), cv2.cvtColor(roi_n, cv2.COLOR_BGR2GRAY).std())

# spill check: any paint on cup for sonas/hero?
for ang, tag, cup in [
    ("-sonas", "sonas", (450, 620, 680, 860)),
    ("", "hero", (950, 1150, 180, 380)),
]:
    base = cv2.imread(str(ROOT / f"termosas-kelionems{ang}.png"))
    for col in ["kreminis", "zalias"]:
        v = cv2.imread(str(ROOT / f"termosas-kelionems-{col}{ang}-v3.png"))
        y0, y1, x0, x1 = cup
        diff = np.abs(v[y0:y1, x0:x1].astype(np.float32) - base[y0:y1, x0:x1].astype(np.float32)).mean()
        print(f"cup-spill {col} {tag}: {diff:.3f}")
