import { startTrial } from './lib.mjs';
// 埋立地(青海新都心): 島・橋・道路がつながり、歩いて・バスで行けること。動物園と大学の本キャンパスの広さ。来園者と学生
export default async (p, shot) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, m = G.world.map, I = m.island, B = m.buildings;
    const zoo = B.find(b => b.type === 'zoo'), univ = B.find(b => b.type === 'univ' && b.siteI != null && m.fsites[b.siteI].y >= I.y);
    const st = B.find(b => b.type === 'station' && b.stationId === 'aoumi_chuo');
    const on = (b) => b && b.doorY >= I.y && b.doorX >= I.x && b.doorX < I.x + I.w;
    // 来客の歩く道(Crowd.path): 橋の近くの本土の建物 → 動物園・大学
    const nearB = (t) => { const bx = I.bridges.slice().sort((a, c) => Math.abs(a - t.doorX) - Math.abs(c - t.doorX))[0]; return B.filter(b => b.doorY < I.y - 10 && b.doorY > I.y - 80 && Math.abs(b.doorX - bx) < 40 && b.type !== 'annex').sort((a, c) => c.doorY - a.doorY)[0]; };
    NLS.C.pending = 0; NLS.C.pathCache.clear(); const p1 = NLS.C.path(nearB(zoo).idx, zoo.idx); NLS.C.pending = 0; const p2 = NLS.C.path(nearB(univ).idx, univ.idx);
    // 主人公の道案内: 青海中央駅の前から動物園へ(長い道は navTo の探索)
    const L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; L.x = st.doorX + 0.5; L.y = st.doorY + 1.5;
    NLS.nav.navTo({ kind: 'bld', b: zoo.idx }); const N = NLS.nav.NAV; const heroPath = N && N.path ? N.path.length : null; NLS.nav.navStop();
    // バス停(島の中・施設の近く)
    const net = NLS.bus.busNet(m), near = (b) => net ? net.stops.filter(s => Math.abs(s.x - b.doorX) + Math.abs(s.y - b.doorY) < 40).map(s => s.name) : [];
    // 乗換案内: 自宅 → 動物園
    const hb = B[G.hero.homeB]; let plan = null;
    try { const pl = NLS.bus.transitPlan(G, { x: hb.doorX, y: hb.doorY, name: '自宅' }, { x: zoo.doorX, y: zoo.doorY, name: zoo.name }); plan = pl && (pl.legs || pl.steps || pl).length; } catch (e) { plan = 'err ' + e.message; }
    const fz = m.fsites[zoo.siteI], fu = m.fsites[univ.siteI];
    return { island: [I.x, I.y, I.w, I.h], bridges: I.bridges, zooOn: on(zoo), univOn: on(univ), univ: univ.name, zooM2: fz.w * fz.h * 4, univM2: fu.w * fu.h * 4, walkZoo: p1 ? p1.n : null, walkUniv: p2 ? p2.n : null, heroPath, stopsZoo: near(zoo), stopsUniv: near(univ), plan };
  });
  console.log('ISLAND', JSON.stringify(r));
  if (!r.zooOn || !r.univOn || !r.walkZoo || !r.walkUniv || !r.heroPath || r.bridges.length < 2) throw new Error('island not connected');
  if (r.zooM2 < 8e4 || r.univM2 < 7e4) throw new Error('island sites too small');
  if (!r.stopsZoo.length || !r.stopsUniv.length) throw new Error('no bus stop near the zoo or the university');
  // 橋の上からの眺め
  await p.evaluate(() => { const G = NLS.G, I = G.world.map.island, L = G.S.loc; L.k = 'out'; delete L.b; L.x = I.bridges[1] + 1; L.y = I.y - 6; G.S.min = 11 * 60; NLS.U.cwAt = -999; });
  await p.waitForTimeout(2000); await shot('bridge');
};
