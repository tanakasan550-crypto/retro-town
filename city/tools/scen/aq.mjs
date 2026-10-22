import { startTrial, st } from './lib.mjs';
const until = async (p, fn, maxS) => { for (let i = 0; i < maxS * 2; i++) { await p.waitForTimeout(500); const r = await p.evaluate(fn); if (r) return r; } return null; };
const pickItem = (p, txt) => p.evaluate((txt) => { const b = [...document.querySelectorAll('#card button.item')].find(b => b.textContent.includes(txt)); if (b) b.click(); return !!b; }, txt);
const walkObj = (p, act) => p.evaluate((act) => { const G = NLS.G, L = G.S.loc; const I = NLS.nav.interiorOf(G, L.b, L.floor).I; const o = I.objs.find(o => o.act === act); NLS.nav.navTo({ kind: 'obj', o }); return !!o; }, act);
export default async (p, shot) => {
  await startTrial(p);
  await p.evaluate(() => { globalThis.__NAVSPEED = 3; const G = NLS.G, b = G.world.map.buildings.find(b => b.type === 'aquarium'); const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0; const I = NLS.nav.interiorOf(G, b.idx, 0).I; L.x = I.door.x + 0.5; L.y = I.H - 2; G.S.min = 10 * 60 + 50; NLS.U.cwAt = -999; });
  await walkObj(p, 'fx_aqticket'); await until(p, () => NLS.U.modal, 30);
  console.log('ticket:', (await st(p)).card.replace(/\n/g, ' | '));
  await pickItem(p, '入館券を買う'); await p.waitForTimeout(600);
  await walkObj(p, 'fx_aqtank'); await until(p, () => NLS.U.modal, 30);
  console.log('tank:', (await st(p)).card.replace(/\n/g, ' | '));
  await pickItem(p, 'じっくり'); await p.waitForTimeout(500);
  console.log('toast:', await p.evaluate(() => document.getElementById('toast').textContent));
  await shot('tank');
  // go to roof via floor nav
  await p.evaluate(() => NLS.nav.navTo({ kind: 'floor', floor: 2 }));
  await until(p, () => NLS.G.S.loc.floor === 2 && !NLS.G.S.loc.tr, 60);
  await p.waitForTimeout(1500); await shot('roof');
  await walkObj(p, 'fx_aqshow'); await until(p, () => NLS.U.modal, 30);
  console.log('show:', (await st(p)).card.replace(/\n/g, ' | '));
  await pickItem(p, 'イルカショーを観る'); await p.waitForTimeout(5000);
  await shot('show');
};
