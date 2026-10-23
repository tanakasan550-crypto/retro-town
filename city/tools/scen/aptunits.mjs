import { startTrial } from './lib.mjs';
import fs from 'fs';
// 集合住宅の住戸の中(fac_house.js の buildUnitHome): アパート・団地・タワーのすべての住戸で、
// 住んでいる住戸は ①台所・冷蔵庫・食事・風呂・洗面・トイレ ②寝る場所が世帯の人数以上 ③入口から全部の設備へ歩ける、
// 空室は家具(寝る場所)なしで設備だけ。④住んでいる住戸の中(間取りと家具)が世帯ごとに違う(同じ建物の空室は同じ間取りでよい)
export default async (p, shot) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, B = w.map.buildings, U = NLS.units;
    const cs = B.filter(b => (b.type === 'apt' || b.type === 'tower') && b.status !== 'closed' && b.campusOf == null);
    const bad = { kit: [], sleep: [], reach: [], vacant: [], err: [] }, sigs = new Map(), m2 = {};
    let units = 0, lived = 0, shots = [];
    const t0 = performance.now();
    for (const b of cs) {
      let R; try { R = U.registry(G, b.idx); } catch (e) { bad.err.push(b.id + ':' + e.message); continue; }
      for (const u of R.units) {
        const code = U.unitCode(u.lv, u.pos);
        let I; try { I = NLS.nav.interiorOf(G, b.idx, code).I; } catch (e) { bad.err.push(b.id + ':' + u.room + ':' + e.message); continue; }
        if (!I.house) { bad.err.push(b.id + ':' + u.room + ':notfac'); continue; }
        units++;
        const acts = new Set(I.objs.map(o => o.act));
        for (const a of ['kitchen', 'fridge', 'bath', 'toilet', 'wash']) if (!acts.has(a)) { bad.kit.push(b.id + ':' + u.room + ':' + a); break; }
        const beds = I.objs.filter(o => o.act === 'sleep').reduce((a, o) => a + (o.w === 2 ? 2 : 1), 0);
        if (u.hh.length) { lived++; if (!acts.has('meal')) bad.kit.push(b.id + ':' + u.room + ':meal'); if (beds < u.hh.length) bad.sleep.push(`${b.id}:${u.room}:${beds}<${u.hh.length}`); }
        else if (beds) bad.vacant.push(b.id + ':' + u.room);
        const k = b.type + ':' + I.house.unit.m2; m2[b.type] = m2[b.type] || []; m2[b.type].push(I.house.unit.m2);
        const W = I.W, H = I.H, sol = new Uint8Array(W * H);
        for (const o of I.objs) if (o.solid) for (let yy = o.y; yy < o.y + (o.h || 1); yy++) for (let xx = o.x; xx < o.x + (o.w || 1); xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H) sol[xx + yy * W] = 1;
        for (let x = 0; x < W; x++) sol[x] = 1;
        const seen = new Uint8Array(W * H), q = [I.door.x + (I.door.y - 1) * W]; seen[q[0]] = 1;
        while (q.length) { const k2 = q.pop(), x = k2 % W, y = (k2 / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 1 || nx >= W || ny >= H) continue; const nk = nx + ny * W; if (seen[nk] || sol[nk]) continue; seen[nk] = 1; q.push(nk); } }
        const near = (o) => { for (let yy = o.y - 1; yy <= o.y + (o.h || 1); yy++) for (let xx = o.x - 1; xx <= o.x + (o.w || 1); xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H && seen[xx + yy * W]) return true; return false; };
        const un = I.objs.filter(o => o.act && !near(o));
        if (un.length) bad.reach.push(`${b.id}:${u.room}:${un.map(o => o.label || o.t).slice(0, 3).join('/')}`);
        const sig = I.objs.filter(o => !o.deco).map(o => o.t + o.x + ',' + o.y).sort().join(';');
        if (u.hh.length) sigs.set(sig, (sigs.get(sig) || 0) + 1);
        if (shots.length < 3 && u.hh.length >= 3 - shots.length && !shots.some(s => s[0] === b.type && s[3] === u.hh.length)) shots.push([b.type, b.idx, code, u.hh.length]);
      }
    }
    const avg = Object.fromEntries(Object.entries(m2).map(([k, L]) => [k, Math.round(L.reduce((a, c) => a + c, 0) / L.length)]));
    return { buildings: cs.length, units, lived, distinct: sigs.size, maxSame: Math.max(...sigs.values()), m2avg: avg, msPer: +((performance.now() - t0) / Math.max(1, units)).toFixed(2), shots, bad: Object.fromEntries(Object.entries(bad).map(([k, v]) => [k, { n: v.length, ex: v.slice(0, 6) }])) };
  });
  console.log('UNITS', JSON.stringify(r));
  for (const [t, b, code] of r.shots) {
    await p.evaluate(([b, code]) => { const G = NLS.G, L = G.S.loc; L.k = 'in'; L.b = b; L.floor = code; const I = NLS.nav.interiorOf(G, b, code).I; L.x = (I.W >> 1) + 0.5; L.y = Math.floor(I.H / 2) + 1.5; G.S.min = 19 * 60; }, [b, code]);
    await p.waitForTimeout(1500); await shot(`unit_${t}_${code}`);
  }
  if (process.env.OUT) fs.writeFileSync(process.env.OUT + '/aptunits.json', JSON.stringify(r, null, 1));
  const B = r.bad;
  if (B.kit.n || B.sleep.n || B.reach.n || B.vacant.n || B.err.n || r.distinct < r.lived * 0.3) throw new Error('apartment units not complete');
};
