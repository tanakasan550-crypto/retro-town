import { startTrial, st } from './lib.mjs';
const until = async (p, fn, maxS) => { for (let i = 0; i < maxS * 2; i++) { await p.waitForTimeout(500); const r = await p.evaluate(fn); if (r) return r; } return null; };
const pickItem = (p, txt) => p.evaluate((txt) => { const b = [...document.querySelectorAll('#card button.item')].find(b => b.textContent.includes(txt) && !b.disabled); if (b) b.click(); return b ? b.textContent : null; }, txt);
const walkObj = (p, pred) => p.evaluate((pred) => { const G = NLS.G, L = G.S.loc; const I = NLS.nav.interiorOf(G, L.b, L.floor).I; const o = I.objs.find(new Function('o', 'return ' + pred)); if (o) NLS.nav.navTo({ kind: 'obj', o }); return !!o; }, pred);
export default async (p, shot) => {
  await startTrial(p);
  // jump to a Saturday in May at 13:00 (baseball 14:00)
  await p.evaluate((process_kind) => { globalThis.__NAVSPEED = 3; const G = NLS.G; globalThis.__SDEV = { kind: process_kind, start: 840, end: 1030, opp: '東都ジャイアンツ', seed: 12345 }; G.S.min = 13 * 60; const b = G.world.map.buildings.find(b => b.type === 'stadium'); const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0; const I = NLS.nav.interiorOf(G, b.idx, 0).I; L.x = I.door.x + 0.5; L.y = I.H - 2; NLS.U.cwAt = -999; }, process.env.KIND || 'b');
  console.log(await p.evaluate(() => document.getElementById('hDate').textContent));
  await walkObj(p, "o.act==='fx_sdticket'"); await until(p, () => NLS.U.modal, 30);
  console.log('tickets:', (await st(p)).card.replace(/\n/g, ' | '));
  console.log(await pickItem(p, '内野指定席')); await p.waitForTimeout(400);
  await p.evaluate(() => { NLS.G.S.min = 14 * 60 + 40; NLS.nav.navTo({ kind: 'floor', floor: 1 }); });
  await until(p, () => NLS.G.S.loc.floor === 1 && !NLS.nav.NAV, 60);
  await p.evaluate(() => { NLS.R.izl = -2; }); await p.waitForTimeout(1500); await shot('bowl');
  console.log('pos', JSON.stringify(await st(p)).slice(0,120));
  await walkObj(p, "o.t==='fx_stands' && o.side==='s'"); await until(p, () => NLS.U.modal, 30);
  console.log('watch:', (await st(p)).card.replace(/\n/g, ' | '));
  await pickItem(p, '最後まで'); await p.waitForTimeout(6000); await shot('scene');
  await p.evaluate(() => window.__scene && window.__scene.end()); await p.waitForTimeout(400);
  console.log('result:', await p.evaluate(() => document.getElementById('toast').textContent));
};
