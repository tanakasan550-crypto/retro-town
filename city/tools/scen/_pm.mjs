import { startTrial } from './lib.mjs';
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, IDS = Object.keys(NLS.JOBS);
    const out = {};
    for (const j of ['plantmgr', 'prodmgr', 'powerstaff', 'heavy', 'foreman']) {
      let elig = 0, unemp = 0, eligAll = 0;
      for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.home[i] >= 0) { const e = w.eligibleFor(i, j, w.M); if (e) eligAll++; if (P.work[i] < 0) { unemp++; if (e) elig++; } }
      out[j] = { eligAll, unempElig: elig, unemp, J: NLS.JOBS[j] };
    }
    return out;
  });
  console.log(JSON.stringify(r));
};
