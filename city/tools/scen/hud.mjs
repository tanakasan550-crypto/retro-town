import { startTrial } from './lib.mjs';
export default async (p, shot) => {
  await startTrial(p);
  await p.evaluate(() => { const G = NLS.G, b = G.bld(G.hero.homeB), L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; L.x = b.doorX + 0.5; L.y = b.doorY + 0.6; NLS.U.cwAt = -999; });
  await p.waitForTimeout(1000);
  await p.touchscreen.tap(700, 150); await p.waitForTimeout(150); await shot('tapring');
  await p.waitForTimeout(500); await shot('hud_out');
  console.log('hud:', await p.evaluate(() => document.getElementById('guideHud').innerText.replace(/\n/g, ' / ')));
  await p.evaluate(() => NLS.AW.cancel());
  // indoor: hotel desk walk
  await p.evaluate(() => { const G = NLS.G, b = G.world.map.buildings.find(b => b.type === 'hotel'); const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0; L.x = 20; L.y = 18; NLS.U.cwAt = -999; const I = NLS.nav.interiorOf(G, b.idx, 0).I; NLS.nav.navTo({ kind: 'obj', o: I.objs.find(o => o.act === 'fx_hbar') }); });
  await p.waitForTimeout(700); await shot('hud_in');
  console.log('hud in:', await p.evaluate(() => document.getElementById('guideHud').innerText.replace(/\n/g, ' / ')));
};
