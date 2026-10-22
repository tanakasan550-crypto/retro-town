import { startTrial, st } from './lib.mjs';
const until = async (p, fn, maxS, arg) => { for (let i = 0; i < maxS * 2; i++) { await p.waitForTimeout(500); const r = await p.evaluate(fn, arg); if (r) return r; } return null; };
export default async (p, shot) => {
  await startTrial(p);
  const info = await p.evaluate(() => {
    const G = NLS.G; G.S.min = 8 * 60;
    const net = NLS.bus.busFleet(G);
    return { stops: net.stops.length, routes: net.routes.map(r => `${r.no}:${r.cyc.length}cyc/${r.len}tiles/${r.buses.length}buses`) };
  });
  console.log('NET', JSON.stringify(info));
  await p.evaluate(() => { const G = NLS.G, s = NLS.bus.busNet(G.world.map).stops[0], L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; L.x = s.x + 0.5; L.y = s.y + 0.5; NLS.U.cwAt = -999; });
  await p.waitForTimeout(6000);
  const s1 = await p.evaluate(() => { const B = NLS.bus, G = NLS.G, net = B.busNet(G.world.map); return { q: net.stops.map(s => s.queue.length).join(','), buses: net.routes.map(r => r.buses.map(b => `${b.id}@${b.S.toFixed(0)} v${b.v.toFixed(1)} ${b.mode}${b.why ? '(' + b.why + ')' : ''} pax${b.pax.length}`).join(' ')).join(' | ') }; });
  console.log('STATE', JSON.stringify(s1));
  await shot('stop_waiting');
  // wait for the bus
  const r = await p.evaluate(() => { const G = NLS.G, t = NLS.bus.facOutdoorTargets(G, G.S.loc)[0]; const acts = NLS.bus.targetActions(G, t); const a = acts.find(a => a.id.startsWith('busgo:C:bs0:bs1')); const r = NLS.bus.runAction(G, a.id, t); return a.label + ' => ' + r.msg; });
  console.log('WAIT', r);
  await p.evaluate(() => { NLS.U.scale = 3; });
  const t0 = await p.evaluate(() => NLS.G.absMin());
  const boarded = await until(p, () => NLS.G.S.onBus && JSON.stringify(NLS.G.S.onBus), 90);
  console.log('BOARDED', boarded, 'after', (await p.evaluate(() => NLS.G.absMin())) - t0, 'game min', await p.evaluate(() => document.getElementById('busHud').innerText.replace(/\n/g, ' / ')));
  await p.evaluate(() => { NLS.U.scale = 1; });
  await p.waitForTimeout(2500); await shot('riding_out');
  await p.evaluate(() => document.querySelector('#busHud [data-a=in]')?.click());
  await p.waitForTimeout(1500); await shot('riding_in');
  await p.evaluate(() => document.querySelector('#busHud [data-a=in]')?.click());
  const trace = [];
  await p.evaluate(() => { NLS.U.scale = 3; });
  for (let i = 0; i < 120 && await p.evaluate(() => !!NLS.G.S.onBus); i++) {
    await p.waitForTimeout(1000);
    trace.push(await p.evaluate(() => { const b = NLS.bus.busOfHero(NLS.G); return b ? `${b.x.toFixed(0)},${b.y.toFixed(0)} v${b.v.toFixed(1)} ${b.mode}${b.why ? '(' + b.why + ')' : ''}` : 'off'; }));
  }
  console.log('TRACE', trace.join(' ; '));
  const after = await p.evaluate(() => { const G = NLS.G, L = G.S.loc, s = NLS.bus.busNet(G.world.map).stops[1]; return { loc: [L.k, L.x, L.y], stop: [s.x, s.y, s.name], onBus: !!G.S.onBus, toast: document.getElementById('toast').textContent }; });
  console.log('ALIGHT', JSON.stringify(after), 'total', (await p.evaluate(() => NLS.G.absMin())) - t0, 'min');
  await p.evaluate(() => { NLS.U.scale = 1; });
  await shot('alighted');
  // NPC status
  const npc = await p.evaluate(() => { const B = NLS.bus, out = []; for (const [id, v] of B.BUSSIM.riders) { out.push(NLS.nav.npcStatus(id).now); if (out.length > 3) break; } const d = [...B.BUSSIM.drivers.keys()][0]; out.push(NLS.nav.npcStatus(d).who + ' / ' + NLS.nav.npcStatus(d).now); return out; });
  console.log('NPC', JSON.stringify(npc, null, 1));
  // planner
  const plan = await p.evaluate(() => { const G = NLS.G, ap = G.world.map.buildings.find(b => b.type === 'airport'); const o = NLS.bus.tripOptions(G, { x: G.S.loc.x, y: G.S.loc.y }, { x: ap.doorX, y: ap.doorY, name: ap.name, b: ap.idx }); return o.map(q => q.nm + ' ' + Math.round(q.mins) + 'min ¥' + q.fare + ' : ' + q.legs.map(l => l.m + (l.r ? '[' + l.r.no + ']' : l.L ? '[' + l.L.name + ']' : '') + '→' + l.to.name + ' ' + Math.round(l.mins)).join(' / ')); });
  console.log('PLAN', JSON.stringify(plan, null, 1));
  await p.evaluate(() => NLS.bus.busMapModal());
  await p.waitForTimeout(800); await shot('busmap');
  await p.evaluate(() => { const cv = document.getElementById('bmcv'); });
};
