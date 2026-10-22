import { startTrial, st } from './lib.mjs';
const until = async (p, fn, maxS) => { for (let i = 0; i < maxS * 2; i++) { await p.waitForTimeout(500); const r = await p.evaluate(fn); if (r) return r; } return null; };
export default async (p, shot) => {
  await startTrial(p);
  await p.evaluate(() => { globalThis.__NAVSPEED = 3; });
  const T = process.env.HT || 'hotel';
  const bi = await p.evaluate((T) => { const G = NLS.G, b = G.world.map.buildings.find(b => b.type === T); const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0; const I = NLS.nav.interiorOf(G, b.idx, 0).I; L.x = I.door.x + 0.5; L.y = I.H - 2; NLS.U.cwAt = -999; return b.idx; }, T);
  await p.waitForTimeout(1200); await shot('lobby');
  // walk to front desk by tapping its object via nav API
  await p.evaluate(() => { const G = NLS.G, L = G.S.loc; const I = NLS.nav.interiorOf(G, L.b, 0).I; const o = I.objs.find(o => o.act === 'fx_hdesk'); NLS.nav.navTo({ kind: 'obj', o }); });
  await until(p, () => NLS.U.modal, 30);
  console.log('desk modal:', (await st(p)).card.replace(/\n/g, ' | '));
  await shot('desk');
  await p.evaluate(() => { const b = [...document.querySelectorAll('#card button.item')].find(b => b.textContent.includes('朝食付き')); b.click(); });
  await p.waitForTimeout(800);
  console.log('after checkin', JSON.stringify(await p.evaluate(() => ({ h: NLS.G.S.hotel, toast: document.getElementById('toast').textContent, nav: NLS.nav.NAV && NLS.nav.NAV.label }))));
  const ok = await until(p, () => NLS.G.S.loc.floor >= 1000 && !NLS.nav.NAV, 120);
  console.log('in room', !!ok, JSON.stringify(await st(p)));
  await shot('room');
  await p.evaluate(() => { const G = NLS.G, L = G.S.loc; const I = NLS.nav.interiorOf(G, L.b, L.floor).I; const o = I.objs.find(o => o.act === 'fx_hsleep'); NLS.nav.navTo({ kind: 'obj', o }); });
  await until(p, () => NLS.U.modal, 20);
  console.log('bed:', (await st(p)).card.replace(/\n/g, ' | '));
  await p.evaluate(() => { const b = [...document.querySelectorAll('#card button.item')].find(b => b.textContent.includes('朝まで')); b && b.click(); });
  await p.waitForTimeout(800);
  console.log('slept', await p.evaluate(() => document.getElementById('hDate').textContent + ' ' + document.getElementById('toast').textContent));
  // walk out to corridor
  await p.evaluate(() => NLS.nav.navTo({ kind: 'exit' }));
  await until(p, () => NLS.G.S.loc.floor < 1000, 30);
  await p.waitForTimeout(800); await shot('corridor');
  console.log(JSON.stringify(await st(p)));
};
