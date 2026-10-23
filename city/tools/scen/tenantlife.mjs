import { startTrial } from './lib.mjs';
// オフィスビルの入居企業の入れ替わり(15年): 退去(社員は職歴に「解雇」が残り職探しへ)・空室・新しい年代の企業の入居(新しい事業ID・自分の職の枠)。
// 床面積の定員を超えない・退去した企業の枠は誰も雇わない・セーブの往復で記録が残る。主人公がビルの空室を借りて開業し、閉店すると空室に戻る
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, P = w.pop, B = w.map.buildings, T = NLS.ten;
    const offs = B.filter(b => T.isTenantOffice(b));
    const kinds = (L) => { const o = {}; for (const t of L) if (!t.vacant) o[t.kindName] = (o[t.kindName] || 0) + 1; return o; };
    const all = () => offs.flatMap(b => T.officeTenants(w, b));
    const k0 = kinds(all()), ids0 = new Set(all().map(t => t.id)), y0 = G.year(), vac0 = all().filter(t => t.vacant).length;
    G.skipTo(G.S.M + 12 * 15, false);
    const L1 = all(), k1 = kinds(L1);
    const dev = (w.dev || []).filter(e => e.kind === 'tenant_close' || e.kind === 'tenant_open');
    const closes = dev.filter(e => e.kind === 'tenant_close'), opens = dev.filter(e => e.kind === 'tenant_open');
    // 定員
    const over = offs.filter(b => T.officeTenants(w, b).reduce((a, t) => a + (t.vacant ? 0 : t.staff), 0) > T.floorCap(b) * T.officeFloors(b)).length;
    // 退去した企業の枠は誰も雇っていない
    let fzBad = 0, fzN = 0; for (const [bi, L] of Object.entries(w.bizFz || {})) for (const s of L) { fzN++; if (w.slots.who[s] >= 0 || w.vacant.includes(s)) fzBad++; }
    // 新しい企業: 新しい事業ID・社員がいる
    const newCos = L1.filter(t => !t.vacant && !ids0.has(t.id));
    const staffOf = new Map(); for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.work[i] >= 0) { const t = T.bizOfPerson(w, i); if (t) staffOf.set(t.id, (staffOf.get(t.id) || 0) + 1); }
    // 開業から2年以上たった企業に社員がいる(開いたばかりの企業は募集中)
    const newOld = newCos.filter(t => t.from <= G.year() - 2), newStaffed = newOld.filter(t => staffOf.get(t.id) > 0).length;
    // 解雇された人の職歴
    let laid = 0, laidRe = 0; for (const [id, pr] of w.prof) { const L = (pr.hist || []).filter(e => e.k === 'laid' && e.M >= (y0 - 1900) * 12); if (L.length) { laid++; if (P.work[id] >= 0) laidRe++; } }
    // セーブの往復
    const N = NLS.nav, G2 = N.Game.load(N.fromJSON(N.toJSON(G.serialize())));
    const sv1 = JSON.stringify(G2.world.bizOv) === JSON.stringify(w.bizOv), sv2 = JSON.stringify(G2.world.bizFz) === JSON.stringify(w.bizFz);
    const saved = sv1 && sv2 && offs.every(b => JSON.stringify(T.officeTenants(G2.world, G2.world.map.buildings[b.idx]).map(t => t.id)) === JSON.stringify(T.officeTenants(w, b).map(t => t.id)));
    // 主人公がビルの空室を借りて開業する
    G.hero.money = Math.max(G.hero.money, 5e7);
    const st = NLS.firm.sites(G, 'travel', 30).filter(s => s.sec);
    let lease = null;
    if (st.length) {
      const s0 = st[0], res = NLS.firm.openFirm(G, 'travel', s0.b, '架空トラベル');
      const t = T.officeTenants(w, B[s0.b]).find(x => x.key === s0.sec);
      const f = (G.hero.firms || []).find(f2 => f2.name === '架空トラベル');
      const cl = f ? NLS.firm.closeFirm(G, f.id) : null;
      const t2 = T.officeTenants(w, B[s0.b]).find(x => x.key === s0.sec);
      lease = { site: s0.name, ok: res.ok, msg: res.msg, tenant: t && { name: t.name, hero: t.hero, kind: t.kindName }, closed: cl && cl.ok, vacantAfter: t2 && t2.vacant };
    }
    return { y0, y1: G.year(), vac0, vac1: L1.filter(t => t.vacant).length, k0, k1, closes: closes.length, opens: opens.length, ex: dev.slice(-4).map(e => `${e.y} ${e.text} [${e.ev}]`), over, fzN, fzBad, newCos: newCos.length, newOld: newOld.length, newStaffed, laid, laidRe, saved, sites: st.length, lease };
  });
  console.log('TENLIFE', JSON.stringify(r, null, 1));
  if (!r.closes || !r.opens || r.over || r.fzBad || !r.newCos || r.newStaffed < r.newOld * 0.7 || !r.laid || !r.saved) throw new Error('tenant turnover not working');
  if (!r.lease || !r.lease.ok || !r.lease.tenant || !r.lease.tenant.hero || r.lease.tenant.name !== '架空トラベル' || !r.lease.closed || !r.lease.vacantAfter) throw new Error('hero lease not working');
};
