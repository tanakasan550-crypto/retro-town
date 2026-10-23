import { startTrial } from './lib.mjs';
export default async (p) => {
  await startTrial(p);
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start');
  await p.evaluate(() => NLS.G.skipTo(NLS.G.S.M + 12 * 6, false));
  const { profile } = await cdp.send('Profiler.stop');
  const self = new Map(), byId = new Map(profile.nodes.map(n => [n.id, n]));
  const dt = profile.timeDeltas; let i = 0;
  for (const s of profile.samples) { const n = byId.get(s); const k = n.callFrame.functionName + ':' + n.callFrame.lineNumber; self.set(k, (self.get(k) || 0) + (dt[i++] || 0)); }
  const tot = [...self.values()].reduce((a, c) => a + c, 0);
  console.log('TOP', JSON.stringify([...self.entries()].sort((a, c) => c[1] - a[1]).slice(0, 25).map(([k, v]) => `${k} ${(v / tot * 100).toFixed(1)}%`)));
};
