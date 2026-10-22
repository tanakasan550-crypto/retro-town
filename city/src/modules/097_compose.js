  // src/compose.js
  var MARKS = { skin: ["#c8e000", "#98a800"], hair: ["#00c8c8", "#009090", "#60e8e8"], top: ["#e00000", "#a00000"], bottom: ["#0000e0", "#0000a0"], acc: ["#00e000", "#009000"], bag: ["#e000e0", "#900090"], shoe: ["#e08000", "#e08000"], iris: ["#8040ff", "#8040ff"], blush: ["#ff8000", "#ff8000"] };
  var h2 = (h) => parseInt(h.slice(1, 3), 16) << 16 | parseInt(h.slice(3, 5), 16) << 8 | parseInt(h.slice(5, 7), 16);
  var OUT = [58, 38, 52];
  var HG = null;
  var deadline = Infinity;
  function beginFrame(ms) {
    deadline = performance.now() + ms;
  }
  var overBudget = () => performance.now() > deadline;
  var P = null;
  var cellCache = /* @__PURE__ */ new Map();
  var missing = /* @__PURE__ */ new Set();
  async function loadParts(base = "") {
    const idx = await (await fetch(base + "assets/parts/index.json")).json();
    const pages = await Promise.all(idx.pages.map((p) => new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas");
        c.width = im.width;
        c.height = im.height;
        const x = c.getContext("2d");
        x.drawImage(im, 0, 0);
        res(c);
      };
      im.onerror = rej;
      im.src = base + p.file;
    })));
    P = { idx: idx.index, pages };
    return P;
  }
  function put(ctx4, key, view, fr, dy = 0) {
    const e = P.idx[`${key}|${view}|${fr}`];
    if (!e) {
      if (e === void 0) missing.add(`${key}|${view}|${fr}`);
      return;
    }
    const [pg, x, y, w, h, ox, oy] = e;
    ctx4.drawImage(P.pages[pg], x, y, w, h, ox, oy + dy, w, h);
  }
  function composeCell(A2, col, dir, fr, defer) {
    const view = dir === "r" ? "l" : dir;
    const key = `${A2.stage}|${JSON.stringify(partKeys(A2))}|${JSON.stringify(col)}|${dir}|${fr}`;
    let c = cellCache.get(key);
    if (c) return c;
    if (defer && performance.now() > deadline) return null;
    const K3 = partKeys(A2);
    const cv2 = document.createElement("canvas");
    cv2.width = 64;
    cv2.height = 96;
    const g = cv2.getContext("2d", { willReadFrequently: true });
    g.imageSmoothingEnabled = false;
    const wheel = A2.wheel;
    if (K3.hairB && view !== "l") put(g, K3.hairB, view, 0);
    if (K3.bag) put(g, "bagB:" + K3.bag, view, 0);
    put(g, K3.body, view, fr);
    if (K3.bag) put(g, "bagF:" + K3.bag, view, 0);
    if (view === "l") put(g, K3.body.replace("body:", "arm:"), "l", fr);
    if (K3.cane) put(g, K3.cane, view, fr);
    const bob = fr && !wheel ? -1 : 0, dy = bob + (A2.stoop || 0) + (wheel ? 7 : 0);
    const hg = HG || (HG = document.createElement("canvas"));
    hg.width = 64;
    hg.height = 96;
    const hc = hg.getContext("2d");
    put(hc, K3.base, view, 0);
    const fv = view !== "u";
    if (fv) {
      put(hc, K3.eyes, view, 0);
      put(hc, K3.brows, view, 0);
      put(hc, K3.mouth, view, 0);
      if (K3.beard) put(hc, K3.beard, view, 0);
      for (const f2 of K3.feat) put(hc, f2, view, 0);
      if (K3.wrinkle) put(hc, K3.wrinkle, view, 0);
    }
    put(hc, K3.hairF, view, 0);
    if (K3.hat) put(hc, K3.hat, view, 0);
    if (K3.glass && fv) put(hc, K3.glass, view, 0);
    g.drawImage(hg, 0, dy);
    const im = g.getImageData(0, 0, 64, 96);
    const u = new Uint32Array(im.data.buffer);
    const map2 = /* @__PURE__ */ new Map();
    const abgr = (h) => 4278190080 | (h & 255) << 16 | h & 65280 | h >>> 16;
    const set = (m, t) => {
      map2.set(abgr(h2(m)), abgr(h2(t)));
    };
    set(MARKS.skin[0], col.skin);
    set(MARKS.skin[1], col.skinS);
    set(MARKS.hair[0], col.hair);
    set(MARKS.hair[1], col.hairS);
    set(MARKS.hair[2], col.hairH);
    set(MARKS.top[0], col.top);
    set(MARKS.top[1], col.topS);
    set(MARKS.bottom[0], col.bottom);
    set(MARKS.bottom[1], col.bottomS);
    set(MARKS.acc[0], col.acc);
    set(MARKS.acc[1], col.accS);
    set(MARKS.bag[0], col.bag);
    set(MARKS.bag[1], col.bagS);
    set(MARKS.shoe[0], col.shoe);
    set(MARKS.iris[0], col.iris);
    set(MARKS.blush[0], col.blushC || col.skinS);
    const N2 = 64 * 96;
    let last = -1;
    for (let i = 0; i < N2; i++) {
      const v = u[i];
      if (v >>> 24 < 128) {
        u[i] = 0;
        continue;
      }
      const w = v | 4278190080;
      const m = map2.get(w);
      u[i] = m !== void 0 ? m : w;
      last = i;
    }
    const src = new Uint32Array(u);
    const OUTV = abgr(OUT[0] << 16 | OUT[1] << 8 | OUT[2]);
    let maxY = -1;
    for (let y = 0; y < 96; y++) for (let x = 0; x < 64; x++) {
      const i = y * 64 + x;
      if (src[i]) {
        if (y > maxY) maxY = y;
        continue;
      }
      if (x < 63 && src[i + 1] || x > 0 && src[i - 1] || y < 95 && src[i + 64] || y > 0 && src[i - 64]) {
        u[i] = OUTV;
        if (y > maxY) maxY = y;
      }
    }
    g.putImageData(im, 0, 0);
    let out = cv2;
    if (dir === "r") {
      const m = document.createElement("canvas");
      m.width = 64;
      m.height = 96;
      const mg = m.getContext("2d");
      mg.translate(64, 0);
      mg.scale(-1, 1);
      mg.drawImage(cv2, 0, 0);
      out = m;
    }
    out.k = key;
    out.pad96 = 95 - maxY;
    cellCache.set(key, out);
    if (cellCache.size > 4e3) cellCache.delete(cellCache.keys().next().value);
    return out;
  }

