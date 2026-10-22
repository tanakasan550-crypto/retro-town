  // src/clothing.js
  var O = (outfit, n2, e, p, grp, from = 0, to = 9999, sea = null) => ({ outfit, n: n2, e, p, grp, from, to, sea });
  var WEAR = [
    O("romper", "\u30ED\u30F3\u30D1\u30FC\u30B9", "\u{1F37C}", 2500, [0]),
    O("kiddress", "\u30EF\u30F3\u30D4\u30FC\u30B9(\u3053\u3069\u3082)", "\u{1F457}", 3800, [0, 1]),
    O("kidtee", "T\u30B7\u30E3\u30C4(\u3053\u3069\u3082)", "\u{1F455}", 2200, [0, 1], 0, 9999, 1),
    O("hoodie", "\u30D1\u30FC\u30AB\u30FC", "\u{1F9E5}", 4800, [1, 2], 0, 9999, 3),
    O("jersey", "\u30B8\u30E3\u30FC\u30B8", "\u{1F3BD}", 4200, [1, 2], 1975),
    O("soccer", "\u30B5\u30C3\u30AB\u30FC\u30B7\u30E3\u30C4", "\u26BD", 3600, [1], 1993),
    O("tee", "T\u30B7\u30E3\u30C4", "\u{1F455}", 2800, [1, 2], 0, 9999, 1),
    O("cardigan", "\u30AB\u30FC\u30C7\u30A3\u30AC\u30F3", "\u{1F9F6}", 6500, [2], 0, 9999, 3),
    O("blouse", "\u30D6\u30E9\u30A6\u30B9", "\u{1F45A}", 5200, [2]),
    O("dress", "\u30EF\u30F3\u30D4\u30FC\u30B9", "\u{1F457}", 8800, [2]),
    O("suit", "\u30B9\u30FC\u30C4", "\u{1F935}", 24e3, [2]),
    O("kimono", "\u7740\u7269", "\u{1F458}", 38e3, [2])
  ];
  var COLORS = 6;
  var wearName = (w) => {
    const o = WEAR.find((q) => q.outfit === w.outfit);
    return o ? o.n : w.outfit;
  };
  function closetOf(h) {
    return h.closet || (h.closet = []);
  }
  var priceWear = (g, o) => Math.max(100, Math.round(g.yen(o.p) / 100) * 100);
  function wearList(g, age, month0) {
    const grp = wearGroup(age), y = g.year();
    return WEAR.filter((o) => o.grp.includes(grp) && y >= o.from && y <= o.to);
  }
  function wearNow(g) {
    const w = g.hero.wear;
    return w && w.grp === wearGroup(g.age()) ? w : null;
  }
  function putOn(g, item) {
    g.hero.wear = { outfit: item.outfit, wardrobe: item.wardrobe, grp: item.grp ?? wearGroup(g.age()), name: item.name || wearName(item) };
    return g.hero.wear;
  }
  function takeOff(g) {
    g.hero.wear = null;
  }
  function buyWear(g, outfit, colorIdx) {
    const o = WEAR.find((q) => q.outfit === outfit);
    if (!o) return { ok: false, msg: "\u305D\u306E\u670D\u306F\u3042\u308A\u307E\u305B\u3093" };
    const grp = wearGroup(g.age());
    if (!o.grp.includes(grp)) return { ok: false, msg: "\u3044\u307E\u306E\u5E74\u4EE3\u3067\u306F\u7740\u3089\u308C\u307E\u305B\u3093" };
    const pr = priceWear(g, o);
    if (g.hero.money < pr) return { ok: false, msg: "\u6240\u6301\u91D1\u304C\u8DB3\u308A\u307E\u305B\u3093" };
    const item = { outfit, wardrobe: 1e3 + colorIdx * 17 + hash2(g.hero.id, colorIdx) % 5, grp, name: o.n, bought: g.S.M, price: pr };
    g.pay(pr, `\u670D: ${o.n}`);
    closetOf(g.hero).push(item);
    putOn(g, item);
    g.advance(20);
    const ch = g.chg({ charm: 1.2, mood: 3 });
    g.log("shop", `${o.n}\u3092\u8CB7\u3063\u3066\u7740\u66FF\u3048\u305F`);
    return { ok: true, msg: `${o.n}\u3092\u8CB7\u3063\u3066\u3001\u305D\u306E\u307E\u307E\u7740\u3066\u5E30\u308A\u307E\u3059(\xA5${pr.toLocaleString("ja-JP")})\u3002${ch}`, item };
  }
  function previewInto2(R5, g, canvas, outfit, wardrobe, dir = "d") {
    const id = g.hero.id, old = R5.lifeOv.get(id);
    const hadW = g.hero.wear;
    R5.lifeOv.set(id, { ...old || {}, outfit, wardrobe });
    try {
      R5.lifePending = false;
      const ctx4 = canvas.getContext("2d");
      ctx4.clearRect(0, 0, canvas.width, canvas.height);
      ctx4.fillStyle = "#e9e4d8";
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
      g.hero.wear = hadW;
    }
    return !R5.lifePending;
  }
  function fittingModal(g, R5, bIdx, D3, sel = {}) {
    const b = g.world.map.buildings[bIdx];
    const age = g.age();
    const list = wearList(g, age, g.month0());
    const o = list.find((q) => q.outfit === sel.outfit) || list[0];
    const ci = sel.color || 0;
    if (!o) {
      D3.showModal(`<h2>${b.name}</h2><div class="tx">\u3053\u306E\u5E74\u4EE3\u5411\u3051\u306E\u670D\u306F\u7F6E\u3044\u3066\u3044\u307E\u305B\u3093\u3002</div><div class="row"><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c) => {
        c.querySelector("#x").onclick = D3.closeModal;
      });
      return;
    }
    const pr = priceWear(g, o);
    const closet = closetOf(g.hero).filter((q) => q.grp === wearGroup(age));
    D3.showModal(`<h2>${b.name}\u30FB\u8A66\u7740\u5BA4</h2><div class="row" style="justify-content:center"><canvas id="pv" width="144" height="200" style="width:96px;height:133px;border:2px solid #4a5a8a;border-radius:8px;image-rendering:pixelated"></canvas></div>
  <div class="tx" style="text-align:center"><b>${o.e} ${o.n}</b>  \xA5${pr.toLocaleString("ja-JP")}${o.sea === 3 ? "(\u51AC\u5411\u304D)" : o.sea === 1 ? "(\u590F\u5411\u304D)" : ""}</div>
  <div class="tx small">\u670D\u3092\u9078\u3076</div><div class="row" style="flex-wrap:wrap">${list.map((q) => `<button class="btn ${q.outfit === o.outfit ? "acc" : ""}" data-o="${q.outfit}">${q.e} ${q.n}</button>`).join("")}</div>
  <div class="tx small">\u8272\u3092\u9078\u3076</div><div class="row" style="flex-wrap:wrap">${Array.from({ length: COLORS }, (_, i) => `<button class="btn ${i === ci ? "acc" : ""}" data-c="${i}">\u8272${i + 1}</button>`).join("")}</div>
  ${closet.length ? `<div class="tx small">\u6301\u3063\u3066\u3044\u308B\u670D(\u30AF\u30ED\u30FC\u30BC\u30C3\u30C8)</div><div class="row" style="flex-wrap:wrap">${closet.map((q, i) => `<button class="btn" data-w="${i}">${q.name}</button>`).join("")}</div>` : ""}
  <div class="row"><button class="btn acc" id="buy" ${g.hero.money < pr ? "disabled" : ""}>\u8CB7\u3046(\xA5${pr.toLocaleString("ja-JP")})</button><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c) => {
      const wardrobe = 1e3 + ci * 17 + hash2(g.hero.id, ci) % 5;
      const pv = c.querySelector("#pv");
      let tries = 0;
      const draw2 = () => {
        if (!pv.isConnected) return;
        const done = previewInto2(R5, g, pv, o.outfit, wardrobe);
        if (!done && tries++ < 25) setTimeout(draw2, 120);
      };
      draw2();
      D3.sfx && D3.sfx.fitting && D3.sfx.fitting();
      c.querySelectorAll("[data-o]").forEach((bt) => bt.onclick = () => fittingModal(g, R5, bIdx, D3, { outfit: bt.dataset.o, color: ci }));
      c.querySelectorAll("[data-c]").forEach((bt) => bt.onclick = () => fittingModal(g, R5, bIdx, D3, { outfit: o.outfit, color: +bt.dataset.c }));
      c.querySelectorAll("[data-w]").forEach((bt) => bt.onclick = () => {
        const it = closet[+bt.dataset.w];
        putOn(g, it);
        D3.toast(`${it.name}\u306B\u7740\u66FF\u3048\u307E\u3057\u305F`, 2400);
        fittingModal(g, R5, bIdx, D3, sel);
      });
      c.querySelector("#buy").onclick = () => {
        const r = buyWear(g, o.outfit, ci);
        D3.toast(r.msg, 3600);
        if (r.ok) {
          D3.sfx && D3.sfx.register && D3.sfx.register();
          D3.updateHud(true);
          D3.closeModal();
        }
      };
      c.querySelector("#x").onclick = D3.closeModal;
    });
  }
  function closetModal(g, R5, D3) {
    const age = g.age();
    const closet = closetOf(g.hero).filter((q) => q.grp === wearGroup(age));
    const cur2 = wearNow(g);
    D3.showModal(`<h2>\u30AF\u30ED\u30FC\u30BC\u30C3\u30C8</h2><div class="tx">\u3044\u307E: <b>${cur2 ? cur2.name : "\u3075\u3060\u3093\u7740(\u305D\u306E\u65E5\u306E\u5B63\u7BC0\u30FB\u6642\u4EE3\u306B\u5408\u308F\u305B\u305F\u670D)"}</b></div><div class="list">${closet.map((q, i) => `<button class="btn item" data-w="${i}">${q.name}</button>`).join("") || '<div class="tx small">\u8CB7\u3063\u305F\u670D\u304C\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002\u6D0B\u670D\u5E97\u3067\u8CB7\u3048\u307E\u3059\u3002</div>'}${cur2 ? '<button class="btn item" id="off">\u3075\u3060\u3093\u7740\u306B\u623B\u3059</button>' : ""}</div><div class="row"><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c) => {
      c.querySelectorAll("[data-w]").forEach((bt) => bt.onclick = () => {
        putOn(g, closet[+bt.dataset.w]);
        D3.toast("\u7740\u66FF\u3048\u307E\u3057\u305F", 2e3);
        closetModal(g, R5, D3);
      });
      const off = c.querySelector("#off");
      if (off) off.onclick = () => {
        takeOff(g);
        closetModal(g, R5, D3);
      };
      c.querySelector("#x").onclick = D3.closeModal;
    });
  }

