from pathlib import Path
from PIL import Image

SRC = Path('../datasets/strava/screenshots')
DST = Path('../datasets/strava/processed')
DST.mkdir(parents=True, exist_ok=True)

for img_path in SRC.glob('*'):
    if img_path.suffix.lower() not in ['.jpg', '.jpeg', '.png', '.webp']:
        continue
    img = Image.open(img_path).convert('RGB')
    img.thumbnail((1280, 1280))
    out = DST / f'{img_path.stem}.jpg'
    img.save(out, quality=88)
    print('saved', out)
