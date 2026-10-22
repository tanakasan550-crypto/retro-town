#!/usr/bin/env python3
"""Build the single-file HTML (images/sound/program inlined) from city/src.
usage: python3 city/tools/build.py [out.html]"""
import os, sys
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, '..', 'src')
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, '..', 'dist', 'index.html')
rd = lambda p: open(os.path.join(src, p), encoding='utf-8').read()
order = [l.strip() for l in rd('modules/ORDER.txt').split('\n') if l.strip() and not l.startswith('#')]
js = ''.join(rd('modules/' + f) for f in order)
html = rd('head.html') + rd('assets.js') + js + rd('tail.html')
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(html)
print('built', out, len(html.encode('utf-8')), 'bytes,', len(order), 'modules')
