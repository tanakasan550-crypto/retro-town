import { startTrial } from './lib.mjs';
export default async (p, shot) => {
  await startTrial(p);
  await p.evaluate(() => { const G = NLS.G; G.S.min = 8 * 60; const L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; NLS.bus.busFleet(G); });
  await p.waitForTimeout(25000);
  const r = await p.evaluate(() => { const G = NLS.G, net = NLS.bus.busNet(G.world.map); let best = null; for (const r of net.routes) for (const b of r.buses) if (!best || b.pax.length > best.pax.length) best = b; G.S.onBus = { bus: best.id, route: best.r.id, from: 'bs0', to: null, req: false, t0: G.absMin() }; return best.id + ' pax ' + best.pax.length; });
  console.log('ON', r);
  await p.waitForTimeout(1500);
  await shot('out');
  await p.evaluate(() => document.querySelector('#busHud [data-a=in]')?.click());
  await p.waitForTimeout(2500); await shot('in');
};
