import { startTrial } from './lib.mjs';
// 朝の通勤・通学: 住民の一日の予定からバス・電車を使う人数と、実際の列・乗車
export default async (p, shot) => {
  await startTrial(p);
  const s0 = await p.evaluate(() => {
    const G = NLS.G, B = NLS.bus; G.S.min = 6 * 60 + 50;
    // 平日にする
    for (let k = 0; k < 7 && (G.date().dow < 1 || G.date().dow > 5); k++) G.advance(1440);
    G.S.min = 6 * 60 + 50;
    const t0 = performance.now();
    B.busFleet(G); const ix = B.busCommuteIndex(G);
    const cm = G.world.getCommute(), ri = cm.index(G.date().dow);
    return { busCommuters: ix.n, byRoute: ix.byRoute, railCommuters: ri.who.size, pop: G.world.pop.n, ms: Math.round(performance.now() - t0), dow: G.date().dow };
  });
  console.log('INDEX', JSON.stringify(s0));
  await p.evaluate(() => { const G = NLS.G, s = NLS.bus.busNet(G.world.map).stops[0], L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; L.x = s.x + 0.5; L.y = s.y + 1.5; NLS.U.cwAt = -999; NLS.U.scale = 3; });
  const samples = [];
  for (let i = 0; i < 8; i++) {
    await p.waitForTimeout(8000);
    samples.push(await p.evaluate(() => {
      const G = NLS.G, B = NLS.bus, net = B.busNet(G.world.map); let wait = 0, ride = 0, why = {};
      for (const [id, v] of B.BUSSIM.riders) { if (v.st === 'wait') wait++; if (v.st === 'ride') ride++; if (v.st === 'wait' || v.st === 'ride') why[v.why] = (why[v.why] || 0) + 1; }
      const busiest = net.stops.map(s => s.name + ':' + s.queue.length).sort((a, b) => +b.split(':')[1] - +a.split(':')[1]).slice(0, 3).join(' ');
      const maxPax = Math.max(...net.routes.flatMap(r => r.buses.map(b => b.pax.length)));
      return `${String(Math.floor(G.S.min / 60)).padStart(2)}:${String(G.S.min % 60).padStart(2, '0')} wait ${wait} ride ${ride} maxPax ${maxPax} ${JSON.stringify(why)} | ${busiest}`;
    }));
  }
  console.log(samples.join('\n'));
  await shot('morning_stop');
  // 住民の様子(バス通学の人を一人)
  const st = await p.evaluate(() => { const G = NLS.G, B = NLS.bus, out = []; for (const [id, v] of B.BUSSIM.riders) if (v.why === '通学' || v.why === '通勤') { out.push(NLS.nav.npcStatus(id).who + ' / ' + NLS.nav.npcStatus(id).now); if (out.length > 3) break; } const ix = B.busCommuteIndex(G); const any = [...ix.who][0]; out.push('walker: ' + NLS.nav.npcStatus(any).now); return out; });
  console.log('STATUS', JSON.stringify(st, null, 1));
};
