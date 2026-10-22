import { startTrial } from './lib.mjs';
// 動物園(改築)と生活音: 入園→獣舎→観察→もぐもぐタイム、近くの動物だけが鳴くこと(字幕で確認)
const pick = (p, txt) => p.evaluate((txt) => { const b = [...document.querySelectorAll('#card button.item')].find(b => b.textContent.includes(txt) && !b.disabled); if (b) b.click(); return b ? b.textContent : null; }, txt);
export default async (p, shot) => {
  await startTrial(p);
  await p.mouse.click(400, 200); // 音の再生許可(ユーザー操作)
  const info = await p.evaluate(() => {
    NLS.snd.unlock(); const G = NLS.G; G.S.min = 11 * 60 - 5;
    const b = G.world.map.buildings.find(q => q.type === 'zoo'); const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0;
    const { I } = NLS.nav.interiorOf(G, b.idx, 0); L.x = I.door.x + 0.5; L.y = I.H - 2.5; NLS.U.cwAt = -999;
    return { name: b.name, W: I.W, H: I.H, ex: I.objs.filter(o => o.t === 'fx_zooex').map(o => o.sp) };
  });
  console.log('ZOO', JSON.stringify(info));
  await p.waitForTimeout(1500); await shot('zoo_gate');
  const tk = await p.evaluate(() => { const G = NLS.G, { I } = NLS.nav.interiorOf(G, G.S.loc.b, 0); const o = I.objs.find(o => o.act === 'fx_zooticket'); NLS.nav.navTo({ kind: 'obj', o }); return !!o; });
  for (let i = 0; i < 30 && !(await p.evaluate(() => NLS.U.modal)); i++) await p.waitForTimeout(500);
  console.log('ticket', await pick(p, '入園券を買う'), await p.evaluate(() => document.getElementById('toast').textContent));
  // ゾウの獣舎の前へ
  await p.evaluate(() => { const G = NLS.G, { I } = NLS.nav.interiorOf(G, G.S.loc.b, 0); const o = I.objs.find(o => o.sp === 'elephant'); NLS.nav.navTo({ kind: 'obj', o }); globalThis.__NAVSPEED = 3; });
  for (let i = 0; i < 40 && !(await p.evaluate(() => NLS.U.modal)); i++) await p.waitForTimeout(500);
  console.log('acts', await p.evaluate(() => [...document.querySelectorAll('#card button.item')].map(b => b.textContent).join(' | ')));
  console.log('feed', await pick(p, 'もぐもぐタイムを見る'), await p.evaluate(() => document.getElementById('toast').textContent.slice(0, 80)));
  await p.waitForTimeout(800);
  await p.evaluate(() => { globalThis.__capLog = []; });
  await p.waitForTimeout(12000);
  await shot('zoo_elephant');
  const st = await p.evaluate(() => { const s = NLS.snd.soundState(); return { btype: s.btype, zoo: (s.zooSp || []).map(z => z.sp + ':' + z.d.toFixed(0)), people: s.peopleN, caps: globalThis.__capLog || [] }; });
  console.log('SOUND zoo', JSON.stringify(st));
  // 駅(朝の改札階・ホーム)
  await p.evaluate(() => { const G = NLS.G; for (let k = 0; k < 7 && (G.date().dow < 1 || G.date().dow > 5); k++) G.advance(1440); G.S.min = 7 * 60 + 40; const b = G.world.map.buildings.find(q => q.type === 'station' && q.stationId === 'aoumi_chuo'); const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0; L.x = 20; L.y = 10; NLS.U.cwAt = -999; globalThis.__capLog = []; });
  await p.waitForTimeout(8000);
  console.log('SOUND concourse', JSON.stringify(await p.evaluate(() => { const s = NLS.snd.soundState(); return { commuters: s.commuterN, caps: globalThis.__capLog }; })));
  await p.evaluate(() => { const L = NLS.G.S.loc; L.floor = 1; L.x = 26.5; L.y = 9; NLS.U.cwAt = -999; globalThis.__capLog = []; });
  await p.waitForTimeout(62000);
  console.log('SOUND platform', JSON.stringify(await p.evaluate(() => { const s = NLS.snd.soundState(); return { platform: s.platform, caps: globalThis.__capLog }; })));
  // 商店街(昼・夜)
  await p.evaluate(() => { const G = NLS.G; G.S.min = 12 * 60; const L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; L.x = 337.5; L.y = 506.5; NLS.U.cwAt = -999; globalThis.__capLog = []; });
  await p.waitForTimeout(25000);
  console.log('SOUND street noon', JSON.stringify(await p.evaluate(() => { const s = NLS.snd.soundState(); return { walkN: s.walkN, open: s.openShopN, caps: globalThis.__capLog }; })));
  await p.evaluate(() => { NLS.G.S.min = 20 * 60 + 30; NLS.U.cwAt = -999; globalThis.__capLog = []; });
  await p.waitForTimeout(20000);
  console.log('SOUND street night', JSON.stringify(await p.evaluate(() => { const s = NLS.snd.soundState(); return { walkN: s.walkN, open: s.openShopN, izk: s.izakayaN, caps: globalThis.__capLog }; })));
};
