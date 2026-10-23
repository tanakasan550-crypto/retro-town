import { startTrial } from './lib.mjs';
export default async (p) => {
  await startTrial(p);
  console.log(JSON.stringify(await p.evaluate(() => {
    const m = NLS.G.world.map, W = m.W, B = m.buildings, u = B.find(b => b.type === 'univ' && b.siteI != null && m.fsites[b.siteI].y >= m.island.y), s = m.fsites[u.siteI];
    // 扉から歩けるタイルを広げる(固くないタイル)
    const seen = new Uint8Array(W * m.H), q = [u.doorX + u.doorY * W]; seen[q[0]] = 1; let reachRoad = false, n = 0;
    while (q.length && n < 4e5) { const k = q.shift(); n++; const x = k % W, y = k / W | 0; if (m.ground[k] === NLS.T.ROAD && (y >= s.y + s.h || y < s.y || x < s.x || x >= s.x + s.w)) { reachRoad = true; break; } for (const d of [1, -1, W, -W]) { const k2 = k + d; if (!seen[k2] && !m.solid[k2] && !(m.bid[k2] >= 0 && m.bid[k2] !== u.idx)) { seen[k2] = 1; q.push(k2); } } }
    const fence = s.fence ? s.fence.length : null;
    return { door: [u.doorX, u.doorY], doorSolid: m.solid[u.doorX + u.doorY * W], site: [s.x, s.y, s.w, s.h], gate: s.gate, reachRoad, explored: n, fence };
  })));
};
