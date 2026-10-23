import { startTrial } from './lib.mjs';
import fs from 'fs';
// 性能: 10年ずつ進め、処理時間・メモリ(JSヒープ)・人物の数・セーブの大きさ/書き出し/読み込みの時間・復元の一致を記録する。
// PROFILE=1 で最後の10年の CPU プロファイル(関数ごとの自己時間の上位)を出す
export default async (p) => {
  await startTrial(p);
  const cdp = await p.context().newCDPSession(p);
  const rows = [];
  for (let k = 0; k < 7; k++) {
    const prof = process.env.PROFILE && k === 6;
    if (prof) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 }); await cdp.send('Profiler.start'); }
    const r = await p.evaluate(() => {
      const G = NLS.G, w = G.world, P = w.pop, t0 = performance.now();
      G.skipTo(Math.min(G.endMonth() - 1, G.S.M + 120), false);
      const tSim = performance.now() - t0;
      let alive = 0; for (let i = 0; i < P.n; i++) if (!P.gone[i]) alive++;
      const N = NLS.nav, t1 = performance.now(), txt = N.toJSON(G.serialize()), tSave = performance.now() - t1;
      const t2 = performance.now(), G2 = N.Game.load(N.fromJSON(txt)), tLoad = performance.now() - t2;
      const P2 = G2.world.pop; let same = P2.n === P.n;
      for (const k of ['born', 'gone', 'home', 'mother', 'father', 'spouse', 'work', 'school', 'workM', 'sch2']) for (let i = 0; i < P.n && same; i += 7) if (P2[k][i] !== P[k][i]) same = false;
      return { y: G.date().y, n: P.n, alive, cap: P.cap, outKin: (w.outKin || []).length, simMs: Math.round(tSim), heapMB: Math.round((performance.memory?.usedJSHeapSize || 0) / 1048576), saveKB: Math.round(txt.length / 1024), saveMs: Math.round(tSave), loadMs: Math.round(tLoad), same };
    });
    if (prof) {
      const { profile } = await cdp.send('Profiler.stop');
      const self = new Map(), dt = profile.timeDeltas, byId = new Map(profile.nodes.map(n => [n.id, n]));
      profile.samples.forEach((id, i) => { const n = byId.get(id), key = (n.callFrame.functionName || '(anon)') + ':' + n.callFrame.lineNumber; self.set(key, (self.get(key) || 0) + (dt[i] || 0)); });
      const tot = [...self.values()].reduce((a, b) => a + b, 0);
      console.log('PROFILE', JSON.stringify([...self].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => k + ' ' + (v / tot * 100).toFixed(1) + '%')));
    }
    const hu = await cdp.send('Runtime.getHeapUsage'); r.heapMB = Math.round(hu.usedSize / 1048576);
    rows.push(r); console.log('PERF', JSON.stringify(r));
    if (!r.same) throw new Error('save restore mismatch');
  }
  // 端末内の保存(IndexedDB の開発用の枠)と、gzip した大きさ(localStorage の場合)
  const z = await p.evaluate(async () => {
    const G = NLS.G, N = NLS.nav, txt = N.toJSON(G.serialize());
    const gzB = await new Response(new Blob([txt]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
    const t0 = performance.now(); let idb = null;
    try { await NLS.saveSlot('devtest', G, {}); const rec = await NLS.loadSlot('devtest'); const G2 = N.Game.load(rec.data); idb = { ok: G2.world.pop.n === G.world.pop.n && G2.S.M === G.S.M, ms: Math.round(performance.now() - t0) }; } catch (e) { idb = { err: e.message }; }
    return { jsonMB: +(txt.length / 1048576).toFixed(1), gzMB: +(gzB.byteLength / 1048576).toFixed(1), idb };
  });
  console.log('STORE', JSON.stringify(z));
  if (!z.idb || !z.idb.ok) throw new Error('device save failed');
  if (process.env.OUT) fs.writeFileSync(process.env.OUT + '/perf.json', JSON.stringify(rows, null, 1));
};
