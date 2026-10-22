import { startTrial } from './lib.mjs';
const until = async (p, fn, maxS) => { for (let i = 0; i < maxS * 2; i++) { await p.waitForTimeout(500); const r = await p.evaluate(fn); if (r) return r; } return null; };
// 乗換案内: 停留所の近くから、バスで行くのが早い行き先へ。経路を実行して到着まで
export default async (p, shot) => {
  await startTrial(p);
  const info = await p.evaluate(() => {
    const G = NLS.G, B = NLS.bus; G.S.min = 9 * 60; globalThis.__NAVSPEED = 2;
    const net = B.busFleet(G), s = net.stops.find(q => q.name.includes('月見温泉')), L = G.S.loc;
    L.k = 'out'; delete L.b; delete L.floor; L.x = s.x + 0.5; L.y = s.y + 2.5; NLS.U.cwAt = -999;
    const dest = G.world.map.buildings.find(b => b.type === 'ryokan' && Math.abs(b.doorX - 1087) < 30);
    const opts = B.tripOptions(G, { x: L.x, y: L.y }, { x: dest.doorX, y: dest.doorY, name: dest.name, b: dest.idx });
    const o = opts.find(q => q.legs.some(l => l.m === 'bus')) || opts[0];
    B.tripStart(G, o, { x: dest.doorX, y: dest.doorY, name: dest.name, b: dest.idx });
    return { dest: dest.name, opts: opts.map(q => q.nm + ' ' + Math.round(q.mins) + '分 ' + q.legs.map(l => l.m + '→' + l.to.name).join(' / ')) };
  });
  console.log('TRIP', JSON.stringify(info, null, 1));
  const log = [];
  for (let i = 0; i < 240; i++) {
    await p.waitForTimeout(1000);
    const s = await p.evaluate(() => { const G = NLS.G, T = G.S.ctrip; return T ? `leg${T.i} ${T.legs[T.i].m} wait=${!!G.S.busWait} onBus=${!!G.S.onBus} ${G.S.loc.k} ${G.S.loc.x.toFixed(0)},${G.S.loc.y.toFixed(0)}` : 'done ' + G.S.loc.k + ' ' + (G.S.loc.b != null ? G.bld(G.S.loc.b).name : ''); });
    if (!log.length || log[log.length - 1] !== s) log.push(s);
    if (s.startsWith('done')) break;
    if (i === 30) await shot('trip_mid');
  }
  console.log('LOG', log.join('\n'));
  console.log('TOAST', await p.evaluate(() => document.getElementById('toast').textContent));
  await shot('trip_end');
};
