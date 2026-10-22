import { startTrial } from './lib.mjs';
export default async (p) => {
  await startTrial(p);
  console.log(await p.evaluate(() => { const G = NLS.G, b = G.hero.homeB, out = {};
    for (const f of [0, 1, 2, 3, 8]) { const I = NLS.nav.interiorOf(G, b, f).I; out[f] = I.objs.filter(o => o.act && /stair|lift|esc|elev/.test(o.act + o.t)).map(o => `${o.t}/${o.act} to=${o.to} via=${o.via} @${o.x},${o.y}`); }
    return JSON.stringify({ unit: G.S.homeUnit, out }, null, 1); }));
};
