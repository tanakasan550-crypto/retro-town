import { startTrial } from './lib.mjs';
// 映画館・ボウリング場・ジム: 各階の中の作りと操作の確認(画面と物の一覧)
const TYPES = (process.env.TYPES || 'cinema,bowling,gym').split(',');
export default async (p, shot) => {
  await startTrial(p);
  for (const t of TYPES) {
    const info = await p.evaluate((t) => { const G = NLS.G, b = G.world.map.buildings.find(q => q.type === t && q.campusOf == null); G.S.min = 19 * 60; const out = []; for (let f = 0; f < 4; f++) { try { const { I } = NLS.nav.interiorOf(G, b.idx, f); const k = {}; for (const o of I.objs) k[o.t] = (k[o.t] || 0) + 1; out.push({ f, W: I.W, H: I.H, label: I.label, objs: k, acts: [...new Set(I.objs.map(o => o.act).filter(Boolean))] }); } catch (e) { } } return { name: b.name, idx: b.idx, w: b.w, h: b.h, fl: out }; }, t);
    console.log(t.toUpperCase(), JSON.stringify(info));
    const floors = [...new Set(info.fl.map(x => x.label + x.W))].length;
    for (const f of info.fl.slice(0, Math.max(1, floors)).map(x => x.f)) {
      await p.evaluate(([i, f]) => { const G = NLS.G, L = G.S.loc; L.k = 'in'; L.b = i; L.floor = f; const { I } = NLS.nav.interiorOf(G, i, f); L.x = (I.door && I.door.x > 0 ? I.door.x : I.W / 2) + 0.5; L.y = I.H - 2.5; NLS.U.cwAt = -999; }, [info.idx, f]);
      await p.waitForTimeout(1200); await shot(t + '_f' + f);
    }
  }
  // ボウリングのレーン・ジムのマシンで遊ぶ/鍛える操作が出ること
  for (const [t, objT, want] of [['bowling', 'lane', /ボウリング/], ['gym', 'treadmill', /トレーニング/]]) {
    if (!TYPES.includes(t)) continue;
    const a = await p.evaluate(([t, objT]) => { const G = NLS.G, b = G.world.map.buildings.find(q => q.type === t && q.campusOf == null); G.S.min = 19 * 60; const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0; const { I } = NLS.nav.interiorOf(G, b.idx, 0); const o = I.objs.find(o => o.t === objT); return NLS.bus.targetActions(G, { kind: 'obj', o }).map(x => x.label); }, [t, objT]);
    console.log('ACTS', t, JSON.stringify(a));
    if (!a.some(l => want.test(l))) throw new Error(t + ' play action missing');
  }
  // 映画: チケットを買い、その回のスクリーンの座席で観る
  if (TYPES.includes('cinema')) {
    const r = await p.evaluate(() => {
      const G = NLS.G, b = G.world.map.buildings.find(q => q.type === 'cinema'); G.S.min = 13 * 60 + 30;
      const L = G.S.loc; L.k = 'in'; L.b = b.idx; L.floor = 0; const { I } = NLS.nav.interiorOf(G, b.idx, 0);
      const tk = I.objs.find(o => o.act === 'fx_cticket'), info = I.objs.find(o => o.act === 'fx_cinfo');
      const sched = NLS.bus.runAction(G, 'cinfo', { kind: 'obj', o: info }).msg;
      const acts = NLS.bus.targetActions(G, { kind: 'obj', o: tk }); const a = acts.find(x => x.id.startsWith('cbuy:') && !x.disabled);
      const buy = NLS.bus.runAction(G, a.id, { kind: 'obj', o: tk }).msg;
      const c = G.S.cine; G.S.min = c.start + 5;
      const seat = I.objs.find(o => o.act === 'fx_cwatch' && o.scr === c.scr);
      L.x = seat.x + 0.5; L.y = seat.y + 0.5; NLS.U.cwAt = -999;
      const wa = NLS.bus.targetActions(G, { kind: 'obj', o: seat }).map(x => x.label);
      const other = I.objs.find(o => o.act === 'fx_cwatch' && o.scr !== c.scr);
      const wo = other ? NLS.bus.targetActions(G, { kind: 'obj', o: other }).map(x => x.label) : [];
      return { screens: I.cineN, sched, buy, watchHere: wa, watchOther: wo };
    });
    console.log('CINEMA FLOW', JSON.stringify(r));
    await p.waitForTimeout(2000); await shot('cinema_show');
    const end = await p.evaluate(() => { const G = NLS.G, { I } = NLS.nav.interiorOf(G, G.S.loc.b, 0); const c = G.S.cine; const seat = I.objs.find(o => o.act === 'fx_cwatch' && o.scr === c.scr); const r = NLS.bus.runAction(G, 'cwatch', { kind: 'obj', o: seat }); return { msg: r.msg, after: G.S.cine, min: G.S.min }; });
    console.log('WATCHED', JSON.stringify(end));
    if (!r.watchHere.some(l => /観る/.test(l)) || r.watchOther.some(l => /観る/.test(l)) || !/最後まで観ました/.test(end.msg)) throw new Error('cinema flow wrong');
  }
};
