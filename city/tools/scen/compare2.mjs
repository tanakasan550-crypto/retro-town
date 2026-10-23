import { startTrial } from './lib.mjs';
import fs from 'fs';
// 改築前後の同縮尺比較(第2版): 前回の画像監査で不合格だった施設と、作り直した大きな施設・公共施設。
// 改築後の版で建物IDを選び(IDS_OUT に書く)、改築前の版(HTML=元の v11 など)では同じ建物IDを同じ拡大率・同じ時刻で撮る(IDS_IN)。
// 外観(ext)と、中の作りを作り直した施設は1階の中(int)も撮る
const PICK = [['zoo', 'ext'], ['aquarium', 'ext'], ['aquarium', 'int'], ['onsenbath', 'ext'], ['onsenbath', 'int'], ['sento', 'int'], ['tourtower', 'ext'], ['ctower', 'ext'], ['stadium', 'ext'], ['stadium', 'ext2'], ['themepark', 'ext'], ['themepark', 'ext2'], ['zoo', 'ext2'], ['univ', 'ext'], ['hs', 'ext'], ['hs', 'int1'], ['elem', 'ext'], ['police', 'ext'], ['police', 'int'], ['fire', 'int'], ['cityhall', 'ext'], ['cityhall', 'int'], ['court', 'int'], ['nursing', 'int1'], ['factory', 'ext']];
const ZL = +(process.env.ZL || -2);
export default async (p, shot) => {
  await startTrial(p);
  let ids = process.env.IDS_IN ? JSON.parse(fs.readFileSync(process.env.IDS_IN, 'utf8')) : null;
  if (!ids) ids = await p.evaluate((PICK) => {
    const m = NLS.G.world.map, B = m.buildings, I = m.island;
    const onIsl = (b) => I && b.doorY >= I.y;
    return PICK.map(([t, mode]) => { const L = B.filter(q => q.type === t && !q.tenant && q.campusOf == null); const b = L.find(q => q.siteI != null && (onIsl(q) || !['zoo', 'aquarium', 'stadium', 'themepark', 'univ', 'factory'].includes(t))) || L[0]; return b ? { t, mode, id: b.id } : null; }).filter(Boolean);
  }, PICK);
  if (process.env.IDS_OUT) fs.writeFileSync(process.env.IDS_OUT, JSON.stringify(ids));
  const rows = [];
  for (const q of ids) {
    const r = await p.evaluate(([q, ZL]) => {
      const G = NLS.G, m = G.world.map, b = m.buildings.find(x => x.id === q.id);
      if (!b) return { ...q, missing: true };
      const s = b.siteI != null && m.fsites ? m.fsites[b.siteI] : (b.site != null && m.sites && m.sites[b.site]) || null;
      const L = G.S.loc; G.S.min = 11 * 60;
      if (q.mode === 'ext2') { L.k = 'out'; delete L.b; delete L.floor; if (s) { L.x = s.x + s.w / 2; L.y = s.y + s.h * 0.45; } else { L.x = b.doorX + 0.5; L.y = b.doorY - 6; } }
      else if (q.mode === 'ext') { L.k = 'out'; delete L.b; delete L.floor; const tower = ['tourtower', 'ctower'].includes(b.type); if (s && !tower) { L.x = s.x + s.w / 2; L.y = s.y + s.h - Math.min(14, s.h * 0.25); } else { L.x = b.doorX + 0.5; L.y = b.doorY + 6.5; } }
      else { const f = q.mode === 'int1' ? 1 : 0; L.k = 'in'; L.b = b.idx; L.floor = f; let I = null; try { I = NLS.nav.interiorOf(G, b.idx, f).I; } catch (e) { } L.x = I ? (I.W >> 1) + 0.5 : 5.5; L.y = I ? I.H - 4.5 : 5.5; }
      try { NLS.R.zlMin = Math.min(-4, ZL); NLS.R.zl = q.mode.startsWith('ext') ? (s && s.w * s.h * 4 > 3e4 ? ZL - 2 : ZL) : 0; NLS.R.resize(); } catch (e) { }
      NLS.U.cwAt = -999;
      return { ...q, idx: b.idx, name: b.name, type: b.type, fp: [b.w, b.h], site: s ? [s.w, s.h] : null, m2: s ? s.w * s.h * 4 : b.w * b.h * 4 };
    }, [q, ZL]);
    rows.push(r);
    if (r.missing) continue;
    await p.waitForTimeout(1800);
    await shot(q.t + '_' + q.mode + '_' + q.id);
  }
  console.log('COMPARE', JSON.stringify(rows));
};
