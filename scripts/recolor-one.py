from rembg import remove
from PIL import Image
import numpy as np
import cv2

def cut_mask(path):
    im = Image.open(path).convert("RGBA")
    cut = remove(im)
    alpha = np.array(cut.split()[-1])
    bgr = cv2.cvtColor(np.array(im.convert("RGB")), cv2.COLOR_RGB2BGR)
    return bgr, alpha

def apply_hue(hsv, sel, hue, sat, value_scale, value_add=0):
    if not np.any(sel):
        return
    hsv[sel, 0] = hue
    hsv[sel, 1] = sat
    v = hsv[sel, 2].astype(np.int16)
    hsv[sel, 2] = np.clip(v * value_scale + value_add, 18, 245).astype(np.uint8)

def recolor(path, out, mode):
    bgr, alpha = cut_mask(path)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    body = alpha > 140
    if mode == "burgundy":
        apply_hue(hsv, body, 0, 150, 0.62, 0)
    elif mode == "blue":
        apply_hue(hsv, body, 105, 55, 0.92, 0)
    elif mode == "graphite":
        cable = (v > 200) & (s < 45)
        sel = body & ~cable
        apply_hue(hsv, sel, 0, 8, 0.28, 0)
    out_bgr = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    a = (alpha.astype(np.float32) / 255.0)[..., None]
    # Keep original pixels outside the product exactly.
    blended = out_bgr * a + bgr * (1 - a)
    # For graphite, cable was excluded from recolor but still inside alpha, so blend would mix.
    # Use a hard body mask for graphite cable exclusion by restoring those pixels.
    if mode == "graphite":
        cable = (v > 200) & (s < 45)
        blended[cable] = bgr[cable]
    cv2.imwrite(out, blended.astype(np.uint8))
    print(mode, int(body.sum()))

recolor(r"D:\jaukumas\public\products\pledas-jaukumas.png", r"D:\jaukumas\public\products\_qa-pledas-bordo.png", "burgundy")
recolor(r"D:\jaukumas\public\products\pledas-jaukumas.png", r"D:\jaukumas\public\products\_qa-pledas-blue.png", "blue")
recolor(r"D:\jaukumas\public\products\namu-kino-projektorius-kreminis-nugara.png", r"D:\jaukumas\public\products\_qa-proj.png", "graphite")
