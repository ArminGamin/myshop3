import cv2
import numpy as np
from pathlib import Path

ROOT = Path(r"D:\jaukumas\public\products")
OUT = Path(r"D:\jaukumas\.tmp-qa")
OUT.mkdir(exist_ok=True)

groups = {
    "pledas": [
        ["pledas-jaukumas.png", "pledas-jaukumas-vyndaris-v3.png", "pledas-jaukumas-melynas-v3.png"],
        ["pledas-jaukumas-sonas.png", "pledas-jaukumas-vyndaris-sonas-v3.png", "pledas-jaukumas-melynas-sonas-v3.png"],
        ["pledas-jaukumas-virsus.png", "pledas-jaukumas-vyndaris-virsus-v3.png", "pledas-jaukumas-melynas-virsus-v3.png"],
    ],
    "silkas": [
        ["silkas-miegas.png", "silkas-miegas-vyndaris-v3.png"],
        ["silkas-miegas-sonas.png", "silkas-miegas-vyndaris-sonas-v3.png"],
        ["silkas-miegas-virsus.png", "silkas-miegas-vyndaris-virsus-v3.png"],
    ],
    "termosas": [
        ["termosas-kelionems.png", "termosas-kelionems-kreminis-v3.png", "termosas-kelionems-zalias-v3.png"],
        ["termosas-kelionems-sonas.png", "termosas-kelionems-kreminis-sonas-v3.png", "termosas-kelionems-zalias-sonas-v3.png"],
        ["termosas-kelionems-virsus.png", "termosas-kelionems-kreminis-virsus-v3.png", "termosas-kelionems-zalias-virsus-v3.png"],
    ],
    "projektorius": [
        ["namu-kino-projektorius-kreminis.png", "namu-kino-projektorius-grafitinis-v3.png"],
        ["namu-kino-projektorius-kreminis-sonas.png", "namu-kino-projektorius-grafitinis-sonas-v3.png"],
        ["namu-kino-projektorius-kreminis-nugara.png", "namu-kino-projektorius-grafitinis-nugara-v3.png"],
    ],
    "arbata": [
        ["keramikos-arbata.png", "keramikos-arbata-vyndaris-v3.png", "keramikos-arbata-pilkelis-v3.png"],
        ["keramikos-arbata-sonas.png", "keramikos-arbata-vyndaris-sonas-v3.png", "keramikos-arbata-pilkelis-sonas-v3.png"],
        ["keramikos-arbata-virsus.png", "keramikos-arbata-vyndaris-virsus-v3.png", "keramikos-arbata-pilkelis-virsus-v3.png"],
    ],
    "deklas": [
        ["odinis-deklas.png", "odinis-deklas-juodas-v3.png"],
        ["odinis-deklas-sonas.png", "odinis-deklas-juodas-sonas-v3.png"],
        ["odinis-deklas-nugara.png", "odinis-deklas-juodas-nugara-v3.png"],
    ],
    "lempa": [
        ["zvakiu-sildymo-lempa.png", "zvakiu-sildymo-lempa-juodas-v3.png"],
        ["zvakiu-sildymo-lempa-sonas.png", "zvakiu-sildymo-lempa-juodas-sonas-v3.png"],
        ["zvakiu-sildymo-lempa-virsus.png", "zvakiu-sildymo-lempa-juodas-virsus-v3.png"],
    ],
    "roze": [
        ["amzinoji-roze.png", "amzinoji-roze-kremine-v3.png", "amzinoji-roze-vysnine-v3.png"],
        ["amzinoji-roze-sonas.png", "amzinoji-roze-kremine-sonas-v3.png", "amzinoji-roze-vysnine-sonas-v3.png"],
        ["amzinoji-roze-virsus.png", "amzinoji-roze-kremine-virsus-v3.png", "amzinoji-roze-vysnine-virsus-v3.png"],
    ],
    "saule": [
        ["saulelydzio-lempa.png", "saulelydzio-lempa-juodas-v3.png"],
        ["saulelydzio-lempa-sonas.png", "saulelydzio-lempa-juodas-sonas-v3.png"],
        ["saulelydzio-lempa-nugara.png", "saulelydzio-lempa-juodas-nugara-v3.png"],
    ],
    "lietus": [
        ["lietaus-drekinuvas.png", "lietaus-drekinuvas-juodas-v3.png"],
        ["lietaus-drekinuvas-sonas.png", "lietaus-drekinuvas-juodas-sonas-v3.png"],
        ["lietaus-drekinuvas-virsus.png", "lietaus-drekinuvas-juodas-virsus-v3.png"],
    ],
    "sildykle": [
        ["megzta-sildykle.png", "megzta-sildykle-vyndaris-v3.png"],
        ["megzta-sildykle-sonas.png", "megzta-sildykle-vyndaris-sonas-v3.png"],
        ["megzta-sildykle-virsus.png", "megzta-sildykle-vyndaris-virsus-v3.png"],
    ],
    "galaktika": [
        ["galaktikos-projektorius.png", "galaktikos-projektorius-kreminis-v3.png"],
        ["galaktikos-projektorius-sonas.png", "galaktikos-projektorius-kreminis-sonas-v3.png"],
        ["galaktikos-projektorius-nugara.png", "galaktikos-projektorius-kreminis-nugara-v3.png"],
    ],
    "plakiklis": [
        ["pieno-plakiklis.png", "pieno-plakiklis-kreminis-v3.png"],
        ["pieno-plakiklis-sonas.png", "pieno-plakiklis-kreminis-sonas-v3.png"],
        ["pieno-plakiklis-virsus.png", "pieno-plakiklis-kreminis-virsus-v3.png"],
    ],
    "masazas": [
        ["masazo-pistoletas.png", "masazo-pistoletas-kreminis-v3.png"],
        ["masazo-pistoletas-sonas.png", "masazo-pistoletas-kreminis-sonas-v3.png"],
        ["masazo-pistoletas-nugara.png", "masazo-pistoletas-kreminis-nugara-v3.png"],
    ],
    "uzvalkalas": [
        ["silkinis-uzvalkalas.png", "silkinis-uzvalkalas-vyndaris-v3.png"],
        ["silkinis-uzvalkalas-sonas.png", "silkinis-uzvalkalas-vyndaris-sonas-v3.png"],
        ["silkinis-uzvalkalas-virsus.png", "silkinis-uzvalkalas-vyndaris-virsus-v3.png"],
    ],
    "guasha": [
        ["gua-sha-rinkinys.png", "gua-sha-rinkinys-nefritas-v3.png"],
        ["gua-sha-rinkinys-sonas.png", "gua-sha-rinkinys-nefritas-sonas-v3.png"],
        ["gua-sha-rinkinys-virsus.png", "gua-sha-rinkinys-nefritas-virsus-v3.png"],
    ],
    "kilimas": [
        ["kilimas-kaledu-grindys.png", "kilimas-kaledu-grindys-vyndaris-v3.png"],
        ["kilimas-kaledu-grindys-sonas.png", "kilimas-kaledu-grindys-vyndaris-sonas-v3.png"],
        ["kilimas-kaledu-grindys-virsus.png", "kilimas-kaledu-grindys-vyndaris-virsus-v3.png"],
    ],
    "raktai": [
        ["raktu-pakabukas-egle.png", "raktu-pakabukas-egle-juodas-v3.png"],
        ["raktu-pakabukas-egle-sonas.png", "raktu-pakabukas-egle-juodas-sonas-v3.png"],
        ["raktu-pakabukas-egle-nugara.png", "raktu-pakabukas-egle-juodas-nugara-v3.png"],
    ],
    "ausines": [
        ["ausines-kisenines.png", "ausines-kisenines-grafitas-v3.png"],
        ["ausines-kisenines-sonas.png", "ausines-kisenines-grafitas-sonas-v3.png"],
        ["ausines-kisenines-virsus.png", "ausines-kisenines-grafitas-virsus-v3.png"],
    ],
    "slepetes": [
        ["slepetes-minksta-peda.png", "slepetes-minksta-peda-vyndaris-v3.png"],
        ["slepetes-minksta-peda-sonas.png", "slepetes-minksta-peda-vyndaris-sonas-v3.png"],
        ["slepetes-minksta-peda-virsus.png", "slepetes-minksta-peda-vyndaris-virsus-v3.png"],
    ],
}


