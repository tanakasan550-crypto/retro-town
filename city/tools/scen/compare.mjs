import { startTrial } from './lib.mjs';
// 改築前後の同縮尺比較: 同じ建物ID・同じ拡大率(ZL)・同じ時刻で外観を撮る。HTML=改築前の単体HTML で同じ試験を回す
const TYPES = ['zoo', 'univ', 'hs', 'jh', 'elem', 'kinder', 'special'];
const ZL = +(process.env.ZL || -1);
export default async (p, shot) => {
  await startTrial(p);
  await p.evaluate(() => NLS.audit.begin());
  const rows = [];
  for (const t of TYPES) {
    const r = await p.evaluate(([t, ZL]) => {
      const G = NLS.G, m = G.world.map, b = m.buildings.find(q => q.type === t);
      if (!b) return null;
      NLS.audit.view(b.idx, { mode: 'ext', hour: 11 });
      const s = b.siteI != null && m.fsites ? m.fsites[b.siteI] : (b.site != null && m.sites && m.sites[b.site]) || null;
      const L = G.S.loc; if (s) { L.x = s.x + s.w / 2; L.y = s.y + s.h / 2; } else { L.x = b.x + b.w / 2; L.y = b.y + b.h / 2; }
      NLS.R.zlMin = Math.min(-4, ZL); NLS.R.zl = ZL; NLS.R.resize(); NLS.U.cwAt = -999;
      return { t, id: b.id, idx: b.idx, name: b.name, bld: [b.x, b.y, b.w, b.h], site: s ? [s.x, s.y, s.w, s.h] : null, m2: s ? s.w * s.h * 4 : b.w * b.h * 4 };
    }, [t, ZL]);
    if (!r) continue;
    rows.push(r);
    await p.waitForTimeout(1500);
    r.S = await p.evaluate(() => [NLS.R.S, NLS.R.zl, NLS.R.baseS]);
    await shot(t + '_' + r.id);
  }
  console.log('COMPARE', JSON.stringify(rows));
};
