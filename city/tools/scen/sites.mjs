import { startTrial } from './lib.mjs';
// 敷地の整備: 移設の結果と、学校・大学・動物園の敷地の撮影
export default async (p, shot) => {
  await startTrial(p);
  const rep = await p.evaluate(() => { const m = NLS.G.world.map, r = m.siteReport || []; const by = {}; for (const x of r) { const k = x.type + (x.moved ? ':moved' : ':stay'); by[k] = (by[k] || 0) + 1; } return { n: r.length, by, far: r.filter(x => x.moved).map(x => x.dist).sort((a, b) => b - a).slice(0, 5), stay: r.filter(x => !x.moved).map(x => x.name), annex: m.buildings.filter(b => b.type === 'annex').length, total: m.buildings.length, displaced: (m.siteMoved || []).length, dispFailed: (m.siteMoved || []).filter(x => x.failed).length, maxDist: Math.max(0, ...r.filter(x => x.moved).map(x => x.dist)), scale: r.filter(x => x.moved).reduce((o, x) => { const k = x.type + '@' + x.scale; o[k] = (o[k] || 0) + 1; return o; }, {}), m2: r.filter(x => x.moved).reduce((o, x) => { o[x.type] = Math.max(o[x.type] || 0, x.site[0] * x.site[1] * 4); return o; }, {}), siteErr: m.siteErr || null, genMs: NLS.G.world.map.siteMs || null }; });
  console.log('SITES', JSON.stringify(rep));
  await p.evaluate(() => NLS.audit.begin()); await p.waitForTimeout(1200);
  await p.addStyleTag({ content: '#auditBar,#toast{display:none!important}' });
  for (const t of ['elem', 'jh', 'hs', 'univ', 'kinder', 'zoo']) {
    const idx = await p.evaluate((t) => { const b = NLS.G.world.map.buildings.find(q => q.type === t); NLS.audit.view(b.idx, { mode: 'ext', hour: 13 }); return b.idx; }, t);
    await p.waitForTimeout(1500); await shot(t + '_site');
  }
};
