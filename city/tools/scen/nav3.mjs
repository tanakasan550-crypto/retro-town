import { startTrial, st } from './lib.mjs';
const until = async (p, fn, maxS) => { for (let i = 0; i < maxS * 2; i++) { await p.waitForTimeout(500); const r = await p.evaluate(fn); if (r) return r; } return null; };
export default async (p, shot) => {
  await startTrial(p);
  await p.evaluate(() => { globalThis.__NAVSPEED = 3; });
  // teleport to outside home door to shorten the test, then go home
  await p.evaluate(() => { const L = NLS.G.S.loc, b = NLS.G.bld(NLS.G.hero.homeB); L.k = 'out'; delete L.b; delete L.floor; L.x = b.doorX + 0.5; L.y = b.doorY + 2.5; NLS.nav.goHome('walk'); });
  const t = Date.now();
  const r = await until(p, () => NLS.G.S.loc.floor === 1807 && !NLS.nav.NAV, 110);
  console.log('home', !!r, (Date.now() - t) / 1000, JSON.stringify(await st(p)));
  await shot('home');
};
