  // src/diag.js
  var pct = (a, p) => {
    if (!a.length) return 0;
    const b = [...a].sort((x, y) => x - y);
    return b[Math.min(b.length - 1, Math.floor(b.length * p))];
  };
  async function runDiag(R5, G4, secs = 5) {
    const out = {
      at: (/* @__PURE__ */ new Date()).toISOString(),
      ua: navigator.userAgent,
      screen: [screen.width, screen.height],
      inner: [innerWidth, innerHeight],
      dpr: devicePixelRatio,
      touch: navigator.maxTouchPoints | 0,
      cores: navigator.hardwareConcurrency || null,
      mem: navigator.deviceMemory || null,
      standalone: !!(matchMedia && matchMedia("(display-mode: standalone)").matches),
      online: navigator.onLine,
      sw: !!("serviceWorker" in navigator),
      orient: screen.orientation && screen.orientation.type || null
    };
    try {
      out.ls = (() => {
        localStorage.setItem("nls_probe", "1");
        localStorage.removeItem("nls_probe");
        return true;
      })();
    } catch (e) {
      out.ls = false;
    }
    try {
      out.idb = !!window.indexedDB;
    } catch (e) {
      out.idb = false;
    }
    const dts = [];
    let last = performance.now();
    const t0 = last;
    await new Promise((res) => {
      const f2 = (t) => {
        dts.push(t - last);
        last = t;
        if (t - t0 < secs * 1e3) requestAnimationFrame(f2);
        else res();
      };
      requestAnimationFrame(f2);
    });
    dts.shift();
    const avg = dts.reduce((a, b) => a + b, 0) / Math.max(1, dts.length);
    out.fps = +(1e3 / avg).toFixed(1);
    out.frameMs = { avg: +avg.toFixed(1), p95: +pct(dts, 0.95).toFixed(1), max: +Math.max(0, ...dts).toFixed(1) };
    out.longFrames = dts.filter((d) => d > 50).length;
    out.frames = dts.length;
    if (performance.memory) out.heapMB = { used: +(performance.memory.usedJSHeapSize / 1048576).toFixed(1), limit: +(performance.memory.jsHeapSizeLimit / 1048576).toFixed(0) };
    try {
      out.scene = { loc: G4.S.loc.k, items: R5.isoStats && R5.isoStats.items, bld: R5.isoStats && R5.isoStats.bld, prof: R5.prof && Object.fromEntries(Object.entries(R5.prof).map(([k, v]) => [k, +v.toFixed(1)])), canvas: [R5.cv.width, R5.cv.height], zoom: R5.zl };
    } catch (e) {
    }
    out.verdict = out.fps >= 30 && out.frameMs.p95 <= 50 ? "\u826F\u597D(30fps\u4EE5\u4E0A)" : out.fps >= 20 ? "\u91CD\u3044(20\u301C30fps)" : "\u975E\u5E38\u306B\u91CD\u3044(20fps\u672A\u6E80)";
    try {
      localStorage.setItem("nls_diag", JSON.stringify(out));
    } catch (e) {
    }
    return out;
  }
  var diagText = (d) => `\u3010\u7AEF\u672B\u8A3A\u65AD\u3011${d.at}
\u5224\u5B9A: ${d.verdict}
FPS ${d.fps} / \u30D5\u30EC\u30FC\u30E0\u5E73\u5747 ${d.frameMs.avg}ms\u30FB95%\u70B9 ${d.frameMs.p95}ms\u30FB\u6700\u5927 ${d.frameMs.max}ms\u30FB50ms\u8D85 ${d.longFrames}\u56DE(${d.frames}\u30D5\u30EC\u30FC\u30E0)
\u753B\u9762 ${d.inner.join("\xD7")} (DPR ${d.dpr}) / \u30BF\u30C3\u30C1 ${d.touch}\u70B9 / \u30B3\u30A2 ${d.cores ?? "?"} / \u30E1\u30E2\u30EA ${d.mem ?? "?"}GB
\u4FDD\u5B58: localStorage ${d.ls ? "OK" : "NG"} / IndexedDB ${d.idb ? "OK" : "NG"} / SW ${d.sw ? "\u5BFE\u5FDC" : "\u306A\u3057"} / \u30DB\u30FC\u30E0\u753B\u9762\u8D77\u52D5 ${d.standalone ? "\u306F\u3044" : "\u3044\u3044\u3048"}
` + (d.heapMB ? `JS\u30D2\u30FC\u30D7 ${d.heapMB.used}MB / \u4E0A\u9650 ${d.heapMB.limit}MB
` : "") + (d.scene ? `\u5834\u9762 ${d.scene.loc} / \u63CF\u753B\u7269 ${d.scene.items ?? "?"} / \u5EFA\u7269 ${d.scene.bld ?? "?"} / \u30BA\u30FC\u30E0 ${d.scene.zoom}
` : "") + `UA: ${d.ua}`;

