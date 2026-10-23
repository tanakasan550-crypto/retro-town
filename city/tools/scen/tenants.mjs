import { startTrial } from './lib.mjs';
import fs from 'fs';
// オフィスビルの複数テナント: 建物 → 階 → 区画 → 入居企業 → 社員(人物ID) → 仕事。床面積の定員を超えない・社員が自分の会社の階の机にいる・
// 企業ごとの代表者(職位がいちばん上の社員)・求人に企業名・各階の中の作り。監査表 tenant_audit.csv を書く
export default async (p, shot) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, B = w.map.buildings, T = NLS.ten;
    for (let k = 0; k < 7 && [0, 6].includes(G.date().dow); k++) G.S.day = G.S.day % 27 + 1;
    G.S.min = 10 * 60 + 30;
    const offs = B.filter(b => T.isTenantOffice(b));
    const rows = [], over = [];
    const staffBy = new Map();
    for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.work[i] >= 0) { const t = T.bizOfPerson(w, i); if (t) (staffBy.get(t.id) || staffBy.set(t.id, []).get(t.id)).push(i); }
    let vac = 0;
    for (const b of offs) {
      const L = T.officeTenants(w, b), cap = T.floorCap(b), F = T.officeFloors(b);
      const sumStaff = L.reduce((a, t) => a + t.staff, 0);
      if (sumStaff > cap * F) over.push(b.id);
      for (const t of L) {
        if (t.vacant) vac++;
        const st = staffBy.get(t.id) || [];
        let rep = -1, rk = -1; for (const i of st) { const pr = w.prof && w.prof.get(i); const k = pr ? pr.rank || 0 : 0; if (k > rk) { rk = k; rep = i; } }
        rows.push({ bizId: t.id, building: b.id + ' ' + b.name, floor: t.lv + 1, kind: t.kindName, name: t.name, vacant: t.vacant ? 1 : 0, staffPlan: t.staff, employees: st.length, rep: rep >= 0 ? G.nameOf(rep) : '', since: t.from, floorM2: b.w * b.h * 4 });
      }
    }
    // 社員がいちばん多い会社の階を見る(平日10時)
    const best = rows.filter(x => !x.vacant).sort((a, c) => c.employees - a.employees)[0];
    const bIdx = +best.bizId.slice(1).split('-')[0], lv = +best.bizId.split('-')[1].slice(0, -1);
    const I = NLS.nav.interiorOf(G, bIdx, lv).I, ppl = NLS.C.indoor(bIdx, I, lv).filter(q => q.role === 'staff');
    const mine = ppl.filter(q => q.biz === best.bizId).length;
    const L2 = G.S.loc; L2.k = 'in'; L2.b = bIdx; L2.floor = lv; L2.x = I.W - 6.5; L2.y = I.H - 3.5;
    const vacs = G.vacanciesNear(200).filter(o => B[o.b].type === 'office').length;
    const kinds = {}; for (const x of rows) if (!x.vacant) kinds[x.kind] = (kinds[x.kind] || 0) + 1;
    return { buildings: offs.length, companies: rows.length, vacant: vac, over, kinds, best: { ...best, onFloor: ppl.length, mine }, emptyCos: rows.filter(x => !x.vacant && !x.employees).length, officeVacancies: vacs, rows, bIdx, lv, F: T.officeFloors(B[bIdx]) };
  });
  console.log('TEN', JSON.stringify({ ...r, rows: undefined }));
  if (process.env.OUT) { const keys = Object.keys(r.rows[0]); fs.writeFileSync(process.env.OUT + '/tenant_audit.csv', '﻿' + [keys.join(','), ...r.rows.map(x => keys.map(k => '"' + String(x[k] ?? '').replace(/"/g, '""') + '"').join(','))].join('\n')); }
  await p.waitForTimeout(2200); await shot('office_floor');
  await p.evaluate(([b]) => { const G = NLS.G, L = G.S.loc; L.k = 'in'; L.b = b; L.floor = 0; const I = NLS.nav.interiorOf(G, b, 0).I; L.x = (I.W >> 1) + 0.5; L.y = I.H - 2.5; G.S.min = 8 * 60 + 55; }, [r.bIdx]);
  await p.waitForTimeout(2200); await shot('office_lobby');
  if (r.over.length || r.best.mine < 1 || r.companies < r.buildings * 2) throw new Error('tenant system problem');
};
