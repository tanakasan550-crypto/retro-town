  // src/fac_core.js — 施設の全面改修の共通基盤
  // 施設ごとの専用ビルダー・階構成・階名・操作(行動)・キャッシュ鍵を登録する。
  // 旧来の内装生成は登録の無い施設でそのまま使われる(既存の街・セーブを壊さない)。
  var FAC_BUILD = {};
  var FAC_RANGE = {};
  var FAC_LABEL = {};
  var FAC_KEY = {};
  var FAC_ACTS = {};
  var FAC_RUN = {};
  function facBuild(b, floor, g) {
    const f = FAC_BUILD[b.type];
    if (!f) return null;
    try {
      return f(b, floor, g);
    } catch (e) {
      console.warn("[fac build]", b.type, e);
      return null;
    }
  }
  function facRange(b) {
    const f = FAC_RANGE[b.type];
    return f ? f(b) : null;
  }
  function facLabel(b, lv) {
    const f = FAC_LABEL[b.type];
    return f ? f(b, lv) : null;
  }
  function facKey(g, b) {
    const f = FAC_KEY[b.type];
    return f ? ":" + f(g, b) : "";
  }
  // 行動: o.act が "fx_" で始まる設備は FAC_ACTS[act](g, o, b, push) が選択肢を出し、FAC_RUN[id](g, arg, tg, r) が実行する
  function facActs(g, o, b, push) {
    if (!o || !o.act || !FAC_ACTS[o.act]) return false;
    FAC_ACTS[o.act](g, o, b, push);
    return true;
  }
  function facRun(g, kind, arg, tg, r) {
    const f = FAC_RUN[kind];
    if (!f) return false;
    f(g, arg, tg, r);
    return true;
  }
  // ---- 間取りの道具
  function plan(W2, H4, floorTile, kind) {
    const m = mk2(W2, H4, floorTile, kind);
    const P = { W: W2, H: H4, ...m, staffSpots: [], seatSpots: [], stairs: [], kind };
    P.fill = (x0, y0, x1, y1, t) => {
      for (let y = Math.max(1, y0); y <= Math.min(H4 - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(W2 - 1, x1); x++) if (P.tiles[x + y * W2] !== "exit") P.tiles[x + y * W2] = t;
    };
    // 間仕切り壁(開口部 gaps=[x or y] を空ける)
    P.hwall = (x0, x1, y, gaps = [], label = "壁") => {
      for (let x = x0; x <= x1; x++) if (!gaps.includes(x)) P.add("pwall", x, y, null, label, true);
    };
    P.vwall = (x, y0, y1, gaps = [], label = "壁") => {
      for (let y = y0; y <= y1; y++) if (!gaps.includes(y)) P.add("pwall", x, y, null, label, true);
    };
    P.wide = (t, x, y, w, h, act, label, extra = {}) => P.add(t, x, y, act, label, true, { ...extra, w, h });
    P.windows = (step = 3) => {
      for (let x = 1; x < W2 - 1; x += step) P.objs.push({ t: "window", x, y: 0, solid: true, deco: true });
    };
    P.door = (x) => {
      const d = { x, y: H4 - 1 };
      P.tiles[x + d.y * W2] = "exit";
      P.reserve(x, H4 - 3, x, H4 - 2);
      P.doorPos = d;
      return d;
    };
    P.stair = (x, y, to, label, via = "main") => {
      const up = to > P.lv;
      P.add(up ? "stairs_up" : "stairs_down", x, y, "stairs", label, false, { to, via });
      P.stairs.push({ x, y, to, via });
    };
    P.lifts = (x, y, n, lo, hi2, label = "エレベーター") => {
      for (let i = 0; i < n; i++) P.add("elev", x + i * 2, y, "lift", `${label}${n > 1 ? i + 1 + "号機" : ""}`, true, { w: 2, h: 1, shaft: i, lo, hi: hi2 });
    };
    P.sign = (x, y, text) => P.add("roomsign", x, y, null, text, false, { text });
    P.done = (extra = {}) => ({ W: W2, H: H4, floors: extra.floors || 1, floor: extra.floor || 0, kind, tiles: P.tiles, objs: P.objs, door: P.doorPos || { x: -9, y: -9 }, stairs: P.stairs, staffSpots: P.staffSpots, seatSpots: P.seatSpots, accessible: true, noDoor: !P.doorPos, fac: true, ...extra });
    return P;
  }
  // ---- 住戸方式の個室(ホテル客室など)から廊下へ出たときの立ち位置
  function unitDoorSpot(g, bIdx, lv, pos) {
    try {
      const I2 = interiorOf(g, bIdx, lv).I;
      const d = I2.objs.find((o) => o.t === "udoor" && o.lv === lv && o.pos === pos);
      if (d) return [d.x + 0.5, d.y + 1.3];
    } catch (_) {
    }
    return null;
  }
  // ---- 体験シーン(全画面アニメーション): sc = { title, dur, draw(ctx, t, W, H, dpr), lines?: [[t, text]] }
  function facScene(sc, msg) {
    if (!sc) {
      if (msg) toast(msg, 4200);
      return;
    }
    const el = $("ride"), cv2 = $("ridecv");
    el.classList.add("on");
    U.modal = true;
    $("ridebar").innerHTML = '<button data-a="skip">終わる</button>';
    $("rideinfo").textContent = sc.title || "";
    const dpr = devicePixelRatio || 1;
    cv2.width = Math.round(cv2.clientWidth * dpr);
    cv2.height = Math.round(cv2.clientHeight * dpr);
    const ctx4 = cv2.getContext("2d");
    let ended = false, raf = 0;
    const t0 = performance.now();
    const end = () => {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf);
      el.classList.remove("on");
      U.modal = false;
      U.cwAt = -999;
      if (msg) toast(msg, 4600);
      if (sc.done) try {
        sc.done();
      } catch (_) {
      }
    };
    $("ridebar").querySelector("button").onclick = end;
    window.__scene = { end, sc };
    const loop = (ts) => {
      if (ended) return;
      const t = (ts - t0) / 1e3;
      try {
        sc.draw(ctx4, t, cv2.width, cv2.height, dpr);
      } catch (e) {
        console.warn("[scene]", e);
        return end();
      }
      if (sc.lines) {
        let cur = sc.title || "";
        for (const [lt, tx] of sc.lines) if (t >= lt) cur = tx;
        $("rideinfo").textContent = cur;
      }
      if (t >= sc.dur) end();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
