#!/usr/bin/env python3
"""監査画像のコンタクトシート(縮小一覧)を作る。カテゴリごとに1枚(多ければ分割)。
使い方: python3 tools/contact_sheet.py <監査の出力先(img/ がある所)> <出力先>"""
import glob, os, sys
from PIL import Image, ImageDraw, ImageFont
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
fs = glob.glob('/usr/share/fonts/**/wqy-zenhei.ttc', recursive=True)
font = ImageFont.truetype(fs[0], 13) if fs else ImageFont.load_default()
TW, TH, COLS, PER = 300, 135, 6, 60
for cat in sorted(os.listdir(os.path.join(src, 'img'))):
    files = sorted(glob.glob(os.path.join(src, 'img', cat, '*.jpg')))
    for part in range(0, len(files), PER):
        chunk = files[part:part + PER]
        rows = (len(chunk) + COLS - 1) // COLS
        sheet = Image.new('RGB', (COLS * TW, rows * (TH + 18)), 'white')
        d = ImageDraw.Draw(sheet)
        for i, f in enumerate(chunk):
            im = Image.open(f).convert('RGB'); im.thumbnail((TW, TH))
            x, y = (i % COLS) * TW, (i // COLS) * (TH + 18)
            sheet.paste(im, (x, y))
            d.text((x + 2, y + TH + 1), os.path.basename(f)[:-4][:40], fill='black', font=font)
        name = f'{cat}_{part // PER + 1}.jpg'
        sheet.save(os.path.join(out, name), quality=62)
        print(name, len(chunk))
