import cv2
import numpy as np
from pathlib import Path

ROOT = Path(r"D:\jaukumas\public\products")
pairs = [
    ("pledas-jaukumas.png", "pledas-jaukumas-vyndaris-v3.png"),
    ("pledas-jaukumas-sonas.png", "pledas-jaukumas-vyndaris-sonas-v3.png"),
    ("pledas-jaukumas-virsus.png", "pledas-jaukumas-vyndaris-virsus-v3.png"),
    ("silkas-miegas.png", "silkas-miegas-vyndaris-v3.png"),
    ("silkas-miegas-sonas.png", "silkas-miegas-vyndaris-sonas-v3.png"),
    ("silkas-miegas-virsus.png", "silkas-miegas-vyndaris-virsus-v3.png"),
    ("termosas-kelionems.png", "termosas-kelionems-kreminis-v3.png"),
    ("termosas-kelionems-sonas.png", "termosas-kelionems-kreminis-sonas-v3.png"),
    ("namu-kino-projektorius-kreminis.png", "namu-kino-projektorius-grafitinis-v3.png"),
    ("namu-kino-projektorius-kreminis-nugara.png", "namu-kino-projektorius-grafitinis-nugara-v3.png"),
    ("keramikos-arbata.png", "keramikos-arbata-vyndaris-v3.png"),
    ("odinis-deklas.png", "odinis-deklas-juodas-v3.png"),
    ("zvakiu-sildymo-lempa.png", "zvakiu-sildymo-lempa-juodas-v3.png"),
    ("amzinoji-roze.png", "amzinoji-roze-kremine-v3.png"),
    ("amzinoji-roze.png", "amzinoji-roze-vysnine-v3.png"),
    ("saulelydzio-lempa.png", "saulelydzio-lempa-juodas-v3.png"),
    ("lietaus-drekinuvas.png", "lietaus-drekinuvas-juodas-v3.png"),
    ("megzta-sildykle.png", "megzta-sildykle-vyndaris-v3.png"),
    ("galaktikos-projektorius.png", "galaktikos-projektorius-kreminis-v3.png"),
    ("pieno-plakiklis.png", "pieno-plakiklis-kreminis-v3.png"),
    ("masazo-pistoletas.png", "masazo-pistoletas-kreminis-v3.png"),
    ("silkinis-uzvalkalas.png", "silkinis-uzvalkalas-vyndaris-v3.png"),
    ("silkinis-uzvalkalas-sonas.png", "silkinis-uzvalkalas-vyndaris-sonas-v3.png"),
    ("silkinis-uzvalkalas-virsus.png", "silkinis-uzvalkalas-vyndaris-virsus-v3.png"),
    ("gua-sha-rinkinys.png", "gua-sha-rinkinys-nefritas-v3.png"),
    ("kilimas-kaledu-grindys.png", "kilimas-kaledu-grindys-vyndaris-v3.png"),
    ("raktu-pakabukas-egle.png", "raktu-pakabukas-egle-juodas-v3.png"),
    ("ausines-kisenines.png", "ausines-kisenines-grafitas-v3.png"),
    ("slepetes-minksta-peda.png", "slepetes-minksta-peda-vyndaris-v3.png"),
]
rows = []
for a_name, b_name in pairs:
    a = cv2.imread(str(ROOT / a_name))
    b = cv2.imread(str(ROOT / b_name))
    b = cv2.resize(b, (a.shape[1], a.shape[0]))
    diff = np.any(np.abs(a.astype(np.int16) - b.astype(np.int16)) > 18, axis=2)
    h, w = diff.shape
    border = np.zeros_like(diff)
    m = int(min(h, w) * 0.08)
    border[:m, :] = True
    border[-m:, :] = True
    border[:, :m] = True
    border[:, -m:] = True
    bleed = float(diff[border].mean())
    changed = float(diff.mean())
    rows.append((bleed, changed, b_name))
rows.sort(reverse=True)
for bleed, changed, name in rows:
    flag = "BLEED" if bleed > 0.02 else "ok"
    print(f"{flag:5} bleed {bleed:5.3f} changed {changed:5.3f}  {name}")
