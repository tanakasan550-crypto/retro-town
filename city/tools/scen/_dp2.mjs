import { startTrial } from './lib.mjs';
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, J = NLS.JOBS, IDS = Object.keys(J);
    const M0 = w.M, t0 = performance.now();
    G.skipTo(G.S.M + 12 * 25, false);
    const ms = performance.now() - t0;
    const emp = {}, slots = {}; for (let s = 0; s < w.slots.b.length; s++) { const j = IDS[w.slots.job[s]]; slots[j] = (slots[j] || 0) + 1; if (w.slots.who[s] >= 0) emp[j] = (emp[j] || 0) + 1; }
    const lj = Object.keys(J).filter(j => J[j].qual || J[j].lic).map(j => `${j}:${emp[j] || 0}/${slots[j] || 0}`);
    const ev = {}, qn = {}, examF = {}, ex = [];
    for (const [id, pr] of w.prof) for (const e of pr.hist || []) { if (e.M < M0) continue; ev[e.k] = (ev[e.k] || 0) + 1; if (e.k === 'qual' && !e.pre) qn[e.q] = (qn[e.q] || 0) + 1; if (e.k === 'exam' && !e.ok) examF[e.q] = (examF[e.q] || 0) + 1; }
    let noHold = 0; for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.job[i] < 255) { const JJ = J[IDS[P.job[i]]]; if ((JJ.qual || JJ.lic) && NLS.dr && !NLS.dr.holdsFor(w, i, JJ)) noHold++; }
    const st = {}; for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.home[i] >= 0) if (P.drS) st[P.drS[i]] = (st[P.drS[i]] || 0) + 1;
    return { years: 25, sec: Math.round(ms / 1000), lj, ev, qn, examF, noHold, st, news: (w.newsLog || []).filter(e => e.kind === 'dream').slice(-4).map(e => e.text), found: (w.dev || []).filter(e => e.kind === 'found').length };
  });
  console.log(JSON.stringify(r));
};
