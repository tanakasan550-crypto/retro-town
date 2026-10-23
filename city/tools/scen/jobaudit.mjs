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
    // 重点分野(指示の分野名)
    const SECT = { 農林水産: 'farmer fisher forester', 建設: 'carpenter builder heavy foreman civil roadworker trafficguide', 運送: 'logistics truckdriver courier forklift logmgr sailor railstaff', 製造: 'factory inspector prodmgr plantmgr craftsman', 清掃: 'cleaner garbage janitor sewer', 造園: 'gardener', 電力: 'powerstaff electrician elecmaint', 水道: 'waterstaff waterworker plumber', 金融: 'banker', 保険: 'insurance', 不動産: 'realtor', 家庭教師: 'tutor', 医療: 'doctor nurse pharmacist', 福祉: 'caregiver childcare', 理美容: 'hairdresser', メディア: 'reporter announcer designer', 自動車整備: 'mechanic', 専門職: 'lawyer judge accountant architect itengineer' };
    const SEC = (j) => Object.keys(SECT).find(k => SECT[k].split(' ').includes(j)) || '';
    // その職の資格を持つ人の数・その職を夢にしている人の数(今)
    const HOLD = {}, DRM = {};
    for (const j of IDS) { const JJ = J[j]; if (!(JJ.qual || JJ.lic)) continue; let n = 0; for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.home[i] >= 0 && NLS.dr.holdsFor(w, i, JJ)) n++; HOLD[j] = n; }
    for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.dr1[i] !== 255) { const D = NLS.dr.DREAMS[P.dr1[i]]; for (const j of D.jobs || []) DRM[j] = (DRM[j] || 0) + 1; }
    const rows = IDS.map(j => {
      const d = J[j], ts = [...(typesOf[j] || [])];
      const bs = [...(bOf[j] || [])].map(i => B[i]).filter(b => b.status !== 'closed'), nb = bs.length, nt = bs.filter(b => b.tenant != null && b.tenant !== false).length;
      let working = 0, n = 0; const now = [];
      for (const i of sample[j] || []) { try { const st = NLS.nav.npcStatus(i).now; n++; if (/仕事中|授業中|勤務|運転|診察|乗務|作業/.test(st)) working++; if (now.length < 2) now.push(st.slice(0, 18)); } catch (e) { } }
      const sz = bs.map(b => b.w * b.h * 4);
      sz.sort((a, c) => a - c);
      return { job: j, name: d.name, wage: d.wage || 0, minAge: d.minAge || '', edu: d.edu || '', lic: d.lic || d.qual || '', exp: d.exp ? (d.exp.jobs || []).join('/') + ':' + d.exp.months : '', skill: d.skill || '', types: ts.join('/'), buildings: nb, tenants: nt, slots: slots[j] || 0, filled: filled[j] || 0, employed: emp[j] || 0, workingAt10: n ? Math.round(working / n * 100) : null, nowEx: now.join(' | '), vacant: vac[j] || 0, m2Median: sz.length ? sz[sz.length >> 1] : 0, fromY: d.fromY || '', dreams: (NLS.dr.DREAMS.filter(x => x.jobs && x.jobs.includes(j)).map(x => x.n)).join('/'), route: (() => { const k = d.qual || d.lic; if (!k) return ''; const rk = Object.keys(NLS.dr.QROUTE).find(q => (NLS.dr.QROUTE[q].q || NLS.dr.QROUTE[q].l) === k); return rk ? NLS.dr.QROUTE[rk].school + '→' + NLS.dr.QROUTE[rk].exam : k === 'driver' ? '自動車教習所→運転免許' : k; })(), holdersNow: HOLD[j] || 0, dreamersNow: DRM[j] || 0, sector: SEC(j), task: (NLS.wt.WORK_TASKS[j] || []).join('/'), heroEvent: (NLS.wt.FLAVOR[j] || []).length };
    });
    const ind = (window.INDUSTRIES_LIST || []).length;
    return { rows, keys: [...new Set(IDS.flatMap(j => Object.keys(J[j])))], ind };
  });
  const noPlace = r.rows.filter(x => !x.buildings), noEmp = r.rows.filter(x => x.buildings && !x.employed);
  console.log('JOBS', r.rows.length, 'noWorkplace', noPlace.length, 'noEmployee', noEmp.length, 'keys', r.keys.join(','));
  console.log('NOPLACE', noPlace.map(x => x.job + ':' + x.name).join(' '));
  console.log('NOEMP', noEmp.map(x => x.job + ':' + x.name + '(' + x.types + ' ' + x.buildings + ')').join(' '));
  const noTask = r.rows.filter(x => !x.task), noEv = r.rows.filter(x => !x.heroEvent);
  console.log('NOTASK', noTask.map(x => x.job).join(' '), 'NOHEROEVENT', noEv.map(x => x.job).join(' '));
  const keys = Object.keys(r.rows[0]);
  if (process.env.OUT) fs.writeFileSync(process.env.OUT + '/job_audit.csv', '﻿' + [keys.join(','), ...r.rows.map(x => keys.map(k => '"' + String(x[k] ?? '').replace(/"/g, '""') + '"').join(','))].join('\n'));
  // 職場の無い職・働く人のいない職・作業の無い職があれば失敗
  if (noPlace.length || noEmp.length || noTask.length) throw new Error('job coverage gap');
};
