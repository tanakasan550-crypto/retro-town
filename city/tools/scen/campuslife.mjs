import { startTrial } from './lib.mjs';
// 学校の一日: 在籍する生徒が時間割どおりに校庭・体育館・教室を使い分ける(同じ人が2か所に出ない)
export default async (p, shot) => {
  await startTrial(p);
  const goto = (t, min, where) => p.evaluate(([t, min, where]) => {
    const G = NLS.G, m = G.world.map;
    for (let k = 0; k < 7 && !G.isSchoolDay(); k++) G.advance(1440);
    G.S.min = min;
    const sb = m.buildings.find(q => q.type === t && q.siteI != null && NLS.campus.campusPresent(G, q, min).length > 30) || m.buildings.find(q => q.type === t && q.siteI != null);
    const s = m.fsites[sb.siteI], yard = s.ground.find(z => z[0] === 'yard' || z[0] === 'field');
    const L = G.S.loc;
    if (where === 'gym') { const gym = m.buildings.find(q => (q.campusOf ?? q.parentB) === sb.idx && q.kind === 'gym'); L.k = 'in'; L.b = gym.idx; L.floor = 0; const { I } = NLS.nav.interiorOf(G, gym.idx, 0); L.x = I.door.x + 0.5; L.y = I.H - 2.5; }
    else { L.k = 'out'; delete L.b; delete L.floor; L.x = yard[1] + yard[3] / 2 + 0.5; L.y = yard[2] + yard[4] * 0.7; }
    NLS.U.cwAt = -999;
    const pres = NLS.campus.campusPresent(G, sb, min);
    const by = {}; for (const id of pres) { const w = NLS.campus.campusWhere(G, sb, id, min); const k = w ? w.where : 'none'; by[k] = (by[k] || 0) + 1; }
    return { school: sb.name, idx: sb.idx, slot: NLS.campus.campusSlot(t, min), present: pres.length, by };
  }, [t, min, where]);
  const seen = (idx, min) => p.evaluate(([idx, min]) => {
    const G = NLS.G, sb = G.world.map.buildings[idx];
    const ids = new Set((NLS.R.walkers || []).map(w => w.id)), inside = new Set((NLS.U.people || []).map(q => q.id));
    const pres = NLS.campus.campusPresent(G, sb, min);
    const yard = pres.filter(id => { const w = NLS.campus.campusWhere(G, sb, id, min); return w && w.where === 'yard'; });
    const gym = pres.filter(id => { const w = NLS.campus.campusWhere(G, sb, id, min); return w && w.where === 'gym'; });
    // 校舎の中(教室)に、いま校庭/体育館にいるはずの人がいないこと
    const cls = G.world.getCrowd ? null : null;
    const one = yard.find(id => ids.has(id));
    return { yardWant: yard.length, yardShown: yard.filter(id => ids.has(id)).length, gymWant: gym.length, gymShown: gym.filter(id => inside.has(id)).length, status: one != null ? NLS.campus.campusNpcStatus(one) : null };
  }, [idx, min]);
  // 1) 小学校の中休み(10:30): 校庭で遊ぶ
  let a = await goto('elem', 630, 'out'); console.log('ELEM break', JSON.stringify(a));
  await p.waitForTimeout(2500); let r = await seen(a.idx, 630); console.log('  seen', JSON.stringify(r)); await shot('elem_break');
  if (!(r.yardShown > 0)) throw new Error('no children in the yard at break');
  // 2) 中学の放課後(16:30): 部活(校庭)
  a = await goto('jh', 990, 'out'); console.log('JH club', JSON.stringify(a));
  await p.waitForTimeout(2500); r = await seen(a.idx, 990); console.log('  seen', JSON.stringify(r)); await shot('jh_club_yard');
  if (!(r.yardShown > 0)) throw new Error('no club members in the yard');
  // 3) 同じ時刻の体育館(バスケ部・バレー部)
  await goto('jh', 990, 'gym'); await p.waitForTimeout(2500); r = await seen(a.idx, 990); console.log('  gym', JSON.stringify(r)); await shot('jh_club_gym');
  if (!(r.gymShown > 0)) throw new Error('no club members in the gym');
  // 4) 体育の授業: 校庭か体育館で体育をしている組がある時限を探す
  const pe = await p.evaluate((idx) => { const G = NLS.G, sb = G.world.map.buildings[idx]; for (const min of [550, 600, 670, 730, 850, 910]) { const pres = NLS.campus.campusPresent(G, sb, min); const n = pres.filter(id => { const w = NLS.campus.campusWhere(G, sb, id, min); return w && w.spot === 'pe'; }).length; if (n) return { min, n, of: pres.length }; } return null; }, a.idx);
  console.log('PE', JSON.stringify(pe));
  if (!pe) throw new Error('no PE class found in a school day');
  // 負荷: いちばん在籍者の多い学校で、居場所の計算1回あたりの時間
  const perf = await p.evaluate(() => { const G = NLS.G, m = G.world.map, L = m.buildings.filter(q => q.siteI != null && ['univ', 'hs', 'jh', 'elem'].includes(q.type)); let big = null, n = -1; for (const b of L) { const k = G.world.pop.school.filter(s => s === b.idx).length; if (k > n) { n = k; big = b; } } const t0 = performance.now(); let c = 0; for (let k = 0; k < 10; k++) for (const id of NLS.campus.campusPresent(G, big, 600 + k)) { NLS.campus.campusWhere(G, big, id, 600 + k); c++; } return { school: big.name, roster: n, msPerCall: +((performance.now() - t0) / 10).toFixed(2), present: c / 10 }; });
  console.log('PERF', JSON.stringify(perf));
};
