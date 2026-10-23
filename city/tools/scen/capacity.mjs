import { startTrial } from './lib.mjs';
import fs from 'fs';
// 収容の検査: 施設の種類ごとに、中の歩ける床の広さ(全階)と席の数を、実際に使う人数
// (働く人・在籍する生徒・住む人・同時にいる来客のいちばん多い時)と比べる。1マス=1㎡として数える
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, B = w.map.buildings, N = NLS.nav, V = NLS.vis;
    const work = new Map(), stu = new Map(), res = new Map();
    for (let i = 0; i < P.n; i++) if (!P.gone[i]) { if (P.work[i] >= 0) work.set(P.work[i], (work.get(P.work[i]) || 0) + 1); if (P.school[i] >= 0) stu.set(P.school[i], (stu.get(P.school[i]) || 0) + 1); if (P.home[i] >= 0) res.set(P.home[i], (res.get(P.home[i]) || 0) + 1); }
    const byType = new Map();
    for (const b of B) { if (b.tenant || b.type === 'annex' || !NLS.BTYPES[b.type] || !NLS.BTYPES[b.type].enter) continue; (byType.get(b.type) || byType.set(b.type, []).get(b.type)).push(b); }
    const rows = [];
    for (const [t, L] of byType) {
      const bt = NLS.BTYPES[t];
      if (bt.cat === 'res') continue;
      // 使う人の多い順に2件
      const occ = (b) => (work.get(b.idx) || 0) + (stu.get(b.idx) || 0);
      for (const b of L.slice().sort((a, c) => occ(c) - occ(a) || a.idx - c.idx).slice(0, 2)) {
        let area = 0, seats = 0, floors = 0, err = null;
        try {
          const lr = N.levelRange(b);
          for (let f = lr.lo; f <= lr.hi; f++) { const I = N.interiorOf(G, b.idx, f).I; const sol = N.interiorOf(G, b.idx, f).solid; floors++; for (let k = 0; k < I.W * I.H; k++) if (!sol[k]) area++; seats += (I.seatSpots || []).length; }
        } catch (e) { err = e.message.slice(0, 60); }
        // 同じ敷地の付属棟(体育館・特別教室棟など)の床も足す
        for (const a of B) if (a.type === 'annex' && (a.parentB === b.idx || a.campusOf === b.idx)) { try { const lr = N.levelRange(a); for (let f = lr.lo; f <= lr.hi; f++) { const I = N.interiorOf(G, a.idx, f).I, sol = N.interiorOf(G, a.idx, f).solid; for (let k = 0; k < I.W * I.H; k++) if (!sol[k]) area++; seats += (I.seatSpots || []).length; } } catch (e) { } }
        let vis = 0; const VP = NLS.vis && V.visitCount ? V : null;
        if (VP) for (let h = 6; h < 23; h++) vis = Math.max(vis, V.visitCount(b, h, true));
        const stay = (window.VISIT_STAY && window.VISIT_STAY[t]) || 60;
        const peak = Math.round(vis * stay / 60);
        const users = (work.get(b.idx) || 0) + (stu.get(b.idx) || 0) + peak;
        rows.push({ type: t, label: bt.label, id: b.id, name: b.name, fp: b.w + 'x' + b.h, floors, area, seats, workers: work.get(b.idx) || 0, students: stu.get(b.idx) || 0, peakVisitors: peak, m2PerUser: users ? +(area / users).toFixed(1) : null, err });
      }
    }
    return rows;
  });
  const bad = r.filter(x => x.err || x.m2PerUser != null && x.m2PerUser < 3 || x.students && x.seats < x.students * 0.5);
  console.log('CAP rows', r.length, 'tight', bad.length);
  for (const x of bad.slice(0, 40)) console.log('TIGHT', JSON.stringify(x));
  if (process.env.OUT) { const keys = Object.keys(r[0]); fs.writeFileSync(process.env.OUT + '/capacity.csv', [keys.join(','), ...r.map(x => keys.map(k => String(x[k] ?? '').replace(/,/g, '、')).join(','))].join('\n')); }
};
