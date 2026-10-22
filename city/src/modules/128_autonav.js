  // src/autonav.js — タップ移動・自動経路歩行・行き先案内(Android操作の全面改修)
  // 歩行は step() の通常入力として画面方向ベクトルを渡すため、入館・向き・足音・時計は従来処理のまま動く。
  var NAV = null;
  var NAV_REACH = 0.32;
  function navActive() {
    return !!NAV;
  }
  function navMode() {
    const nd = G3.world.pop.needs[G3.hero.id];
    return nd & NEED.WHEEL ? MODE2.WHEEL : nd & NEED.CANE ? MODE2.CANE : MODE2.WALK;
  }
  function navLocKey() {
    const L2 = G3.S.loc;
    return L2.k === "out" ? "out" : `in:${L2.b}:${L2.floor}`;
  }
  // 目標: {kind:"pt",x,y} / {kind:"bld",b,floor?,unit?} / {kind:"npc",id} / {kind:"obj",o} / {kind:"deco",x,y,d} / {kind:"exit"} / {kind:"floor",floor}
  function navTo(tg, opts = {}) {
    if (!G3 || R4.street) return false;
    NAV = { tg, label: opts.label || navLabel(tg), run: !!opts.run, path: null, i: 0, key: "", dir: null, stuckT: 0, lastP: null, fails: 0, push: 0, born: performance.now(), done: false };
    navPlan();
    navPill();
    return !!NAV;
  }
  function navStop(msg) {
    if (!NAV) return;
    NAV = null;
    U.navMark = null;
    navPill();
    if (msg) toast(msg, 2600);
  }
  function navLabel(tg) {
    if (tg.kind === "bld") return G3.bld(tg.b).name;
    if (tg.kind === "npc") return G3.nameOf(tg.id);
    if (tg.kind === "obj") return tg.o.label || "設備";
    if (tg.kind === "exit") return "出口";
    if (tg.kind === "floor") return "階段・エレベーター";
    if (tg.kind === "deco") return tg.d === 2 ? "自動販売機" : "ベンチ";
    return "タップした場所";
  }
  // ---- 経路計画(場所が変わるたびに再計画)
  function navPlan() {
    const n = NAV, L2 = G3.S.loc, tg = n.tg;
    n.key = navLocKey();
    n.path = null;
    n.i = 0;
    n.push = 0;
    n.goal = null;
    n.after = null;
    if (L2.k === "out") {
      let gx, gy;
      if (tg.kind === "bld") {
        const b = G3.bld(tg.b);
        gx = b.doorX;
        gy = b.doorY;
        n.after = "enter";
      } else if (tg.kind === "npc") {
        const w = (R4.walkers || []).find((w2) => w2.id === tg.id);
        if (!w) return navStop(`${n.label}を見失いました`);
        gx = Math.floor(w.x);
        gy = Math.floor(w.y);
        n.after = "talk";
      } else if (tg.kind === "deco") {
        gx = tg.x;
        gy = tg.y;
        n.after = "deco";
      } else if (tg.kind === "pt") {
        const f = nearWalkOut(tg.x, tg.y);
        if (!f) return navStop("そこへは歩いて行けません");
        gx = f[0];
        gy = f[1];
      } else return navStop();
      let sx = Math.floor(L2.x), sy = Math.floor(L2.y);
      if (G3.world.map.solid[sx + sy * G3.world.map.W]) {
        const f = nearWalkOut(L2.x, L2.y);
        if (f) [sx, sy] = f;
      }
      const p = findPath(G3.world.map, sx, sy, gx, gy, navMode());
      if (!p) return navStop(`${n.label}への道が見つかりません`);
      n.path = p.map(([x, y]) => [x + 0.5, y + 0.5]);
      if (n.after === "deco") n.path.pop();
      if (n.after === "talk") n.path.pop();
      if (tg.kind === "pt") n.path[n.path.length - 1] = [tg.x, tg.y].map((v, k) => Math.abs(v - n.path[n.path.length - 1][k]) < 0.5 ? v : n.path[n.path.length - 1][k]);
      if (n.after === "enter") n.path[n.path.length - 1] = [gx + 0.5, gy + 0.45];
      n.tiles = new Set(p.map(([x, y]) => x + y * G3.world.map.W));
      n.goal = n.path[n.path.length - 1];
      U.route = p;
      return;
    }
    // 屋内
    const { I: I2, solid } = interiorOf(G3, L2.b, L2.floor);
    let goals = null;
    const wantOut = tg.kind === "exit" || tg.kind === "pt" && tg.out || tg.kind === "bld" && tg.b !== L2.b || tg.kind === "npc" && tg.out || tg.kind === "deco";
    if (wantOut) {
      if (isUnitFloor(L2.floor) || L2.floor === 0 || !navStairs(I2, 0)) {
        goals = [[I2.door.x, I2.H - 2]];
        n.after = "out";
      } else goals = navLevel(I2, solid, 0);
    } else if (tg.kind === "bld" || tg.kind === "floor") {
      // 同じ建物内: 目標の階へ(自宅の住戸を含む)
      const unit = tg.unit;
      const lvWant = tg.kind === "floor" ? tg.floor : unit != null ? decodeUnit(unit).lv : tg.floor ?? null;
      if (unit != null && L2.floor === unit) return navArrive();
      if (isUnitFloor(L2.floor)) {
        goals = [[I2.door.x, I2.H - 2]];
        n.after = "out";
      } else if (lvWant != null && L2.floor !== lvWant) {
        goals = navLevel(I2, solid, lvWant);
        if (!goals) return navStop("この階からは行けません");
      } else if (unit != null) {
        const u = decodeUnit(unit);
        const o = I2.objs.find((o2) => o2.t === "udoor" && o2.lv === u.lv && o2.pos === u.pos);
        if (!o) return navStop("住戸の入口が見つかりません");
        n.obj = o;
        goals = navAround(I2, solid, o);
        n.after = "unit";
      } else return navArrive();
    } else if (tg.kind === "obj") {
      n.obj = tg.o;
      goals = navAround(I2, solid, tg.o);
      n.after = "obj";
    } else if (tg.kind === "npc") {
      const p = (U.people || []).find((q) => q.id === tg.id);
      if (!p) return navStop(`${n.label}を見失いました`);
      goals = navAround(I2, solid, { x: Math.floor(p.x), y: Math.floor(p.y) });
      n.after = "talk";
    } else if (tg.kind === "pt") {
      goals = [[Math.floor(tg.x), Math.floor(tg.y)]];
    }
    if (!goals || !goals.length) return navStop("近づける場所がありません");
    const p = bfsIn(I2, solid, Math.floor(L2.x), Math.floor(L2.y), goals);
    if (!p) return navStop(`${n.label}への道が見つかりません`);
    n.path = p.map(([x, y]) => [x + 0.5, y + 0.5]);
    if (tg.kind === "pt" && !tg.out && boxFreeIn(I2, solid, tg.x, tg.y)) n.path[n.path.length - 1] = [tg.x, tg.y];
    if (n.after === "out") n.path[n.path.length - 1] = [I2.door.x + 0.5, I2.H - 1.5];
    n.goal = n.path[n.path.length - 1];
    n.tiles = null;
  }
  // 別の階へ: 2階以上離れていればエレベーター、それ以外は階段
  function navLevel(I2, solid, lv) {
    const n = NAV, L2 = G3.S.loc;
    n.liftTo = null;
    if (Math.abs(lv - L2.floor) >= 2 && !n.noLift) {
      const el = I2.objs.find((o) => o.t === "elev" && o.lo != null && o.lo <= lv && o.hi >= lv);
      if (el) {
        n.obj = el;
        n.liftTo = lv;
        n.after = "lift";
        return navAround(I2, solid, el);
      }
    }
    const st3 = navStairs(I2, lv);
    if (!st3) return null;
    n.after = "stairs";
    return [[st3.x, st3.y]];
  }
  // 階の移動: 階段のつながりを幅優先で探し、いまの階で乗るべき階段を返す
  function navStairs(I2, lvWant) {
    const L2 = G3.S.loc;
    const usable = (I3) => I3.objs.filter((o) => o.act === "stairs" && o.to != null && !isUnitFloor(o.to) && !(o.gate && !bathGateOk(G3, o.gate)));
    const first = /* @__PURE__ */ new Map();
    const q = [L2.floor];
    first.set(L2.floor, null);
    for (let i = 0; i < q.length && i < 80; i++) {
      const f = q[i];
      let I3;
      try {
        I3 = f === L2.floor ? I2 : interiorOf(G3, L2.b, f).I;
      } catch (_) {
        continue;
      }
      for (const o of usable(I3)) {
        if (first.has(o.to)) continue;
        first.set(o.to, f === L2.floor ? o : first.get(f));
        if (o.to === lvWant) return first.get(o.to);
        q.push(o.to);
      }
    }
    return null;
  }
  // 物の周囲の立てるマス
  function navAround(I2, solid, o) {
    const w = o.w || 1, h = o.h || 1, out = [];
    for (let y = o.y - 1; y <= o.y + h; y++) for (let x = o.x - 1; x <= o.x + w; x++) {
      const inside = x >= o.x && x < o.x + w && y >= o.y && y < o.y + h;
      if (inside || x < 0 || y < 0 || x >= I2.W || y >= I2.H) continue;
      if (!solid[x + y * I2.W]) out.push([x, y]);
    }
    if (!out.length && !solid[o.x + o.y * I2.W]) out.push([o.x, o.y]);
    return out;
  }
  function bfsIn(I2, solid, sx, sy, goals) {
    const W2 = I2.W, H4 = I2.H, n = W2 * H4;
    const gset = new Set(goals.map(([x, y]) => x + y * W2));
    const prev = new Int32Array(n).fill(-2);
    sx = Math.max(0, Math.min(W2 - 1, sx));
    sy = Math.max(0, Math.min(H4 - 1, sy));
    const s = sx + sy * W2;
    prev[s] = -1;
    const q = [s];
    let hit = -1;
    for (let qi = 0; qi < q.length; qi++) {
      const k = q[qi];
      if (gset.has(k)) {
        hit = k;
        break;
      }
      const x = k % W2, y = k / W2 | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W2 || ny >= H4) continue;
        const kk = nx + ny * W2;
        if (prev[kk] !== -2) continue;
        if (solid[kk] && !gset.has(kk)) continue;
        prev[kk] = k;
        q.push(kk);
      }
    }
    if (hit < 0) return null;
    const p = [];
    for (let k = hit; k >= 0; k = prev[k]) p.push([k % W2, k / W2 | 0]);
    return p.reverse();
  }
  function nearWalkOut(x, y) {
    const map2 = G3.world.map;
    const ok = (tx, ty) => tx >= 0 && ty >= 0 && tx < map2.W && ty < map2.H && !map2.solid[tx + ty * map2.W] && isFinite(tileCost(map2.ground[tx + ty * map2.W], navMode()));
    const fx = Math.floor(x), fy = Math.floor(y);
    for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      if (ok(fx + dx, fy + dy)) return [fx + dx, fy + dy];
    }
    return null;
  }
  // ---- 見通し(経路の角を滑らかに切る。車道・線路は経路上のマス以外を横切らない)
  function navLOS(ax, ay, bx, by) {
    const L2 = G3.S.loc, d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d / 0.2);
    if (L2.k === "out") {
      const map2 = G3.world.map, tl = NAV.tiles;
      for (let i = 1; i <= n; i++) {
        const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n;
        if (!boxFreeOut(map2, x, y)) return false;
        const k = Math.floor(x) + Math.floor(y) * map2.W;
        if (tl && !tl.has(k)) {
          const gr = map2.ground[k];
          if (gr === T.ROAD || gr === T.RAIL || gr === T.CROSSING || gr === T.BRIDGE || gr === T.WATER) return false;
        }
      }
      return true;
    }
    const { I: I2, solid } = interiorOf(G3, L2.b, L2.floor);
    for (let i = 1; i <= n; i++) {
      const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n;
      if (!boxFreeIn(I2, solid, x, y)) return false;
    }
    return true;
  }
  // ---- 毎フレーム: 画面方向の入力ベクトルを返す(null=自動歩行なし)
  function navInput(dt) {
    const n = NAV;
    if (!n) return null;
    const L2 = G3.S.loc;
    if (n.key !== navLocKey()) {
      // 入館・退館・階移動の直後は少し待ってから再計画
      n.wait = (n.wait || 0) + dt;
      if (n.wait < 0.25) return null;
      n.wait = 0;
      if (L2.k === "in" && n.tg.kind === "bld" && L2.b === n.tg.b && n.tg.unit == null && n.tg.floor == null) return navArrive(), null;
      navPlan();
      if (!NAV) return null;
    }
    if (L2.tr) return null;
    if (n.tg.kind === "npc" && performance.now() - (n.rt || 0) > 900) {
      n.rt = performance.now();
      const list = L2.k === "out" ? R4.walkers || [] : U.people || [];
      const w = list.find((q) => q.id === n.tg.id);
      if (!w) return navStop(`${n.label}を見失いました`), null;
      if (Math.hypot(w.x - L2.x, w.y - L2.y) < 1.25) return navArrive(), null;
      if (n.goal && Math.hypot(w.x - n.goal[0], w.y - n.goal[1]) > 1.5) navPlan();
      if (!NAV) return null;
    }
    if (n.push > 0) {
      n.push -= dt;
      if (n.push <= 0) {
        if (n.after === "enter") return navEnterFallback(), null;
        if (n.after === "out" || n.after === "stairs") navPlan();
        return null;
      }
      return navScreen(n.pushDir[0], n.pushDir[1]);
    }
    const P = n.path;
    if (!P) {
      if (n.after === "lift" && !L2.tr) {
        n.noLift = true;
        navPlan();
      }
      return null;
    }
    // 角を切って先へ進んだ分、経由点の番号を追いつかせる
    {
      let bi = n.i, bd = 1e9;
      for (let k = n.i; k < Math.min(P.length, n.i + 12); k++) {
        const dd = Math.hypot(P[k][0] - L2.x, P[k][1] - L2.y);
        if (dd < bd) {
          bd = dd;
          bi = k;
        }
      }
      if (bd < 1.2) n.i = bi;
    }
    while (n.i < P.length - 1 && Math.hypot(P[n.i][0] - L2.x, P[n.i][1] - L2.y) < NAV_REACH + 0.15) n.i++;
    const last = P[P.length - 1];
    if (n.i >= P.length - 1 && Math.hypot(last[0] - L2.x, last[1] - L2.y) < NAV_REACH) return navReached();
    // 見通しが利く一番遠い経由点へ向かう(6点先まで)
    let j = n.i;
    for (let k = Math.min(P.length - 1, n.i + 6); k > n.i; k--) if (navLOS(L2.x, L2.y, P[k][0], P[k][1])) {
      j = k;
      break;
    }
    let dx = P[j][0] - L2.x, dy = P[j][1] - L2.y;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d;
    dy /= d;
    // 方向を滑らかに補間(急な向き変えのガタつき防止)
    if (n.dir) {
      const k = Math.min(1, dt * 14);
      let ex = n.dir[0] + (dx - n.dir[0]) * k, ey = n.dir[1] + (dy - n.dir[1]) * k;
      const e = Math.hypot(ex, ey);
      if (e > 0.2) {
        dx = ex / e;
        dy = ey / e;
      }
    }
    n.dir = [dx, dy];
    // 歩行者信号: 横断歩道の手前で赤なら待つ(渡っている途中は止まらない)
    if (L2.k === "out") {
      const map2 = G3.world.map;
      const here = crosswalkAt(map2, L2.x, L2.y);
      const ahead = !here ? crosswalkAt(map2, L2.x + dx * 0.7, L2.y + dy * 0.7) : null;
      const ps = ahead ? pedState(ahead.c, ahead.horiz, R4.time || 0) : "N";
      const wasWaiting = n.signal;
      n.signal = ps === "R" || ps === "F";
      void wasWaiting;
      if (n.signal) {
        n.lastP = [L2.x, L2.y];
        n.stuckT = 0;
        const t = $("navtx");
        if (t) t.textContent = `🚦 信号待ち(${n.label}へ)`;
        return { x: 0, y: 0, run: false };
      }
    }
    // 行き詰まり検知
    if (n.lastP && Math.hypot(n.lastP[0] - L2.x, n.lastP[1] - L2.y) < 0.02) {
      n.stuckT += dt;
      if (n.stuckT > 0.7) {
        n.stuckT = 0;
        if (++n.fails > 3) return navStop("通れないため、自動移動を止めました"), null;
        navPlan();
        return null;
      }
    } else n.stuckT = 0;
    n.lastP = [L2.x, L2.y];
    const rem = (P.length - 1 - n.i) + Math.hypot(P[n.i][0] - L2.x, P[n.i][1] - L2.y);
    n.remain = rem;
    // 終点直前は歩きに切り替える
    return navScreen(dx, dy, n.run && rem > 3);
  }
  function navScreen(wx, wy, run = false) {
    if (R4.iso) return { x: (wx - wy) / 2, y: (wx + wy) / 4, run };
    return { x: wx, y: wy, run };
  }
  function navReached() {
    const n = NAV, L2 = G3.S.loc;
    if (n.after === "enter") {
      // 自宅(テナント入居の集合住宅を含む)は館内案内を出さずに住居部分へ入る
      const b = G3.bld(n.tg.b);
      if (b.tenants && b.tenants.length && (n.tg.b === G3.hero.homeB || n.tg.direct)) {
        const r = tryEnter(G3, n.tg.b, true);
        if (r.ok) {
          U.cwAt = -999;
          sfx.door();
        } else {
          navStop();
          if (r.msg) toast(r.msg, 3e3);
        }
        return null;
      }
      n.push = 0.6;
      n.pushDir = [0, -1];
      return null;
    }
    if (n.after === "out") {
      n.push = 0.8;
      n.pushDir = [0, 1];
      return null;
    }
    if (n.after === "lift") {
      if (L2.tr) return null;
      const r = callLift(G3, n.obj);
      if (r.msg) toast(r.msg, 2200);
      if (!r.ok) {
        n.noLift = true;
        navPlan();
      } else n.path = null;
      return null;
    }
    if (n.after === "stairs") {
      // 階段のマスへ乗る
      const { I: I2 } = interiorOf(G3, L2.b, L2.floor);
      const st3 = I2.objs.find((o) => o.act === "stairs" && Math.floor(L2.x) === o.x && Math.floor(L2.y) === o.y);
      if (!st3) {
        n.push = 0.5;
        n.pushDir = [0, -1];
      } else {
        n.push = 0.3;
        n.pushDir = [0, 0.01];
      }
      return null;
    }
    navArrive();
    return null;
  }
  function navEnterFallback() {
    const n = NAV;
    if (!n || G3.S.loc.k !== "out") return;
    const bi = n.tg.b;
    navStop();
    if (U.dest && U.dest.idx === bi) clearDest();
    actOn({ kind: "door", b: bi, label: G3.bld(bi).name });
  }
  // ---- 到着時の動作
  function navArrive() {
    const n = NAV;
    if (!n) return;
    const L2 = G3.S.loc, tg = n.tg;
    navStop();
    const face = (x, y) => {
      const dx = x - L2.x, dy = y - L2.y;
      if (R4.iso) {
        const sx = (dx - dy) / 2, sy = (dx + dy) / 4;
        L2.f = Math.abs(sx) > Math.abs(sy) ? sx > 0 ? "r" : "l" : sy > 0 ? "d" : "u";
      } else L2.f = Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "r" : "l" : dy > 0 ? "d" : "u";
    };
    if (n.after === "unit" && n.obj) {
      if (enterUnit(G3, n.obj.lv, n.obj.pos)) {
        U.cwAt = -999;
        sfx.door();
        toast(tg.unit != null && G3.bld(tg.b) && tg.b === G3.hero.homeB ? "ただいま。自宅に着きました" : `${n.obj.room}号室に入りました`, 2400);
      }
      return;
    }
    if (n.after === "obj" && n.obj) {
      const o = n.obj;
      face(o.x + (o.w || 1) / 2, o.y + (o.h || 1) / 2);
      if (o.act) actOn({ kind: "obj", o, label: o.label || o.t });
      return;
    }
    if (n.after === "talk") {
      const list = L2.k === "out" ? R4.walkers || [] : U.people || [];
      const w = list.find((q) => q.id === tg.id);
      if (w) {
        face(w.x, w.y);
        actOn({ kind: "npc", id: tg.id, label: G3.nameOf(tg.id), role: w.role });
      }
      return;
    }
    if (n.after === "deco") {
      face(tg.x + 0.5, tg.y + 0.5);
      actOn({ kind: "deco", d: tg.d, x: tg.x, y: tg.y, label: navLabel(tg) });
      return;
    }
    if (tg.kind === "bld" && tg.rail && L2.k === "in" && L2.b === tg.b) {
      const r = startRide(G3, tg.rail.from, tg.rail.to);
      if (!r.ok) return toast(r.msg, 3600);
      sfx.train();
      U.railNext = tg.rail.finalB;
      rideScreen(r.ride);
      return;
    }
    if (tg.kind === "bld" && L2.k === "in" && L2.b === tg.b) {
      if (U.dest && U.dest.idx === tg.b) clearDest();
      toast(`${G3.bld(tg.b).name}に着きました`, 2200);
    }
  }
  // ---- タップ判定(画面座標 → 世界)
  function cvXY(e) {
    const r = cv.getBoundingClientRect();
    return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height];
  }
  function tapPick(sx, sy) {
    const L2 = G3.S.loc;
    if (L2.k === "out") {
      const P2 = R4.P, Z = P2.Z, map2 = G3.world.map;
      // 人(画面上の立ち姿の範囲)
      let best = null, bd = 1e9;
      for (const w of R4.walkers || []) {
        if (w.car) continue;
        const px2 = P2.X(w.x, w.y), py = P2.Y(w.x, w.y);
        const hw = 6 * Z, hh = 26 * Z;
        if (sx > px2 - hw && sx < px2 + hw && sy > py - hh && sy < py + 3 * Z) {
          const dd = Math.abs(sx - px2) + Math.abs(sy - (py - hh / 2)) * 0.5;
          if (dd < bd) {
            bd = dd;
            best = w;
          }
        }
      }
      if (best) return { kind: "npc", id: best.id };
      // 建物(手前の高い面から順に)
      const year = G3.year();
      for (let z = 40; z >= 0; z -= 0.5) {
        const u = P2.U(sx, sy + z * PXM * Z), v = P2.V(sx, sy + z * PXM * Z);
        const tx = Math.floor(u), ty = Math.floor(v);
        if (tx < 0 || ty < 0 || tx >= map2.W || ty >= map2.H) continue;
        let bi = map2.bid[tx + ty * map2.W];
        if (bi < 0) continue;
        let b = map2.buildings[bi];
        if (b.parent !== void 0) b = map2.buildings[b.parent] || b;
        let hm = 3;
        try {
          hm = bldHeight(bldSpec(b, map2, year), b);
        } catch (_) {
        }
        if (z <= hm + 0.5) {
          const bt = BTYPES[b.type];
          if (bt && (bt.enter || b.type === "gasstation" || b.tenants && b.tenants.length)) return { kind: "bld", b: b.idx };
          return { kind: "pt", x: b.doorX + 0.5, y: b.doorY + 0.5, note: b.name };
        }
      }
      const u = P2.U(sx, sy), v = P2.V(sx, sy);
      const tx = Math.floor(u), ty = Math.floor(v);
      if (tx >= 0 && ty >= 0 && tx < map2.W && ty < map2.H) {
        const d = map2.deco[tx + ty * map2.W];
        if (d === 2 || d === 3) return { kind: "deco", x: tx, y: ty, d };
      }
      return { kind: "pt", x: u, y: v };
    }
    const P2 = R4.ip;
    if (!P2) return null;
    const { I: I2 } = interiorOf(G3, L2.b, L2.floor);
    const inv = (x, y) => {
      const a = (x - P2.ox) / (8 * P2.Z), b = (y - P2.oy) / (4 * P2.Z);
      return [(a + b) / 2, (b - a) / 2];
    };
    let best = null, bd = 1e9;
    for (const p of U.people || []) {
      const px2 = P2.X(p.x, p.y), py = P2.Y(p.x, p.y);
      const hw = 6 * P2.Z, hh = 26 * P2.Z;
      if (sx > px2 - hw && sx < px2 + hw && sy > py - hh && sy < py + 3 * P2.Z) {
        const dd = Math.abs(sx - px2);
        if (dd < bd) {
          bd = dd;
          best = p;
        }
      }
    }
    if (best) return { kind: "npc", id: best.id };
    for (let z = 3; z >= 0; z -= 0.25) {
      const [u, v] = inv(sx, sy + z * 12 * P2.Z);
      for (const o of I2.objs) {
        if (!o.act) continue;
        const w = o.w || 1, h = o.h || 1;
        if (u >= o.x - 0.1 && u < o.x + w + 0.1 && v >= o.y - 0.1 && v < o.y + h + 0.1 && z <= (o.act === "stairs" ? 0.6 : 2)) return o.act === "stairs" ? { kind: "pt", x: o.x + 0.5, y: o.y + 0.5, stairs: o } : { kind: "obj", o };
      }
    }
    const [u, v] = inv(sx, sy);
    if (v >= I2.H - 1.6 && Math.abs(u - (I2.door.x + 0.5)) < 1.3) return { kind: "exit" };
    return { kind: "pt", x: Math.max(0.5, Math.min(I2.W - 0.5, u)), y: Math.max(0.5, Math.min(I2.H - 0.5, v)) };
  }
  function onTap(e) {
    if (!G3 || U.modal || U.act || G3.blocked() || !G3.canWalk() || R4.street) return;
    if (taxiTripActive(G3)) return;
    const [sx, sy] = cvXY(e);
    const tg = tapPick(sx, sy);
    if (!tg) return;
    const L2 = G3.S.loc;
    // 目の前の対象を叩いたら歩かずに即実行
    if (tg.kind === "obj") {
      const o = tg.o, cx = Math.max(o.x, Math.min(L2.x, o.x + (o.w || 1))), cy = Math.max(o.y, Math.min(L2.y, o.y + (o.h || 1)));
      if (Math.hypot(cx - L2.x, cy - L2.y) < 1.1) return actOn({ kind: "obj", o, label: o.label || o.t });
    }
    if (tg.kind === "pt" && tg.stairs) {
      navTo({ kind: "pt", x: tg.x, y: tg.y }, { label: tg.stairs.label || "階段" });
      if (NAV) NAV.after = "stairs";
      U.navMark = { x: tg.x, y: tg.y, t: performance.now(), out: false };
      return;
    }
    U.navMark = { x: tg.kind === "pt" ? tg.x : null, y: tg.kind === "pt" ? tg.y : null, t: performance.now(), out: L2.k === "out" };
    navTo(tg, { run: e.detail === 2 || U.navRunDefault });
  }
  // ---- 画面: 自動移動中の表示・行き先パネル・時間速度
  function navPill() {
    let el = $("navpill");
    if (!el) {
      el = document.createElement("div");
      el.id = "navpill";
      el.innerHTML = '<span id="navtx"></span><button id="navstop" aria-label="自動移動を止める">■ 止める</button>';
      $("app").appendChild(el);
      $("navstop").addEventListener("click", (e) => {
        e.stopPropagation();
        navStop("自動移動を止めました");
      });
    }
    el.classList.toggle("on", !!NAV);
    if (NAV) $("navtx").textContent = `🚶 ${NAV.label}へ移動中`;
  }
  function navTick() {
    if (!NAV) return;
    const t = $("navtx");
    if (t && NAV.remain != null && G3.S.loc.k === "out" && !NAV.signal) t.textContent = `🚶 ${NAV.label}へ 約${Math.max(1, Math.round(NAV.remain * 4))}m`;
  }
  var SPEEDS = [{ s: 0, l: "⏸", t: "時間停止" }, { s: 0.25, l: "🐢", t: "低速(1/4)" }, { s: 1, l: "▶", t: "通常速度" }, { s: 2, l: "⏩", t: "2倍速" }];
  function speedBar() {
    let el = $("spdbar");
    if (!el) {
      el = document.createElement("div");
      el.id = "spdbar";
      el.innerHTML = SPEEDS.map((x, i) => `<button data-i="${i}" title="${x.t}" aria-label="${x.t}">${x.l}</button>`).join("");
      $("app").appendChild(el);
      el.querySelectorAll("button").forEach((b) => b.addEventListener("click", (e) => {
        e.stopPropagation();
        U.scale = SPEEDS[+b.dataset.i].s;
        try {
          localStorage.setItem("nls_speed", String(U.scale));
        } catch (_) {
        }
        speedBar();
        toast(SPEEDS[+b.dataset.i].t, 1200);
      }));
    }
    el.querySelectorAll("button").forEach((b) => b.classList.toggle("sel", SPEEDS[+b.dataset.i].s === U.scale));
    el.classList.toggle("paused", U.scale === 0);
  }
  // 行き先パネル: 自宅へ・地図・駅・タクシー・階別案内
  // 電車経路: 最寄り駅→目的地最寄り駅。徒歩より早いときだけ提案
  var WALK_TPM = 4.4;
  function railOption(destB) {
    const L2 = G3.S.loc, map2 = G3.world.map, dest = G3.bld(destB);
    const pos = L2.k === "out" ? { x: L2.x, y: L2.y } : { x: G3.bld(L2.b).doorX, y: G3.bld(L2.b).doorY };
    const md = (b, p) => Math.abs(b.doorX - p.x) + Math.abs(b.doorY - p.y);
    let s1 = null, s2 = null;
    for (const b of map2.buildings) {
      if (b.type !== "station" || !b.stationId) continue;
      if (!s1 || md(b, pos) < md(s1, pos)) s1 = b;
      const dp = { x: dest.doorX, y: dest.doorY };
      if (!s2 || md(b, dp) < md(s2, dp)) s2 = b;
    }
    if (!s1 || !s2 || s1.stationId === s2.stationId) return null;
    let T4 = null;
    try {
      T4 = planTrip(G3, s1.stationId, s2.stationId);
    } catch (_) {
    }
    if (!T4 || !T4.sim || !T4.sim.ok) return null;
    const w1 = md(s1, pos) * 1.3, w2 = md(s2, { x: dest.doorX, y: dest.doorY }) * 1.3;
    const walkAll = md(dest, pos) * 1.3 / WALK_TPM;
    const mins = Math.round((w1 + w2) / WALK_TPM + T4.total);
    if (mins >= walkAll * 0.9) return null;
    return { s1, s2, mins, fare: T4.fare, walkMins: Math.round(walkAll) };
  }
  function railGo(destB) {
    const o = railOption(destB);
    if (!o) return toast("電車のほうが早い経路はありません");
    closeModal();
    navTo({ kind: "bld", b: o.s1.idx, direct: true, rail: { from: o.s1.stationId, to: o.s2.stationId, finalB: destB } }, { label: `${o.s1.name}(電車で${G3.bld(destB).name}へ)`, run: true });
  }
  function goHome(how = "walk") {
    const hb = G3.hero.homeB;
    if (hb == null || hb < 0) return toast("自宅がありません");
    const L2 = G3.S.loc;
    let unit = G3.S.homeUnit;
    try {
      const u = unitOfPerson(G3, G3.hero.id);
      if (u) unit = unitCode(u.lv, u.pos);
    } catch (_) {
    }
    if (how === "taxi" && L2.k === "out") {
      closeModal();
      setDest(G3.bld(hb), 0);
      return moveModal();
    }
    closeModal();
    navTo({ kind: "bld", b: hb, unit: unit != null ? unit : void 0 }, { label: "自宅", run: true });
  }
  function destSheet() {
    if (!G3 || U.modal) return;
    const L2 = G3.S.loc, inB = L2.k === "in", b = inB ? G3.bld(L2.b) : null;
    const pos = inB ? { x: b.doorX, y: b.doorY } : { x: L2.x, y: L2.y };
    const near = (f, k = 1) => nearestOfType(G3.world, pos.x, pos.y, f, k).map((x) => x.b);
    const quick = [["🚉", "最寄り駅", (x) => x.type === "station"], ["🏪", "コンビニ", (x) => x.type === "konbini"], ["🏥", "病院", (x) => ["hospital", "clinic"].includes(x.type)], ["🏫", "学校", (x) => BTYPES[x.type].cat === "school"], ["🏢", "市役所", (x) => x.type === "cityhall"], ["♨", "温泉", (x) => x.type === "onsenbath" || x.type === "ryokan" || x.type === "sento"]];
    const floors = inB ? floorGuide(b) : [];
    showModal(`<h2>🧭 行き先</h2>
      <div class="dsgrid">
        <button class="btn acc" id="dsHome">🏠 自宅へ帰る(徒歩)</button>
        <button class="btn sec" id="dsHomeT">🚕 自宅へタクシー</button>
        <button class="btn sec" id="dsMap">🗺 地図から選ぶ</button>
        <button class="btn sec" id="dsMove">🚃 電車・バス・タクシー</button>
        ${inB ? '<button class="btn sec" id="dsExit">🚪 建物から出る</button>' : ""}
      </div>
      <h3>近くの施設へ歩く</h3><div class="dsgrid">${quick.map((q, i) => `<button class="btn sec" data-q="${i}">${q[0]} ${q[1]}</button>`).join("")}</div>
      ${floors.length ? `<h3>${esc4(b.name)} 階別案内</h3><div class="list">${floors.map((f) => `<button class="btn item" data-fl="${f.floor}" ${f.here ? "disabled" : ""}>${esc4(f.label)}${f.here ? "(いまの階)" : ""}</button>`).join("")}</div>` : ""}
      <div class="small">画面をタップすると、その場所・建物・人・設備まで自動で歩きます。ダブルタップで走ります。ジョイスティックを触ると止まります。</div>
      <div class="row">${btn("閉じる", "sec")}</div>`, (c) => {
      c.querySelector("#dsHome").onclick = () => goHome("walk");
      c.querySelector("#dsHomeT").onclick = () => {
        if (L2.k !== "out") {
          closeModal();
          toast("建物を出たら、移動メニューからタクシーを呼べます");
          return navTo({ kind: "exit" });
        }
        goHome("taxi");
      };
      c.querySelector("#dsMap").onclick = () => {
        closeModal();
        mapModal();
      };
      c.querySelector("#dsMove").onclick = () => {
        closeModal();
        moveModal();
      };
      const ex = c.querySelector("#dsExit");
      if (ex) ex.onclick = () => {
        closeModal();
        navTo({ kind: "exit" });
      };
      c.querySelectorAll("[data-q]").forEach((q) => q.onclick = () => {
        const f = quick[+q.dataset.q];
        const t = near(f[2])[0];
        closeModal();
        if (!t) return toast("近くに見つかりません");
        setDest(t, navMode());
        navTo({ kind: "bld", b: t.idx }, { run: true });
      });
      c.querySelectorAll("[data-fl]").forEach((q) => q.onclick = () => {
        closeModal();
        navTo({ kind: "floor", floor: +q.dataset.fl }, { label: q.textContent });
      });
      c.querySelector(".row .btn").onclick = closeModal;
    });
  }
  // 階の一覧(階段でつながる階)
  function floorGuide(b) {
    const L2 = G3.S.loc;
    if (isUnitFloor(L2.floor)) return [];
    const seen = /* @__PURE__ */ new Map();
    const q = [L2.floor];
    seen.set(L2.floor, true);
    for (let i = 0; i < q.length && i < 40; i++) {
      let I2;
      try {
        I2 = interiorOf(G3, b.idx, q[i]).I;
      } catch (_) {
        continue;
      }
      for (const o of I2.objs) if (o.act === "stairs" && o.to != null && !seen.has(o.to) && !isUnitFloor(o.to)) {
        seen.set(o.to, true);
        q.push(o.to);
      }
    }
    if (q.length < 2) return [];
    return q.sort((a, c) => a - c).map((f) => {
      let lab = "";
      try {
        lab = levelFn(b, f) || `${f + 1}階`;
      } catch (_) {
        lab = `${f + 1}階`;
      }
      let what = "";
      try {
        const I2 = interiorOf(G3, b.idx, f).I;
        what = I2.title || I2.name || "";
      } catch (_) {
      }
      return { floor: f, label: lab + (what && !lab.includes(what) ? " " + what : ""), here: f === L2.floor };
    });
  }
  // ---- 入力の配線
  (function wireNav() {
    const st = document.createElement("style");
    st.textContent = `#navpill{position:absolute;left:50%;top:calc(6px + env(safe-area-inset-top,0px));transform:translateX(-50%);display:none;align-items:center;gap:8px;background:#0d1a33e6;border:1px solid #4fc3f7;border-radius:20px;padding:4px 6px 4px 12px;font-size:13px;z-index:6;max-width:60vw;white-space:nowrap}
#navpill.on{display:flex}#navtx{overflow:hidden;text-overflow:ellipsis}
#navpill button{background:#e53935;color:#fff;border:0;border-radius:14px;padding:6px 10px;font-size:12px;min-height:32px}
#spdbar{position:absolute;right:calc(8px + var(--safe-r));top:58px;display:flex;gap:3px;z-index:5;background:#0d1a33b3;border-radius:16px;padding:3px}
#spdbar button{min-width:36px;min-height:34px;border:0;border-radius:12px;background:transparent;color:#fff;font-size:15px}
#spdbar button.sel{background:#ffd54a;color:#14213d}#spdbar.paused button.sel{background:#ff7a7a}
#btnNav{position:absolute;z-index:5;right:calc(118px + var(--safe-r));bottom:calc(86px + var(--safe-b));width:54px;height:54px;border-radius:50%;border:2px solid #fff8;background:#2e7d32dd;color:#fff;font-size:24px}
.dsgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin:6px 0}
.dsgrid .btn{min-height:46px}
#tapmark{position:absolute;pointer-events:none;width:28px;height:28px;margin:-14px 0 0 -14px;border:3px solid #ffd54a;border-radius:50%;z-index:4;opacity:0;transition:opacity .5s}
#tapmark.on{opacity:1;transition:none}`;
    document.head.appendChild(st);
    const b = document.createElement("button");
    b.id = "btnNav";
    b.textContent = "🧭";
    b.title = "行き先(自宅・地図・階別案内)";
    b.setAttribute("aria-label", "行き先");
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      destSheet();
    });
    $("app").appendChild(b);
    const mk = document.createElement("div");
    mk.id = "tapmark";
    $("app").appendChild(mk);
    speedBar();
    try {
      const s = localStorage.getItem("nls_speed");
      if (s != null && SPEEDS.some((x) => String(x.s) === s)) U.scale = +s;
    } catch (_) {
    }
    speedBar();
    setInterval(() => {
      navTick();
      if (G3) {
        const L2 = G3.S.loc;
        // 自宅住戸を覚える(エレベーター・階段経由で帰宅するため)
        if (L2.k === "in" && L2.b === G3.hero.homeB && isUnitFloor(L2.floor)) G3.S.homeUnit = L2.floor;
        if (condoFixM !== G3.S.M) fixCondoHeights(G3);
        // 電車を降りたら目的地へ歩きを再開
        if (U.railNext != null && !U.modal && !RD.on && !NAV) {
          const fb = U.railNext;
          U.railNext = null;
          setDest(G3.bld(fb), navMode());
          navTo({ kind: "bld", b: fb }, { run: true });
        }
      }
      speedBar();
    }, 400);
  })();
  function showTapMark(e) {
    const mk = $("tapmark"), ar = $("app").getBoundingClientRect();
    if (!mk) return;
    mk.style.left = e.clientX - ar.left + "px";
    mk.style.top = e.clientY - ar.top + "px";
    mk.classList.add("on");
    setTimeout(() => mk.classList.remove("on"), 60);
  }
