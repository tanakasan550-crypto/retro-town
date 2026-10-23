import { startTrial } from './lib.mjs';
// 亡くなったあとの流れ: 喪主の決まり(子どもは務めない)・通夜/告別式の参列者・葬儀場の掲示と焼香・亡くなった人が日常に出ないこと・セーブ
export default async (p, shot) => {
  await startTrial(p);
  const st = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, F = w.funerals || [];
    const why = {}; let kid = 0, self = 0, deadChief = 0, noHall = 0;
    for (const r of F) { why[r.why] = (why[r.why] || 0) + 1; if (r.chief === r.id) self++; if (r.chief >= 0 && Math.floor((r.M - P.born[r.chief]) / 12) < 18) kid++; if (r.hall < 0) noHall++; }
    return { n: F.length, deaths: w.stats.deaths, why, kid, self, noHall, ex: F.slice(-3).map(r => ({ who: G.nameOf(r.id), age: r.age, chief: r.chief >= 0 ? G.nameOf(r.chief) : null, why: r.why, att: r.att.length, heirs: r.heirs.map(h => G.nameOf(h[0]) + ' ' + h[1]).join('・') })) };
  });
  console.log('FUNERALS', JSON.stringify(st));
  if (!st.n || st.kid || st.self) throw new Error('funeral records or chief rule wrong');
  // 住民どうしの葬儀: 家族のいる住民を1人亡くして、通夜の時間に葬儀場へ
  const f = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop;
    let id = -1;
    for (let i = 0; i < P.n; i++) if (!P.gone[i] && i !== G.hero.id && P.spouse[i] >= 0 && w.childrenOf(i).filter(k => !P.gone[k]).length >= 1 && Math.floor((G.S.M - P.born[i]) / 12) > 55 && P.home[i] >= 0 && !G.hero.rel[i]) { id = i; break; }
    if (id < 0) return { id };
    w.kill(id, G.S.M, 1);
    const r = NLS.fun.funeralOf(w, id), s = NLS.fun.funeralSched(r);
    // 通夜の時刻へ(同じ月の d+1 日 18:30)
    while (G.date().d < s.wake.d) G.advance(1440);
    G.S.min = 18 * 60 + 30;
    const L = G.S.loc; L.k = 'in'; L.b = r.hall; L.floor = 0; const { I } = NLS.nav.interiorOf(G, r.hall, 0); L.x = I.door.x + 0.5; L.y = I.H - 2.5; NLS.U.cwAt = -999;
    return { id, name: G.nameOf(id), hall: w.map.buildings[r.hall].name, chief: G.nameOf(r.chief), why: r.why, att: r.att.length, now: NLS.fun.funeralNow(G, r.hall)?.k, text: NLS.fun.funeralText(G, id) };
  });
  console.log('NPC FUNERAL', JSON.stringify(f));
  if (f.id < 0) throw new Error('no NPC with family found for the test');
  await p.waitForTimeout(2500);
  const inside = await p.evaluate((id) => { const G = NLS.G, r = NLS.fun.funeralOf(G.world, id); const here = new Set((NLS.U.people || []).map(q => q.id)); const I2 = NLS.nav.interiorOf(G, r.hall, 0).I, b = G.world.map.buildings[r.hall], P = G.world.pop; const dbg = { type: b.type, fh: !!I2.funeralHall, big: !!I2.big, now: !!NLS.fun.funeralNow(G, r.hall), alive: r.att.filter(x => !P.gone[x]).length, ind: NLS.C.indoor(r.hall, I2, 0).filter(q => q.role === 'mourner').length, ui: (NLS.U.people || []).length, loc: [G.S.loc.k, G.S.loc.b] };
    return { dbg, shown: r.att.filter(x => here.has(x)).length, chiefHere: here.has(r.chief), deadHere: here.has(id) }; }, f.id);
  console.log('HALL', JSON.stringify(inside)); await shot('wake');
  if (!inside.shown || !inside.chiefHere || inside.deadHere) throw new Error('mourners not shown at the wake');
  // 告別式の日の火葬(13:00〜): 火葬場の炉前ホールに遺族がいる
  const crem = await p.evaluate((id) => {
    const G = NLS.G, r = NLS.fun.funeralOf(G.world, id), s = NLS.fun.funeralSched(r);
    // 同じ月の火葬の日・時刻へ(日付を直接合わせる)
    G.S.day = s.crem.d; G.S.min = s.crem.a + 10;
    const L = G.S.loc; L.k = 'in'; L.b = r.crem; L.floor = 0; const { I } = NLS.nav.interiorOf(G, r.crem, 0); L.x = I.door.x + 0.5; L.y = I.H - 2.5; NLS.U.cwAt = -999;
    return { crem: G.world.map.buildings[r.crem].name, fp: G.world.map.buildings[r.crem].w + 'x' + G.world.map.buildings[r.crem].h, isCrem: !!I.crem, chief: r.chief };
  }, f.id);
  await p.waitForTimeout(2500);
  const cremIn = await p.evaluate((c) => { const G = NLS.G, L = G.S.loc, I = NLS.nav.interiorOf(G, L.b, 0).I, ind = NLS.C.indoor(L.b, I, 0); return { chiefHere: (NLS.U.people || []).some(q => q.id === c.chief), n: (NLS.U.people || []).filter(q => q.role === 'mourner').length, min: G.S.min, d: G.date().d }; }, crem);
  console.log('CREM', JSON.stringify({ ...crem, ...cremIn })); await shot('crematorium');
  if (!crem.isCrem || !cremIn.chiefHere) throw new Error('family not at the crematorium');
  const acts = await p.evaluate(() => { const G = NLS.G, { I } = NLS.nav.interiorOf(G, G.S.loc.b, 0); const t = { kind: 'obj', o: I.objs.find(o => o.act === 'fx_shoko') }; const b = { kind: 'obj', o: I.objs.find(o => o.act === 'fx_fboard') }; const a = NLS.bus.targetActions(G, t).map(x => x.label); const r = NLS.bus.runAction(G, 'fboard', b); return { shoko: a, board: r && r.msg }; });
  console.log('ACTS', JSON.stringify(acts));
  // 亡くなった人が日常の場面(通り・駅・店・学校)に出ないこと
  const leak = await p.evaluate(async () => {
    const G = NLS.G, w = G.world, P = w.pop, B = w.map.buildings, bad = new Set();
    const spots = [B.find(b => b.type === 'station'), B.find(b => b.type === 'super'), B.find(b => b.type === 'konbini'), B.find(b => b.type === 'elem'), B.find(b => b.type === 'hospital'), B.find(b => b.type === 'sento')];
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    let seen = 0;
    for (const h of [8, 12.5, 17.5]) for (const b of spots) for (const k of ['out', 'in']) {
      G.S.min = h * 60; const L = G.S.loc;
      if (k === 'in') { L.k = 'in'; L.b = b.idx; L.floor = 0; const { I } = NLS.nav.interiorOf(G, b.idx, 0); L.x = I.door.x + 0.5; L.y = I.H - 2.5; }
      else { L.k = 'out'; delete L.b; delete L.floor; L.x = b.doorX + 0.5; L.y = b.doorY + 1.5; }
      NLS.U.cwAt = -999; await wait(700);
      for (const q of [...(NLS.R.walkers || []), ...(NLS.U.people || [])]) { if (q.id == null) continue; seen++; if (P.gone[q.id]) bad.add(q.id); }
    }
    return { seen, dead: [...bad].slice(0, 10), nDead: bad.size };
  });
  console.log('LEAK', JSON.stringify(leak));
  if (leak.nDead) throw new Error('dead people appeared in daily scenes');
  // セーブの往復で葬儀の記録が残る
  const sv = await p.evaluate((id) => { const N = NLS.nav, G = NLS.G; const G2 = N.Game.load(N.fromJSON(N.toJSON(G.serialize()))); const a = NLS.fun.funeralOf(G.world, id), b = NLS.fun.funeralOf(G2.world, id); return { n: (G2.world.funerals || []).length, same: JSON.stringify(a) === JSON.stringify(b) }; }, f.id);
  console.log('SAVE', JSON.stringify(sv));
  if (!sv.same) throw new Error('funeral record lost in save');
  // 主人公(15歳)が喪主に選ばれないこと: 母が亡くなった場合
  const hc = await p.evaluate(() => { const G = NLS.G, w = G.world, P = w.pop, m = G.hero.mother; if (m == null || m < 0 || P.gone[m]) return null; const c = NLS.fun.funeralChief(w, m, G.S.M); return { chief: c.id === G.hero.id ? 'hero' : c.id >= 0 ? G.nameOf(c.id) : null, why: c.why, heroAge: G.age() }; });
  console.log('HERO CHIEF', JSON.stringify(hc));
  if (hc && hc.chief === 'hero') throw new Error('a 15-year-old was chosen as chief mourner');
};
