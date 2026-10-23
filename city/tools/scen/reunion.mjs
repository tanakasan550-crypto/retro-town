import { startTrial } from './lib.mjs';
// 何十年ぶりの再会: 主人公の人生を約25年すすめ、高校の最後の組が同じだった同級生(街に住む大人)と話す。
// 在籍記録と最後の組・その年の担任(職歴から)・日記の行事・いまの職場と家族・ほかの同級生の消息が根拠つきで出ること、
// 日記に「〇年ぶりに再会した」が残り、もう一度話すと同じ再会の話を繰り返さないこと。セーブの往復で組の記録が残ること
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, h = G.hero;
    const t0 = G.year();
    G.skipTo(G.S.M + 12 * 25, false);
    // 高校の同じ組・同じ学年(在籍記録と最後の組の記録)
    const hs = P.sch4[h.id], ck = P.cls4[h.id], coh = Math.floor((P.born[h.id] - 3) / 12);
    const mates = [];
    for (let i = 0; i < P.n; i++) if (i !== h.id && !P.gone[i] && P.home[i] >= 0 && P.sch4[i] === hs && Math.floor((P.born[i] - 3) / 12) === coh && P.cls4[i] === ck) mates.push(i);
    const id = mates.find(i => !h.rel[i]) ?? mates[0];
    if (id == null) return { hs, ck, mates: 0 };
    const facts = (() => { G._talkGap = { id, gapM: null }; const f = NLS.talkFacts(G, id); G._talkGap = null; return f.map(x => `${x.pri}| ${x.say} [${x.why}]`); })();
    const said = [];
    for (let k = 0; k < 3; k++) { const res = NLS.runAction(G, 'chat', { id }); said.push(String(res.msg).slice(0, 160)); }
    const diary = G.S.log.filter(e => e.ev === 'reunion').map(e => e.text);
    const N = NLS.nav, G2 = N.Game.load(N.fromJSON(N.toJSON(G.serialize())));
    return { years: G.year() - t0, heroAge: G.age(), hs: w.map.buildings[hs] && w.map.buildings[hs].name, ck: ck + 1, mates: mates.length, id, name: G.nameOf(id), facts, said, diary, saved: G2.world.pop.cls4[id] === P.cls4[id] && G2.world.pop.cls4[h.id] === ck };
  });
  console.log('REUNION', JSON.stringify(r, null, 1));
  if (!r.mates || !r.facts.some(f => f.startsWith('3|') && /年ぶり|ひさしぶり/.test(f)) || !r.diary.length || !r.saved) throw new Error('reunion not working');
  // 2回目以降は別の話題(同じ根拠を続けない)
  if (new Set(r.said.map(s => (s.match(/根拠: ([^)]*)/) || [])[1])).size < 2) throw new Error('reunion talk repeats');
};
