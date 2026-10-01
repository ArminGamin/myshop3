import cv2
import numpy as np
from pathlib import Path

ROOT = Path(r"D:\jaukumas\public\products")

pairs = [
    ("pledas-jaukumas.png", "pledas-jaukumas-vyndaris-v3.png"),
    ("pledas-jaukumas-sonas.png", "pledas-jaukumas-vyndaris-sonas-v3.png"),
    ("pledas-jaukumas-virsus.png", "pledas-jaukumas-vyndaris-virsus-v3.png"),
    ("pledas-jaukumas.png", "pledas-jaukumas-melynas-v3.png"),
    ("pledas-jaukumas-sonas.png", "pledas-jaukumas-melynas-sonas-v3.png"),
    ("pledas-jaukumas-virsus.png", "pledas-jaukumas-melynas-virsus-v3.png"),
    ("silkas-miegas.png", "silkas-miegas-vyndaris-v3.png"),
    ("silkas-miegas-sonas.png", "silkas-miegas-vyndaris-sonas-v3.png"),
    ("silkas-miegas-virsus.png", "silkas-miegas-vyndaris-virsus-v3.png"),
    ("termosas-kelionems.png", "termosas-kelionems-kreminis-v3.png"),
    ("termosas-kelionems-sonas.png", "termosas-kelionems-kreminis-sonas-v3.png"),
    ("termosas-kelionems-virsus.png", "termosas-kelionems-kreminis-virsus-v3.png"),
    ("termosas-kelionems.png", "termosas-kelionems-zalias-v3.png"),
    ("termosas-kelionems-sonas.png", "termosas-kelionems-zalias-sonas-v3.png"),
    ("termosas-kelionems-virsus.png", "termosas-kelionems-zalias-virsus-v3.png"),
    ("namu-kino-projektorius-kreminis.png", "namu-kino-projektorius-grafitinis-v3.png"),
    ("namu-kino-projektorius-kreminis-sonas.png", "namu-kino-projektorius-grafitinis-sonas-v3.png"),
    ("namu-kino-projektorius-kreminis-nugara.png", "namu-kino-projektorius-grafitinis-nugara-v3.png"),
    ("keramikos-arbata.png", "keramikos-arbata-vyndaris-v3.png"),
    ("keramikos-arbata-sonas.png", "keramikos-arbata-vyndaris-sonas-v3.png"),
    ("keramikos-arbata-virsus.png", "keramikos-arbata-vyndaris-virsus-v3.png"),
    ("keramikos-arbata.png", "keramikos-arbata-pilkelis-v3.png"),
    ("keramikos-arbata-sonas.png", "keramikos-arbata-pilkelis-sonas-v3.png"),
    ("keramikos-arbata-virsus.png", "keramikos-arbata-pilkelis-virsus-v3.png"),
    ("odinis-deklas.png", "odinis-deklas-juodas-v3.png"),
    ("odinis-deklas-sonas.png", "odinis-deklas-juodas-sonas-v3.png"),
    ("odinis-deklas-nugara.png", "odinis-deklas-juodas-nugara-v3.png"),
    ("zvakiu-sildymo-lempa.png", "zvakiu-sildymo-lempa-juodas-v3.png"),
    ("zvakiu-sildymo-lempa-sonas.png", "zvakiu-sildymo-lempa-juodas-sonas-v3.png"),
    ("zvakiu-sildymo-lempa-virsus.png", "zvakiu-sildymo-lempa-juodas-virsus-v3.png"),
    ("amzinoji-roze.png", "amzinoji-roze-kremine-v3.png"),
    ("amzinoji-roze-sonas.png", "amzinoji-roze-kremine-sonas-v3.png"),
    ("amzinoji-roze-virsus.png", "amzinoji-roze-kremine-virsus-v3.png"),
    ("amzinoji-roze.png", "amzinoji-roze-vysnine-v3.png"),
    ("amzinoji-roze-sonas.png", "amzinoji-roze-vysnine-sonas-v3.png"),
    ("amzinoji-roze-virsus.png", "amzinoji-roze-vysnine-virsus-v3.png"),
    ("saulelydzio-lempa.png", "saulelydzio-lempa-juodas-v3.png"),
    ("saulelydzio-lempa-sonas.png", "saulelydzio-lempa-juodas-sonas-v3.png"),
    ("saulelydzio-lempa-nugara.png", "saulelydzio-lempa-juodas-nugara-v3.png"),
    ("lietaus-drekinuvas.png", "lietaus-drekinuvas-juodas-v3.png"),
    ("lietaus-drekinuvas-sonas.png", "lietaus-drekinuvas-juodas-sonas-v3.png"),
    ("lietaus-drekinuvas-virsus.png", "lietaus-drekinuvas-juodas-virsus-v3.png"),
    ("megzta-sildykle.png", "megzta-sildykle-vyndaris-v3.png"),
    ("megzta-sildykle-sonas.png", "megzta-sildykle-vyndaris-sonas-v3.png"),
    ("megzta-sildykle-virsus.png", "megzta-sildykle-vyndaris-virsus-v3.png"),
    ("galaktikos-projektorius.png", "galaktikos-projektorius-kreminis-v3.png"),
    ("galaktikos-projektorius-sonas.png", "galaktikos-projektorius-kreminis-sonas-v3.png"),
    ("galaktikos-projektorius-nugara.png", "galaktikos-projektorius-kreminis-nugara-v3.png"),
    ("pieno-plakiklis.png", "pieno-plakiklis-kreminis-v3.png"),
    ("pieno-plakiklis-sonas.png", "pieno-plakiklis-kreminis-sonas-v3.png"),
    ("pieno-plakiklis-virsus.png", "pieno-plakiklis-kreminis-virsus-v3.png"),
    ("masazo-pistoletas.png", "masazo-pistoletas-kreminis-v3.png"),
    ("masazo-pistoletas-sonas.png", "masazo-pistoletas-kreminis-sonas-v3.png"),
    ("masazo-pistoletas-nugara.png", "masazo-pistoletas-kreminis-nugara-v3.png"),
    ("silkinis-uzvalkalas.png", "silkinis-uzvalkalas-vyndaris-v3.png"),
    ("silkinis-uzvalkalas-sonas.png", "silkinis-uzvalkalas-vyndaris-sonas-v3.png"),
    ("silkinis-uzvalkalas-virsus.png", "silkinis-uzvalkalas-vyndaris-virsus-v3.png"),
    ("gua-sha-rinkinys.png", "gua-sha-rinkinys-nefritas-v3.png"),
    ("gua-sha-rinkinys-sonas.png", "gua-sha-rinkinys-nefritas-sonas-v3.png"),
    ("gua-sha-rinkinys-virsus.png", "gua-sha-rinkinys-nefritas-virsus-v3.png"),
    ("kilimas-kaledu-grindys.png", "kilimas-kaledu-grindys-vyndaris-v3.png"),
    ("kilimas-kaledu-grindys-sonas.png", "kilimas-kaledu-grindys-vyndaris-sonas-v3.png"),
    ("kilimas-kaledu-grindys-virsus.png", "kilimas-kaledu-grindys-vyndaris-virsus-v3.png"),
    ("raktu-pakabukas-egle.png", "raktu-pakabukas-egle-juodas-v3.png"),
    ("raktu-pakabukas-egle-sonas.png", "raktu-pakabukas-egle-juodas-sonas-v3.png"),
    ("raktu-pakabukas-egle-nugara.png", "raktu-pakabukas-egle-juodas-nugara-v3.png"),
    ("ausines-kisenines.png", "ausines-kisenines-grafitas-v3.png"),
    ("ausines-kisenines-sonas.png", "ausines-kisenines-grafitas-sonas-v3.png"),
    ("ausines-kisenines-virsus.png", "ausines-kisenines-grafitas-virsus-v3.png"),
    ("slepetes-minksta-peda.png", "slepetes-minksta-peda-vyndaris-v3.png"),
    ("slepetes-minksta-peda-sonas.png", "slepetes-minksta-peda-vyndaris-sonas-v3.png"),
    ("slepetes-minksta-peda-virsus.png", "slepetes-minksta-peda-vyndaris-virsus-v3.png"),
]

