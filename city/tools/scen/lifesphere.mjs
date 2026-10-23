import { startTrial } from './lib.mjs';
import fs from 'fs';
// 遠くへ移した建物(siteMoved で 100マス=約200m 以上)の生活圏: 移す前と後で、住む人の通勤・通学の距離、
// いちばん近い小学校・スーパー/コンビニ・駅・バス停までの距離を比べる(1マス=2m・道のりではなく縦横の距離)。
// 小学生の通学が 2km を超える子・通勤が 2倍以上かつ 3km 以上のびた人を数え、監査表 docs/relocate_far.csv を書く
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, m = w.map, P = w.pop, B = m.buildings, M = w.M;
    const byId = new Map(B.map(b => [b.id, b]));
    const far = (m.siteMoved || []).filter(x => x.to && Math.abs(x.to[0] - x.from[0]) + Math.abs(x.to[1] - x.from[1]) >= 100);
    const KM = 2 / 1000;
    const of = (types) => B.filter(b => types.includes(b.type) && b.status !== 'closed');
    const ELEM = of(['elem']), SHOP = of(['super', 'konbini', 'shop', 'mall', 'greengrocer']), STA = of(['station']);
    let stops = []; try { stops = (NLS.bus.busNet(m) || {}).stops || []; } catch (e) { }
    const near = (L, x, y) => { let d = 1e9; for (const b of L) d = Math.min(d, Math.abs(b.doorX - x) + Math.abs(b.doorY - y)); return d; };
    const nearS = (x, y) => { let d = 1e9; for (const s of stops) d = Math.min(d, Math.abs(s.x - x) + Math.abs(s.y - y)); return d; };
    const res = new Map(); for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.home[i] >= 0) { const L = res.get(P.home[i]) || []; L.push(i); res.set(P.home[i], L); }
    const rows = []; let kids = 0, kidFar = 0, kidFar0 = 0, wk = 0, wkWorse = 0, shopWorse = 0, staWorse = 0;
    for (const x of far) {
      const b = byId.get(x.id); if (!b) continue;
      // 入口の位置は移す前と同じ向き(建物の左上からのずれ)で
      const ox = b.doorX - b.x, oy = b.doorY - b.y, fx = x.from[0] + ox, fy = x.from[1] + oy, tx = b.doorX, ty = b.doorY;
      const ppl = res.get(b.idx) || [];
      let kN = 0, kF = 0, kF0 = 0, cN = 0, cW = 0, dW0 = 0, dW1 = 0;
      for (const i of ppl) {
        const age = Math.floor((M - P.born[i]) / 12);
        if (P.school[i] >= 0 && age >= 6 && age <= 12) {
          const s = B[P.school[i]], d0 = Math.abs(s.doorX - fx) + Math.abs(s.doorY - fy), d1 = Math.abs(s.doorX - tx) + Math.abs(s.doorY - ty);
          kN++; if (d1 * KM > 2) kF++; if (d0 * KM > 2) kF0++;
        }
        if (P.work[i] >= 0) {
          const s = B[P.work[i]], d0 = Math.abs(s.doorX - fx) + Math.abs(s.doorY - fy), d1 = Math.abs(s.doorX - tx) + Math.abs(s.doorY - ty);
          cN++; dW0 += d0; dW1 += d1; if (d1 > d0 * 2 && (d1 - d0) * KM > 3) cW++;
        }
      }
      const e0 = near(ELEM, fx, fy), e1 = near(ELEM, tx, ty), s0 = near(SHOP, fx, fy), s1 = near(SHOP, tx, ty), t0 = near(STA, fx, fy), t1 = near(STA, tx, ty), b0 = nearS(fx, fy), b1 = nearS(tx, ty);
      kids += kN; kidFar += kF; kidFar0 += kF0; wk += cN; wkWorse += cW; if (s1 * KM > 1 && s1 > s0 * 2) shopWorse++; if (Math.min(t1, b1) * KM > 1 && Math.min(t1, b1) > Math.min(t0, b0) * 2) staWorse++;
      rows.push({ id: b.id, type: b.type, name: b.name, moveM: Math.round((Math.abs(x.to[0] - x.from[0]) + Math.abs(x.to[1] - x.from[1])) * 2), residents: ppl.length, elemKids: kN, elemOver2km: kF, elemOver2kmBefore: kF0, workers: cN, commuteKmBefore: cN ? +(dW0 / cN * KM).toFixed(2) : '', commuteKmAfter: cN ? +(dW1 / cN * KM).toFixed(2) : '', commuteMuchWorse: cW, nearElemKm: `${(e0 * KM).toFixed(2)}→${(e1 * KM).toFixed(2)}`, nearShopKm: `${(s0 * KM).toFixed(2)}→${(s1 * KM).toFixed(2)}`, nearStationOrBusKm: `${(Math.min(t0, b0) * KM).toFixed(2)}→${(Math.min(t1, b1) * KM).toFixed(2)}` });
    }
    const types = {}; for (const x of rows) types[x.type] = (types[x.type] || 0) + 1;
    return { far: far.length, rows, types, kids, kidFar, kidFar0, wk, wkWorse, shopWorse, staWorse, stops: stops.length };
  });
  const { rows, ...sum } = r;
  console.log('LIFESPHERE', JSON.stringify(sum));
  console.log('WORST', JSON.stringify(rows.filter(x => x.elemOver2km || x.commuteMuchWorse).slice(0, 8)));
  if (!r.stops || r.wkWorse || r.shopWorse || r.staWorse || r.kidFar > Math.max(2, r.kids * 0.03)) throw new Error('relocated homes lost their life sphere');
  if (process.env.OUT) { const keys = Object.keys(rows[0]); fs.writeFileSync(process.env.OUT + '/relocate_far.csv', '﻿' + [keys.join(','), ...rows.map(x => keys.map(k => '"' + String(x[k] ?? '').replace(/"/g, '""') + '"').join(','))].join('\n')); }
};
