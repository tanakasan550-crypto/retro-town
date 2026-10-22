import { startTrial } from './lib.mjs';
export default async (p) => {
  await startTrial(p);
  console.log(await p.evaluate(() => { const G = NLS.G, out = []; let n = 0, bad = 0;
    for (const b of G.world.map.buildings) { if (b.type !== 'apt' && b.type !== 'tower') continue; n++;
      const r = NLS.nav.registry(G, b.idx); const top = Math.max(0, ...r.units.filter(u => u.root >= 0).map(u => u.lv)); const nf = NLS.nav.storeys(b);
      if (top > nf - 1) { bad++; out.push(`${b.idx} ${b.type} ${b.name} nf=${nf} top=${top} hh=${r.households} per=${r.plan.perFloor} fp=${b.w}x${b.h}`); } }
    return n + ' condos, overflow ' + bad + '\n' + out.slice(0, 30).join('\n'); }));
};
