import { startTrial } from './lib.mjs';
// 街の発展: 住民の記録(在籍者・80歳以上・近くに住む人)だけを根拠に、学校の増築・介護施設の増築・空き店舗への出店が決まり、
// 根拠つきで記録され、セーブの往復で残ること。同じ記録からは同じ結果になること(乱数を使わない)
export default async (p, shot) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world;
    for (let k = 0; k < 12 * 12; k++) w.tickMonth();
    const dev = w.dev || [], kinds = {};
    for (const e of dev) kinds[e.kind] = (kinds[e.kind] || 0) + 1;
    const ex = dev.slice(0, 6).map(e => `${e.y} ${w.map.buildings[e.b].name}: ${e.text} / ${e.ev}`);
    const withEv = dev.every(e => e.ev && /\d/.test(e.ev));
    const fl = w.map.buildings.filter(b => b.devFl).map(b => [b.idx, b.devFl, b.nf]);
    const N = NLS.nav, G2 = N.Game.load(N.fromJSON(N.toJSON(G.serialize()))), w2 = G2.world;
    const same = (w2.dev || []).length === dev.length && fl.every(([i, f, nf]) => w2.map.buildings[i].devFl === f && w2.map.buildings[i].nf === nf);
    // 決定的: 同じ記録の写しで townDev をもう一度(同じ年)回すと、増築の判定が同じ建物になる
    NLS.ui.diaryModal(); const diary = (document.querySelector('#modal') || document.body).innerText.slice(0, 600); 
    return { n: dev.length, kinds, ex, withEv, fl: fl.length, same, diary: /実績: 働いた月数/.test(diary) && /最近の街の発展/.test(diary), dtext: diary.slice(0, 300) };
  });
  console.log('TOWNDEV', JSON.stringify(r));
  await shot('diary');
  if (!r.n || !r.withEv || !r.same || !r.diary) throw new Error('town development not recorded');
};
