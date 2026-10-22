import { startTrial, st } from './lib.mjs';
export default async (p, shot) => {
  await startTrial(p);
  await p.evaluate(() => NLS.nav.navTo({ kind: 'exit' }));
  await p.waitForTimeout(1500);
  console.log(await p.evaluate(() => { const N = NLS.nav.NAV, L = NLS.G.S.loc; const I = NLS.G.S && null;
    return JSON.stringify({ path: N.path.slice(0, 8), i: N.i, x: L.x, y: L.y, dir: N.dir }); }));
};
