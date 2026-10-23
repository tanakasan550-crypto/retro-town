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

  // Android 実機の検証(設定 → 端末の検証): 描画(5秒)・端末内の保存と読み込みの往復(専用の枠 devicecheck に保存し、読み直して一致を確かめ、消す)・
  // メモリ・保存の空き容量。結果は端末に残し(localStorage nls_devcheck)、コピーして報告できる。手で確かめる項目の一覧も付ける。
  // ここでの結果は「その端末で動いた記録」で、PC のエミュレーションの結果を実機の合格としない
  var DEVCHECK_MANUAL = ["縦持ち・横持ちを切り替えても画面が崩れない", "ジョイスティック/十字キーで歩ける・タップで移動できる", "建物に入る・出る・階段とエレベーターで階を移る", "メニュー・モーダルが指で押せる(文字を大きくするも)", "音が鳴る・音量を変えられる・字幕が出る", "戻るボタン・ホーム画面に戻って再開しても続きから遊べる", "セーブ → アプリを閉じる → 開いて続きから遊べる", "10分遊んで端末が熱くなりすぎない・電池の減り"];
  async function runDeviceCheck(R5, G4, step = () => {
  }) {
    const out = { kind: "devicecheck" };
    step("描画を5秒計測しています…");
    out.diag = await runDiag(R5, G4, 5);
    step("端末内に保存して読み直しています…");
    const sv = { ok: false };
    try {
      const t0 = performance.now();
      await saveSlot("devicecheck", G4, { label: "端末の検証(自動で消します)" });
      const t1 = performance.now();
      const rec = await loadSlot("devicecheck");
      const t2 = performance.now();
      const G5 = Game.load(rec.data);
      const t3 = performance.now();
      const a = G4.world, b = G5.world;
      sv.same = { hero: G5.hero.id === G4.hero.id, month: G5.S.M === G4.S.M, people: b.pop.n === a.pop.n, slots: b.slots.b.length === a.slots.b.length, money: G5.hero.money === G4.hero.money, tenants: JSON.stringify(b.bizOv || null) === JSON.stringify(a.bizOv || null) };
      sv.ok = Object.values(sv.same).every(Boolean);
      sv.ms = { save: Math.round(t1 - t0), load: Math.round(t2 - t1), restore: Math.round(t3 - t2) };
      await deleteSlot("devicecheck");
      sv.deleted = !await loadSlot("devicecheck");
    } catch (e) {
      sv.err = String(e && e.message || e);
    }
    out.save = sv;
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const e = await navigator.storage.estimate();
        out.storageMB = { used: +(e.usage / 1048576).toFixed(1), quota: +(e.quota / 1048576).toFixed(0) };
      }
    } catch (e) {
    }
    out.manual = DEVCHECK_MANUAL;
    out.verdict = `${out.diag.verdict}・保存の往復 ${sv.ok ? "一致" : "不一致または失敗"}`;
    try {
      localStorage.setItem("nls_devcheck", JSON.stringify(out));
    } catch (e) {
    }
    return out;
  }
  var deviceCheckText = (c) => diagText(c.diag) + `
【保存と読み込み】${c.save.ok ? "一致" : "不一致・失敗"}${c.save.ms ? `(保存 ${c.save.ms.save}ms・読み込み ${c.save.ms.load}ms・復元 ${c.save.ms.restore}ms)` : ""}${c.save.same ? " 項目: " + Object.entries(c.save.same).map(([k, v]) => `${k}${v ? "○" : "×"}`).join(" ") : ""}${c.save.err ? " エラー: " + c.save.err : ""}${c.save.deleted === false ? "(検証用の枠が消えていません)" : ""}
` + (c.storageMB ? `端末の保存領域 ${c.storageMB.used}MB 使用 / 上限 ${c.storageMB.quota}MB
` : "") + `【手で確かめる項目(○×を書いて報告)】
` + c.manual.map((x, i) => `${i + 1}. ${x}: `).join("\n");
