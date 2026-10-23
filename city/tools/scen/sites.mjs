import { startTrial } from './lib.mjs';
// 敷地の整備: 移設の結果と、学校・大学・動物園の敷地の撮影
export default async (p, shot) => {
  await startTrial(p);
  const rep = await p.evaluate(() => { const m = NLS.G.world.map, r = m.siteReport || []; const by = {}; for (const x of r) { const k = x.type + (x.moved ? ':moved' : ':stay'); by[k] = (by[k] || 0) + 1; } return { n: r.length, by, far: r.filter(x => x.moved).map(x => x.dist).sort((a, b) => b - a).slice(0, 5), stay: r.filter(x => !x.moved).map(x => x.name), annex: m.buildings.filter(b => b.type === 'annex').length, total: m.buildings.length, displaced: (m.siteMoved || []).length, dispFailed: (m.siteMoved || []).filter(x => x.failed).length, maxDist: Math.max(0, ...r.filter(x => x.moved).map(x => x.dist)) }; });
  console.log('SITES', JSON.stringify(rep));
  await p.evaluate(() => NLS.audit.begin()); await p.waitForTimeout(1200);
  await p.addStyleTag({ content: '#auditBar,#toast{display:none!important}' });
  for (const t of ['elem', 'jh', 'hs', 'univ', 'kinder', 'zoo']) {
    const idx = await p.evaluate((t) => { const b = NLS.G.world.map.buildings.find(q => q.type === t); NLS.audit.view(b.idx, { mode: 'ext', hour: 13 }); return b.idx; }, t);
    await p.waitForTimeout(1500); await shot(t + '_site');
  }
};
