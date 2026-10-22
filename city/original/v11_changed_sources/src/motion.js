// 主人公の移動・衝突・出入り(屋外/屋内)・階段・干渉対象の探索。DOM非依存でテスト可能。
import { stepLevel, tryBoard } from './hiway.js';
import { enterBlock, leashBlock, LEASH_MSG } from './minor.js';
import { BTYPES } from './data.js';
import { buildInterior, interiorSolid, hasElevator } from './interior.js';
import { NEED } from './world.js';
import { tickTransit, startEsc, bindInterior } from './lift.js';
import { UNIT_BASE, isUnitFloor, decodeUnit, unitCode } from './units.js';
import { bigKind } from './interior_big.js'; import { eraBucket } from './interior.js';
import { inviteIfAny } from './gathering.js'; import { isOpenFor } from './actions.js'; import { speedMult, parkMoto, parkBike } from './vehicle.js'; import { driveTick, parkHere, curCar } from './cars.js';
function parkHereAt(g, b) { const c = curCar(g.hero); if (!c) return; c.parked = { x: b.doorX + 0.5 + 1.6, y: b.doorY + 1.1, d: 0, b: b.idx, where: b.name + 'の前' }; }

import { trainsAt } from './transit.js'; import { T } from './map.js';
// 踏切: 列車が近づくと遮断機が下りる(isorender と同じ半径12)。渡り始めは止められ、すでに踏切の中にいる人は出られる。
let _tc = { g: null, t: -1, v: [] };
export function trainNear(g, x, y, r = 12) { if (!g.tr) return false; const t = g.absMin(); if (_tc.g !== g || _tc.t !== t) _tc = { g, t, v: trainsAt(g.tr, t) }; for (const q of _tc.v) if (Math.hypot(q.x - x, q.y - y) < r) return true; return false; }
export const CROSS_MSG = '遮断機が下りています。電車が通り過ぎるまで待ちましょう';
export const R = 0.27;
export function heroSpeed(g) {
  const nd = g.world.pop.needs[g.hero.id]; const a = g.age(); let v = 4.4;
  if (a < 9) v = 3.4; else if (a > 72) v = 3.1; else if (a > 60) v = 3.8;
  if (nd & NEED.WHEEL) v = Math.min(v, 3.7); if (nd & NEED.CANE) v = Math.min(v, 3.3);
  return v * speedMult(g);
}
const interiorCache = new Map();
export function interiorOf(g, bIdx, floor) { const b0 = g.world.map.buildings[bIdx]; const k = bIdx + ':' + floor + ':e' + eraBucket(g.year()) + (bigKind(b0) === 'condo' ? ':' + g.S.M + ':' + (g.hero.homeB === bIdx ? 1 : 0) : ''); let r = interiorCache.get(k); if (!r) { const b = b0; const I = buildInterior(b, floor, g); r = { I, solid: interiorSolid(I) }; interiorCache.set(k, r); } return r; }
export function clearInteriorCache() { interiorCache.clear(); }
bindInterior(g => interiorOf(g, g.S.loc.b, g.S.loc.floor).I);

function blockedOut(map, x, y) { const tx = Math.floor(x), ty = Math.floor(y); if (tx < 0 || ty < 0 || tx >= map.W || ty >= map.H) return true; return map.solid[tx + ty * map.W] === 1; }
function boxFreeOut(map, x, y) { return !(blockedOut(map, x - R, y - R) || blockedOut(map, x + R, y - R) || blockedOut(map, x - R, y + R * 0.2) || blockedOut(map, x + R, y + R * 0.2)); }
function blockedIn(I, s, x, y) { const tx = Math.floor(x), ty = Math.floor(y); if (tx < 0 || ty < 0 || tx >= I.W || ty >= I.H) return true; return s[tx + ty * I.W] === 1; }
function boxFreeIn(I, s, x, y) { return !(blockedIn(I, s, x - R, y - R * 0.3) || blockedIn(I, s, x + R, y - R * 0.3) || blockedIn(I, s, x - R, y + R * 0.3) || blockedIn(I, s, x + R, y + R * 0.3)); }

