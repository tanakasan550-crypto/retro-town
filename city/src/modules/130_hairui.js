  // src/hairui.js
  var yen3 = (n2) => "\xA5" + n2.toLocaleString("ja-JP");
  function previewHair(R5, g, canvas, hd, dir = "d") {
    const id = g.hero.id, old = R5.lifeOv.get(id);
    R5.lifeOv.set(id, { ...old || {}, hd });
    try {
      R5.lifePending = false;
      const ctx4 = canvas.getContext("2d");
      ctx4.clearRect(0, 0, canvas.width, canvas.height);
      ctx4.fillStyle = "#efe9dd";
      ctx4.fillRect(0, 0, canvas.width, canvas.height);
      ctx4.fillStyle = "#cfc7b4";
      ctx4.fillRect(0, canvas.height * 0.82, canvas.width, canvas.height * 0.18);
      const keep = R5.S;
      R5.S = Math.max(3, Math.floor(canvas.height / 24));
      const pop = g.world.pop;
      R5.drawChar(ctx4, canvas.width / 2, canvas.height * 0.9, pop.look[id], g.age(), dir, false, { wheel: !!(pop.needs[id] & 1), id });
      R5.S = keep;
    } finally {
      if (old) R5.lifeOv.set(id, old);
      else R5.lifeOv.delete(id);
    }
    return !R5.lifePending;
  }
  function draftHd(g, sel) {
    const hd = { ...g.hero.hairdo || {} };
    const age = g.age(), yr = g.year();
    const ids = sel.svc || [];
    const st3 = sel.style != null ? stylesFor(yr, age)[sel.style] : null;
    if (st3) {
      hd.key = st3.key;
      hd.m = g.S.M;
    }
    if (ids.includes("buzz")) {
      hd.key = "bald";
      hd.m = g.S.M;
    }
    if (ids.includes("perm") && !st3) {
      hd.key = "curly";
      hd.m = g.S.M;
    }
    if (ids.includes("color") || ids.includes("gray")) {
      hd.col = DYES[sel.dye ?? 1][1];
      hd.cm = g.S.M;
    }
    if (ids.includes("beard") && sel.facial) hd.facial = sel.facial;
    if (ids.includes("shave")) hd.facial = "";
    return hairNow(hd.key ? hd : null, g.S.M, age) || { key: void 0, col: hd.col || null, roots: 0 };
  }
  function hairModal(g, R5, bIdx, D3, sel = {}) {
    const b = g.world.map.buildings[bIdx], K3 = salonKind(b) || { n: "\u7406\u7F8E\u5BB9\u5BA4" };
    const age = g.age();
    sel.svc = sel.svc || [];
    const L2 = servicesFor(g, b, age, true);
    const q = quote(g, b, age, true, sel);
    const styles = stylesFor(g.year(), age);
    const needStyle = sel.svc.some((x) => ["cut", "kidcut", "perm", "set", "len"].includes(x)), needDye = sel.svc.some((x) => ["color", "gray"].includes(x));
    D3.showModal(`<h2>${b.name}(${K3.n})</h2><div class="row" style="justify-content:center"><canvas id="pv" width="144" height="200" style="width:96px;height:133px;border:2px solid #4a5a8a;border-radius:8px;image-rendering:pixelated"></canvas></div>
  <div class="tx small">\u30E1\u30CB\u30E5\u30FC(\u3044\u304F\u3064\u3067\u3082\u9078\u3079\u307E\u3059)</div><div class="row" style="flex-wrap:wrap">${L2.map((s) => `<button class="btn ${sel.svc.includes(s.id) ? "acc" : ""}" data-s="${s.id}">${s.n} ${yen3(s.price)}</button>`).join("")}</div>
  ${needStyle ? `<div class="tx small">\u30B9\u30BF\u30A4\u30EB(\u3044\u307E\u306E\u6D41\u884C\u306B\u3042\u308F\u305B\u305F\u540D\u524D)</div><div class="row" style="flex-wrap:wrap">${styles.map((s, i) => `<button class="btn ${sel.style === i ? "acc" : ""}" data-y="${i}">${s.n}</button>`).join("")}</div>` : ""}
  ${needDye ? `<div class="tx small">\u9AEA\u8272</div><div class="row" style="flex-wrap:wrap">${DYES.map((d, i) => `<button class="btn ${(sel.dye ?? 1) === i ? "acc" : ""}" data-d="${i}"><span style="display:inline-block;width:10px;height:10px;background:${d[1]};border:1px solid #fff"></span> ${d[0]}</button>`).join("")}</div>` : ""}
  ${sel.svc.includes("beard") ? `<div class="row"><button class="btn ${sel.facial === "mustache" ? "acc" : ""}" data-f="mustache">\u53E3\u3072\u3052</button><button class="btn ${sel.facial === "beard" ? "acc" : ""}" data-f="beard">\u3042\u3054\u3072\u3052</button></div>` : ""}
  <div class="tx" id="tot"><b>\u5408\u8A08 ${yen3(q.total)}</b>(${q.minutes}\u5206)  \u6240\u6301\u91D1 ${yen3(Math.round(g.hero.money))}</div>
  <div class="row"><button class="btn acc" id="pay" ${!q.items.length || g.hero.money < q.total ? "disabled" : ""}>\u304A\u9858\u3044\u3059\u308B(${yen3(q.total)})</button><button class="btn sec" id="x">\u3084\u3081\u308B</button></div>`, (c) => {
      const pv = c.querySelector("#pv");
      let tries = 0;
      const draw2 = () => {
        if (!pv.isConnected) return;
        const hd = draftHd(g, sel);
        const done = previewHair(R5, g, pv, hd);
        if (!done && tries++ < 25) setTimeout(draw2, 120);
      };
      draw2();
      c.querySelectorAll("[data-s]").forEach((bt) => bt.onclick = () => {
        const i = sel.svc.indexOf(bt.dataset.s);
        if (i < 0) sel.svc.push(bt.dataset.s);
        else sel.svc.splice(i, 1);
        hairModal(g, R5, bIdx, D3, sel);
      });
      c.querySelectorAll("[data-y]").forEach((bt) => bt.onclick = () => {
        sel.style = +bt.dataset.y;
        hairModal(g, R5, bIdx, D3, sel);
      });
      c.querySelectorAll("[data-d]").forEach((bt) => bt.onclick = () => {
        sel.dye = +bt.dataset.d;
        hairModal(g, R5, bIdx, D3, sel);
      });
      c.querySelectorAll("[data-f]").forEach((bt) => bt.onclick = () => {
        sel.facial = bt.dataset.f;
        hairModal(g, R5, bIdx, D3, sel);
      });
      c.querySelector("#pay").onclick = (ev) => {
        ev.target.disabled = true;
        const r = doHair(g, b, { ...sel, man: true });
        D3.toast(r.msg, 4200);
        if (r.ok) {
          D3.sfx && D3.sfx.scissors && D3.sfx.scissors();
          setTimeout(() => D3.sfx && D3.sfx.register && D3.sfx.register(), 500);
          D3.updateHud(true);
          D3.closeModal();
        } else hairModal(g, R5, bIdx, D3, sel);
      };
      c.querySelector("#x").onclick = D3.closeModal;
    });
  }

