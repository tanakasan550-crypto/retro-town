import { startTrial, st } from './lib.mjs';
export default async (p, shot) => {
  await startTrial(p);
  await p.evaluate(() => { const G = NLS.G, b = G.bld(G.hero.homeB), L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; L.x = b.doorX + 0.5; L.y = b.doorY + 0.6; NLS.U.cwAt = -999; });
  await p.waitForTimeout(1200);
  // tap on several screen points (right half) and report what was picked
  for (const [x, y] of [[700, 150], [600, 300], [500, 250], [380, 200]]) {
    await p.touchscreen.tap(x, y); await p.waitForTimeout(300);
    console.log('tap', x, y, JSON.stringify(await p.evaluate(() => { const N = NLS.nav.NAV; return N ? { tg: N.tg, label: N.label } : 'none'; })));
    await p.evaluate(() => NLS.nav.navStop());
  }
  await p.touchscreen.tap(700, 150); await p.waitForTimeout(2500); await shot('tapwalk');
  console.log(JSON.stringify(await st(p)));
  // joystick drag on left
  const c = await p.$('#cv');
  await p.evaluate(() => NLS.nav.navStop());
};
