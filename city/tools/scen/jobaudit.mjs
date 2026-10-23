import { startTrial } from './lib.mjs';
import fs from 'fs';
// 職業と職場の全数監査: 職業(JOBS+JOBS_EXT)ごとに、職の枠を持つ施設の種類(BTYPES.slots)・街にある件数(テナントを含む)・
// 職の枠の数・雇われているNPC・平日10時に「仕事中」の人の割合・主人公が応募できる空き枠・資格/学歴/経験/給料。
// 事業カタログ(INDUSTRIES)は実在の職場と数えない(主人公の起業の選択肢)
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, B = w.map.buildings, BT = NLS.BTYPES, J = NLS.JOBS, IDS = Object.keys(J);
    for (let k = 0; k < 7 && [0, 6].includes(G.date().dow); k++) G.S.day = G.S.day % 27 + 1;
    G.S.min = 10 * 60 + 30;
    // 職場の種類は実際の職の枠(world.slots)から(BTYPES.slots に無い拡張職もここに出る)
    const typesOf = {}, bOf = {}; for (let s = 0; s < w.slots.b.length; s++) { const j = IDS[w.slots.job[s]], b = B[w.slots.b[s]]; (typesOf[j] = typesOf[j] || new Set()).add(b.type); (bOf[j] = bOf[j] || new Set()).add(b.idx); }
    const nB = {}, nTen = {}; for (const b of B) { if (b.status === 'closed') continue; nB[b.type] = (nB[b.type] || 0) + 1; if (b.tenant != null && b.tenant !== false) nTen[b.type] = (nTen[b.type] || 0) + 1; }
    const slots = {}, filled = {}, vac = {};
    for (let s = 0; s < w.slots.b.length; s++) { const j = IDS[w.slots.job[s]]; slots[j] = (slots[j] || 0) + 1; if (w.slots.who[s] >= 0) filled[j] = (filled[j] || 0) + 1; }
    for (const s of w.vacant) { const j = IDS[w.slots.job[s]]; vac[j] = (vac[j] || 0) + 1; }
    const emp = {}, sample = {};
    for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.work[i] >= 0 && P.job[i] < 255) { const j = IDS[P.job[i]]; emp[j] = (emp[j] || 0) + 1; const L = sample[j] = sample[j] || []; if (L.length < 12) L.push(i); }
    const rows = IDS.map(j => {
      const d = J[j], ts = [...(typesOf[j] || [])];
      const bs = [...(bOf[j] || [])].map(i => B[i]).filter(b => b.status !== 'closed'), nb = bs.length, nt = bs.filter(b => b.tenant != null && b.tenant !== false).length;
      let working = 0, n = 0; const now = [];
      for (const i of sample[j] || []) { try { const st = NLS.nav.npcStatus(i).now; n++; if (/仕事中|授業中|勤務|運転|診察|乗務|作業/.test(st)) working++; if (now.length < 2) now.push(st.slice(0, 18)); } catch (e) { } }
      const sz = bs.map(b => b.w * b.h * 4);
      sz.sort((a, c) => a - c);
      return { job: j, name: d.name, wage: d.wage || 0, minAge: d.minAge || '', edu: d.edu || '', lic: d.lic || d.qual || '', exp: d.exp ? (d.exp.jobs || []).join('/') + ':' + d.exp.months : '', skill: d.skill || '', types: ts.join('/'), buildings: nb, tenants: nt, slots: slots[j] || 0, filled: filled[j] || 0, employed: emp[j] || 0, workingAt10: n ? Math.round(working / n * 100) : null, nowEx: now.join(' | '), vacant: vac[j] || 0, m2Median: sz.length ? sz[sz.length >> 1] : 0 };
    });
    const ind = (window.INDUSTRIES_LIST || []).length;
    return { rows, keys: [...new Set(IDS.flatMap(j => Object.keys(J[j])))], ind };
  });
  const noPlace = r.rows.filter(x => !x.buildings), noEmp = r.rows.filter(x => x.buildings && !x.employed);
  console.log('JOBS', r.rows.length, 'noWorkplace', noPlace.length, 'noEmployee', noEmp.length, 'keys', r.keys.join(','));
  console.log('NOPLACE', noPlace.map(x => x.job + ':' + x.name).join(' '));
  console.log('NOEMP', noEmp.map(x => x.job + ':' + x.name + '(' + x.types + ' ' + x.buildings + ')').join(' '));
  const keys = Object.keys(r.rows[0]);
  if (process.env.OUT) fs.writeFileSync(process.env.OUT + '/job_audit.csv', '﻿' + [keys.join(','), ...r.rows.map(x => keys.map(k => '"' + String(x[k] ?? '').replace(/"/g, '""') + '"').join(','))].join('\n'));
};
