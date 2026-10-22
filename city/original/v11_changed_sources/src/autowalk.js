// タップ自動移動(2026-10-23 代表者P0)。画面のタップ → 対象(人・建物の入口・屋内設備・出口・地面)の判定 → 実際の経路探索 → moveHero で一歩ずつ歩く。
//  座標ジャンプはしない: 壁・家具・踏切の遮断機・段差は moveHero(通常の歩行と同じ衝突判定)がそのまま効く。詰まったら再探索、別の場所をタップすれば目的地変更。
//  DOM非依存(テスト可能)。main.js は step() の中で AW.dir() を呼び、返ったベクトルを moveHero に渡す。
import { findPath, MODE } from './nav.js';
import { interiorOf, CROSS_MSG, R as HR } from './motion.js'; import { isUnitFloor } from './units.js';
import { T } from './map.js';
import { BTYPES } from './data.js';
import { worldDirToFacing } from './iso.js';

// ---- 画面→世界(地面からの高さ z[m]を仮定した逆変換)。屋外=R.P(Proj) / 屋内=R.ip
export function screenToGround(R, inside, sx, sy, z = 0) {
  if (inside) { const P = R.ip; if (!P) return null; const Z = P.Z, y = sy + z * 12 * Z; const a = (sx - P.ox) / (8 * Z), b = (y - P.oy) / (4 * Z); return [(a + b) / 2, (b - a) / 2]; }
  const P = R.P; if (!P) return null; const Z = P.Z, y = sy + z * 12 * Z; const a = (sx - P.x0) / (16 * Z), b = (y - P.y0) / (8 * Z); return [(a + b) / 2, (b - a) / 2];
}
const pxOf = (R, inside, u, v, z = 0) => { const P = inside ? R.ip : R.P; return [P.X(u, v), P.Y(u, v, z)]; };

// ---- タップの判定。戻り値: {kind:'npc'|'door'|'obj'|'exit'|'tile'|'deco', ...}
export function resolveTap(g, R, crowd, sx, sy) {
  const L = g.S.loc, map = g.world.map, inside = L.k === 'in'; const Zp = inside ? (R.ip && R.ip.Z) : (R.P && R.P.Z); if (!Zp) return null;
  // 人
  let best = null, bd = 1e9; for (const w of crowd || []) { const wx = w.x ?? w.cx, wy = w.y ?? w.cy; if (wx == null) continue; const [px, py] = pxOf(R, inside, wx, wy, 0.9); const dx = Math.abs(sx - px), dy = Math.abs(sy - py); if (dx < 0.55 * 16 * Zp && dy < 1.1 * 12 * Zp) { const d = dx + dy; if (d < bd) { bd = d; best = { kind: 'npc', id: w.id, x: wx, y: wy, label: g.nameOf ? g.nameOf(w.id) : '人' }; } } }
  if (best) return best;
  if (!inside) {
    // 建物(屋根・壁をタップしても建物と判定する: 高さを仮定した複数の逆変換で足跡に当たるか)
    let hit = null; for (let z = 0; z <= 16; z += 2) { const q = screenToGround(R, false, sx, sy, z); if (!q) continue; const tx = Math.floor(q[0]), ty = Math.floor(q[1]); if (tx < 0 || ty < 0 || tx >= map.W || ty >= map.H) continue; const bi = map.bid[tx + ty * map.W]; if (bi < 0) continue; const b = map.buildings[bi]; const hh = Math.max(3, (b.floors || 1) * 3.3 + 1); if (z <= hh) { if (!hit || z > hit.z) hit = { b: bi, z }; } }
    if (hit) { const b = map.buildings[hit.b]; const bt = BTYPES[b.type]; return { kind: 'door', b: hit.b, x: b.doorX, y: b.doorY, label: b.name, enter: !bt || bt.enter !== false }; }
    const q = screenToGround(R, false, sx, sy, 0); if (!q) return null; const tx = Math.floor(q[0]), ty = Math.floor(q[1]); if (tx < 0 || ty < 0 || tx >= map.W || ty >= map.H) return null;
    const d = map.deco[tx + ty * map.W]; if (d === 2 || d === 3) return { kind: 'deco', x: tx, y: ty, d, label: d === 2 ? '自動販売機' : 'ベンチ' };
    return { kind: 'tile', x: tx, y: ty };
  }
  const { I } = interiorOf(g, L.b, L.floor);
  // 出口(扉まわり)
  if (I.door && !I.noDoor) { const ip = R.ip, cx = I.door.x + 0.5, cy = I.door.y + 0.5; let hit = false; try { const dx = sx - ip.X(cx, cy), dy = sy - ip.Y(cx, cy, 3.4); hit = Math.abs(dx) < 46 * (ip.Z || 1) + 14 && Math.abs(dy) < 16 * (ip.Z || 1) + 12; } catch (_) { } const q = screenToGround(R, true, sx, sy, 0); if (hit || (q && Math.abs(q[0] - cx) < 1.6 && Math.abs(q[1] - cy) < 1.8)) return { kind: 'exit', x: I.door.x, y: I.door.y, label: '出口' }; }
  // 設備・家具(高さ 0〜2.4m を仮定して足跡に当たる物。作用のある設備を優先)
  let hit = null; for (const z of [0, 0.8, 1.6, 2.4]) { const q = screenToGround(R, true, sx, sy, z); if (!q) continue; for (const o of I.objs) { if (!o.act) continue; const w = o.w || 1, h = o.h || 1; if (q[0] >= o.x - 0.15 && q[0] <= o.x + w + 0.15 && q[1] >= o.y - 0.15 && q[1] <= o.y + h + 0.15) { const sc = z * 0.1 + (o.act === 'stairs' ? 0 : 0); if (!hit || sc < hit.sc) hit = { o, sc, z }; } } if (hit) break; }
  if (hit) { const o = hit.o; if (o.act === 'stairs') return { kind: 'stairs', o, x: o.x, y: o.y, label: o.label || '階段' }; return { kind: 'obj', o, x: o.x, y: o.y, label: o.label || o.t }; }
  const q = screenToGround(R, true, sx, sy, 0); if (!q) return null; return { kind: 'tile', x: Math.floor(q[0]), y: Math.floor(q[1]) };
}

