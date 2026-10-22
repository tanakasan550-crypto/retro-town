  // src/vocui.js
  var yen2 = (n2) => "\xA5" + Math.round(n2).toLocaleString("ja-JP");
  function vocModal(g, bIdx, D3) {
    const b = g.world.map.buildings[bIdx], L2 = licOf(g), E2 = L2.enr, opts = enrollOptions(g, bIdx);
    const y = g.year();
    const stateTx = E2 ? { study: `\u5728\u5B66\u4E2D ${E2.M}/${E2.need}\u304B\u6708`, intern: `\u5B9F\u5730\u4FEE\u7DF4\u4E2D ${E2.internM}/${E2.internNeed}\u304B\u6708(\u7406\u7F8E\u5BB9\u5BA4\u3067\u50CD\u304F)`, exam: E2.passM != null ? "\u5408\u683C\u30FB\u514D\u8A31\u767B\u9332\u306E\u624B\u7D9A\u304D\u5F85\u3061" : "\u56FD\u5BB6\u8A66\u9A13\u306E\u53D7\u9A13\u5F85\u3061" }[E2.state] || "" : "";
    const R5 = heroRoles(g);
    const lic = ["beautician", "barber", "nurse", "cooklic", "childcare", "mechanic", "elec2", "sekou2", "forklift", "heavy", "curator"].filter((k) => hasLic(g, k)).map((k) => LICENSE_NAMES[k]);
    D3.showModal(`<h2>${b.name}</h2><div class="tx small">${y}\u5E74\u306E\u5236\u5EA6: ${opts.map((o) => `${o.n}\u306F${o.yrs < 1 ? "\u8B1B\u7FD2" + Math.round(o.yrs * 12) + "\u304B\u6708" : "\u4FEE\u696D" + o.yrs + "\u5E74"}${o.intern ? `+\u5B9F\u5730\u4FEE\u7DF4${o.intern}\u304B\u6708` : ""}`).join(" / ")}</div>
  ${E2 ? `<div class="tx"><b>${VOC[E2.k].n}</b>: ${stateTx}${E2.state !== "intern" && VOC[E2.k].exam ? `<br>\u5408\u683C\u7387\u306E\u76EE\u5B89 ${Math.round(passProb(g, E2, VOC[E2.k]) * 100)}%(\u8A66\u9A13\u306F\u5E74${VOC[E2.k].exam.months.length}\u56DE)` : ""}</div><div class="row"><button class="btn sec" id="wd">\u9000\u5B66\u3059\u308B</button></div>` : opts.map((o) => `<div class="tx"><b>${o.n}</b>(${o.long}) \u5165\u5B66\u91D1${yen2(g.yen(o.entrance))} / \u5E74\u9593\u6388\u696D\u6599${yen2(g.yen(o.tuition))} / ${o.minAge}\u6B73\u304B\u3089<div class="row"><button class="btn acc" data-e="${o.k}">\u5165\u5B66\u3059\u308B</button><button class="btn sec" data-e="${o.k}" data-loan="1">\u5968\u5B66\u91D1(\u8CB8\u4E0E)\u3067\u5165\u5B66</button></div></div>`).join("")}
  <div class="tx small">\u6301\u3063\u3066\u3044\u308B\u8CC7\u683C: ${lic.length ? lic.join("\u3001") : "\u306A\u3057"}${R5.practitioner ? ` / \u5B9F\u52D9 \u7F8E\u5BB9${L2.work.beautician || 0}\u304B\u6708\u30FB\u7406\u5BB9${L2.work.barber || 0}\u304B\u6708` : ""}</div>
  ${["beautician", "barber"].filter((k) => hasLic(g, k)).map((k) => `<div class="row"><button class="btn ${kanriReady(g, k) && !isKanri(g, k) ? "acc" : "sec"}" data-k="${k}">${k === "barber" ? "\u7BA1\u7406\u7406\u5BB9\u5E2B" : "\u7BA1\u7406\u7F8E\u5BB9\u5E2B"}\u8B1B\u7FD2(${isKanri(g, k) ? "\u4FEE\u4E86\u6E08\u307F" : "\u514D\u8A31\u5F8C3\u5E74\u4EE5\u4E0A\u306E\u5B9F\u52D9\u304C\u5FC5\u8981\u30FB" + yen2(g.yen(3e4))})</button></div>`).join("")}
  <div class="row"><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c) => {
      c.querySelectorAll("[data-e]").forEach((bt) => bt.onclick = () => {
        const r = enrollVoc(g, bIdx, bt.dataset.e, { loan: !!bt.dataset.loan });
        D3.toast(r.msg, 4200);
        D3.updateHud();
        if (r.ok) vocModal(g, bIdx, D3);
      });
      c.querySelectorAll("[data-k]").forEach((bt) => bt.onclick = () => {
        const r = takeKanriCourse(g, bt.dataset.k);
        D3.toast(r.msg, 4200);
        D3.updateHud();
        if (r.ok) vocModal(g, bIdx, D3);
      });
      const wd = c.querySelector("#wd");
      if (wd) wd.onclick = () => {
        const r = withdrawVoc(g);
        D3.toast(r.msg, 3e3);
        vocModal(g, bIdx, D3);
      };
      c.querySelector("#x").onclick = D3.closeModal;
    });
  }

