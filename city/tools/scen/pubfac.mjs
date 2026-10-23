import { startTrial } from './lib.mjs';
// 公共施設の作り直し: 警察署・消防署・市役所・裁判所・介護施設・福祉施設・研究所。
// 全部の階が作れて階段でつながり、職員の立ち位置が職の枠(働く人)の数に足りること。v11 の操作の設備(窓口・留置室・裁判官席)が残ること。各施設を撮る
export default async (p, shot) => {
  await startTrial(p);
  const TYPES = ['police', 'fire', 'cityhall', 'court', 'nursing', 'welfare', 'lab'];
  const r = await p.evaluate((TYPES) => {
    const G = NLS.G, B = G.world.map.buildings, N = NLS.nav, out = {};
    for (const t of TYPES) {
      const b = B.find(q => q.type === t && !q.tenant && q.campusOf == null);
      if (!b) { out[t] = { missing: true }; continue; }
      const lr = N.levelRange(b); let staff = 0, seats = 0, stairsOk = true, objs = new Set(), area = 0, err = null;
      try {
        for (let f = lr.lo; f <= lr.hi; f++) {
          const R = N.interiorOf(G, b.idx, f), I = R.I; staff += I.staffSpots.length; seats += (I.seatSpots || []).length;
          for (let k = 0; k < I.W * I.H; k++) if (!R.solid[k]) area++;
          for (const o of I.objs) objs.add(o.t + ':' + (o.act || ''));
          const need = (f > lr.lo ? 1 : 0) + (f < lr.hi ? 1 : 0); if ((I.stairs || []).length < need) stairsOk = false;
        }
      } catch (e) { err = e.message; }
      const slots = Object.values(NLS.BTYPES[t].slots || {}).reduce((a, c) => a + c, 0);
      out[t] = { b: b.idx, name: b.name, fp: b.w + 'x' + b.h, site: b.siteI != null, floors: lr.hi - lr.lo + 1, area, staff, slots, seats, stairsOk, hall: objs.has('counter:hall'), cell: [...objs].some(x => x.startsWith('cell')), judge: [...objs].some(x => x.startsWith('judgebench')), truck: [...objs].some(x => x.startsWith('firetruck')), bed: [...objs].some(x => x.startsWith('bed')), err };
    }
    return out;
  }, TYPES);
  for (const t of TYPES) console.log('PUB', t, JSON.stringify(r[t]));
  const bad = TYPES.filter(t => { const x = r[t]; return !x || x.missing || x.err || !x.stairsOk || x.staff < x.slots * 0.6; });
  if (!r.cityhall.hall || !r.police.cell || !r.court.judge || !r.fire.truck || !r.nursing.bed) bad.push('equipment');
  for (const [t, f] of [['police', 0], ['police', 1], ['fire', 0], ['cityhall', 0], ['cityhall', 4], ['court', 0], ['nursing', 1], ['lab', 1]]) {
    await p.evaluate(([b, f]) => { const G = NLS.G, L = G.S.loc; L.k = 'in'; L.b = b; L.floor = f; const I = NLS.nav.interiorOf(G, b, f).I; L.x = (I.W >> 1) + 0.5; L.y = I.H - 4.5; G.S.min = 11 * 60; NLS.U.cwAt = -999; }, [r[t].b, f]);
    await p.waitForTimeout(1800); await shot(t + '_' + f);
  }
  if (bad.length) throw new Error('public facility problem: ' + bad.join(','));
};
