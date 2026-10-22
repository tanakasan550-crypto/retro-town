# One-time: split the bundled single HTML into editable source parts.
import re, sys, os
src = sys.argv[1]; out = sys.argv[2]
L = open(src, encoding='utf-8').read().split('\n')
# locate main script: line starting with "<script>(() => {" and its closing </script>
start = next(i for i,l in enumerate(L) if l.startswith('<script>(() => {'))
end = next(i for i in range(start, len(L)) if L[i] == '</script>')
assets = next(i for i,l in enumerate(L) if l.startswith('<script>(function(){var A='))
os.makedirs(out+'/modules', exist_ok=True)
open(out+'/head.html','w',encoding='utf-8').write('\n'.join(L[:assets])+'\n')
open(out+'/assets.js','w',encoding='utf-8').write('\n'.join(L[assets:start])+'\n')
open(out+'/tail.html','w',encoding='utf-8').write('\n'.join(L[end:]))
body = L[start:end]
# split at "  // src/xxx.js" markers
idx = [i for i,l in enumerate(body) if re.match(r'^  // src/[\w/.-]+\.js$', l)]
parts = [('000_prelude.js', body[:idx[0]])]
for n,(a,b) in enumerate(zip(idx, idx[1:]+[len(body)])):
    name = re.match(r'^  // src/([\w/.-]+)\.js$', body[a]).group(1).replace('/','_')
    parts.append(('%03d_%s.js' % (n+1, name), body[a:b]))
order = []
for fn, lines in parts:
    open(out+'/modules/'+fn,'w',encoding='utf-8').write('\n'.join(lines)+'\n')
    order.append(fn)
open(out+'/modules/ORDER.txt','w').write('\n'.join(order)+'\n')
print(len(parts), 'modules')
