import { startTrial, st } from './lib.mjs';
const until = async (p, fn, maxS) => { for (let i = 0; i < maxS * 2; i++) { await p.waitForTimeout(500); const r = await p.evaluate(fn); if (r) return r; } return null; };
export default async (p, shot) => {
  await startTrial(p);
  const info = await p.evaluate(() => {
    const G = NLS.G; G.S.min = 10 * 60;
    const net = NLS.bus.busNet(G.world.map);
    return { stops: net.stops.map(s => s.name + '@' + s.x + ',' + s.y), routes: net.routes.map(r => r.no + ':' + r.stops.length + 'stops/' + r.len + 'tiles') };
  });
  console.log(JSON.stringify(info));
  await p.evaluate(() => { const G = NLS.G, s = NLS.bus.busNet(G.world.map).stops[0], L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; L.x = s.x + 0.5; L.y = s.y + 1.4; L.f = 'u'; });
  await p.waitForTimeout(1500); await shot('stop');
  const tgs = await p.evaluate(() => NLS.ui.targetsFor ? NLS.ui.targetsFor(NLS.G, []).map(t => t.label) : NLS.bus.facOutdoorTargets(NLS.G, NLS.G.S.loc).map(t => t.label));
  console.log('targets', tgs);
  const acts = await p.evaluate(() => { const G = NLS.G, t = NLS.bus.facOutdoorTargets(G, G.S.loc)[0]; return NLS.bus.targetActions(G, t).map(a => a.id + ' ' + a.label); });
  console.log('acts', acts.slice(0, 8));
  const nb = await p.evaluate(() => NLS.bus.busesNow(NLS.R, NLS.G.S.loc).length);
  console.log('buses near', nb);
  const r = await p.evaluate(() => { const G = NLS.G, t = NLS.bus.facOutdoorTargets(G, G.S.loc)[0]; const a = NLS.bus.targetActions(G, t).find(a => a.id.startsWith('busgo')); const m0 = G.hero.money; const r = NLS.bus.runAction(G, a.id, t); return { id: a.id, msg: r.msg, ui: r.ui, paid: m0 - G.hero.money, loc: [G.S.loc.x, G.S.loc.y] }; });
  console.log('ride', JSON.stringify(r));
  // find a bus on screen
  await p.evaluate(() => { const G = NLS.G, r = NLS.bus.busNet(G.world.map).routes[0]; const b = NLS.bus.busesNow(Object.assign(Object.create(NLS.R), { time: NLS.R.time }), { x: r.pts[0][0], y: r.pts[0][1] }); const L = G.S.loc; const q = r.pts[Math.floor(r.len / 3)]; L.x = q[0] + 0.5; L.y = q[1] + 2.5; });
  for (let k = 0; k < 6; k++) { const n = await p.evaluate(() => NLS.bus.busesNow(NLS.R, NLS.G.S.loc).filter(b => Math.abs(b.x - NLS.G.S.loc.x) < 12 && Math.abs(b.y - NLS.G.S.loc.y) < 12).length); if (n) break; await p.waitForTimeout(3000); }
  await shot('bus_on_road');
};
