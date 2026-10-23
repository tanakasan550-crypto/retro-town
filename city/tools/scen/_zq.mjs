import { startTrial } from './lib.mjs';
export default async (p) => {
  await startTrial(p);
  console.log(JSON.stringify(await p.evaluate(() => {
    const m = NLS.G.world.map, B = m.buildings, s = m.fsites.find(s => s.type === 'zoo');
    const inS = B.filter(b => b.x >= s.x && b.x < s.x + s.w && b.y >= s.y && b.y < s.y + s.h).map(b => [b.idx, b.type, b.name, b.campusOf, b.parentB, b.kind, b.nameGen]);
    return { site: [s.x, s.y, s.w, s.h], annex: s.annex, inS };
  })));
};
