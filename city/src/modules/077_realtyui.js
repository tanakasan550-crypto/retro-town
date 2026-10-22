  // src/realtyui.js
  var yenS4 = (n2) => "\xA5" + Math.round(n2).toLocaleString("ja-JP");
  var esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  function realtyModal(g, D3) {
    const h = g.hero, E2 = estate(h);
    const sm = estateSummary(g);
    const home = h.owned.includes(h.homeB) && !h.homeIsParents ? appraisal(g, h.homeB) : null;
    const props = E2.props.map((p) => {
      const b = g.bld(p.bi), a = appraisal(g, p.bi);
      const t = p.tenant >= 0 ? g.nameOf(p.tenant) : "\u7A7A\u5BA4";
      return `<div class="item"><div>${esc(b.name)}(\u8CC3\u8CB8\u30FB${esc(t)}) <span class="small">\u7BC9${a.age}\u5E74 \u30FB \u6642\u4FA1${yenS4(a.value)} \u30FB \u5BB6\u8CC3${yenS4(g.rentOf(b))}/\u6708${p.kind === "inherit" ? " \u30FB\u76F8\u7D9A" : ""}</span></div><div class="row"><button class="btn" data-rf="${p.bi}:1">${REFORMS[0].name}</button><button class="btn" data-rf="${p.bi}:2">${REFORMS[1].name}</button>${b.wa ? `<button class="btn" data-rf="${p.bi}:3">${REFORMS[2].name}</button>` : ""}<button class="btn sec" data-sellp="${p.bi}">\u58F2\u308B</button></div></div>`;
    }).join("");
    const cand = investCandidates(g, 5).map((o) => {
      const q = investQuote(g, o.bi);
      return `<div class="item"><div>${esc(o.name)} <span class="small">\u5BB6\u8CC3${yenS4(o.rent)}/\u6708 \u30FB \u5229\u56DE\u308A${q.yield}%</span></div><button class="btn acc" data-buyp="${o.bi}">\u8CB7\u3046 ${yenS4(q.price)}(\u982D\u91D1${yenS4(q.down)})</button></div>`;
    }).join("");
    const lands = E2.land.map((l) => `<div class="item"><div>${esc(l.dist)}\u306E\u571F\u5730 ${l.area}\u33A1 <span class="small">\u6642\u4FA1${yenS4(landValue(g, l))}(\u53D6\u5F97${yenS4(l.price)})</span></div><button class="btn sec" data-sell-l="${l.id}">\u58F2\u308B</button></div>`).join("");
    const offers2 = landOffers(g).slice(0, 4).map((o) => `<div class="item"><div>${esc(o.dist)}\u306E\u571F\u5730 ${o.area}\u33A1 <span class="small">${yenS4(o.ppm)}/\u33A1</span></div><button class="btn" data-buy-l="${o.id}">\u8CB7\u3046 ${yenS4(o.price)}</button></div>`).join("");
    D3.showModal(`<h2>\u4E0D\u52D5\u7523(\u8CC7\u7523\u7BA1\u7406)</h2><div class="tx small">\u7D14\u8CC7\u7523(\u4E0D\u52D5\u7523) ${yenS4(sm.net)}(\u81EA\u5B85${yenS4(sm.own)} \u30FB \u8CC3\u8CB8${yenS4(sm.prop)} \u30FB \u571F\u5730${yenS4(sm.land)} \u30FB \u501F\u5165${yenS4(sm.debt)})
\u6642\u4FA1\u306F\u5730\u4FA1\u306E\u6CE2\u30FB\u7BC9\u5E74\u30FB\u30EA\u30D5\u30A9\u30FC\u30E0\u3067\u5909\u308F\u308A\u307E\u3059(\u30B2\u30FC\u30E0\u5185\u306E\u67B6\u7A7A\u306E\u76EE\u5B89)\u3002\u58F2\u5374\u306B\u306F\u4EF2\u4ECB\u624B\u6570\u6599(\u7D043%+6\u4E07\u5186)\u304C\u304B\u304B\u308A\u307E\u3059\u3002${h.flags.moveBy ? `
<b>\u58F2\u5374\u6E08\u307F\u306E\u5BB6\u306B\u4EEE\u4F4F\u307E\u3044\u4E2D\u3002${Math.max(0, h.flags.moveBy - g.S.M)}\u304B\u6708\u4EE5\u5185\u306B\u5F15\u3063\u8D8A\u3057\u307E\u3059\u3002</b>` : ""}</div>
  ${home ? `<h3>\u81EA\u5B85</h3><div class="item"><div>${esc(home.name)} <span class="small">\u7BC9${home.age}\u5E74(\u5B9F\u52B9${home.effAge}\u5E74) \u30FB \u5730\u4FA1\u6307\u6570${home.landIdx} \u30FB \u6642\u4FA1${yenS4(home.value)}</span></div><div class="row"><button class="btn" data-rf="${h.homeB}:1">${REFORMS[0].name}</button><button class="btn" data-rf="${h.homeB}:2">${REFORMS[1].name}</button>${g.bld(h.homeB).wa ? `<button class="btn" data-rf="${h.homeB}:3">${REFORMS[2].name}</button>` : ""}<button class="btn sec" id="sellres">\u58F2\u5374\u3059\u308B(\u4EF2\u4ECB\u624B\u6570\u6599${yenS4(home.brokerFee)})</button></div></div>` : ""}
  ${props ? `<h3>\u8CC3\u8CB8\u7269\u4EF6</h3>${props}` : ""}<h3>\u8CC3\u8CB8\u7269\u4EF6\u3092\u8CB7\u3046(\u5BB6\u8CC3\u53CE\u5165)</h3>${cand || '<div class="tx small">\u5019\u88DC\u304C\u3042\u308A\u307E\u305B\u3093</div>'}
  ${lands ? `<h3>\u4FDD\u6709\u3059\u308B\u571F\u5730</h3>${lands}` : ""}<h3>\u571F\u5730\u3092\u8CB7\u3046</h3>${offers2 || '<div class="tx small">\u3044\u307E\u306F\u58F2\u308A\u51FA\u3057\u304C\u3042\u308A\u307E\u305B\u3093</div>'}<div class="tx small">(\u571F\u5730\u3078\u306E\u5EFA\u7BC9\u306F\u4ECA\u5F8C\u306E\u5BFE\u5FDC\u3067\u3059)</div>
  <div class="row"><button class="btn sec" id="x">\u9589\u3058\u308B</button></div>`, (c) => {
      const done = (r) => {
        D3.toast(r.msg, 3800);
        if (r.ok) {
          D3.sfx.coin && D3.sfx.coin();
          D3.updateHud(true);
          realtyModal(g, D3);
        }
      };
      c.querySelector("#x").onclick = D3.closeModal;
      const s = c.querySelector("#sellres");
      if (s) s.onclick = () => {
        if (confirm(`${home.name}\u3092\u58F2\u5374\u3057\u307E\u3059\u304B?(\u6642\u4FA1${yenS4(home.value)}\u30FB\u624B\u6570\u6599${yenS4(home.brokerFee)}\u30023\u304B\u6708\u4EE5\u5185\u306B\u5F15\u3063\u8D8A\u3057\u307E\u3059)`)) done(sellResidence(g));
      };
      c.querySelectorAll("[data-rf]").forEach((b) => b.onclick = () => {
        const [bi, lv] = b.dataset.rf.split(":").map(Number);
        done(reform(g, bi, lv));
      });
      c.querySelectorAll("[data-buyp]").forEach((b) => b.onclick = () => done(buyInvest(g, +b.dataset.buyp)));
      c.querySelectorAll("[data-sellp]").forEach((b) => b.onclick = () => {
        if (confirm("\u3053\u306E\u7269\u4EF6\u3092\u58F2\u5374\u3057\u307E\u3059\u304B?")) done(sellInvest(g, +b.dataset.sellp));
      });
      c.querySelectorAll("[data-buy-l]").forEach((b) => b.onclick = () => done(buyLand(g, +b.dataset.buyL)));
      c.querySelectorAll("[data-sell-l]").forEach((b) => b.onclick = () => done(sellLand(g, +b.dataset.sellL)));
    });
  }

