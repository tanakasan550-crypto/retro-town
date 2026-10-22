// TYPES=station,hospital node tools/shot.mjs tools/scen/tour.mjs  — 各施設の外観と各階を撮影
import { startTrial } from './lib.mjs';
export default async (p, shot) => {
  await startTrial(p, { scenario: process.env.SCEN || '喧嘩番長人生' });
  const types = (process.env.TYPES || 'station').split(',');
  for (const t of types) {
    const info = await p.evaluate((t) => { const G = NLS.G, b = G.world.map.buildings.find(b => b.type === t && b.parent === undefined); if (!b) return null;
      const L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; delete L.tr; L.x = b.doorX + 0.5; L.y = b.doorY + 3.5; L.f = 'u'; NLS.U.cwAt = -999;
      const r = NLS.nav.levelRange ? NLS.nav.levelRange(b) : null; return { idx: b.idx, name: b.name, w: b.w, h: b.h, floors: b.floors, r }; }, t);
    if (!info) { console.log('none', t); continue; }
    console.log(t, JSON.stringify(info));
    await p.waitForTimeout(1200); await shot(`${t}_out`);
    const fl = await p.evaluate((i) => { const G = NLS.G, L = G.S.loc; L.k = 'in'; L.b = i; L.floor = 0; const I = NLS.nav.interiorOf(G, i, 0).I; L.x = I.door.x + 0.5; L.y = I.H - 1.6; L.f = 'u'; NLS.U.cwAt = -999;
      const fl = new Set([0]); const q = [0]; for (let k = 0; k < q.length && k < 12; k++) { for (const o of NLS.nav.interiorOf(G, i, q[k]).I.objs) if (o.act === 'stairs' && o.to != null && !fl.has(o.to) && o.to < 1000) { fl.add(o.to); q.push(o.to); } }
      return [...fl].sort((a, b) => a - b); }, info.idx);
    for (const f of fl.slice(0, +(process.env.MAXF || 4))) {
      const d = await p.evaluate(([i, f]) => { const G = NLS.G, L = G.S.loc; L.floor = f; const I = NLS.nav.interiorOf(G, i, f).I; L.x = Math.min(I.W - 2, I.W / 2); L.y = I.H - 2.5; NLS.U.cwAt = -999;
        const acts = {}; for (const o of I.objs) if (o.act) acts[o.act] = (acts[o.act] || 0) + 1; return { W: I.W, H: I.H, n: I.objs.length, acts }; }, [info.idx, f]);
      console.log('  floor', f, JSON.stringify(d));
      await p.waitForTimeout(900); await shot(`${t}_f${f}`);
    }
  }
};