// 戻り値: {moved, entered?, exited?, msg?}
export function moveHero(g, ix, iy, dt, run = false) {
  const L = g.S.loc; const res = { moved: false }; if (!g.canWalk()) return res;
  if (L.tr && L.k === 'in') { const tr = tickTransit(g, dt, !!(ix || iy)); return tr || res; }   // エレベーター/エスカレーターの乗車中は操作できない
  if (ix === 0 && iy === 0) return res;
  const len = Math.hypot(ix, iy); ix /= len; iy /= len; const sp = heroSpeed(g) * (run ? 1.35 : 1) * dt;
  if (Math.abs(ix) > Math.abs(iy)) L.f = ix > 0 ? 'r' : 'l'; else L.f = iy > 0 ? 'd' : 'u';
  const nx = L.x + ix * sp, ny = L.y + iy * sp;
  if (L.k === 'out') {
    const map = g.world.map; const ride0 = g.hero.veh && g.hero.veh.ride; const isCar = ride0 === 'car' || ride0 === 'test';
    if (L.lv) { const lr = stepLevel(g, L, ix, iy, sp, isCar ? 'car' : ride0); if (lr) { res.moved = lr.moved; if (res.moved && ride0 === 'car') { const dr = driveTick(g, sp); if (dr) { res.msg = dr.msg; res.dismounted = true; } } return res; } }
    if (leashBlock(g, nx, ny)) { res.msg = LEASH_MSG; return res; }
    const gAt = (x, y) => { const tx = Math.floor(x), ty = Math.floor(y); return tx < 0 || ty < 0 || tx >= map.W || ty >= map.H ? -1 : map.ground[tx + ty * map.W]; };
    const xBlock = (x, y) => gAt(x, y) === T.CROSSING && gAt(L.x, L.y) !== T.CROSSING && trainNear(g, x, y);   // 渡り始めのみ止める
    if (boxFreeOut(map, nx, L.y) && !xBlock(nx, L.y)) { L.x = nx; res.moved = true; } else if (xBlock(nx, L.y)) res.msg = CROSS_MSG;
    if (boxFreeOut(map, L.x, ny) && !xBlock(L.x, ny)) { L.y = ny; res.moved = true; } else if (xBlock(L.x, ny)) res.msg = CROSS_MSG;
    if (res.moved) tryBoard(g, L, ix, iy, isCar ? 'car' : ride0);
    if (res.moved && g.hero.veh && g.hero.veh.ride === 'car') { const dr = driveTick(g, sp); if (dr) { res.msg = dr.msg; res.dismounted = true; } }   // 走行距離・燃料(ガス欠で降ろす)
    // 玄関に向かって歩く → 入る
    if (iy < 0) { const tx = Math.floor(L.x), ty = Math.floor(L.y - R - 0.16); const bi = (tx >= 0 && ty >= 0 && tx < map.W && ty < map.H) ? map.bid[tx + ty * map.W] : -1; if (bi >= 0) { const b = map.buildings[bi]; if (b.doorX === tx && b.doorY - 1 === ty) { const r = tryEnter(g, bi); if (r.ok) res.entered = bi; else if (r.directory != null) res.directory = r.directory; else res.msg = r.msg; } } }
  } else {
    const { I, solid } = interiorOf(g, L.b, L.floor);
    const stepOk = (x, y) => boxFreeIn(I, solid, x, y) || (y >= I.H - 1.5 && Math.abs(x - (I.door.x + 0.5)) < 0.7 && y < I.H + 0.2);
    if (stepOk(nx, L.y)) { L.x = nx; res.moved = true; } if (stepOk(L.x, ny)) { L.y = ny; res.moved = true; }
    if (L.y >= I.H - 0.6 && Math.abs(L.x - (I.door.x + 0.5)) < 0.8) { if (isUnitFloor(L.floor)) { leaveUnit(g); res.floor = L.floor; return res; } if (L.floor !== 0) { res.msg = '出口は1階にあります。階段・エレベーターで1階へ降りましょう'; L.y = I.H - 1.3; return res; } exitBuilding(g); res.exited = true; return res; }
    if (L.sl) { const q = L.sl; if (q.f !== L.floor || q.b !== L.b || Math.hypot(L.x - q.x, L.y - q.y) > 1.9) L.sl = null; }   // 階の移動直後は、階段から離れるまで再び反応しない(押し続けても行き来しない)
    for (const o of I.objs) if (!L.sl && o.act === 'stairs' && Math.floor(L.x) === o.x && Math.floor(L.y) === o.y) { const b = g.world.map.buildings[L.b]; const nd = g.world.pop.needs[g.hero.id]; if (o.gate && !bathGateOk(g, o.gate)) { res.msg = o.gate === 'K' ? '家族風呂(貸切)は12歳未満のかたは保護者同伴が必要です(この版では未対応)' : o.gate === 'M' ? 'ここは男湯です。あなたの設定(性別)では女湯のほうへどうぞ' : 'ここは女湯です。あなたの設定(性別)では男湯のほうへどうぞ'; L.y += 0.6; } else if ((nd & NEED.WHEEL) && !hasElevator(b)) { res.msg = '階段しかないため、車いすでは上がれません(この建物にはエレベーターがありません)'; L.y += 0.6; } else { changeFloor(g, o.to, o.t === 'stairs_up' ? 'down' : 'up', o.via); res.floor = o.to; } break; }
    if (!L.sl && !L.tr) for (const o of I.objs) if (o.t === 'esc' && o.enter && Math.floor(L.x) === o.enter.x && Math.floor(L.y) === o.enter.y && Math.abs(L.x - (o.enter.x + 0.5)) < 0.45 && ((o.dir === 'up' && iy < -0.3) || (o.dir === 'down' && iy > 0.3))) { const er = startEsc(g, o); if (er.msg) res.msg = er.msg; if (er.ok) res.moved = true; else { L.y += o.dir === 'up' ? 0.5 : -0.5; } break; }
  }
  return res;
}
// 男湯/女湯の入口: 性別設定が男→男湯のみ/女→女湯のみ。その他・未設定・旧セーブは自分で選べる(施設側の仕組みで固定しない)
export const bathGateOk = (g, side) => { if (side === 'K') return g.age() >= 12; const sx = (g.hero.ident && g.hero.ident.sex) || 'u'; return sx === 'm' ? side === 'M' : sx === 'f' ? side === 'F' : true; };
// 階段・エレベーターで降り立つ位置が家具・植木の中にならないよう、いちばん近い歩ける升へ寄せる(2026-10-22 全数監査: ホテル71棟で2階に着くと植木の中に埋まって動けなかった)
export function freeNear(I, s, x, y) {
  const ok = (px, py) => boxFreeIn(I, s, px, py) && px > 0.4 && py > 0.4 && px < I.W - 0.4 && py < I.H - 0.4; if (ok(x, y)) return [x, y];
  for (let r = 1; r < 8; r++) for (let dy = r; dy >= -r; dy--) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const px = Math.floor(x) + dx + 0.5, py = Math.floor(y) + dy + 0.5; if (ok(px, py)) return [px, py]; }
  return [x, y];
}
export function changeFloor(g, to, from, via) {
  const L = g.S.loc; const { I, solid: sol0 } = interiorOf(g, L.b, to); const st = I.stairs.find(s => s.to === L.floor && (!via || s.via === via)) || I.stairs.find(s => s.to === L.floor) || I.stairs[0]; L.floor = to; if (st) { [L.x, L.y] = freeNear(I, sol0, st.x + 0.5, st.y + 1.6); L.sl = { f: to, b: L.b, x: st.x + 0.5, y: st.y + 0.5 }; } else { L.x = I.W / 2; L.y = I.H - 2; } L.f = 'd';
}
export function tryEnter(g, bIdx, direct = false) {
  const b = g.world.map.buildings[bIdx]; const bt = BTYPES[b.type]; if (b.type === 'gasstation') return { ok: false, gas: bIdx, msg: '' }; { const rd = g.hero.veh && (g.hero.veh.ride === 'car' || g.hero.veh.ride === 'test'); if (b.type === 'cardealer' && rd) return { ok: false, dealer: bIdx, msg: '' }; if (b.type === 'usedcar' && rd) return { ok: false, used: bIdx, msg: '' }; }   // 車に乗っているときは店先で、歩きならショールームへ入る
  if (!direct && b.tenants && b.tenants.length) return { ok: false, directory: bIdx, msg: '' };   // ビルは館内案内から入る施設を選ぶ
  if (!bt.enter) return { ok: false, msg: `${b.name}は立ち入れません(外から眺めるだけです)` };   // 立入不可(墓地・公園・倉庫・桟橋など)。A/歩行/案内/直接のどの経路もここを通る
  if (!bt.interior && !bigKind(b)) return { ok: false, msg: `${b.name}の内部はまだ作られていません(未実装)` };   // 内装の無い施設を事務室にしない
  { const mb = enterBlock(g, b, b.type); if (mb) return { ok: false, msg: mb }; }
  const chk = isOpenFor(g, b); if (!chk.ok) return chk;
  if (g.hero.veh) { if (g.hero.veh.ride === 'car') { parkHereAt(g, b); } else if (g.hero.veh.ride === 'moto') { parkMoto(g); } else if (g.hero.veh.ride === 'bicycle') { parkBike(g); } g.hero.veh.ride = null; } const L = g.S.loc; delete L.tr; delete L.z; L.k = 'in'; L.b = bIdx; L.floor = 0; const { I } = interiorOf(g, bIdx, 0); L.x = I.door.x + 0.5; L.y = I.H - 1.6; L.f = 'u'; g.S.stats.enters = (g.S.stats.enters || 0) + 1; try { inviteIfAny(g, bIdx); } catch (_) { } return { ok: true };
}
export function enterUnit(g, lv, pos) { const L = g.S.loc; if (L.k !== 'in') return false; L.floor = unitCode(lv, pos); const { I } = interiorOf(g, L.b, L.floor); L.x = I.door.x + 0.5; L.y = I.H - 1.6; L.f = 'u'; L.sl = null; return true; }
export function leaveUnit(g) { const L = g.S.loc; if (!isUnitFloor(L.floor)) return; const { lv, pos } = decodeUnit(L.floor); L.floor = lv; L.x = 2 + pos * 3 + 1.5; L.y = 6.4; L.f = 'd'; L.sl = { f: lv, b: L.b, x: L.x, y: 5.5 }; }
export function exitBuilding(g) { const L = g.S.loc; if (L.k !== 'in') return; delete L.tr; delete L.z; const b = g.world.map.buildings[L.b]; L.k = 'out'; L.x = b.doorX + 0.5; L.y = b.doorY + 0.6; L.f = 'd'; delete L.b; delete L.floor; }
// 干渉対象(向いている方向): door(屋外) / obj / npc
export function targetsFor(g, crowdList) {
  const L = g.S.loc; const out = []; const fx = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] }[L.f] || [0, 1];
  const score = (px, py, maxd) => { const dx = px - L.x, dy = py - L.y; const d = Math.hypot(dx, dy); if (d > maxd) return null; const dot = d < 0.01 ? 1 : (dx * fx[0] + dy * fx[1]) / d; if (dot < 0.15 && d > 0.8) return null; return d - dot * 0.5; };
  if (L.k === 'out') {
    const map = g.world.map;
    for (const b of map.buildings) { if (b.tenant) continue; { const bt0 = BTYPES[b.type]; if (bt0 && !bt0.enter && b.type !== 'gasstation') continue; } if (Math.abs(b.doorX - L.x) > 2 || Math.abs(b.doorY - L.y) > 2) continue; const s = score(b.doorX + 0.5, b.doorY + 0.5, 1.6); if (s != null) out.push({ kind: 'door', b: b.idx, s: s - 0.3, label: `${b.name}に入る` }); }
    // 自販機・ベンチ(装飾)
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const tx = Math.floor(L.x) + dx, ty = Math.floor(L.y) + dy; if (tx < 0 || ty < 0 || tx >= map.W || ty >= map.H) continue; const d = map.deco[tx + ty * map.W]; if (d === 2 || d === 3) { const s = score(tx + 0.5, ty + 0.5, 1.6); if (s != null) out.push({ kind: 'deco', d, x: tx, y: ty, s, label: d === 2 ? '自動販売機' : 'ベンチ' }); } }
    for (const w of crowdList || []) { const s = score(w.x, w.y, 1.7); if (s != null) out.push({ kind: 'npc', id: w.id, s: s - 0.2, label: g.nameOf(w.id) }); }
  } else {
    const { I } = interiorOf(g, L.b, L.floor);
    for (const o of I.objs) { if (!o.act || o.act === 'stairs') continue; const s = score(o.w ? Math.max(o.x + 0.5, Math.min(L.x, o.x + o.w - 0.5)) : o.x + 0.5, o.h ? Math.max(o.y + 0.5, Math.min(L.y, o.y + o.h - 0.5)) : o.y + 0.5, 1.7); if (s != null) out.push({ kind: 'obj', o, s, label: o.label || o.t }); }
    for (const w of crowdList || []) { const s = score(w.x, w.y, 1.7); if (s != null) out.push({ kind: 'npc', id: w.id, s: s - 0.2, label: g.nameOf(w.id), role: w.role }); }
  }
  out.sort((a, b) => a.s - b.s); return out;
}