orb = cv2.ORB_create(1500)
rows = []
for a_name, b_name in pairs:
    a = cv2.imread(str(ROOT / a_name), cv2.IMREAD_GRAYSCALE)
    b = cv2.imread(str(ROOT / b_name), cv2.IMREAD_GRAYSCALE)
    if a.shape != b.shape:
        b = cv2.resize(b, (a.shape[1], a.shape[0]))
    ka, da = orb.detectAndCompute(a, None)
    kb, db = orb.detectAndCompute(b, None)
    if da is None or db is None:
        print("NOFEAT", b_name)
        continue
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(da, db)
    matches = sorted(matches, key=lambda m: m.distance)[:400]
    if len(matches) < 12:
        print(f"FEW {len(matches):4} {b_name}")
        continue
    src = np.float32([ka[m.queryIdx].pt for m in matches])
    dst = np.float32([kb[m.trainIdx].pt for m in matches])
    shift = np.linalg.norm(src - dst, axis=1)
    close = float((shift < 3).mean())
    med = float(np.median(shift))
    # neutral background identity
    ac = cv2.imread(str(ROOT / a_name))
    bc = cv2.imread(str(ROOT / b_name))
    if ac.shape != bc.shape:
        bc = cv2.resize(bc, (ac.shape[1], ac.shape[0]))
    ha = cv2.cvtColor(ac, cv2.COLOR_BGR2HSV)
    hb = cv2.cvtColor(bc, cv2.COLOR_BGR2HSV)
    neutral = (ha[:, :, 1] < 28) & (hb[:, :, 1] < 28) & (ha[:, :, 2] > 50) & (hb[:, :, 2] > 50)
    mag = np.abs(ac.astype(np.int16) - bc.astype(np.int16)).max(axis=2)
    if neutral.sum() > 500:
        nd = float((mag[neutral] > 14).mean())
        nfrac = float(neutral.mean())
    else:
        nd = -1
        nfrac = float(neutral.mean())
    rows.append((close, med, nd, nfrac, b_name))

rows.sort()
print("flag close medshift neutrDiff nfrac file")
for close, med, nd, nfrac, name in rows:
    flag = "LOOK" if close < 0.85 or (nd > 0.08 and nfrac > 0.05) else "ok"
    print(f"{flag:4} {close:5.2f} {med:7.2f} {nd:8.3f} {nfrac:5.2f}  {name}")
