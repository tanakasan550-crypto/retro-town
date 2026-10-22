import { startTrial } from './lib.mjs';
// 通り視点: 昼の商店街(昭和町商店街)で、来客の流れが温まってから歩きながら撮影
export default async (p, shot) => {
  await startTrial(p);
  const where = await p.evaluate(() => {
    const G = NLS.G; G.S.min = 12 * 60;
    const L = G.S.loc; L.k = 'out'; delete L.b; delete L.floor; L.x = 337.5; L.y = 506.5; L.f = 'r'; NLS.U.cwAt = -999; NLS.U.scale = 0.25;
    return 'ok';
  });
  await p.waitForTimeout(9000);
  await p.evaluate(() => NLS.setStreet(true));
  await p.waitForTimeout(1500);
  console.log('walkers', await p.evaluate(() => (NLS.R.walkers || []).length + ' near15:' + (NLS.R.walkers || []).filter(w => Math.abs(w.x - NLS.G.S.loc.x) < 15 && Math.abs(w.y - NLS.G.S.loc.y) < 15).length));
  await shot('street_0');
  const t0 = Date.now(); let frames0 = await p.evaluate(() => NLS.R.time);
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(1200); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(300);
  await shot('street_1');
  await p.keyboard.down('ArrowLeft'); await p.waitForTimeout(800); await p.keyboard.up('ArrowLeft');
  await shot('street_2');
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(2000); await p.keyboard.up('ArrowUp');
  await shot('street_3');
  console.log(await p.evaluate(() => JSON.stringify({ loc: [NLS.G.S.loc.x.toFixed(1), NLS.G.S.loc.y.toFixed(1)], street: NLS.R.street })));
  await p.evaluate(() => { NLS.G.S.min = 19 * 60 + 30; NLS.U.cwAt = -999; }); await p.waitForTimeout(4000); await shot('street_night');
};
