import { startTrial, st } from './lib.mjs';
const until = async (p, fn, maxS) => { for (let i = 0; i < maxS * 2; i++) { await p.waitForTimeout(500); const r = await p.evaluate(fn); if (r) return r; } return null; };
const card = async (p) => (await st(p)).card.replace(/\n/g, ' | ').slice(0, 200);
const pick = (p, txt) => p.evaluate((txt) => { const b = [...document.querySelectorAll('#card button.item')].find(b => b.textContent.includes(txt) && !b.disabled); if (b) b.click(); return b ? b.textContent : null; }, txt);
const act = async (p, a, label) => { await p.evaluate((a) => { const G = NLS.G, L = G.S.loc; const I = NLS.nav.interiorOf(G, L.b, L.floor).I; const o = I.objs.find(o => o.act === a); NLS.nav.navTo({ kind: 'obj', o }); }, a); await until(p, () => NLS.U.modal, 40); console.log(label, await card(p)); };
export default async (p, shot) => {
  await startTrial(p);
  await p.evaluate(() => { globalThis.__NAVSPEED = 3; const G = NLS.G, b = G.world.map.buildings.find(b => b.type === 'hospital'); const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0; L.x = 22.5; L.y = 27; G.S.min = 9 * 60; NLS.U.cwAt = -999; NLS.R.izl = -1; });
  await p.waitForTimeout(1200); await shot('lobby');
  await act(p, 'fx_horeg', 'reg:'); console.log(await pick(p, '受付をする')); await p.waitForTimeout(500); console.log(' toast', await p.evaluate(() => document.getElementById('toast').textContent));
  await act(p, 'fx_horeg', 'reg2:'); console.log(await pick(p, '受付済み')); await p.waitForTimeout(700); console.log(' toast', await p.evaluate(() => document.getElementById('toast').textContent));
  await until(p, () => NLS.U.modal, 40); console.log('exam:', await card(p));
  await shot('exam');
  console.log(await pick(p, '診察を受ける')); await p.waitForTimeout(800); console.log(' toast', await p.evaluate(() => document.getElementById('toast').textContent));
  await p.evaluate(() => { if (NLS.U.modal) document.querySelector('#card .row .btn')?.click(); });
  await act(p, 'fx_hocash', 'cash:'); console.log(await pick(p, '会計をする'));
  for (const f of [2, 4, 9]) { await p.evaluate((f) => { const G = NLS.G, L = G.S.loc; L.floor = f; L.x = 28; L.y = 11; NLS.U.cwAt = -999; }, f); await p.waitForTimeout(1500); await shot('floor' + f); }
};
