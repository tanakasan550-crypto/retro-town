import { startTrial } from './lib.mjs';
// 朝の駅: 住民の通勤予定どおりにホーム(路線・方面別)と改札階に人がいるか
export default async (p, shot) => {
  await startTrial(p);
  const info = await p.evaluate(() => {
    const G = NLS.G; for (let k = 0; k < 7 && (G.date().dow < 1 || G.date().dow > 5); k++) G.advance(1440);
    G.S.min = 7 * 60 + 40;
    const b = G.world.map.buildings.find(q => q.type === 'station' && q.stationId === 'aoumi_chuo');
    const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 1; L.x = 26.5; L.y = 9; NLS.U.cwAt = -999; NLS.U.scale = 1;
    return b.name;
  });
  await p.waitForTimeout(3500);
  const a = await p.evaluate(() => ({ floor: NLS.G.S.loc.floor, people: NLS.U.people.length, commuters: NLS.U.people.filter(q => q.role === 'commuter').length }));
  console.log('PLATFORM', JSON.stringify(a));
  await shot('platform');
  await p.evaluate(() => { const L = NLS.G.S.loc; L.floor = 0; L.x = 20; L.y = 10; NLS.U.cwAt = -999; });
  await p.waitForTimeout(3500);
  const c = await p.evaluate(() => ({ floor: NLS.G.S.loc.floor, people: NLS.U.people.length, commuters: NLS.U.people.filter(q => q.role === 'commuter').length }));
  console.log('CONCOURSE', JSON.stringify(c));
  await shot('concourse');
};
