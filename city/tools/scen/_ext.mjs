import { startTrial } from './lib.mjs';
export default async (p, shot) => {
  await startTrial(p); await p.evaluate(() => NLS.audit.begin()); await p.addStyleTag({ content: '#auditBar,#toast{display:none!important}' });
  for (const t of (process.env.TYPES || 'sento,onsenbath').split(',')) {
    await p.evaluate((t) => { const b = NLS.G.world.map.buildings.find(q => q.type === t); NLS.audit.view(b.idx, { mode: 'ext', hour: 15 }); }, t);
    await p.waitForTimeout(1500); await shot(t + '_ext');
  }
};