// ---- 屋内の経路(4近傍BFS。目標集合のどれかに最初に着いた所で終了)
function bfsIn(I, solid, sx, sy, isGoal) {
  const W = I.W, H = I.H; const par = new Int32Array(W * H).fill(-2); const s = sx + sy * W; if (sx < 0 || sy < 0 || sx >= W || sy >= H) return null; par[s] = -1; const q = [s];
  for (let i = 0; i < q.length; i++) { const k = q[i], x = k % W, y = (k / W) | 0; if (isGoal(x, y)) { const p = []; for (let c = k; c !== -1; c = par[c]) p.push([c % W, (c / W) | 0]); return p.reverse(); }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const nk = nx + ny * W; if (par[nk] !== -2 || solid[nk]) continue; par[nk] = k; q.push(nk); } }
  return null;
}

export class AutoWalk {
  constructor() { this.goal = null; this.path = null; this.i = 0; this.stuckT = 0; this.replans = 0; this.waitT = 0; this.lastX = 0; this.lastY = 0; this.onDone = null; this.status = ''; this.t = 0; }
  get active() { return !!this.goal; }
  cancel(why) { const was = this.goal; this.goal = null; this.path = null; this.status = why || ''; return was; }
  // goal: {kind, ...}。屋外は座標で、屋内は設備/出口/タイルで指定
  goTo(g, goal) {
    this.goal = goal; this.chain = false; this.replans = 0; this.stuckT = 0; this.waitT = 0; this.t = 0; this.status = ''; const ok = this.plan(g); if (!ok) { const why = this.status || '行けない場所です'; this.goal = null; return { ok: false, msg: why }; } return { ok: true }; }
  plan(g) {
    const L = g.S.loc, goal = this.goal; if (!goal) return false; const sx = Math.floor(L.x), sy = Math.floor(L.y);
    if (L.k === 'out') {
      const map = g.world.map; const walk = (x, y) => x >= 0 && y >= 0 && x < map.W && y < map.H && !map.solid[x + y * map.W] && map.ground[x + y * map.W] !== T.WATER && map.ground[x + y * map.W] !== T.RAIL;
      let tx = goal.x, ty = goal.y; if (goal.kind === 'npc') { tx = Math.floor(goal.x); ty = Math.floor(goal.y); }
      if (goal.kind === 'door' || goal.kind === 'deco') { /* 入口の前 / 自販機・ベンチの隣 */ }
      if (goal.kind === 'deco') { let b = null, bd = 1e9; for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1]]) { const x = goal.x + dx, y = goal.y + dy; if (walk(x, y)) { const d = Math.abs(x - sx) + Math.abs(y - sy); if (d < bd) { bd = d; b = [x, y]; } } } if (!b) { this.status = 'そこへは近づけません'; return false; } tx = b[0]; ty = b[1]; }
      if (!walk(tx, ty)) { let b = null, bd = 1e9; for (let r = 1; r <= 4 && !b; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = tx + dx, y = ty + dy; if (walk(x, y)) { const d = Math.abs(dx) + Math.abs(dy); if (d < bd) { bd = d; b = [x, y]; } } } if (!b) { this.status = 'そこへは行けません'; return false; } tx = b[0]; ty = b[1]; }
      const p = findPath(map, sx, sy, tx, ty, MODE.WALK, 1200000, false); if (!p || !p.length) { this.status = '道がつながっていません(タクシーや電車を使いましょう)'; return false; }
      this.path = p; this.i = 0; this.dest = { x: tx, y: ty }; return true;
    }
    // 屋内
    const { I, solid } = interiorOf(g, L.b, L.floor); const W = I.W; let isGoal;
    if (goal.kind === 'exit' && L.floor !== 0 && !isUnitFloor(L.floor)) {   // 上階の「出口」=まず1階へ降りる(階段、なければエレベーター)。瞬間移動はしない
      const down = (I.stairs || []).filter(st => typeof st.to === 'number' && (L.floor > 0 ? st.to < L.floor : st.to > L.floor));
      if (down.length) { let b = null, bd = 1e9; for (const st of down) { const d = Math.abs(st.x - sx) + Math.abs(st.y - sy); if (d < bd) { bd = d; b = st; } } this.chain = true; goal.kind = 'stairs'; goal.o = { x: b.x, y: b.y }; }
      else { const lf = (I.objs || []).filter(o => o.act === 'lift'); if (lf.length) { let b = null, bd = 1e9; for (const o of lf) { const d = Math.abs(o.x - sx) + Math.abs(o.y - sy); if (d < bd) { bd = d; b = o; } } goal.kind = 'obj'; goal.o = b; this.status = '上の階です。エレベーターで1階へ降りましょう'; } }
    }
    if (goal.kind === 'exit') { const dx = I.door.x; const dy0 = Math.min(I.door.y, I.H - 1); isGoal = (x, y) => y >= dy0 && x === dx; }
    else if (goal.kind === 'stairs') { const o = goal.o; isGoal = (x, y) => x === o.x && y === o.y; }
    else if (goal.kind === 'obj') { const o = goal.o, w = o.w || 1, h = o.h || 1; isGoal = (x, y) => { const cx = Math.max(o.x + 0.5, Math.min(x + 0.5, o.x + w - 0.5)), cy = Math.max(o.y + 0.5, Math.min(y + 0.5, o.y + h - 0.5)); return Math.hypot(cx - (x + 0.5), cy - (y + 0.5)) <= 1.25 && !(x >= o.x && x < o.x + w && y >= o.y && y < o.y + h); }; }
    else if (goal.kind === 'npc') { const nx = Math.floor(goal.x), ny = Math.floor(goal.y); isGoal = (x, y) => Math.hypot(x - nx, y - ny) <= 1.3 && !(x === nx && y === ny); }
    else { const tx = goal.x, ty = goal.y; isGoal = (x, y) => x === tx && y === ty; if (solid[tx + ty * W]) { isGoal = (x, y) => Math.abs(x - tx) + Math.abs(y - ty) <= 1; } }
    // 階段・扉は「歩いて乗る」ので、目的の升が solid でも到達とみなすため、経路は solid を避けつつ goal 判定だけ使う
    const sol = solid; const p = bfsIn(I, sol, sx, sy, isGoal); if (!p) { this.status = 'そこへは行けません(家具や壁でふさがれています)'; return false; }
    this.path = p; this.i = 0; this.dest = { x: p[p.length - 1][0], y: p[p.length - 1][1] }; return true;
  }
  // 毎フレーム: 世界座標の進行方向ベクトル[ix,iy]を返す(到着/失敗なら null と status)。
  // arrived: 到着した(onArrive を呼ぶべき)  failed: 中止
  dir(g, dt, lastRes) {
    const L = g.S.loc, goal = this.goal; if (!goal) return null; this.t += dt;
    if (goal.kind === 'npc' && L.k === 'out' && goal.live) { const w = goal.live(); if (w) { goal.x = w.x; goal.y = w.y; } }
    if (lastRes && lastRes.msg === CROSS_MSG) { this.waitT += dt; this.stuckT = 0; if (this.waitT > 240) { this.cancel('遮断機が開きません'); return null; } return [0, 0]; }
    // 進捗の監視(位置がほとんど動かない=壁などで詰まった → 再探索)
    const moved = Math.hypot(L.x - this.lastX, L.y - this.lastY); this.lastX = L.x; this.lastY = L.y; if (moved < 0.004) this.stuckT += dt; else this.stuckT = 0;
    if (this.stuckT > 0.45) { this.stuckT = 0; if (++this.replans > 6) { this.cancel('途中で進めなくなりました'); return null; } if (!this.plan(g)) { this.cancel(this.status || '進めなくなりました'); return null; } }
    if (goal.kind === 'npc' && this.t > 1.5 && (this.t % 1.5) < dt) this.plan(g);
    const p = this.path; if (!p) return null;
    // 到着判定
    const last = p[p.length - 1]; const cx = last[0] + 0.5, cy = last[1] + 0.5; const dEnd = Math.hypot(L.x - cx, L.y - cy);
    // 経由点: 次の升の中心。近づいたら進める(先読みで角を切って滑らかに)
    for (let k = Math.min(p.length - 1, this.i + 4); k >= this.i; k--) { const w = p[k]; if (Math.hypot(L.x - (w[0] + 0.5), L.y - (w[1] + 0.5)) < 0.42) { this.i = Math.min(p.length - 1, k + 1); break; } }
    let tgt = p[Math.min(this.i, p.length - 1)];
    if (dEnd < 0.3) { if (goal.kind === 'exit') { return [0, 1]; } this.arrived = true; return null; }
    // 直線上に障害がなければ、先の経由点を狙う(最大3升先まで)
    const la = Math.min(p.length - 1, this.i + 3); for (let j = la; j > this.i; j--) { const w = p[j]; if (this.clear(g, L.x, L.y, w[0] + 0.5, w[1] + 0.5)) { tgt = w; break; } }
    const dx = tgt[0] + 0.5 - L.x, dy = tgt[1] + 0.5 - L.y; const d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d];
  }
  // (x0,y0)→(x1,y1) を主人公の体(半径HR)で通れるか(0.2刻みで標本)
  clear(g, x0, y0, x1, y1) {
    const L = g.S.loc; const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.2); let sol, W, H, isOut = L.k === 'out'; let map = null, I = null;
    if (isOut) { map = g.world.map; sol = map.solid; W = map.W; H = map.H; } else { const r = interiorOf(g, L.b, L.floor); I = r.I; sol = r.solid; W = I.W; H = I.H; }
    const bad = (x, y) => { const tx = Math.floor(x), ty = Math.floor(y); if (tx < 0 || ty < 0 || tx >= W || ty >= H) return true; const k = tx + ty * W; if (sol[k]) return true; if (isOut) { const gr = map.ground[k]; return gr === T.WATER || gr === T.RAIL; } return false; };
    for (let i = 1; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; if (bad(x - HR, y - HR) || bad(x + HR, y - HR) || bad(x - HR, y + HR) || bad(x + HR, y + HR)) return false; }
    return true;
  }
  facing(vx, vy, prev) { return worldDirToFacing(vx, vy, prev); }
}
