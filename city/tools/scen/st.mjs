import { startTrial, st } from './lib.mjs';
const until = async (p, fn, maxS) => { for (let i = 0; i < maxS * 2; i++) { await p.waitForTimeout(500); const r = await p.evaluate(fn); if (r) return r; } return null; };
const pickItem = (p, txt) => p.evaluate((txt) => { const b = [...document.querySelectorAll('#card button.item, #card button[data-to]')].find(b => b.textContent.includes(txt) && !b.disabled); if (b) b.click(); return b ? b.textContent : null; }, txt);
const walkObj = (p, pred) => p.evaluate((pred) => { const G = NLS.G, L = G.S.loc; const I = NLS.nav.interiorOf(G, L.b, L.floor).I; const o = I.objs.find(new Function('o', 'return ' + pred)); if (o) NLS.nav.navTo({ kind: 'obj', o }); return !!o; }, pred);
const toast = (p) => p.evaluate(() => document.getElementById('toast').textContent);
export default async (p, shot) => {
  await startTrial(p);
  const sid = await p.evaluate(() => { globalThis.__NAVSPEED = 3; const G = NLS.G, b = G.world.map.buildings.find(b => b.type === 'station' && b.stationId === 'kazeminato') || G.world.map.buildings.find(b => b.type === 'station'); const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0; const I = NLS.nav.interiorOf(G, b.idx, 0).I; L.x = I.door.x + 0.5; L.y = I.H - 2; G.S.min = 9 * 60; NLS.U.cwAt = -999; return b.name; });
  console.log('station', sid);
  await p.waitForTimeout(1200); await shot('concourse');
  // try the gate without ticket
  await p.evaluate(() => { const L = NLS.G.S.loc; L.x = 21.5; L.y = 11.6; });
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(700); await p.keyboard.up('ArrowUp');
  console.log('no-ticket gate:', await toast(p), JSON.stringify(await st(p)).slice(0, 80));
  await walkObj(p, "o.act==='fx_stticket'"); await until(p, () => NLS.U.modal, 30);
  await pickItem(p, '行き先を選んで'); await p.waitForTimeout(500);
  console.log('dest list:', (await st(p)).card.slice(0, 200).replace(/\n/g, ' | '));
  await shot('ticketmachine');
  console.log('bought:', await pickItem(p, '月見温泉'), await toast(p));
  // walk to the platform via floor nav (passes the gate)
  await p.evaluate(() => NLS.nav.navTo({ kind: 'floor', floor: 1 }));
  await until(p, () => NLS.G.S.loc.floor === 1 && !NLS.G.S.loc.tr, 60);
  console.log('platform', JSON.stringify(await st(p)).slice(0, 120), await toast(p), 'railIn', await p.evaluate(() => NLS.G.S.railIn));
  await p.waitForTimeout(9000); await shot('platform');
  await walkObj(p, "o.act==='fx_stboard'"); await until(p, () => NLS.U.modal, 30);
  console.log('board:', (await st(p)).card.replace(/\n/g, ' | '));
  await pickItem(p, '列車に乗る'); await p.waitForTimeout(1500);
  await shot('riding');
  await p.evaluate(() => { const b = document.querySelector('#ridebar [data-a=skip]'); b && b.click(); });
  await until(p, () => !document.getElementById('ride').classList.contains('on'), 60);
  await p.waitForTimeout(800);
  console.log('arrived', JSON.stringify(await st(p)).slice(0, 140), await toast(p), 'railIn', await p.evaluate(() => NLS.G.S.railIn));
  await shot('arrival');
  await p.evaluate(() => NLS.nav.navTo({ kind: 'exit' }));
  await until(p, () => NLS.G.S.loc.k === 'out', 60);
  console.log('out', JSON.stringify(await p.evaluate(() => ({ rail: NLS.G.S.rail, railIn: NLS.G.S.railIn }))));
};
