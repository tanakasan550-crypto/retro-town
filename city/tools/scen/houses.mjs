import { startTrial } from './lib.mjs';
import fs from 'fs';
// 一戸建ての中の作り(fac_house.js): 街の住宅・農家・別荘をすべて作って、
// ①1階に台所・冷蔵庫・食事・風呂・洗面・トイレ(テレビは1955年以降)②寝る場所(ベッド・布団。ダブルベッドは2人)が住む人の数以上
// ③子どもがいれば勉強机 ④すべての設備に玄関から歩いて行ける(隣のマス)⑤間取りが家ごとに違う(同じ形の量産でない)⑥階段で全部の階がつながる
export default async (p, shot) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, B = w.map.buildings, M = w.M;
    const hs = B.filter(b => ['house', 'farmhouse', 'villa'].includes(b.type) && b.estate !== 2 && b.campusOf == null && b.status !== 'closed');
    const res = new Map(); for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.home[i] >= 0) { const L = res.get(P.home[i]) || []; L.push(i); res.set(P.home[i], L); }
    const sigs = new Map(), bad = { kit: [], sleep: [], study: [], reach: [], stairs: [], err: [] }, tiers = {}, eras = {};
    const t0 = performance.now();
    let n = 0;
    for (const b of hs) {
      let I0;
      try { I0 = NLS.nav.interiorOf(G, b.idx, 0).I; } catch (e) { bad.err.push(b.id + ':' + e.message); continue; }
      if (!I0.house) { bad.err.push(b.id + ':notfac'); continue; }
      n++;
      tiers[I0.house.tier] = (tiers[I0.house.tier] || 0) + 1; eras[I0.house.era] = (eras[I0.house.era] || 0) + 1;
      const F = I0.floors, objs = [];
      const fl = [I0]; for (let lv = 1; lv < F; lv++) fl.push(NLS.nav.interiorOf(G, b.idx, lv).I);
      for (const I of fl) objs.push(...I.objs);
      const acts = new Set(I0.objs.map(o => o.act));
      for (const a of ['kitchen', 'fridge', 'meal', 'bath', 'toilet', 'wash']) if (!acts.has(a)) { bad.kit.push(b.id + ':' + a); break; }
      if (G.year() >= 1955 && !objs.some(o => o.act === 'tv')) bad.kit.push(b.id + ':tv');
      const ppl = res.get(b.idx) || [];
      const beds = objs.filter(o => o.act === 'sleep').reduce((a, o) => a + (o.w === 2 ? 2 : 1), 0);
      if (ppl.length && beds < ppl.length) bad.sleep.push(`${b.id}:${beds}<${ppl.length}`);
      if (ppl.some(i => { const a = (M - P.born[i]) / 12; return a >= 6 && a < 18; }) && !objs.some(o => o.act === 'study')) bad.study.push(b.id);
      // 歩いて行けるか(各階: 扉または階段から)
      for (const I of fl) {
        const W = I.W, H = I.H, sol = new Uint8Array(W * H);
        for (const o of I.objs) if (o.solid) for (let yy = o.y; yy < o.y + (o.h || 1); yy++) for (let xx = o.x; xx < o.x + (o.w || 1); xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H) sol[xx + yy * W] = 1;
        for (let x = 0; x < W; x++) sol[x] = 1;
        const seen = new Uint8Array(W * H), q = [];
        const st = I.door && I.door.x >= 0 ? [I.door.x, I.door.y - 1] : I.stairs && I.stairs[0] ? [I.stairs[0].x, I.stairs[0].y] : null;
        if (!st) { bad.reach.push(b.id + ':nostart'); continue; }
        q.push(st[0] + st[1] * W); seen[q[0]] = 1;
        while (q.length) { const k = q.pop(), x = k % W, y = (k / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 1 || nx >= W || ny >= H) continue; const nk = nx + ny * W; if (seen[nk] || sol[nk]) continue; seen[nk] = 1; q.push(nk); } }
        const near = (o) => { for (let yy = o.y - 1; yy <= o.y + (o.h || 1); yy++) for (let xx = o.x - 1; xx <= o.x + (o.w || 1); xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H && seen[xx + yy * W]) return true; return false; };
        const un = I.objs.filter(o => o.act && !near(o));
        if (un.length) bad.reach.push(`${b.id}:${I.floor}:${un.map(o => o.label || o.t).slice(0, 3).join('/')}`);
        if (F > 1 && !(I.stairs || []).length) bad.stairs.push(b.id + ':' + I.floor);
      }
      const sig = fl.map(I => I.objs.filter(o => !o.deco).map(o => o.t + o.x + ',' + o.y).sort().join(';')).join('|');
      sigs.set(sig, (sigs.get(sig) || 0) + 1);
    }
    const ms = performance.now() - t0;
    // 撮影する代表(小・中・大、年代、農家、別荘、町家/茅葺き)
    const pick = (f) => { const b = hs.find(b => { try { return f(b, NLS.nav.interiorOf(G, b.idx, 0).I); } catch (e) { return false; } }); return b ? b.idx : -1; };
    const shots = [
      ['small_showa', pick((b, I) => I.house.tier === 0 && I.house.era === 0 && b.type === 'house')],
      ['mid_heisei_1F', pick((b, I) => I.house.tier === 1 && I.house.era === 1 && b.type === 'house' && I.floors > 1)],
      ['large_modern', pick((b, I) => I.house.era === 2 && b.type === 'house') ],
      ['farmhouse', pick((b, I) => b.type === 'farmhouse')],
      ['villa', pick((b, I) => b.type === 'villa')],
      ['machiya_or_kaya', pick((b, I) => b.wa === 'machiya' || b.wa === 'kaya')],
      ['big_family', pick((b, I) => I.house.n >= 6)]
    ].filter(x => x[1] >= 0);
    const maxSame = Math.max(...sigs.values());
    return { shots, houses: hs.length, built: n, distinct: sigs.size, maxSame, tiers, eras, msPer: +(ms / Math.max(1, n)).toFixed(1), bad: Object.fromEntries(Object.entries(bad).map(([k, v]) => [k, { n: v.length, ex: v.slice(0, 6) }])) };
  });
  console.log('HOUSES', JSON.stringify(r));
  if (process.env.OUT) fs.writeFileSync(process.env.OUT + '/houses.json', JSON.stringify(r, null, 1));
  for (const [nm, b] of r.shots) for (const lv of [0, 1]) {
    const ok = await p.evaluate(([b, lv]) => { const G = NLS.G, I0 = NLS.nav.interiorOf(G, b, 0).I; if (lv >= I0.floors) return false; const L = G.S.loc; L.k = 'in'; L.b = b; L.floor = lv; const I = NLS.nav.interiorOf(G, b, lv).I; L.x = (I.W >> 1) + 0.5; L.y = Math.floor(I.H / 2) + 0.5; G.S.min = 19 * 60; return true; }, [b, lv]);
    if (ok) { await p.waitForTimeout(1500); await shot(`house_${nm}_${lv + 1}F`); }
  }
  const B = r.bad;
  if (r.built < r.houses * 0.98 || B.kit.n || B.sleep.n || B.study.n || B.reach.n || B.stairs.n || B.err.n || r.distinct < r.built * 0.5) throw new Error('house interiors not complete');
};
