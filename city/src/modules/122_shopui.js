  // src/shopui.js
  function shopModal(g, bIdx, D3, label = "") {
    const b = g.world.map.buildings[bIdx], bt = BTYPES[b.type];
    const list = goodsFor(b, bt, g.year(), g.month0());
    const money = g.hero.money;
    const cat = {};
    for (const it of list) (cat[it.cat] = cat[it.cat] || []).push(it);
    const rows2 = Object.entries(cat).map(([k, arr]) => `<div class="tx small">${k}</div><div class="list">${arr.map((it) => {
      const st3 = stockOf(g, b, it), pr = priceOf(g, it);
      return `<button class="btn item" data-id="${it.id}" ${st3 <= 0 || money < pr ? "disabled" : ""}>${it.e} ${it.n}  \xA5${pr.toLocaleString("ja-JP")}  <span class="small">${st3 <= 0 ? "\u58F2\u308A\u5207\u308C" : "\u6B8B\u308A" + st3}</span></button>`;
    }).join("")}</div>`).join("");
    D3.showModal(`<h2>${b.name}</h2><div class="tx small">${label ? label + " / " : ""}\u6240\u6301\u91D1 \xA5${money.toLocaleString("ja-JP")}  \u68DA\u306B\u3042\u308B\u5546\u54C1\u3092\u8CB7\u3048\u307E\u3059(\u5728\u5EAB\u306F\u65E5\u3054\u3068\u306B\u5165\u308C\u66FF\u308F\u308A\u307E\u3059)${usageOf(g.world, g.year(), g.month0(), b) ? `
\u3053\u306E\u753A\u306E\u4EBA\u306E\u4ECA\u6708\u306E\u6765\u5E97: \u5EF6\u3079\u7D04${Math.round(usageOf(g.world, g.year(), g.month0(), b)).toLocaleString("ja-JP")}\u56DE` : ""}</div>${rows2 || '<div class="tx">\u3044\u307E\u58F2\u3063\u3066\u3044\u308B\u5546\u54C1\u306F\u3042\u308A\u307E\u305B\u3093\u3002</div>'}<div class="row"><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c) => {
      c.querySelector("#x").onclick = D3.closeModal;
      c.querySelectorAll("button[data-id]").forEach((bt2) => bt2.onclick = () => {
        const r = buyGoods(g, b, bt, bt2.dataset.id);
        if (r.veh) {
          const vr = buyVehicle(g, r.veh);
          D3.toast(vr.msg, 3600);
          if (vr.ok) {
            g.advance(15);
            D3.sfx.register && D3.sfx.register();
            D3.updateHud(true);
          }
          shopModal(g, bIdx, D3, label);
          return;
        }
        D3.toast(r.msg, 3e3);
        if (r.ok) {
          D3.sfx.register && D3.sfx.register();
          D3.updateHud(true);
        }
        shopModal(g, bIdx, D3, label);
      });
    });
  }

