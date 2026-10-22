  // src/carui.js
  var yenS6 = (n2) => "\xA5" + Math.round(n2).toLocaleString("ja-JP");
  var colName = (i) => ["\u8D64", "\u9752", "\u9EC4", "\u767D", "\u9ED2", "\u7DD1", "\u9280", "\u8336", "\u30AA\u30EC\u30F3\u30B8", "\u30AC\u30F3\u30E1\u30BF", "\u6C34\u8272", "\u7D2B"][i] || "\u8272";
  var swatch = (i) => {
    const c = CAR_COLORS[i] || [128, 128, 128];
    return `<span style="display:inline-block;width:.9em;height:.9em;border-radius:50%;background:rgb(${c.join(",")});border:1px solid #888;vertical-align:-.1em"></span>`;
  };
  var gauge = (p) => `<span style="display:inline-block;width:6em;height:.7em;background:#ddd;border-radius:3px;vertical-align:middle;overflow:hidden"><span style="display:block;width:${Math.max(0, Math.min(100, p))}%;height:100%;background:${p < 15 ? "#d33" : p < 40 ? "#e9a21b" : "#3a9a55"}"></span></span> ${p}%`;
  var docState = (g, c) => {
    const M = g.S.M;
    const a = [], mo = (n2) => `${Math.floor(n2 / 12) + 1900}\u5E74${n2 % 12 + 1}\u6708`;
    a.push(M >= c.shakenM ? '<b style="color:#d33">\u8ECA\u691C\u5207\u308C</b>' : `\u8ECA\u691C ${mo(c.shakenM)}\u307E\u3067`);
    a.push(M >= c.insM ? '<b style="color:#d33">\u4FDD\u967A\u5207\u308C</b>' : `\u4FDD\u967A ${mo(c.insM)}\u307E\u3067`);
    return a.join(" / ");
  };
  var insLine = (g, c, m) => {
    const pol = c.pol || { co: "minato", cover: "std", ded: 5e4 };
    const co = INS_CO.find((x) => x.id === pol.co) || INS_CO[0];
    const ln = getLoans(g.hero).find((l) => l.uid === c.uid);
    const H4 = histOf(g.hero);
    return `
\u4FDD\u967A: ${co.name}\u30FB${COVERS[pol.cover].name}\u30FB\u514D\u8CAC${yenS6(g.yen(pol.ded))}\u30FB\u5E74\u984D${yenS6(insPremium(g, c, m.cls))}(\u4E8B\u6545\u6B74${c.accs || 0}\u56DE/\u8ACB\u6C42${H4.acc.filter((a) => a.claimed).length}\u4EF6)${ln ? `
\u30ED\u30FC\u30F3\u6B8B\u50B5 ${yenS6(ln.bal)}(\u6708${yenS6(ln.pay)}\u30FB\u3042\u3068${ln.left}\u56DE)` : ""}${c.rep && g.S.M < c.rep.until ? `
<b style="color:#d33">${c.rep.kind}\u306E\u4FEE\u7406\u4E2D(\u4FEE\u7406\u5DE5\u5834)</b>` : ""}`;
  };
  function carsPanelHtml(g) {
    migrateLegacy(g);
    const v = getCars(g.hero);
    if (!v.cars.length) return "";
    const out = g.S.loc.k === "out";
    return `<h3>\u30DE\u30A4\u30AB\u30FC</h3>` + v.cars.map((c) => {
      const m = MODEL[c.model];
      const cur2 = c.uid === v.cur;
      const riding = v.ride === "car" && cur2;
      return `<div class="tx small" style="border:1px solid #8884;border-radius:8px;padding:6px;margin:4px 0">${swatch(c.color)} <b>${carName(c)}</b>${cur2 ? " (\u4F7F\u7528\u4E2D)" : ""}
${CLS_NAMES[m.cls]} / ${FUEL_NAMES[m.fuel]} / \u71C3\u8CBB ${econOf(m, c.my).toFixed(1)}km/L
\u8D70\u884C ${Math.round(c.odo).toLocaleString("ja-JP")}km / \u71C3\u6599 ${gauge(fuelPct(c))} / \u6574\u5099 ${Math.round(c.cond)}%
${docState(g, c)}
\u99D0\u8ECA: ${riding ? "\u904B\u8EE2\u4E2D" : c.parked ? c.parked.where : "\u2014"} / \u58F2\u5374\u984D\u306E\u76EE\u5B89 ${yenS6(appraise(g, c, "usedshop").price)}${insLine(g, c, m)}</div>
    <div class="row" style="flex-wrap:wrap">${!cur2 ? `<button class="btn" data-car="use:${c.uid}">\u3053\u306E\u8ECA\u3092\u4F7F\u3046</button>` : riding ? '<button class="btn acc" data-car="park:0">\u3053\u3053\u306B\u99D0\u8ECA\u3057\u3066\u964D\u308A\u308B</button>' : `<button class="btn acc" data-car="ride:0" ${out ? "" : "disabled"}>\u4E57\u308B</button>`}<button class="btn" data-car="service:${c.uid}">\u70B9\u691C\u30FB\u30AA\u30A4\u30EB\u4EA4\u63DB</button><button class="btn" data-car="renew:${c.uid}">\u8ECA\u691C\u30FB\u4FDD\u967A\u306E\u66F4\u65B0</button><button class="btn" data-car="ins:${c.uid}">\u88DC\u511F\u3092\u5909\u3048\u308B</button><button class="btn" data-car="ded:${c.uid}">\u514D\u8CAC\u3092\u5909\u3048\u308B</button><button class="btn" data-car="co:${c.uid}">\u4FDD\u967A\u4F1A\u793E\u3092\u5909\u3048\u308B</button><button class="btn" data-car="sell:${c.uid}">\u58F2\u308B</button></div>`;
    }).join("");
  }
  function bindCarsPanel(c, g, D3) {
    c.querySelectorAll("[data-car]").forEach((b) => b.onclick = () => {
      const [k, id] = b.dataset.car.split(":");
      const v = getCars(g.hero);
      let r = { ok: false, msg: "" };
      if (k === "use") {
        v.cur = +id;
        r = { ok: true, msg: "\u4F7F\u3046\u8ECA\u3092\u5207\u308A\u66FF\u3048\u307E\u3057\u305F" };
      } else if (k === "ride") r = boardCar(g);
      else if (k === "park") {
        parkHere(g);
        r = { ok: true, msg: "\u99D0\u8ECA\u3057\u3066\u964D\u308A\u307E\u3057\u305F\u3002" };
      } else if (k === "service") r = serviceCar(g, +id);
      else if (k === "renew") r = renewDocs(g, +id);
      else if (k === "sell") {
        const cc = v.cars.find((q) => q.uid === +id);
        if (!cc) return;
        const ap = appraise(g, cc, "usedshop");
        if (!confirm(`${carName(cc)}
\u67FB\u5B9A ${yenS6(ap.price)}(\u5E74\u5F0F${ap.factors.\u5E74\u5F0F}\u5E74\u30FB\u8D70\u884C${ap.factors.\u8D70\u884C.toLocaleString("ja-JP")}km\u30FB\u72B6\u614B${ap.factors.\u72B6\u614B}%\u30FB\u4E8B\u6545\u6B74${ap.factors.\u4E8B\u6545\u6B74}\u56DE)${ap.loanBal ? `
\u30ED\u30FC\u30F3\u6B8B\u50B5 ${yenS6(ap.loanBal)} \u3092\u7CBE\u7B97 \u2192 \u624B\u53D6\u308A ${yenS6(ap.net)}` : ""}
\u58F2\u308A\u307E\u3059\u304B?`)) return;
        r = sellCarEx(g, +id);
      } else if (k === "ins") {
        const cc = v.cars.find((q) => q.uid === +id);
        if (!cc) return;
        const ks = ["basic", "std", "full"];
        const nx = ks[(ks.indexOf((cc.pol || {}).cover || "std") + 1) % 3];
        r = setPolicy(g, +id, { cover: nx });
      } else if (k === "ded") {
        const cc = v.cars.find((q) => q.uid === +id);
        if (!cc) return;
        const nx = DEDS[(DEDS.indexOf((cc.pol || {}).ded ?? 5e4) + 1) % DEDS.length];
        r = setPolicy(g, +id, { ded: nx });
      } else if (k === "co") {
        const cc = v.cars.find((q) => q.uid === +id);
        if (!cc) return;
        const nx = INS_CO[(INS_CO.findIndex((x) => x.id === ((cc.pol || {}).co || "minato")) + 1) % INS_CO.length].id;
        r = setPolicy(g, +id, { co: nx });
      }
      D3.toast(r.msg, 2800);
      if (r.ok) {
        D3.sfx && D3.sfx.coin && (k === "sell" || k === "service" || k === "renew") && D3.sfx.coin();
        D3.closeModal();
        D3.updateHud(true);
      }
    });
  }
  function fuelModal(g, bIdx, D3) {
    migrateLegacy(g);
    const b = g.world.map.buildings[bIdx];
    const car = curCar(g.hero);
    const y = g.year(), M = g.S.M;
    moveToPump(g, bIdx);
    const prices = ["reg", "hi", "dsl"].map((f2) => `${FUEL_NAMES[f2]} ${gasPrice(y, M, f2)}\u5186/L`).join(" \u30FB ");
    if (!car) {
      D3.showModal(`<h2>${b.name}</h2><div class="tx">\u8ECA\u3067\u6765\u308B\u3068\u7D66\u6CB9\u3067\u304D\u307E\u3059\u3002
\u672C\u65E5\u306E\u4FA1\u683C: ${prices}</div><div class="row"><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c) => c.querySelector("#x").onclick = D3.closeModal);
      return;
    }
    const v = getCars(g.hero);
    const riding = v.ride === "car";
    const near2 = riding || car.parked && Math.hypot(car.parked.x - (b.x + b.w / 2), car.parked.y - (b.y + b.h / 2)) < 14;
    const m = MODEL[car.model];
    const q = fuelQuote(g, car, m.fuel);
    const opts = [["\xA51,000", Math.floor(1e3 / q.price * 10) / 10], ["\xA53,000", Math.floor(3e3 / q.price * 10) / 10], ["\xA55,000", Math.floor(5e3 / q.price * 10) / 10], ["10L", 10], ["20L", 20], ["\u6E80\u30BF\u30F3", "full"]];
    D3.showModal(`<h2>${b.name}</h2><div class="tx small">\u3053\u306E\u753A\u306E\u8ECA\u306E\u7D66\u6CB9: \u4ECA\u6708\u3053\u306E\u5E97\u3067\u7D04${Math.round(usageOf(g.world, y, g.month0(), b) / 30).toLocaleString("ja-JP")}\u53F0(\u7D04${Math.round(usageOf(g.world, y, g.month0(), b)).toLocaleString("ja-JP")}L)</div><div class="tx">\u672C\u65E5\u306E\u4FA1\u683C: ${prices}

${swatch(car.color)} ${carName(car)}
\u71C3\u6599 ${gauge(fuelPct(car))}(${car.fuel.toFixed(1)} / ${m.tank}L)
\u5FC5\u8981\u306A\u71C3\u6599: <b>${FUEL_NAMES[m.fuel]}</b>(${q.price}\u5186/L) \u5165\u308B\u91CF: \u3042\u3068 ${q.room.toFixed(1)}L${near2 ? "" : '\n<b style="color:#d33">\u8ECA\u304C\u30B9\u30BF\u30F3\u30C9\u306B\u3042\u308A\u307E\u305B\u3093(\u8ECA\u306B\u4E57\u3063\u3066\u6765\u3066\u304F\u3060\u3055\u3044)</b>'}</div>
  <div class="tx small">\u71C3\u6599\u306E\u7A2E\u985E(\u8ECA\u306B\u5408\u3046\u3082\u306E\u3060\u3051\u9078\u3079\u307E\u3059)</div><div class="row">${["reg", "hi", "dsl"].map((f2) => `<button class="btn ${f2 === m.fuel ? "acc" : ""}" data-f="${f2}" ${f2 === m.fuel ? "" : "disabled"}>${FUEL_NAMES[f2]}</button>`).join("")}</div>
  <div class="tx small">\u7D66\u6CB9\u91CF</div><div class="row" style="flex-wrap:wrap">${opts.map((o, i) => `<button class="btn" data-o="${i}" ${near2 && q.room > 0.1 ? "" : "disabled"}>${o[0]}</button>`).join("")}</div>
  ${g.S.M >= car.insM || g.S.M >= car.shakenM ? '<div class="row"><button class="btn" id="renew">\u8ECA\u691C\u30FB\u4FDD\u967A\u306E\u66F4\u65B0\u3092\u983C\u3080</button></div>' : ""}
  <div class="row"><button class="btn" id="svc">\u70B9\u691C\u30FB\u30AA\u30A4\u30EB\u4EA4\u63DB(\xA5${g.yen(8e3).toLocaleString("ja-JP")})</button><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c) => {
      c.querySelector("#x").onclick = () => {
        leavePump(g);
        D3.closeModal();
      };
      c.querySelectorAll("[data-o]").forEach((bt) => bt.onclick = () => {
        const r = refuel(g, car.uid, m.fuel, opts[+bt.dataset.o][1]);
        D3.toast(r.msg, 3e3);
        if (r.ok) {
          D3.sfx.fuel && D3.sfx.fuel();
          D3.updateHud(true);
          pumping(g, bIdx, D3, car, car.fuel - (r.liters || 0), car.fuel);
        }
      });
      const rn = c.querySelector("#renew");
      if (rn) rn.onclick = () => {
        const r = renewDocs(g, car.uid);
        D3.toast(r.msg, 3e3);
        if (r.ok) {
          D3.updateHud(true);
          fuelModal(g, bIdx, D3);
        }
      };
      c.querySelector("#svc").onclick = () => {
        const r = serviceCar(g, car.uid);
        D3.toast(r.msg, 3e3);
        if (r.ok) {
          D3.updateHud(true);
          fuelModal(g, bIdx, D3);
        }
      };
    });
  }
  function payHtml(g, price, o) {
    const v = getCars(g.hero);
    const trades = v.cars;
    const q = quote2(g, price, { tradeUid: o.t ?? null, loanYears: o.l || 0 });
    const tb = trades.map((c) => `<button class="btn ${o.t === c.uid ? "acc" : ""}" data-t="${c.uid}">\u4E0B\u53D6\u308A: ${carName(c)}(${yenS6(appraise(g, c, "dealer").price)})</button>`).join("") + (trades.length ? `<button class="btn ${o.t == null ? "acc" : ""}" data-t="-1">\u4E0B\u53D6\u308A\u306A\u3057</button>` : "");
    const lb = [0, 3, 5, 7].map((y) => `<button class="btn ${(o.l || 0) === y ? "acc" : ""}" data-l="${y}">${y ? y + "\u5E74\u30ED\u30FC\u30F3" : "\u4E00\u62EC\u6255\u3044"}</button>`).join("");
    const sum = `\u304A\u652F\u6255\u3044\u76EE\u5B89: ${q.trade ? `\u4E0B\u53D6\u308A ${yenS6(q.trade.price)}${q.trade.loanBal ? `(\u6B8B\u50B5${yenS6(q.trade.loanBal)}\u3092\u7CBE\u7B97)` : ""}\u3092\u5DEE\u3057\u5F15\u304D\u3001` : ""}${q.loan ? `\u982D\u91D1 <b>${yenS6(q.loan.down)}</b> + \u30ED\u30FC\u30F3 ${yenS6(q.loan.principal)}(\u6708 ${yenS6(q.loan.pay)}\u30FB\u5E74\u5229${(q.loan.rate * 100).toFixed(1)}%\u30FB${q.loan.months}\u56DE)` : `\u73FE\u91D1 <b>${yenS6(Math.max(0, q.cash))}</b>`}${q.ok ? "" : `
<b style="color:#d33">${q.msg}</b>`}`;
    return `<div class="row" style="flex-wrap:wrap">${tb}</div><div class="row" style="flex-wrap:wrap">${lb}</div><div class="tx small">${sum}</div>`;
  }
  function bindPay(c, again, o) {
    c.querySelectorAll("[data-t]").forEach((bt) => bt.onclick = () => again({ ...o, t: +bt.dataset.t < 0 ? null : +bt.dataset.t }));
    c.querySelectorAll("[data-l]").forEach((bt) => bt.onclick = () => again({ ...o, l: +bt.dataset.l }));
  }
  function dealerModal(g, bIdx, D3, sel = {}) {
    const b = g.world.map.buildings[bIdx];
    const y = g.year();
    const list = newStock(g, y);
    const ck = canOwn(g);
    const mi = sel.m != null ? sel.m : 0;
    const m = list[mi] || list[0];
    const gi = sel.g || 0;
    const ci = sel.c != null ? sel.c : 3;
    const price = newPrice(g, m, GRADES[gi].k);
    const po = { t: sel.t ?? null, l: sel.l || 0 };
    D3.showModal(`<h2>${b.name}(\u65B0\u8ECA)</h2><div class="tx small">${y}\u5E74\u306E\u5C55\u793A\u8ECA(\u67B6\u7A7A\u30E1\u30FC\u30AB\u30FC\u30FB\u67B6\u7A7A\u8ECA\u7A2E)\u3002\u62C5\u5F53\u306E\u55B6\u696D\u30B9\u30BF\u30C3\u30D5\u304C\u3054\u6848\u5185\u3057\u307E\u3059\u3002
\u3053\u306E\u753A\u3067\u306F\u4ECA\u6708\u3001\u3053\u306E\u5E97\u3067\u7D04${usageOf(g.world, g.year(), g.month0(), b)}\u4EBA\u304C\u8ECA\u3092\u8CB7\u3044\u66FF\u3048\u307E\u3057\u305F\u3002${ck.ok ? "" : '\n<b style="color:#d33">' + ck.msg + "</b>"}</div>
  <div class="list" style="max-height:36vh;overflow:auto">${list.map((q, i) => `<button class="btn item ${i === mi ? "acc" : ""}" data-m="${i}">${MAKERS[q.maker]} ${q.name}
<span class="small">${CLS_NAMES[q.cls]} \u30FB \u71C3\u8CBB${econOf(q, y).toFixed(1)}km/L \u30FB ${q.seats}\u4EBA\u4E57\u308A \u30FB ${yenS6(newPrice(g, q))}\u301C</span></button>`).join("")}</div>
  <div class="tx"><b>${MAKERS[m.maker]} ${m.name}</b> ${y}\u5E74\u30E2\u30C7\u30EB
\u30B0\u30EC\u30FC\u30C9\u30FB\u8272\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002 \u4FA1\u683C <b>${yenS6(price)}</b></div>
  <div class="row" style="flex-wrap:wrap">${GRADES.map((q, i) => `<button class="btn ${i === gi ? "acc" : ""}" data-g="${i}">${q.name}</button>`).join("")}</div>
  <div class="row" style="flex-wrap:wrap">${CAR_COLORS.map((_, i) => `<button class="btn ${i === ci ? "acc" : ""}" data-c="${i}">${swatch(i)} ${colName(i)}</button>`).join("")}</div>
  ${payHtml(g, price, po)}
  <div class="row"><button class="btn" id="test">\u8A66\u4E57\u3059\u308B</button><button class="btn acc" id="buy" ${ck.ok ? "" : "disabled"}>\u8CFC\u5165\u3059\u308B</button><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c) => {
      c.querySelector("#x").onclick = D3.closeModal;
      c.querySelectorAll("[data-m]").forEach((bt) => bt.onclick = () => dealerModal(g, bIdx, D3, { m: +bt.dataset.m, g: gi, c: ci, ...po }));
      c.querySelectorAll("[data-g]").forEach((bt) => bt.onclick = () => dealerModal(g, bIdx, D3, { m: mi, g: +bt.dataset.g, c: ci, ...po }));
      c.querySelectorAll("[data-c]").forEach((bt) => bt.onclick = () => dealerModal(g, bIdx, D3, { m: mi, g: gi, c: +bt.dataset.c, ...po }));
      bindPay(c, (o2) => dealerModal(g, bIdx, D3, { m: mi, g: gi, c: ci, ...o2 }), po);
      c.querySelector("#test").onclick = () => testDrive(g, m, ci, D3);
      c.querySelector("#buy").onclick = () => {
        if (!confirm(`${m.name}(${GRADES[gi].name}\u30FB${colName(ci)})\u3092 ${yenS6(price)} \u3067\u8CFC\u5165\u3057\u307E\u3059\u304B?`)) return;
        const r = buyNewEx(g, m.id, gi, ci, bIdx, { tradeUid: po.t, loanYears: po.l });
        D3.toast(r.msg, 4200);
        if (r.ok) {
          D3.sfx.coin && D3.sfx.coin();
          D3.closeModal();
          D3.updateHud(true);
        }
      };
    });
  }
  function usedModal(g, bIdx, D3, sel = 0, po = { t: null, l: 0 }) {
    const b = g.world.map.buildings[bIdx];
    const lot = usedLot(g, bIdx);
    const ck = canOwn(g);
    const it = lot[sel] || lot[0];
    if (!lot.length) {
      D3.showModal(`<h2>${b.name}(\u4E2D\u53E4\u8ECA)</h2><div class="tx">\u3044\u307E\u306F\u5C55\u793A\u8ECA\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u6765\u6708\u307E\u305F\u6765\u3066\u304F\u3060\u3055\u3044\u3002</div><div class="row"><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c) => c.querySelector("#x").onclick = D3.closeModal);
      return;
    }
    D3.showModal(`<h2>${b.name}(\u4E2D\u53E4\u8ECA)</h2><div class="tx small">\u5728\u5EAB\u306F\u6BCE\u6708\u5165\u308C\u66FF\u308F\u308A\u307E\u3059\u3002\u5E74\u5F0F\u30FB\u8D70\u884C\u8DDD\u96E2\u30FB\u72B6\u614B\u3067\u4FA1\u683C\u304C\u5909\u308F\u308A\u307E\u3059\u3002
\u3053\u306E\u753A\u3067\u306F\u4ECA\u6708\u3001\u3053\u306E\u5E97\u3067\u7D04${usageOf(g.world, g.year(), g.month0(), b)}\u4EBA\u304C\u8ECA\u3092\u8CB7\u3044\u66FF\u3048\u307E\u3057\u305F\u3002${ck.ok ? "" : '\n<b style="color:#d33">' + ck.msg + "</b>"}</div>
  <div class="list" style="max-height:44vh;overflow:auto">${lot.map((q, i) => {
      const m = MODEL[q.model];
      return `<button class="btn item ${q === it ? "acc" : ""}" data-i="${i}">${swatch(q.color)} ${q.my}\u5E74 ${MAKERS[m.maker]} ${m.name}
<span class="small">${Math.round(q.odo).toLocaleString("ja-JP")}km \u30FB \u72B6\u614B${q.cond >= 80 ? "A" : q.cond >= 60 ? "B" : q.cond >= 45 ? "C" : "D"}(${q.cond}) \u30FB ${CLS_NAMES[m.cls]} \u30FB <b>${yenS6(q.price)}</b></span></button>`;
    }).join("")}</div>
  ${it ? payHtml(g, it.price, po) : ""}
  <div class="tx small">\u58F2\u5374\u306F\u300C\u6301\u3061\u7269\u300D\u306E\u30DE\u30A4\u30AB\u30FC\u304B\u3089(\u67FB\u5B9A\u984D\u306E\u5185\u8A33\u304C\u51FA\u307E\u3059)\u3002\u3053\u306E\u5E97\u3067\u306F\u4E0B\u53D6\u308A\u3082\u53D7\u3051\u4ED8\u3051\u307E\u3059\u3002</div>
  <div class="row"><button class="btn" id="test">\u8A66\u4E57\u3059\u308B</button><button class="btn acc" id="buy" ${ck.ok ? "" : "disabled"}>\u3053\u306E\u8ECA\u3092\u8CB7\u3046</button><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c) => {
      c.querySelector("#x").onclick = D3.closeModal;
      c.querySelectorAll("[data-i]").forEach((bt) => bt.onclick = () => usedModal(g, bIdx, D3, +bt.dataset.i, po));
      bindPay(c, (o2) => usedModal(g, bIdx, D3, sel, o2), po);
      c.querySelector("#test").onclick = () => testDrive(g, MODEL[it.model], it.color, D3);
      c.querySelector("#buy").onclick = () => {
        if (!confirm(`${carName(it)}\u3092 ${yenS6(it.price)} \u3067\u8CFC\u5165\u3057\u307E\u3059\u304B?`)) return;
        const r = buyUsedEx(g, it, bIdx, { tradeUid: po.t, loanYears: po.l });
        D3.toast(r.msg, 4200);
        if (r.ok) {
          D3.sfx.coin && D3.sfx.coin();
          D3.closeModal();
          D3.updateHud(true);
        }
      };
    });
  }
  function testDrive(g, m, color, D3) {
    if (g.age() < 18 || !g.hero.quals.driver) {
      D3.toast("\u8A66\u4E57\u306B\u306F\u904B\u8EE2\u514D\u8A31\u304C\u5FC5\u8981\u3067\u3059", 2800);
      return;
    }
    const v = getCars(g.hero);
    D3.closeModal();
    const L2 = g.S.loc;
    v.test = { until: Date.now() + 45e3, x: L2.x, y: L2.y, model: m.id, color, prevRide: v.ride };
    v.ride = "test";
    D3.toast(`${m.name}\u306E\u8A66\u4E57\u3067\u3059(\u7D0445\u79D2)\u3002\u304A\u5E97\u306E\u5468\u308A\u3092\u8D70\u3063\u3066\u307F\u307E\u3057\u3087\u3046`, 3600);
  }
  function pumping(g, bIdx, D3, car, f0, f1) {
    const m = MODEL[car.model];
    const b = g.world.map.buildings[bIdx];
    const t0 = performance.now();
    const dur = 1600;
    D3.showModal(`<h2>${b.name}</h2><div class="tx">\u7D66\u6CB9\u4E2D\u2026
${swatch(car.color)} ${carName(car)}
<span id="pf">${gauge(Math.max(0, f0 / m.tank))}</span>
<span id="pl">${f0.toFixed(1)} / ${m.tank}L</span></div>`, (c) => {
      const tick2 = () => {
        const u = Math.min(1, (performance.now() - t0) / dur);
        const f2 = f0 + (f1 - f0) * u;
        const pf = c.querySelector("#pf"), pl = c.querySelector("#pl");
        if (pf) pf.innerHTML = gauge(f2 / m.tank);
        if (pl) pl.textContent = f2.toFixed(1) + " / " + m.tank + "L";
        if (u < 1) setTimeout(tick2, 60);
        else {
          D3.sfx.register && D3.sfx.register();
          D3.sfx.coin && D3.sfx.coin();
          setTimeout(() => fuelModal(g, bIdx, D3), 350);
        }
      };
      tick2();
    });
  }