def fit(img, w=220):
    h = int(round(img.shape[0] * w / img.shape[1]))
    return cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)


for name, angles in groups.items():
    rows = []
    for files in angles:
        cells = []
        base = cv2.imread(str(ROOT / files[0]))
        for i, fn in enumerate(files):
            im = cv2.imread(str(ROOT / fn))
            cell = fit(im)
            if i:
                b = cv2.resize(base, (im.shape[1], im.shape[0]))
                mag = np.abs(b.astype(np.int16) - im.astype(np.int16)).max(axis=2)
                heat = cv2.applyColorMap(np.clip(mag * 3, 0, 255).astype(np.uint8), cv2.COLORMAP_INFERNO)
                cells.append(fit(heat, 120))
            cells.append(cell)
        h = max(c.shape[0] for c in cells)
        padded = []
        for c in cells:
            if c.shape[0] < h:
                pad = np.full((h - c.shape[0], c.shape[1], 3), 20, np.uint8)
                c = np.vstack([c, pad])
            padded.append(c)
        rows.append(np.hstack(padded))
    w = max(r.shape[1] for r in rows)
    stacked = []
    for r in rows:
        if r.shape[1] < w:
            pad = np.full((r.shape[0], w - r.shape[1], 3), 20, np.uint8)
            r = np.hstack([r, pad])
        stacked.append(r)
    sheet = np.vstack(stacked)
    cv2.imwrite(str(OUT / f"{name}.jpg"), sheet, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
    print(name, sheet.shape)
