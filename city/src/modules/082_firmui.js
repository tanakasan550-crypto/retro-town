  // src/firmui.js
  var yenS5 = (n2) => "\xA5" + Math.round(n2).toLocaleString("ja-JP");
  var esc2 = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  function firmModal(g, D3, tab = "mine", sel = {}) {
    const h = g.hero, F = firmsOf(h);
    const sm = firmSummary(g);
    const head = `<h2>\u4E8B\u696D\u30FB\u8D77\u696D</h2><div class="tx small">\u7D4C\u55B6\u4E2D ${sm.n}\u4EF6 \u30FB \u5F93\u696D\u54E1 ${sm.staff}\u4EBA \u30FB \u5148\u6708\u306E\u640D\u76CA\u5408\u8A08 ${yenS5(sm.monthly)} \u30FB \u666F\u6C17\u6307\u6570 ${econIndex(g.year()).toFixed(2)}
\u5168\u696D\u7A2E\u3067\u5171\u901A\u306E\u7D4C\u55B6\u30A8\u30F3\u30B8\u30F3(\u8CC3\u6599\u30FB\u4ED5\u5165\u308C\u30FB\u4EBA\u4EF6\u8CBB\u30FB\u7A0E\u91D1\u30FB\u5728\u5EAB\u30FB\u55B6\u696D\u6642\u9593)\u3002\u6570\u5024\u306F\u30B2\u30FC\u30E0\u5185\u306E\u76EE\u5B89\u3067\u3059\u3002</div>
  <div class="row"><button class="btn ${tab === "mine" ? "acc" : ""}" data-tab="mine">\u7D4C\u55B6\u4E2D</button><button class="btn ${tab === "new" ? "acc" : ""}" data-tab="new">\u4E8B\u696D\u3092\u59CB\u3081\u308B</button><button class="btn ${tab === "heir" ? "acc" : ""}" data-tab="heir">\u627F\u7D99\u3057\u305F\u4E8B\u696D</button></div>`;
    let body = "", bind = () => {
    };
    if (tab === "mine") {
      body = F.length ? F.map((f2) => {
        const ind = IND[f2.ind], rp = f2.last || report(g, f2), open2 = f2.state === "open";
        return `<div class="item" style="border:1px solid #8884;border-radius:8px;padding:6px;margin:4px 0"><div><b>${esc2(f2.name)}</b> <span class="small">${ind.n} \u30FB ${esc2(g.bld(f2.b).name)} \u30FB ${open2 ? "\u55B6\u696D\u4E2D" : f2.state === "bankrupt" ? "\u5012\u7523" : "\u9589\u5E97"}${f2.gen > 1 ? ` \u30FB${f2.gen}\u4EE3\u76EE` : ""}</span></div>
      ${open2 ? `<div class="tx small">\u3010\u5F79\u8077\u3011\u6240\u6709\u8005\u30FB\u7D4C\u55B6\u8005${f2.mgr != null ? `(\u5E97\u9577: ${esc2(g.nameOf(f2.mgr))})` : "(\u5E97\u9577\u306A\u3057\u30FB\u81EA\u5206\u3067\u904B\u55B6)"}
\u8CC7\u91D1 ${yenS5(f2.cash)} \u30FB \u8A55\u5224 ${Math.round(f2.rep)} \u30FB \u5F93\u696D\u54E1 ${f2.staff.length}\u4EBA
${f2.last ? "\u5148\u6708" : "\u898B\u8FBC\u307F"}: \u5BA2 ${rp.customers}\u4EBA \u30FB \u58F2\u4E0A ${yenS5(rp.rev)} \u30FB \u539F\u4FA1 ${yenS5(rp.cogs)} \u30FB \u4EBA\u4EF6\u8CBB ${yenS5(rp.wage)} \u30FB \u8CC3\u6599 ${yenS5(rp.rent)} \u30FB \u7A0E ${yenS5(rp.tax)} \u30FB <b>\u5229\u76CA ${yenS5(rp.profit)}</b>
\u4FA1\u683C ${Math.round(f2.price * 100)}% \u30FB \u5728\u5EAB ${["", "\u5C11\u306A\u3081", "\u6A19\u6E96", "\u591A\u3081"][f2.stock]} \u30FB \u55B6\u696D ${f2.hrs[0]}\u6642\u301C${f2.hrs[1]}\u6642${f2.boom ? "\n<b>\u7E41\u76DB\u4E2D!</b>" : ""}${f2.comp ? "\n\u8FD1\u304F\u306B\u540C\u696D\u306E\u5E97\u304C\u3067\u304D\u82E6\u6226\u4E2D" : ""}
\u5F93\u696D\u54E1: ${f2.staff.map((s) => esc2(g.nameOf(s.id))).join("\u3001") || "\u306A\u3057"}${f2.regulars.length ? "\n\u5E38\u9023: " + f2.regulars.map((i) => esc2(g.nameOf(i))).join("\u3001") : ""}</div>
      <div class="row" style="flex-wrap:wrap"><button class="btn" data-a="work:${f2.id}">\u5E97\u306B\u7ACB\u3064(1\u6642\u9593)</button><button class="btn" data-a="hire:${f2.id}">\u96C7\u3046</button><button class="btn" data-a="price-:${f2.id}">\u5024\u4E0B\u3052</button><button class="btn" data-a="price+:${f2.id}">\u5024\u4E0A\u3052</button><button class="btn" data-a="stock:${f2.id}">\u5728\u5EAB\u3092\u5909\u3048\u308B</button><button class="btn" data-a="hours:${f2.id}">\u55B6\u696D\u6642\u9593\u3092\u5909\u3048\u308B</button><button class="btn" data-a="mgr:${f2.id}">\u5E97\u9577\u3092\u4EFB\u547D</button><button class="btn" data-a="fire:${f2.id}">\u5F93\u696D\u54E1\u3092\u6E1B\u3089\u3059</button><button class="btn" data-a="wd:${f2.id}">\u8CC7\u91D1\u3092\u53D7\u3051\u53D6\u308B</button><button class="btn" data-a="inv:${f2.id}">\u51FA\u8CC7\u3059\u308B</button><button class="btn" data-a="heir:${f2.id}">\u5B50\u306B\u7D99\u304C\u305B\u308B</button><button class="btn sec" data-a="close:${f2.id}">\u9589\u5E97\u3059\u308B</button></div>` : ""}</div>`;
      }).join("") : '<div class="tx small">\u307E\u3060\u4E8B\u696D\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u300C\u4E8B\u696D\u3092\u59CB\u3081\u308B\u300D\u304B\u3089\u958B\u696D\u3067\u304D\u307E\u3059\u3002</div>';
      bind = (c) => c.querySelectorAll("[data-a]").forEach((b) => b.onclick = () => {
        const [k, sid] = b.dataset.a.split(":");
        const id = +sid, f2 = F.find((q) => q.id === id);
        let r = { ok: false, msg: "" };
        if (k === "work") r = workHere(g, id);
        else if (k === "hire") r = hire(g, id);
        else if (k === "price-") r = setPrice(g, id, f2.price - 0.05);
        else if (k === "price+") r = setPrice(g, id, f2.price + 0.05);
        else if (k === "stock") r = setStock(g, id, f2.stock % 3 + 1);
        else if (k === "hours") r = setHours(g, id, f2.hrs[0], f2.hrs[1] >= 22 ? Math.max(f2.hrs[0] + 6, 14) : f2.hrs[1] + 2);
        else if (k === "mgr") {
          const s = f2.staff.find((q) => g.S.M - q.M >= 12 && q.id !== f2.mgr);
          r = s ? appointManager(g, id, s.id) : { ok: false, msg: "\u52E4\u7D9A1\u5E74\u4EE5\u4E0A\u306E\u5F93\u696D\u54E1\u304C\u3044\u307E\u305B\u3093" };
        } else if (k === "fire") {
          const s = f2.staff[f2.staff.length - 1];
          r = s ? fire(g, id, s.id) : { ok: false, msg: "\u5F93\u696D\u54E1\u306F\u3044\u307E\u305B\u3093" };
        } else if (k === "wd") r = withdraw(g, id);
        else if (k === "inv") r = invest(g, id, g.yen(1e6));
        else if (k === "heir") r = passOn(g, id);
        else if (k === "close") {
          if (!confirm(`${f2.name}\u3092\u9589\u5E97\u3057\u307E\u3059\u304B?`)) return;
          r = closeFirm(g, id);
        }
        D3.toast(r.msg, 3200);
        if (r.ok) {
          D3.sfx.coin && ["wd", "close", "inv"].includes(k) && D3.sfx.coin();
          D3.updateHud(true);
          firmModal(g, D3, "mine");
        }
      });
    } else if (tab === "heir") {
      const L2 = heirFirms(h);
      body = L2.length ? L2.map((f2) => `<div class="item">${esc2(f2.name)}(${IND[f2.ind].n}\u30FB${f2.gen}\u4EE3\u76EE\u30FB\u7D99\u3044\u3060\u4EBA: ${esc2(g.nameOf(f2.owner))})</div>`).join("") : '<div class="tx small">\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002</div>';
    } else {
      const cat = sel.cat || "retail";
      const ind = sel.ind ? IND[sel.ind] : null;
      const cats = Object.keys(CATS).map((k) => `<button class="btn ${k === cat ? "acc" : ""}" data-cat="${k}">${CATS[k]}</button>`).join("");
      const inds = byCat(cat).map((x) => {
        const ck = canOpen(g, x.id);
        return `<button class="btn item ${ind && ind.id === x.id ? "acc" : ""}" data-ind="${x.id}" ${x.cap === 0 ? "disabled" : ""}>${x.n}
<span class="small">\u958B\u696D ${yenS5(g.yen(x.cap))} \u30FB \u8CC3\u6599 ${yenS5(g.yen(x.rent))}/\u6708 \u30FB \u5F93\u696D\u54E1${x.staff}\u4EBA\u301C${ck.ok ? "" : " \u30FB\u8981\u4EF6\u3042\u308A"}</span></button>`;
      }).join("");
      let det = "";
      if (ind) {
        const ck = canOpen(g, ind.id), S2 = sites(g, ind.id, 6);
        det = `<div class="tx"><b>${ind.n}</b>(${esc2(ind.goods)})
\u55B6\u696D ${ind.hrs}\u6642 \u30FB \u8077\u7A2E: ${esc2(ind.job)}${ck.ok ? "" : `
<b style="color:#d33">${esc2(ck.msg)}</b>`}</div>${ck.ok ? S2.map((s) => `<button class="btn item" data-site="${s.b}">${esc2(s.name)} <span class="small">${esc2(s.type)} \u30FB \u7ACB\u5730${s.loc.toFixed(2)} \u30FB ${s.d}\u30BF\u30A4\u30EB</span></button>`).join("") || '<div class="tx small">\u958B\u696D\u3067\u304D\u308B\u5834\u6240\u304C\u3042\u308A\u307E\u305B\u3093</div>' : ""}`;
      }
      body = `<div class="row" style="flex-wrap:wrap">${cats}</div><div class="list" style="max-height:30vh;overflow:auto">${inds}</div>${det}`;
      bind = (c) => {
        c.querySelectorAll("[data-cat]").forEach((b) => b.onclick = () => firmModal(g, D3, "new", { cat: b.dataset.cat }));
        c.querySelectorAll("[data-ind]").forEach((b) => b.onclick = () => firmModal(g, D3, "new", { cat, ind: b.dataset.ind }));
        c.querySelectorAll("[data-site]").forEach((b) => b.onclick = () => {
          const r = openFirm(g, ind.id, +b.dataset.site);
          D3.toast(r.msg, 3600);
          if (r.ok) {
            D3.sfx.coin && D3.sfx.coin();
            D3.updateHud(true);
            firmModal(g, D3, "mine");
          }
        });
      };
    }
    D3.showModal(head + body + '<div class="row"><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>', (c) => {
      c.querySelector("#x").onclick = D3.closeModal;
      c.querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => firmModal(g, D3, b.dataset.tab));
      bind(c);
    });
  }

