  // src/eraads.js
  var eraTier = (y) => y < 1955 ? 0 : y < 1980 ? 1 : y < 2e3 ? 2 : y < 2012 ? 3 : 4;
  var SCREEN_YEAR = { crt: 1985, led: 2003 };
  var FONT = '"Hiragino Sans","Yu Gothic","Noto Sans CJK JP","Noto Sans JP","Meiryo",sans-serif';
  var BIG = /* @__PURE__ */ new Set(["downtown", "tower"]);
  var ZONES = { shotengai: 3, onsen: 2, downtown: 5, tower: 5, oldtown: 4, chinatown: 3 };
  var cache12 = /* @__PURE__ */ new WeakMap();
  function boardSpots(map2) {
    let m = cache12.get(map2);
    if (m) return m;
    m = /* @__PURE__ */ new Map();
    cache12.set(map2, m);
    if (map2.ver !== 4) return m;
    const { W: W2, H: H4, ground, deco, bid, solid, buildings } = map2;
    const cinemas = buildings.filter((b) => b.type === "cinema");
    const PR = buildProps(map2);
    const doorAt = new Set(buildings.map((b) => b.doorX + b.doorY * W2));
    const okTile = (x, y) => {
      if (x < 2 || y < 2 || x >= W2 - 2 || y >= H4 - 2) return false;
      const k = x + y * W2;
      const g = ground[k];
      if (g !== T.GRASS && g !== T.PLAZA && g !== T.PATH) return false;
      return !PR.has(k) && !deco[k] && bid[k] < 0 && !solid[k] && !doorAt.has(k) && !doorAt.has(k + 1) && !doorAt.has(k - 1);
    };
    for (const b of buildings) {
      if (b.parent !== void 0) continue;
      const every2 = b.type === "station" ? 1 : ZONES[b.zone];
      if (!every2) continue;
      const h = hash2(b.idx * 2654435761 | 0, 5369127) >>> 0;
      if (h % every2) continue;
      const cand = [[b.x - 1, b.y + b.h - 1], [b.x + b.w, b.y + b.h - 1]];
      if (h >>> 5 & 1) cand.reverse();
      const pt = cand.find(([cx, cy]) => okTile(cx, cy));
      if (!pt) continue;
      const [x, y] = pt;
      let ci = -1, cd = 1e9;
      for (const c of cinemas) {
        const d = Math.abs(c.x - b.x) + Math.abs(c.y - b.y);
        if (d < cd) {
          cd = d;
          ci = c.idx;
        }
      }
      const spot = { x, y, host: b.idx, zone: b.zone, h, cinema: cd < 140 ? ci : -1 };
      const k = (x >> 3) + (y >> 3) * 4096;
      (m.get(k) || m.set(k, []).get(k)).push(spot);
    }
    return m;
  }
  var boardsIn = (map2, cx, cy) => boardSpots(map2).get(cx + cy * 4096) || [];
  function boardKind(s, year) {
    const t = eraTier(year), r = (s.h >>> 9) % 10, big = BIG.has(s.zone), st3 = s.zone === "onsen";
    if (t === 0) return r < 5 ? "notice" : r < 8 ? "wood" : "poster";
    if (t === 1) return r < 3 ? "notice" : r < 5 ? "wood" : r < 8 ? "poster" : "neon";
    if (t === 2) return big && year >= SCREEN_YEAR.crt && r < 5 ? "crt" : r < 2 ? "notice" : r < 6 ? "neon" : r < 8 ? "poster" : "wood";
    if (t === 3) return big && year >= SCREEN_YEAR.led && r < 4 ? "led" : r < 2 ? "notice" : r < 5 ? "neon" : r < 8 ? "poster" : "wood";
    return (big || s.zone === "shotengai" || st3) && r < (big ? 6 : 3) ? "led" : r < 5 ? "sign" : r < 7 ? "notice" : "poster";
  }
  var WAFU = ["\u304A\u98DF\u4E8B\u51E6", "\u55B6\u696D\u4E2D", "\u672C\u65E5\u5165\u8377", "\u5C71\u7530\u5546\u5E97", "\u7C73\u30FB\u5473\u564C", "\u5449\u670D", "\u624B\u6253\u3061\u305D\u3070", "\u6C37", "\u9152\u30FB\u7159\u8349", "\u7406\u9AEA"];
  var PAINT = ["\u5927\u58F2\u51FA\u3057", "\u6620\u753B\u4E0A\u6620\u6848\u5185", "\u6B73\u672B\u5927\u58F2\u51FA\u3057", "\u30DF\u30EB\u30AF\u30FB\u30D1\u30F3", "\u96FB\u6C17\u5668\u5177", "\u5199\u771F\u9928", "\u55AB\u8336", "\u8CB8\u672C"];
  var NEON = ["\u30AB\u30E9\u30AA\u30B1\u55B6\u696D\u4E2D", "\u65B0\u4F5C\u30D3\u30C7\u30AA\u5165\u8377", "\u30AB\u30BB\u30C3\u30C8\u30FBCD\u767A\u58F2\u4E2D", "\u30B5\u30DE\u30FC\u30BB\u30FC\u30EB", "\u30B9\u30CA\u30C3\u30AF", "\u30B2\u30FC\u30E0\u30BB\u30F3\u30BF\u30FC", "\u55AB\u8336", "\u30D1\u30C1\u30F3\u30B3"];
  var CM = [["\u9EA6\u8336 \u3072\u3068\u3084\u3059\u307F", "#2e7d4f"], ["\u6D77\u306E\u99C5 \u307E\u3064\u308A", "#1f6fb5"], ["\u3042\u304A\u307F\u7C73 \u65B0\u7C73", "#c7902e"], ["\u6708\u898B\u6E29\u6CC9 \u3086\u3051\u3080\u308A", "#8a4fb0"]];
  var pick4 = (a, h) => a[(h >>> 3) % a.length];
  function noticeContent(map2, s, year, month0) {
    const host = map2.buildings[s.host];
    const lines = [], link = [];
    if (month0 === 8 || month0 === 9) {
      lines.push("\u79CB\u307E\u3064\u308A");
      lines.push("10\u6708 \u5883\u5185\u30FB\u5546\u5E97\u8857");
      link.push("festival");
    }
    if (host && host.openYear != null && host.openYear >= year - 1 && host.openYear <= year) {
      lines.push("\u958B\u5E97\u306E\u304A\u77E5\u3089\u305B");
      lines.push(String(host.name).slice(0, 9));
      link.push("open");
    }
    const c = s.cinema >= 0 ? map2.buildings[s.cinema] : null;
    if (c && eraTier(year) >= 1) {
      lines.push("\u4E0A\u6620\u4E2D");
      lines.push(String(c.name).slice(0, 9));
      link.push("movie");
    }
    if (!lines.length) {
      lines.push(eraTier(year) === 0 ? "\u914D\u7D66\u306E\u304A\u77E5\u3089\u305B" : "\u753A\u5185\u4F1A\u306E\u304A\u77E5\u3089\u305B");
      lines.push(eraTier(year) === 0 ? "\u672C\u65E5 \u6B63\u5348" : "\u56DE\u89A7\u677F\u3092\u3054\u89A7\u304F\u3060\u3055\u3044");
    }
    return { lines, link };
  }
  function drawBoard(c, X, Y2, Z, s, year, month0, map2, t, night) {
    const kind = boardKind(s, year), tier2 = eraTier(year), h = s.h;
    const pw = 15 * Z, ph = 11 * Z, pole = 17 * Z;
    const x0 = X - pw / 2, y0 = Y2 - pole - ph;
    c.save();
    c.textAlign = "center";
    c.textBaseline = "middle";
    const post = (col) => {
      c.fillStyle = col;
      c.fillRect(X - 0.8 * Z, Y2 - pole, 1.6 * Z, pole);
      c.fillStyle = "rgba(0,0,0,0.16)";
      c.beginPath();
      c.ellipse(X, Y2, 5 * Z, 1.8 * Z, 0, 0, 7);
      c.fill();
    };
    const txt2 = (s2, x, y, px2, col, bold) => {
      c.font = `${bold ? "700 " : ""}${Math.max(5, px2 * Z)}px ${FONT}`;
      c.fillStyle = col;
      c.fillText(s2, x, y);
    };
    if (kind === "notice") {
      const n2 = noticeContent(map2, s, year, month0);
      post("#5a4630");
      c.fillStyle = tier2 === 0 ? "#6b4a2a" : "#4a5a6a";
      c.fillRect(x0 - Z, y0 - Z, pw + 2 * Z, ph + 2 * Z);
      c.fillStyle = tier2 === 0 ? "#e9dfc4" : "#f1efe4";
      c.fillRect(x0, y0, pw, ph);
      c.fillStyle = n2.link.length ? "#d8442e" : "#9a9a8a";
      c.fillRect(x0 + Z, y0 + Z, pw - 2 * Z, 2.2 * Z);
      txt2(tier2 === 0 ? "\u63B2\u793A\u677F" : "\u63B2\u793A", X, y0 + 2.1 * Z, 2, "#fff", true);
      txt2(n2.lines[0], X, y0 + 5.4 * Z, 2.4, "#222", true);
      txt2(n2.lines[1] || "", X, y0 + 8.4 * Z, 1.9, "#444");
      if (tier2 === 0) {
        c.fillStyle = "#b08a60";
        c.fillRect(x0 + 1.2 * Z, y0 + 9.4 * Z, 3 * Z, 1.2 * Z);
      }
    } else if (kind === "wood") {
      post("#5a4630");
      c.fillStyle = "#9a7242";
      c.fillRect(x0, y0 + Z, pw, ph - 2 * Z);
      c.strokeStyle = "#6b4c28";
      c.lineWidth = Z * 0.6;
      c.strokeRect(x0, y0 + Z, pw, ph - 2 * Z);
      txt2(pick4(tier2 === 0 ? WAFU : PAINT, h), X, y0 + ph / 2, 3.1, tier2 === 0 ? "#2a1a0c" : "#fff6dc", true);
    } else if (kind === "poster") {
      post("#555");
      const col = ["#c93a2e", "#2f6aa8", "#e0a62b", "#3a8a5a"][h >>> 6 & 3];
      c.fillStyle = "#f3eee0";
      c.fillRect(x0 + Z, y0, pw - 2 * Z, ph);
      c.fillStyle = col;
      c.fillRect(x0 + 2 * Z, y0 + Z, pw - 4 * Z, ph * 0.58);
      txt2(tier2 === 0 ? "\u6620\u753B\u4E0A\u6620\u6848\u5185" : "\u8FD1\u65E5\u4E0A\u6620", X, y0 + ph * 0.8, 2.2, "#222", true);
      c.fillStyle = "rgba(255,255,255,0.5)";
      c.beginPath();
      c.arc(X, y0 + ph * 0.36, 2.3 * Z, 0, 7);
      c.fill();
    } else if (kind === "neon") {
      post("#444");
      const col = ["#ff4f9a", "#4fe0ff", "#ffd24a", "#7dff7a"][h >>> 6 & 3];
      const on2 = night || (Math.floor(t * 2) + h & 3) !== 0;
      c.fillStyle = "#17141f";
      c.fillRect(x0 + 2 * Z, y0 - 2 * Z, pw - 4 * Z, ph + 3 * Z);
      c.strokeStyle = col;
      c.lineWidth = Z * 0.9;
      c.globalAlpha = on2 ? 1 : 0.35;
      c.strokeRect(x0 + 2.8 * Z, y0 - 1.2 * Z, pw - 5.6 * Z, ph + 1.4 * Z);
      txt2(pick4(NEON, h).slice(0, 4), X, y0 + ph * 0.28, 2.6, col, true);
      txt2(pick4(NEON, h >>> 4).slice(0, 4), X, y0 + ph * 0.7, 2.6, col, true);
      c.globalAlpha = 1;
    } else if (kind === "crt") {
      post("#3a3a40");
      c.fillStyle = "#cfc8b4";
      c.fillRect(x0 - Z, y0 - Z, pw + 2 * Z, ph + 2.5 * Z);
      c.fillStyle = "#0c0f10";
      c.fillRect(x0 + Z, y0, pw - 2 * Z, ph - Z);
      const sl = Math.floor(t / 3 + h) % CM.length;
      c.fillStyle = CM[sl][1];
      c.fillRect(x0 + 1.4 * Z, y0 + 0.4 * Z, pw - 2.8 * Z, ph - 1.8 * Z);
      c.fillStyle = "rgba(0,0,0,0.16)";
      for (let i = 0; i < ph - Z; i += 1.6 * Z) c.fillRect(x0 + Z, y0 + i, pw - 2 * Z, 0.6 * Z);
      txt2(CM[sl][0], X, y0 + ph / 2 - 0.4 * Z, 2.1, "#fff", true);
    } else if (kind === "led" || kind === "sign") {
      const big = kind === "led", w = big ? pw * 1.25 : pw * 0.7, hh = big ? ph : ph * 1.2;
      post("#2b2e36");
      const lx = X - w / 2, ly = Y2 - pole - hh;
      c.fillStyle = "#101216";
      c.fillRect(lx - 0.7 * Z, ly - 0.7 * Z, w + 1.4 * Z, hh + 1.4 * Z);
      const sl = Math.floor(t / 4 + h) % 4, cm = CM[(h >>> 4) % CM.length];
      const host = map2.buildings[s.host];
      const slides = [[cm[0], cm[1], "\u67B6\u7A7ACM"], ["\u4ECA\u65E5\u306E\u5929\u6C17 \u306F\u308C", "#2a77b5", "\u5929\u6C17"], [month0 === 8 || month0 === 9 ? "\u79CB\u307E\u3064\u308A 10\u6708" : "\u5730\u57DF\u30A4\u30D9\u30F3\u30C8", "#b5412a", "\u30A4\u30D9\u30F3\u30C8"], [host ? String(host.name).slice(0, 8) : "\u5E97\u8217\u6848\u5185", "#3f7d4a", "\u5E97\u8217\u6848\u5185"]];
      const [tx, col, tag] = slides[big ? sl : 3 - (sl & 1)];
      c.fillStyle = col;
      c.fillRect(lx, ly, w, hh);
      c.fillStyle = "rgba(255,255,255,0.18)";
      c.fillRect(lx, ly, w, 1.6 * Z);
      txt2(tag, lx + w * 0.5, ly + 0.9 * Z, 1.5, "#fff");
      txt2(tx, X, ly + hh * 0.58, big ? 2.4 : 2, "#fff", true);
      if (night) {
        c.globalAlpha = 0.25;
        c.fillStyle = col;
        c.fillRect(lx - 2 * Z, ly - 2 * Z, w + 4 * Z, hh + 4 * Z);
        c.globalAlpha = 1;
      }
    }
    c.restore();
    return kind;
  }

