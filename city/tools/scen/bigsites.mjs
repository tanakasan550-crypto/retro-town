import { startTrial } from './lib.mjs';
// 埋立地の南の列(第2期): ドリームパーク・総合スタジアム・臨海工場が実際に近い広さで島にあり、歩いて・バスで行けること。
// 地図は南へ広がっても、元のマス(道路・建物の位置)は変わらないこと。各施設の外観を撮る
export default async (p, shot) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, m = G.world.map, I = m.island, B = m.buildings;
    const on = (b) => b && b.doorY >= I.y && b.doorX >= I.x && b.doorX < I.x + I.w && b.doorY < I.y + I.h;
    const get = (t) => B.find(b => b.type === t && b.siteI != null && on(b));
    const tp = get('themepark'), sd = get('stadium'), fc = get('factory');
    const site = (b) => b ? m.fsites[b.siteI] : null;
    const m2 = (b) => { const s = site(b); return s ? s.w * s.h * 4 : 0; };
    const nearB = (t) => { const bx = I.bridges.slice().sort((a, c) => Math.abs(a - t.doorX) - Math.abs(c - t.doorX))[0]; return B.filter(b => b.doorY < I.y - 10 && b.doorY > I.y - 80 && Math.abs(b.doorX - bx) < 40 && b.type !== 'annex').sort((a, c) => c.doorY - a.doorY)[0]; };
    const walk = (b) => { if (!b) return null; NLS.C.pending = 0; NLS.C.pathCache.clear(); const q = NLS.C.path(nearB(b).idx, b.idx); return q ? q.n : null; };
    const net = NLS.bus.busNet(m), near = (b) => net && b ? net.stops.filter(s => Math.abs(s.x - b.doorX) + Math.abs(s.y - b.doorY) < 40).map(s => s.name) : [];
    const rides = site(tp) ? site(tp).solid.filter(s => s.ride).map(s => s.ride) : [];
    const stands = site(sd) ? site(sd).solid.filter(s => s.kind === 'stand').length : 0;
    return { H: m.H, H0: m.H0, island: [I.x, I.y, I.w, I.h], tp: tp && [tp.idx, tp.name, m2(tp)], sd: sd && [sd.idx, sd.name, m2(sd)], fc: fc && [fc.idx, fc.name, m2(fc)], rides, stands,
      walk: [walk(tp), walk(sd), walk(fc)], stops: [near(tp), near(sd)], rep: (m.siteReport || []).filter(x => ['themepark', 'stadium', 'factory'].includes(x.type)).map(x => [x.name, x.fromM2, x.site, x.scale]) };
  });
  console.log('BIG', JSON.stringify(r));
  if (!r.tp || !r.sd || !r.fc) throw new Error('south row facilities missing');
  if (r.tp[2] < 15e4 || r.sd[2] < 15e4 || r.fc[2] < 4e4) throw new Error('south row sites too small');
  if (r.rides.length < 7 || r.stands !== 4) throw new Error('rides or stands missing');
  if (r.walk.some(x => !x)) throw new Error('south row not walkable from the mainland');
  if (!r.stops[0].length || !r.stops[1].length) throw new Error('no bus stop near the park or the stadium');
  await p.evaluate(() => { for (let i = 0; i < 6; i++) NLS.R.zoomBy(-1); });
  const go = async (k, dx, dy, min, name) => {
    await p.evaluate(([k, dx, dy, min]) => { const G = NLS.G, m = G.world.map, b = m.buildings.find(q => q.type === k && q.siteI != null && q.doorY >= m.island.y); const s = m.fsites[b.siteI]; const L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; L.x = s.x + s.w * dx; L.y = s.y + s.h * dy; G.S.min = min; NLS.U.cwAt = -999; }, [k, dx, dy, min]);
    await p.waitForTimeout(2500); await shot(name);
  };
  await go('themepark', 0.5, 0.3, 11 * 60, 'park_center');
  await go('themepark', 0.72, 0.38, 11 * 60, 'park_coaster');
  await go('themepark', 0.22, 0.6, 11 * 60, 'park_west');
  await go('themepark', 0.56, 0.6, 14 * 60, 'park_mid');
  await go('stadium', 0.5, 0.97, 13 * 60, 'stadium_south');
  await go('stadium', 0.5, 0.36, 20 * 60, 'stadium_night');
  await go('factory', 0.5, 0.55, 10 * 60, 'factory');
};
