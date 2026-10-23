import { startTrial } from './lib.mjs';
export default async (p) => {
  await startTrial(p);
  console.log(JSON.stringify(await p.evaluate(() => {
    const G = NLS.G, m = G.world.map, I = m.island, B = m.buildings, zoo = B.find(b => b.type === 'zoo');
    const near = B.filter(b => b.doorY < I.y - 10 && Math.abs(b.doorX - I.bridges[0]) < 40 && b.doorY > I.y - 80).sort((a, b) => (I.y - a.doorY) - (I.y - b.doorY))[0];
    const out = {};
    for (const [nm, b] of [['near', near], ['station', B.find(b => b.type === 'station' && b.stationId === 'aoumi_chuo')]]) {
      NLS.C.pending = 0; NLS.C.pathCache.clear(); const r = NLS.C.path(b.idx, zoo.idx); out[nm] = { from: [b.doorX, b.doorY], n: r ? r.n : null };
    }
    // 橋のタイルの種類
    const k = (x, y) => m.ground[x + y * m.W]; const T = NLS.T, nm = Object.fromEntries(Object.entries(T).map(([a, v]) => [v, a]));
    out.bridgeCol = []; for (let y = I.y - 20; y < I.y + 6; y += 2) out.bridgeCol.push(nm[k(I.bridges[0], y)] + (m.solid[I.bridges[0] + y * m.W] ? '!' : ''));
    out.zooDoor = [zoo.doorX, zoo.doorY, nm[k(zoo.doorX, zoo.doorY)], nm[k(zoo.doorX, zoo.doorY + 1)]];
    return out;
  })));
};
