import { startTrial } from './lib.mjs';
import fs from 'fs';
// 小学校・中学校の敷地を、在籍者の数から国の設置基準(小学校設置基準・中学校設置基準)で求める広さと比べる(1マス=2m×2m=4㎡)。
// 運動場: 240人以下 2,400㎡、241〜720人 2,400+10×(人数−240)㎡、721人以上 7,200㎡(小中とも)。
// 校舎の床面積: 小学校 40人以下 500㎡、41〜480人 500+5×(人数−40)㎡、481人以上 2,700+3×(人数−480)㎡ /
//               中学校 40人以下 600㎡、41〜480人 600+6×(人数−40)㎡、481人以上 3,240+4×(人数−480)㎡
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, m = w.map, P = w.pop, B = m.buildings;
    const stu = new Map(); for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.school[i] >= 0) stu.set(P.school[i], (stu.get(P.school[i]) || 0) + 1);
    const ground = (n) => n <= 240 ? 2400 : n <= 720 ? 2400 + 10 * (n - 240) : 7200;
    const floorReq = (t, n) => t === 'elem' ? (n <= 40 ? 500 : n <= 480 ? 500 + 5 * (n - 40) : 2700 + 3 * (n - 480)) : (n <= 40 ? 600 : n <= 480 ? 600 + 6 * (n - 40) : 3240 + 4 * (n - 480));
    const rows = [];
    for (const b of B) {
      if (!['elem', 'jh'].includes(b.type) || b.status === 'closed' || b.campusOf != null) continue;
      const s = b.siteI != null ? m.fsites[b.siteI] : null, n = stu.get(b.idx) || 0;
      const site = s ? s.w * s.h * 4 : b.w * b.h * 4;
      const yard = s ? s.ground.filter(g => ['yard', 'field', 'court'].includes(g[0])).reduce((a, g) => a + g[3] * g[4] * 4, 0) : 0;
      let fl = b.w * b.h * 4 * Math.max(1, b.nf || b.floors || 1);
      for (const a of B) if (a.type === 'annex' && (a.parentB === b.idx || a.campusOf === b.idx)) fl += a.w * a.h * 4 * Math.max(1, a.nf || a.floors || 1);
      rows.push({ id: b.id, type: b.type, name: b.name, students: n, siteM2: site, groundM2: yard, groundReq: ground(n), floorM2: fl, floorReq: floorReq(b.type, n), hasSite: !!s, groundOK: yard >= ground(n), floorOK: fl >= floorReq(b.type, n) });
    }
    return rows;
  });
  const sum = (t) => { const L = r.filter(x => x.type === t), med = (k) => L.map(x => x[k]).sort((a, c) => a - c)[L.length >> 1]; return { n: L.length, siteMed: med('siteM2'), groundMed: med('groundM2'), studentsMed: med('students'), groundNG: L.filter(x => !x.groundOK).map(x => `${x.id}:${x.students}人:${x.groundM2}<${x.groundReq}`), floorNG: L.filter(x => !x.floorOK).map(x => `${x.id}:${x.floorM2}<${x.floorReq}`), noSite: L.filter(x => !x.hasSite).length }; };
  const out = { elem: sum('elem'), jh: sum('jh') };
  console.log('SCHOOLLAND', JSON.stringify(out));
  if (process.env.OUT) { const keys = Object.keys(r[0]); fs.writeFileSync(process.env.OUT + '/school_land.csv', '﻿' + [keys.join(','), ...r.map(x => keys.map(k => '"' + String(x[k] ?? '') + '"').join(','))].join('\n')); }
  if (out.elem.groundNG.length || out.elem.floorNG.length || out.jh.groundNG.length || out.jh.floorNG.length) throw new Error('school land below the national standard');
};
