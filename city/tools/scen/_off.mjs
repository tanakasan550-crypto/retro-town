import { startTrial } from './lib.mjs';
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, B = w.map.buildings, out = {};
    for (const t of ['office', 'tower', 'shop', 'bank', 'lawfirm', 'agency', 'media', 'cram', 'cardealer', 'usedcar', 'farmcoop', 'construction']) {
      const L = B.filter(b => b.type === t);
      const fl = {}, fp = [];
      for (const b of L) { const f = b.nf || b.floors || 1; fl[f] = (fl[f] || 0) + 1; fp.push(b.w * b.h); }
      fp.sort((a, c) => a - c);
      out[t] = { n: L.length, ten: L.filter(b => b.tenant != null).length, util: L.filter(b => b.util).length, salon: L.filter(b => b.salon).length, floors: fl, fpMed: fp[fp.length >> 1], fpMax: fp[fp.length - 1], zones: [...new Set(L.map(b => b.zone))].slice(0, 8).join('/') };
    }
    const types = Object.keys(NLS.BTYPES).join(',');
    return { out, types, year: G.date().y };
  });
  console.log(JSON.stringify(r, null, 0));
};
