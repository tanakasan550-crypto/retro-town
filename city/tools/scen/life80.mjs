import { startTrial } from './lib.mjs';
// 80年の通し回帰: 人生の終わりまで5年ずつ進め、そのたびに人口・葬儀の決まり・施設名・会話・セーブ往復・画面の描画を確かめる
const YEARS = +(process.env.YEARS || 99);
export default async (p, shot) => {
  await startTrial(p, process.env.BIRTH ? { scenario: process.env.BIRTH } : {});
  const t00 = Date.now();
  const s0 = await p.evaluate(() => ({ M: NLS.G.S.M, end: NLS.G.endMonth(), age: NLS.G.age() }));
  console.log('START', JSON.stringify(s0));
  const steps = Math.ceil(Math.min(YEARS * 12, s0.end - s0.M) / 60);
  for (let k = 1; k <= steps; k++) {
    const t0 = Date.now();
    const r = await p.evaluate((k) => {
      const G = NLS.G, w = G.world, P = w.pop;
      const target = Math.min(G.endMonth(), G.S.M + 60);
      const st = G.skipTo(target, false);
      const F = w.funerals || [];
      const kid = F.filter(r => r.chief >= 0 && Math.floor((r.M - P.born[r.chief]) / 12) < 18).length;
      let alive = 0; for (let i = 0; i < P.n; i++) if (!P.gone[i]) alive++;
      const mech = w.map.buildings.filter(b => /第\d+$/.test(b.name || '')).length;
      // 会話の事実(生きている住民を1人)
      let tf = -1; for (let i = (k * 7919) % P.n, c = 0; c < P.n; i = (i + 1) % P.n, c++) if (!P.gone[i] && i !== G.hero.id) { tf = NLS.talkFacts(G, i).length; break; }
      let save = null;
      if (k % 4 === 0 || st.stopped === 'end') { const N = NLS.nav; const txt = N.toJSON(G.serialize()); const G2 = N.Game.load(N.fromJSON(txt)); save = { kb: Math.round(txt.length / 1024), sameM: G2.S.M === G.S.M, sameN: G2.world.pop.n === P.n, names: G2.world.map.buildings.map(b => b.name).join('|') === w.map.buildings.map(b => b.name).join('|') }; }
      return { y: G.date().y, age: G.age(), stopped: st.stopped, ended: G.S.ended, alive, n: P.n, deaths: w.stats.deaths, funerals: F.length, kidChief: kid, mech, talkFacts: tf, save, heroAlive: !G.S.ended };
    }, k);
    r.ms = Date.now() - t0;
    console.log('STEP', k, JSON.stringify(r));
    if (r.kidChief) throw new Error('a child became chief mourner');
    if (r.mech) throw new Error('mechanical facility names came back');
    if (r.save && !(r.save.sameM && r.save.sameN && r.save.names)) throw new Error('save round trip changed the game');
    if (r.talkFacts <= 0) throw new Error('talk facts empty');
    // 画面: 学校の校庭と駅の中を描く(描画の例外は shot.mjs が拾う)
    if (!r.ended) {
      await p.evaluate(() => { const G = NLS.G, m = G.world.map, b = m.buildings.find(q => q.type === 'elem' && q.siteI != null), s = m.fsites[b.siteI]; const L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; L.x = s.x + s.w / 2; L.y = s.y + s.h * 0.6; G.S.min = 10 * 60 + 30; NLS.U.cwAt = -999; });
      await p.waitForTimeout(800);
      await p.evaluate(() => { const G = NLS.G, b = G.world.map.buildings.find(q => q.type === 'station'); const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0; const { I } = NLS.nav.interiorOf(G, b.idx, 0); L.x = I.door.x + 0.5; L.y = I.H - 2.5; G.S.min = 8 * 60; NLS.U.cwAt = -999; });
      await p.waitForTimeout(800);
      await p.evaluate(() => { const L = NLS.G.S.loc; L.k = 'out'; delete L.b; delete L.floor; });
      if (k % 4 === 0) await shot('y' + r.y);
    }
    if (r.ended) break;
  }
  const end = await p.evaluate(() => ({ ended: NLS.G.S.ended, age: NLS.G.age(), y: NLS.G.date().y, log: (NLS.G.S.log || NLS.G.logs || []).slice?.(-3) }));
  console.log('END', JSON.stringify(end), 'totalSec', Math.round((Date.now() - t00) / 1000));
  await p.waitForTimeout(1500); await shot('ending');
  if (YEARS >= 80 && !end.ended) throw new Error('life did not reach its end');
};
