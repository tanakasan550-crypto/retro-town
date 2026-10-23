import { startTrial } from './lib.mjs';
// 市外の親族の帰省を実際の移動と対面に: 正月の朝に駅から子の家へ歩く姿・昼は家の中にいる・話すと帰省の話(根拠つき)・
// 人物情報のいまの様子・夕方に駅へ帰る。主人公の祖父母が主人公の家に来る日を選んで撮影する
export default async (p, shot) => {
  await startTrial(p);
  const pick = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop;
    // 次の1月1日へ
    G.skipTo(Math.ceil((G.S.M + 1) / 12) * 12, false);
    for (const d of [1, 2, 3]) {
      G.S.day = d;
      const L = NLS.kin.kinVisitsToday(G);
      const mine = L.find(v => [G.hero.mother, G.hero.father, G.hero.id].includes(v.host));
      if (mine) return { d, v: mine, n: L.length, mine: true };
    }
    G.S.day = 1; const L = NLS.kin.kinVisitsToday(G); return { d: 1, v: L.find(v => v.wm >= 8) || L[0], n: L.length, mine: false };
  });
  console.log('PICK', JSON.stringify(pick));
  if (!pick.v || pick.n < 100) throw new Error('no New Year visits');
  // 歩く途中(駅→家)の屋外の人の一覧にいる
  const walk = await p.evaluate((pk) => {
    const G = NLS.G, m = G.world.map, B = m.buildings, v = pk.v; G.S.day = pk.d;
    G.S.min = Math.round(v.t0 + v.wm * 0.5);
    let seen = null;
    NLS.C.pending = 0; NLS.C.path(v.st, v.hb); NLS.C.pending = 0; NLS.C.path(v.hb, v.st);
    for (let k = 0; k < 4 && !seen; k++) { NLS.C.pending = 0; const hb = B[v.hb], sb = B[v.st]; const cx = (hb.doorX + sb.doorX) / 2, cy = (hb.doorY + sb.doorY) / 2; const L = NLS.C.outdoor(cx, cy, 120); seen = L.find(q => q.id === v.id) || null; }
    const st = NLS.nav.npcStatus(v.id).now;
    const L2 = G.S.loc; if (seen) { L2.k = 'out'; delete L2.b; delete L2.floor; L2.x = seen.x; L2.y = seen.y + 1; }
    return { seen: !!seen, at: seen ? [Math.round(seen.x), Math.round(seen.y)] : null, st };
  }, pick);
  console.log('WALK', JSON.stringify(walk));
  await p.waitForTimeout(1500); await shot('walking');
  // 家の中にいる(昼)・話す
  const home = await p.evaluate((pk) => {
    const G = NLS.G, v = pk.v; G.S.day = pk.d; G.S.min = v.arrive + 60;
    // 集合住宅は迎える世帯の住戸の階(主人公の家なら主人公の住戸)
    let fl = 0; try { const rg = NLS.nav.registry(G, v.hb); if (rg && rg.units) { const ui = rg.units.findIndex(u => u && u.hh && u.hh.includes(v.host)); if (ui >= 0) fl = 1000 + (Math.floor(ui / rg.plan.perFloor) + 1) * 100 + ui % rg.plan.perFloor; } } catch (e) { }
    const I = NLS.nav.interiorOf(G, v.hb, fl).I;
    const inside = NLS.C.indoor(v.hb, I, fl).some(q => q.id === v.id);
    const facts = NLS.talkFacts(G, v.id).map(f => f.say + ' [' + f.why + ']');
    const st = NLS.nav.npcStatus(v.id);
    const rel = NLS.tiesOf(G.world, G.hero.id, v.id).map(t => t.rel || t.k);
    const L = G.S.loc; L.k = 'in'; L.b = v.hb; L.floor = fl; L.x = I.door.x + 0.5; L.y = I.door.y - 1.5;
    G.S.min = v.leave + Math.round(v.wm / 2); const back = NLS.nav.npcStatus(v.id).now;
    G.S.min = v.arrive + 60;
    return { inside, facts, now: st.now, who: st.who, rel, back };
  }, pick);
  console.log('HOME', JSON.stringify(home));
  await p.waitForTimeout(3500);
  const seenUI = await p.evaluate((id) => ({ ui: (NLS.U.people || []).some(q => q.id === id), loc: [NLS.G.S.loc.k, NLS.G.S.loc.b, NLS.G.S.loc.floor] }), pick.v.id);
  console.log('UI', JSON.stringify(seenUI));
  await shot('inside');
  if (!seenUI.ui || !walk.seen || !/歩いて/.test(walk.st) || !home.inside || !home.facts.some(f => /帰省|正月/.test(f)) || !/家にいます/.test(home.now) || !/帰る/.test(home.back)) throw new Error('outside relatives visit not shown');
};
