  // src/devui.js
  var esc3 = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function devPanel(x) {
    if (!devToolsEnabled()) return;
    const G4 = x.G();
    const on2 = isTestSession(G4);
    const S2 = on2 ? sessionOf(G4) : null;
    const row = (id, label, val, w = 70) => `<span class="small">${label}</span> <input id="${id}" value="${val}" style="width:${w}px">`;
    const d = G4.date();
    x.showModal(`<h2>\u958B\u767A\u8005: \u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3</h2>
  <div class="tx small">${on2 ? "\u3010\u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3\u4E2D\u3011\u3053\u306E\u72B6\u614B\u306F\u901A\u5E38\u306E\u30BB\u30FC\u30D6\u306B\u306F\u66F8\u304D\u8FBC\u307E\u308C\u307E\u305B\u3093(\u4FDD\u5B58\u306F\u958B\u767A\u5C02\u7528\u306E\u5225\u67A0\u306E\u307F)\u3002\u7D42\u4E86\u3059\u308B\u3068\u5143\u306E\u4EBA\u751F\u3078\u305D\u306E\u307E\u307E\u623B\u308A\u307E\u3059\u3002" : "\u3044\u307E\u306E\u4EBA\u751F\u3092\u300C\u8907\u88FD\u300D\u3057\u3066\u8A66\u9A13\u7528\u306E\u4E16\u754C\u3092\u958B\u304D\u307E\u3059\u3002\u8907\u88FD\u306E\u4E2D\u3067\u306F\u5E74\u9F62\u30FB\u65E5\u4ED8\u30FB\u6642\u523B\u30FB\u55B6\u696D\u6642\u9593\u30FB\u8CC7\u91D1\u3092\u81EA\u7531\u306B\u5909\u3048\u3001\u5168\u65BD\u8A2D\u3078\u76F4\u63A5\u79FB\u52D5\u3067\u304D\u307E\u3059\u3002\u5143\u306E\u4EBA\u751F\u3068\u901A\u5E38\u306E\u30BB\u30FC\u30D6\u306F\u5909\u308F\u308A\u307E\u305B\u3093\u3002"}</div>
  <div class="list">${on2 ? `
    <div class="formrow">${row("dAge", "\u5E74\u9F62", G4.age(), 50)} <button class="btn sec" id="dAgeB">\u8A2D\u5B9A</button> <button class="btn sec" data-age="0">0\u6B73</button><button class="btn sec" data-age="6">6</button><button class="btn sec" data-age="15">15</button><button class="btn sec" data-age="30">30</button><button class="btn sec" data-age="70">70</button><button class="btn sec" data-age="95">95</button></div>
    <div class="formrow">${row("dY", "\u5E74", d.y, 54)} ${row("dM", "\u6708", d.m0 + 1, 34)} ${row("dD", "\u65E5", d.d, 34)} <button class="btn sec" id="dDateB">\u65E5\u4ED8\u3092\u8A2D\u5B9A</button> <button class="btn sec" data-y="1946">1946</button><button class="btn sec" data-y="1964">1964</button><button class="btn sec" data-y="1990">1990</button><button class="btn sec" data-y="2024">2024</button><button class="btn sec" data-y="2040">2040</button></div>
    <div class="formrow">${row("dH", "\u6642", d.h, 34)} ${row("dMi", "\u5206", d.mi, 34)} <button class="btn sec" id="dTimeB">\u6642\u523B\u3092\u8A2D\u5B9A</button> <button class="btn sec" data-h="0">0\u6642</button><button class="btn sec" data-h="6">6\u6642</button><button class="btn sec" data-h="12">12\u6642</button><button class="btn sec" data-h="18">18\u6642</button><button class="btn sec" data-h="23">23\u6642</button></div>
    <div class="formrow"><span class="small">\u6642\u9593</span> <button class="btn sec" data-sc="0">\u505C\u6B62</button><button class="btn sec" data-sc="1">\xD71</button><button class="btn sec" data-sc="60">\xD760</button><button class="btn sec" data-sc="600">\xD7600</button><span class="small"> \u73FE\u5728 \xD7${x.U.scale}</span></div>
    <button class="btn item" id="dHours">\u55B6\u696D\u6642\u9593: ${S2.bypass.hours ? "\u89E3\u9664\u4E2D(\u9589\u5E97\u4E2D\u3067\u3082\u5165\u308C\u308B)" : "\u901A\u5E38\u3069\u304A\u308A"}</button>
    <button class="btn item" id="dAgeLim">\u5E74\u9F62\u306B\u3088\u308B\u5165\u9928\u5236\u9650: ${S2.bypass.age ? "\u89E3\u9664\u4E2D" : "\u901A\u5E38\u3069\u304A\u308A"}</button>
    <button class="btn item" id="dMoney">\u8CC7\u91D1: ${G4.hero.testMode?.on ? "\u8A66\u9A13\u7528\u306E\u7121\u5236\u9650(" + Math.round(TEST_MAX / 1e12) + "\u5146\u5186)" : "\u901A\u5E38"}</button>
    <button class="btn item acc" id="dList">\u5168\u65BD\u8A2D\u4E00\u89A7(\u540D\u79F0\u30FB\u7A2E\u985E\u30FB\u5730\u533A\u30FB\u5EA7\u6A19\u30FB\u968E\u6570\u30FB\u691C\u67FB\u72B6\u614B)</button>
    <button class="btn item" id="dEnd">\u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3\u3092\u7D42\u4E86\u3057\u3066\u5143\u306E\u4EBA\u751F\u3078\u623B\u308B</button>` : `
    <button class="btn item acc" id="dStart">\u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3\u3092\u958B\u59CB(\u73FE\u5728\u306E\u4EBA\u751F\u3092\u8907\u88FD)</button>
    <button class="btn item" id="dList">\u5168\u65BD\u8A2D\u4E00\u89A7(\u95B2\u89A7\u306E\u307F\u30FB\u79FB\u52D5\u306F\u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3\u4E2D)</button>`}
  </div><div class="row"><button class="btn sec" id="dX">\u9589\u3058\u308B</button></div>`, (c) => {
      const q = (id) => c.querySelector("#" + id), ref = () => {
        x.updateHud(true);
        x.clear();
        devPanel(x);
      };
      q("dX").onclick = x.closeModal;
      if (!on2) {
        q("dStart").onclick = () => {
          const t = openTestSession(G4);
          if (!t) {
            x.toast("\u3053\u306E\u7248\u3067\u306F\u4F7F\u3048\u307E\u305B\u3093");
            return;
          }
          x.closeModal();
          x.enterTest(t);
          x.toast("\u3010\u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3\u3011\u5143\u306E\u4EBA\u751F\u3068\u901A\u5E38\u30BB\u30FC\u30D6\u306F\u5909\u308F\u308A\u307E\u305B\u3093", 3600);
        };
      } else {
        const num = (id, dflt) => {
          const v = parseInt(q(id).value, 10);
          return Number.isFinite(v) ? v : dflt;
        };
        q("dAgeB").onclick = () => {
          devSetAge(G4, Math.max(0, Math.min(110, num("dAge", 30))));
          ref();
        };
        c.querySelectorAll("[data-age]").forEach((b) => b.onclick = () => {
          devSetAge(G4, +b.dataset.age);
          ref();
        });
        q("dDateB").onclick = () => {
          devSetDate(G4, Math.max(1900, Math.min(2200, num("dY", 1990))), Math.max(1, Math.min(12, num("dM", 1))) - 1, num("dD", 1));
          ref();
        };
        c.querySelectorAll("[data-y]").forEach((b) => b.onclick = () => {
          devSetDate(G4, +b.dataset.y, G4.month0(), G4.S.day);
          ref();
        });
        q("dTimeB").onclick = () => {
          devSetTime(G4, Math.max(0, Math.min(23, num("dH", 12))), Math.max(0, Math.min(59, num("dMi", 0))));
          ref();
        };
        c.querySelectorAll("[data-h]").forEach((b) => b.onclick = () => {
          devSetTime(G4, +b.dataset.h, 0);
          ref();
        });
        c.querySelectorAll("[data-sc]").forEach((b) => b.onclick = () => {
          x.U.scale = +b.dataset.sc;
          ref();
        });
        q("dHours").onclick = () => {
          devSetBypass(G4, "hours", !S2.bypass.hours);
          ref();
        };
        q("dAgeLim").onclick = () => {
          devSetBypass(G4, "age", !S2.bypass.age);
          ref();
        };
        q("dMoney").onclick = () => {
          devSetMoney(G4, !G4.hero.testMode?.on);
          ref();
        };
        q("dEnd").onclick = () => {
          x.closeModal();
          x.leaveTest();
          x.toast("\u5143\u306E\u4EBA\u751F\u3078\u623B\u308A\u307E\u3057\u305F(\u8A66\u9A13\u4E2D\u306E\u5909\u66F4\u306F\u7834\u68C4\u3055\u308C\u307E\u3057\u305F)", 3200);
        };
      }
      q("dList").onclick = () => facilityList(x);
    });
  }
  var PAGE = 40;
  function facilityList(x, st3 = { q: "", type: "", district: "", page: 0, sel: null, enterOnly: false }) {
    const G4 = x.G();
    const on2 = isTestSession(G4);
    const all = facilityRows(G4, { q: st3.q, type: st3.type, district: st3.district, enterOnly: st3.enterOnly });
    const types = [...new Set(G4.world.map.buildings.map((b) => b.type))].sort((a, b) => BTYPES[a].label.localeCompare(BTYPES[b].label, "ja"));
    const dists = [...new Set(G4.world.map.buildings.map(districtOf2))].sort((a, b) => a.localeCompare(b, "ja"));
    const pages = Math.max(1, Math.ceil(all.length / PAGE));
    st3.page = Math.max(0, Math.min(pages - 1, st3.page));
    const rows2 = all.slice(st3.page * PAGE, st3.page * PAGE + PAGE);
    const sel = st3.sel != null ? G4.world.map.buildings[st3.sel] : null;
    const detail = sel ? (() => {
      const bt = BTYPES[sel.type];
      const fl = floorList(sel);
      return `<div class="tx small" style="border:1px solid #888;padding:6px;margin:6px 0"><b>${esc3(sel.name)}</b>(${esc3(bt.label)}\u30FB${esc3(districtOf2(sel))})
\u5EA7\u6A19 (${sel.x},${sel.y}) \u5927\u304D\u3055 ${sel.w}\xD7${sel.h} / \u5165\u53E3 (${sel.doorX},${sel.doorY}) / ${fl.length}\u968E / ${bt.enter ? "\u5185\u90E8\u3042\u308A" : "\u5916\u89B3\u306E\u307F(\u5165\u308C\u306A\u3044)"}
\u691C\u67FB: ${esc3(inspectLine(G4, sel))}
<span class="small">\u203B \u76F4\u63A5\u79FB\u52D5\u306F\u8A66\u9A13\u7528\u3067\u3059\u3002\u300C\u6B69\u3044\u3066\u884C\u3051\u308B\u300D\u306E\u5224\u5B9A\u306B\u306F\u306A\u308A\u307E\u305B\u3093(\u5225\u5224\u5B9A: tools/audit_reach.mjs)\u3002</span></div>
    <div class="formrow"><button class="btn sec" id="fMap">\u5730\u56F3\u3067\u4F4D\u7F6E\u3068\u7D4C\u8DEF\u3092\u898B\u308B</button>${on2 ? `<button class="btn acc" id="fDoor">\u5165\u53E3\u3078\u76F4\u63A5\u79FB\u52D5</button>` : '<span class="small">(\u76F4\u63A5\u79FB\u52D5\u306F\u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3\u4E2D\u306E\u307F)</span>'}</div>
    ${on2 && bt.enter ? `<div class="formrow">${fl.map((f2) => `<button class="btn sec" data-fl="${f2.floor}">${esc3(f2.label)}</button>`).join("")}</div>` : ""}`;
    })() : "";
    x.showModal(`<h2>\u5168\u65BD\u8A2D\u4E00\u89A7 <span class="small">${all.length}\u4EF6</span></h2>
  <div class="formrow"><input id="fQ" placeholder="\u540D\u79F0\u30FB\u7A2E\u985E\u30FB\u4F4F\u6240\u30FBID" value="${esc3(st3.q)}" style="flex:1;min-width:120px"><select id="fT"><option value="">\u5168\u7A2E\u985E(${types.length})</option>${types.map((t) => `<option value="${t}" ${st3.type === t ? "selected" : ""}>${esc3(BTYPES[t].label)}(${t})</option>`).join("")}</select><select id="fD"><option value="">\u5168\u5730\u533A</option>${dists.map((t) => `<option ${st3.district === t ? "selected" : ""}>${esc3(t)}</option>`).join("")}</select><label class="small"><input type="checkbox" id="fE" ${st3.enterOnly ? "checked" : ""}>\u5165\u308C\u308B\u65BD\u8A2D\u306E\u307F</label></div>
  ${detail}
  <div class="list" style="max-height:38vh;overflow:auto">${rows2.map((r) => `<button class="btn item" data-i="${r.idx}" style="${r.idx === st3.sel ? "outline:2px solid #fc6" : ""}">${esc3(r.name)} <span class="small">${esc3(r.label)}\u30FB${esc3(r.district)}\u30FB(${r.x},${r.y})\u30FB${r.floors}\u968E\u30FB${esc3(inspectLine(G4, G4.world.map.buildings[r.idx], true))}</span></button>`).join("") || '<div class="small">\u8A72\u5F53\u306A\u3057</div>'}</div>
  <div class="formrow"><button class="btn sec" id="fP">\uFF1C</button><span class="small">${st3.page + 1}/${pages}</span><button class="btn sec" id="fN">\uFF1E</button><button class="btn sec" id="fX">\u623B\u308B</button></div>`, (c) => {
      const q = (id) => c.querySelector("#" + id), again = () => facilityList(x, st3);
      q("fQ").onchange = (e) => {
        st3.q = e.target.value.trim();
        st3.page = 0;
        again();
      };
      q("fT").onchange = (e) => {
        st3.type = e.target.value;
        st3.page = 0;
        again();
      };
      q("fD").onchange = (e) => {
        st3.district = e.target.value;
        st3.page = 0;
        again();
      };
      q("fE").onchange = (e) => {
        st3.enterOnly = e.target.checked;
        st3.page = 0;
        again();
      };
      q("fP").onclick = () => {
        st3.page--;
        again();
      };
      q("fN").onclick = () => {
        st3.page++;
        again();
      };
      q("fX").onclick = () => devPanel(x);
      c.querySelectorAll("[data-i]").forEach((b) => b.onclick = () => {
        st3.sel = +b.dataset.i;
        again();
      });
      if (sel) {
        q("fMap").onclick = () => {
          x.closeModal();
          x.showRoute(sel);
        };
        const d = q("fDoor");
        if (d) d.onclick = () => {
          const r = devGotoDoor(G4, sel.idx);
          x.closeModal();
          x.clear();
          x.updateHud(true);
          x.toast(r.msg, 3e3);
        };
        c.querySelectorAll("[data-fl]").forEach((b) => b.onclick = () => {
          const r = devGotoFloor(G4, sel.idx, +b.dataset.fl);
          x.closeModal();
          x.clear();
          x.updateHud(true);
          x.toast(r.msg, 3e3);
        });
      }
    });
  }

