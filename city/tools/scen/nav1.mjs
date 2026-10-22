import { startTrial, st } from './lib.mjs';
export default async (p, shot) => {
  await startTrial(p);
  await shot('start');
  // 出口をタップ相当: exit
  await p.evaluate(() => NLS.nav.navTo({ kind: 'exit' }));
  for (let i = 0; i < 30; i++) {
    await p.waitForTimeout(500);
    const s = await st(p); const n = await p.evaluate(() => { const N = NLS.nav.NAV; return N ? { after: N.after, i: N.i, len: N.path && N.path.length, goal: N.goal } : null; });
    console.log(i, JSON.stringify(s), JSON.stringify(n));
    if (s.k === 'out' && !n) break;
  }
  await shot('after_exit');
};
