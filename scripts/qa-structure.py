import cv2
import numpy as np
from pathlib import Path

ROOT = Path(r"D:\jaukumas\public\products")
OUT = Path(r"D:\jaukumas\.tmp-qa")
OUT.mkdir(exist_ok=True)

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


def thumb(img, w=280):
    h = int(img.shape[0] * w / img.shape[1])
    return cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)


rows = []
sheets = []
for a_name, b_name in pairs:
    a = cv2.imread(str(ROOT / a_name))
    b = cv2.imread(str(ROOT / b_name))
    if a is None or b is None:
        print("MISSING", a_name, b_name)
        continue
    same_size = a.shape == b.shape
    if not same_size:
        b = cv2.resize(b, (a.shape[1], a.shape[0]))
    mag = np.abs(a.astype(np.int16) - b.astype(np.int16)).max(axis=2)
    h, w = mag.shape
    m = max(8, int(min(h, w) * 0.06))
    border = np.zeros_like(mag, dtype=bool)
    border[:m, :] = True
    border[-m:, :] = True
    border[:, :m] = True
    border[:, -m:] = True
    ag = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY).astype(np.float32)
    bg = cv2.cvtColor(b, cv2.COLOR_BGR2GRAY).astype(np.float32)
    corr = float(np.corrcoef(ag.ravel(), bg.ravel())[0, 1])
    ident = float((mag < 4).mean())
    bleed = float((mag[border] > 12).mean())
    changed = float((mag > 12).mean())
    rows.append((bleed, 1 - corr, changed, ident, same_size, a.shape[1], a.shape[0], b_name))
    heat = cv2.applyColorMap(np.clip(mag, 0, 80).astype(np.uint8) * 3, cv2.COLORMAP_INFERNO)
    row = np.hstack([thumb(a), thumb(b), thumb(heat)])
    cv2.putText(row, b_name.replace("-v3.png", "")[:42], (8, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    sheets.append((bleed, 1 - corr, b_name, row))

rows.sort(reverse=True)
print("flag bleed  1-corr changed ident size file")
for bleed, ic, ch, ident, same, w, h, name in rows:
    flag = "LOOK" if bleed > 0.04 or ic > 0.05 or not same else "ok"
    size = "Y" if same else "N"
    print(f"{flag:4} {bleed:6.3f} {ic:7.3f} {ch:7.3f} {ident:6.3f} {size} {w}x{h}  {name}")

# contact of anything that looks off, plus a full grid of the worst 24
sheets.sort(key=lambda x: (x[0], x[1]), reverse=True)
bad = [s[3] for s in sheets if s[0] > 0.04 or s[1] > 0.05]
if bad:
    hmin = min(r.shape[0] for r in bad)
    bad = [cv2.resize(r, (int(r.shape[1] * hmin / r.shape[0]), hmin)) for r in bad]
    cv2.imwrite(str(OUT / "suspects.jpg"), np.vstack(bad), [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    print("suspects", len(bad))
