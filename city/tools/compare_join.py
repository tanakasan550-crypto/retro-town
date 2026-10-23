#!/usr/bin/env python3
"""改築前後の同縮尺比較画像を作る。
使い方: compare.mjs を改築前(HTML=旧単体HTML)と改築後で回し、そのログと画像の場所を渡す。
  python3 tools/compare_join.py <before_dir> <before_log> <after_dir> <after_log> <out_dir>
"""
import glob, json, os, re, sys
from PIL import Image, ImageDraw, ImageFont

bd, bl, ad, al, out_dir = sys.argv[1:6]
rows = lambda p: {r['id']: r for r in json.loads(re.search(r'COMPARE (.*)', open(p).read()).group(1))}
B, A = rows(bl), rows(al)
fs = glob.glob('/usr/share/fonts/**/wqy-zenhei.ttc', recursive=True) + glob.glob('/usr/share/fonts/**/*CJK*', recursive=True)
font = ImageFont.truetype(fs[0], 36) if fs else ImageFont.load_default()
os.makedirs(out_dir, exist_ok=True)
for f in sorted(os.listdir(ad)):
    id_ = f.rsplit('_', 1)[-1][:-4]
    ra, rb = A[id_], B[id_]
    i1, i2 = Image.open(os.path.join(bd, f)).convert('RGB'), Image.open(os.path.join(ad, f)).convert('RGB')
    w = 1200; h = int(i1.height * w / i1.width)
    img = Image.new('RGB', (w * 2 + 20, h + 70), 'white')
    img.paste(i1.resize((w, h)), (0, 70)); img.paste(i2.resize((w, h)), (w + 20, 70))
    d = ImageDraw.Draw(img)
    d.text((10, 12), f"改築前 {rb['name']} ({rb['id']}) 敷地 {rb['m2']:,}㎡", fill='black', font=font)
    d.text((w + 30, 12), f"改築後 敷地 {ra['m2']:,}㎡ (×{ra['m2'] / rb['m2']:.1f})  同じ拡大率", fill='black', font=font)
    img.save(os.path.join(out_dir, f[:-4] + '.jpg'), quality=80)
    print(f, rb['m2'], ra['m2'], round(ra['m2'] / rb['m2'], 2))
