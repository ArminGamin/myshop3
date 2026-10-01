from PIL import Image
import numpy as np
from rembg import new_session, remove
import cv2

session = new_session()
for name in [
    "zvakiu-sildymo-lempa.png",
    "silkas-miegas-sonas.png",
    "silkinis-uzvalkalas-sonas.png",
]:
    im = Image.open(rf"D:\jaukumas\public\products\{name}").convert("RGBA")
    cut = remove(im, session=session)
    alpha = np.array(cut.split()[-1])
    Image.fromarray(alpha).save(rf"D:\jaukumas\public\products\_mask-{name}")
    print(name, alpha.shape, int((alpha > 80).sum()))
