import { startTrial } from './lib.mjs';
// 銭湯・日帰り温泉: 各階(受付・男湯・女湯・家族風呂)と外観の画面確認・入浴の操作
export default async (p, shot) => {
  await startTrial(p);
  for (const t of ['sento', 'onsenbath']) {
    const fl = await p.evaluate((t) => { const G = NLS.G, b = G.world.map.buildings.find(q => q.type === t); G.S.min = 16 * 60; const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0; const out = []; for (let f = 0; f < 4; f++) { try { const { I } = NLS.nav.interiorOf(G, b.idx, f); const k = {}; for (const o of I.objs) k[o.t] = (k[o.t] || 0) + 1; out.push({ f, W: I.W, H: I.H, label: I.label, objs: k }); } catch (e) { } } return { name: b.name, idx: b.idx, fl: out }; }, t);
    console.log(t.toUpperCase(), JSON.stringify(fl));
    for (const f of fl.fl.map(x => x.f)) {
      await p.evaluate(([i, f]) => { const G = NLS.G, L = G.S.loc; L.k = 'in'; L.b = i; L.floor = f; const { I } = NLS.nav.interiorOf(G, i, f); L.x = (I.door && I.door.x > 0 ? I.door.x : I.W / 2) + 0.5; L.y = I.H - 2.5; NLS.U.cwAt = -999; }, [fl.idx, f]);
      await p.waitForTimeout(1200); await shot(t + '_f' + f);
    }
  }
  // 入浴の手順(主人公): 女湯へ → 洗い場で体を洗う → 大きな湯船に入る → 露天風呂(温泉)
  const pick = (txt) => p.evaluate((txt) => { const b = [...document.querySelectorAll('#card button.item')].find(b => b.textContent.includes(txt) && !b.disabled); if (b) b.click(); return b ? b.textContent : [...document.querySelectorAll('#card button.item')].map(b => b.textContent).join(' | '); }, txt);
  const go = async (sel) => { await p.evaluate((sel) => { const G = NLS.G, { I } = NLS.nav.interiorOf(G, G.S.loc.b, G.S.loc.floor); const o = I.objs.find(o => eval(sel)); NLS.nav.navTo({ kind: 'obj', o }); globalThis.__NAVSPEED = 3; }, sel); for (let i = 0; i < 40 && !(await p.evaluate(() => NLS.U.modal)); i++) await p.waitForTimeout(400); };
  const st = await p.evaluate(() => { const G = NLS.G, b = G.world.map.buildings.find(q => q.type === 'onsenbath'); const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 2; const { I } = NLS.nav.interiorOf(G, b.idx, 2); L.x = 8.5; L.y = I.H - 3.5; NLS.U.cwAt = -999; return { fem: G.world.isFem(G.hero.id), label: I.label }; });
  console.log('HERO', JSON.stringify(st));
  await go("o.act === 'wash'"); console.log('wash', await pick('体を洗う'));
  await p.waitForTimeout(800); await p.evaluate(() => { NLS.U.modal = null; document.getElementById('modal').classList.remove('on'); });
  await go("o.t === 'fx_yubune' && o.kind === 'onsen'"); const r1 = await pick('湯船に入る'); console.log('bath', r1, await p.evaluate(() => document.getElementById('toast').textContent.slice(0, 60)));
  await p.waitForTimeout(1500); await shot('hero_bath');
  if (!/湯船に入る/.test(r1)) throw new Error('could not take a bath in the big tub');
};
