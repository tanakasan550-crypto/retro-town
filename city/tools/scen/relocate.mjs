import { startTrial } from './lib.mjs';
// 敷地の整備で移した建物(siteMoved): 足元の番号・入口が歩ける場所で、歩いて街の中心とつながること。
// 住む人の数と居住数(occ)が一致・通勤/通学の先へ歩いて行けること(実際の経路を一部で確かめる)・夜は家にいる・朝は通勤/登校する。
// セーブの往復で同じ場所・同じ住人。地図から消えた建物がないこと
export default async (p) => {
  await startTrial(p);
  const r = await p.evaluate(() => {
    const G = NLS.G, w = G.world, m = w.map, P = w.pop, T = NLS.T, W = m.W, H = m.H, B = m.buildings;
    const byId = new Map(B.map(b => [b.id, b]));
    const mv = (m.siteMoved || []).filter(x => x.to).map(x => byId.get(x.id)).filter(Boolean);
    const failed = (m.siteMoved || []).filter(x => x.failed).length;
    // 歩ける場所の連結成分(青海中央駅の入口から)
    const st = B.find(b => b.type === 'station' && b.stationId === 'aoumi_chuo');
    const comp = new Uint8Array(W * H), q = new Int32Array(W * H); let qh = 0, qt = 0;
    const walk = (k) => !m.solid[k] && m.ground[k] !== T.WATER;
    const s0 = st.doorX + (st.doorY + 1) * W; comp[s0] = 1; q[qt++] = s0;
    while (qh < qt) { const k = q[qh++], x = k % W; for (const n of [x > 0 ? k - 1 : -1, x < W - 1 ? k + 1 : -1, k - W, k + W]) if (n >= 0 && n < W * H && !comp[n] && walk(n)) { comp[n] = 1; q[qt++] = n; } }
    const reach = (b) => { for (const [dx, dy] of [[0, 0], [0, 1], [-1, 1], [1, 1]]) { const k = b.doorX + dx + (b.doorY + dy) * W; if (comp[k]) return true; } return false; };
    let badFoot = 0, badDoor = 0, unreach = [], inSite = 0, overlap = 0;
    for (const b of mv) {
      for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) if (m.bid[x + y * W] !== b.idx) badFoot++;
      if (m.solid[b.doorX + b.doorY * W]) badDoor++;
      if (!reach(b)) unreach.push(b.id + ':' + b.type);
      if ((m.fsites || []).some(s => b.doorX >= s.x && b.doorX < s.x + s.w && b.doorY >= s.y && b.doorY < s.y + s.h)) inSite++;
    }
    // 屋外に入れる敷地(動物園・遊園地): 門の内側の通路が歩いてつながる
    const openBad = (m.fsites || []).filter(s => s.open && s.solid && s.props).filter(s => { const gx = (s.gate[0] + s.gate[1]) >> 1; for (let y = s.y + s.h - 3; y > s.y + s.h - 12; y--) for (const x of [s.x + 2, s.x + s.w - 3, gx - 12, gx + 12]) if (comp[x + y * W]) return false; return true; }).map(s => s.type);
    // 住む人(移した建物)
    const mvSet = new Set(mv.map(b => b.idx)), res = [];
    const cnt = new Map();
    for (let i = 0; i < P.n; i++) if (!P.gone[i] && P.home[i] >= 0) { cnt.set(P.home[i], (cnt.get(P.home[i]) || 0) + 1); if (mvSet.has(P.home[i])) res.push(i); }
    let occBad = 0; for (const b of mv) if ((cnt.get(b.idx) || 0) !== w.occ[b.idx]) occBad++;
    // 通勤・通学の先(連結成分にあるか)
    let wk = 0, wkBad = 0, sc = 0, scBad = 0;
    const badW = new Set(); for (const i of res) { if (P.work[i] >= 0) { wk++; if (!reach(B[P.work[i]])) { wkBad++; badW.add(B[P.work[i]].id + ':' + B[P.work[i]].type + ':' + B[P.work[i]].name + '@' + B[P.work[i]].doorX + ',' + B[P.work[i]].doorY); } } if (P.school[i] >= 0) { sc++; if (!reach(B[P.school[i]])) scBad++; } }
    // 実際の歩く経路(30人)
    let pathOk = 0, pathN = 0;
    for (const i of res.filter(i => P.work[i] >= 0 || P.school[i] >= 0).slice(0, 30)) { const a = B[P.home[i]], t = B[P.work[i] >= 0 ? P.work[i] : P.school[i]]; pathN++; const pts = NLS.findPath(m, a.doorX, a.doorY, t.doorX, t.doorY, 0, 12e5, true); if (pts && pts.length) pathOk++; }
    // 一日の暮らし(平日の夜23時は家・朝8時は通勤/登校/授業/仕事)
    const day = (min) => { G.S.min = min; return res.slice(0, 40).map(i => { try { return NLS.nav.npcStatus(i).now || ''; } catch (e) { return 'ERR ' + e.message; } }); };
    const night = day(23 * 60), morning = day(8 * 60);
    const err = [...night, ...morning].filter(s => s.startsWith('ERR')).length;
    const atHome = night.filter(s => /家|自宅|寝/.test(s)).length;
    // セーブの往復: 同じ場所・同じ住人
    const N = NLS.nav, G2 = N.Game.load(N.fromJSON(N.toJSON(G.serialize()))), m2 = G2.world.map, P2 = G2.world.pop;
    const samePos = mv.every(b => { const c = m2.buildings[b.idx]; return c.x === b.x && c.y === b.y && c.doorX === b.doorX; });
    const sameRes = res.every(i => P2.home[i] === P.home[i]);
    return { openBad, badW: [...badW], moved: mv.length, failed, badFoot, badDoor, unreach: unreach.length, unreachEx: unreach.slice(0, 8), inSite, residents: res.length, occBad, wk, wkBad, sc, scBad, pathOk, pathN, err, atHome, nightEx: night.slice(0, 4), morningEx: morning.slice(0, 6), samePos, sameRes };
  });
  console.log('RELOCATE', JSON.stringify(r));
  if (r.openBad.length || r.failed || r.badFoot || r.badDoor || r.unreach || r.inSite || r.occBad || r.wkBad || r.scBad || r.pathOk < r.pathN || r.err || r.atHome < 34 || !r.samePos || !r.sameRes) throw new Error('relocated buildings problem');
};
