  // src/audit.js — 開発者用 施設監査モード(カテゴリ別一覧・完成度・外観/入口/通り視点/各階/朝昼夜/撮影)
  // v11 の「試験セッション」(現在の人生を複製し、終了すると元の人生へ戻る・通常セーブに書かない)の上で動く。
  // 施設ID(b.id / b.idx)はそのまま使い、採番し直さない。完成度はコードと試験の事実から判定し、人が確認していない項目は「未検査」「未検証」のまま。
  var AUDIT_CATS = [
    ["edu", "学校・教育・大学・研究"],
    ["med", "病院・医療・福祉"],
    ["res", "住宅・マンション・宿泊"],
    ["shop", "商店街・百貨店・飲食・小売"],
    ["transit", "駅・地下鉄・バス・空港・港湾"],
    ["leisure", "公園・動物園・水族館・遊園地・娯楽"],
    ["onsen", "温泉・旅館・観光"],
    ["public", "公共施設・消防・警察・行政"],
    ["work", "オフィス・工場・職業施設"],
    ["culture", "寺社・伝統文化・歴史施設"],
    ["other", "その他"]
  ];
  var AUDIT_TYPE_CAT = (() => {
    const m = {};
    const put = (cat, s) => s.split(" ").forEach((t) => m[t] = cat);
    put("edu", "kinder elem jh hs univ special cram lab");
    put("med", "hospital clinic pharmacy nursing welfare");
    put("res", "house farmhouse apt tower villa hotel bizhotel resorthotel minshuku");
    put("shop", "shop konbini super mall dept bookstore clothes fishshop liquor greengrocer homecenter directsale cardealer usedcar ramen restaurant seafood izakaya cafe market gasstation");
    put("transit", "station metro airport ferry pier marina harboroffice");
    put("leisure", "park zoo aquarium themepark stadium cinema gamecenter bowling gym beachhouse");
    put("onsen", "onsenbath ryokan sento tourtower");
    put("public", "cityhall police fire court library funeral crematorium");
    put("work", "office warehouse factory logistics construction farmcoop bank media agency lawfirm");
    put("culture", "shrine temple museum edovillage cemetery");
    return m;
  })();
  var auditCat = (b) => b.type === "annex" && b.parentB != null && G3 ? AUDIT_TYPE_CAT[G3.bld(b.parentB).type] || "other" : AUDIT_TYPE_CAT[b.type] || "other";
  // 自動試験(tools/scen)のうち、その施設の利用を実際に通して確かめているもの
  var AUDIT_TESTS = { hotel: "hotel", bizhotel: "hotel", resorthotel: "hotel", aquarium: "aq", themepark: "tp", station: "st,stpeople,metro", metro: "metro", stadium: "sd", airport: "fly", hospital: "ho", zoo: "zoo" };
  var auditFactC = /* @__PURE__ */ new Map();
  // 種類ごとの事実(代表の建物の内部を実際に組み立てて数える)
  function auditFacts(g, b) {
    let f2 = auditFactC.get(b.type);
    if (f2) return f2;
    const bt = BTYPES[b.type];
    f2 = { objs: 0, acts: 0, fx: 0, staff: 0, floors: 0, err: "" };
    if (bt.enter) {
      for (const fl of floorList(b).slice(0, 4)) {
        try {
          const { I: I2 } = interiorOf(g, b.idx, fl.floor);
          f2.floors++;
          f2.objs += I2.objs.length;
          f2.acts += I2.objs.filter((o) => o.act).length;
          f2.fx += I2.objs.filter((o) => o.act && (String(o.act).startsWith("fx_") || FAC_ACTS[o.act])).length;
          f2.staff += (I2.staffSpots || []).length;
        } catch (e) {
          f2.err = String(e && e.message || e).slice(0, 80);
        }
      }
    }
    auditFactC.set(b.type, f2);
    return f2;
  }
  // 完成度(9項目)。v = 表示, ok = 達成(true)/未達(false)/未確認(null)
  function auditStatus(g, b) {
    const bt = BTYPES[b.type], f2 = auditFacts(g, b);
    const slots = bt.slots ? Object.values(bt.slots).reduce((a, c) => a + c, 0) : 0;
    const special = SPECIAL.has(b.type) || b.type === "metro";
    const rebuilt = !!FAC_BUILD[b.type];
    const tests = AUDIT_TESTS[b.type] || "";
    const st3 = {
      ext: special ? { v: "専用の外観", ok: true } : { v: "汎用の外観(種類別の色・看板)", ok: false },
      int: rebuilt ? { v: `改築済み(規模に合わせた間取り・${f2.floors}階を確認)`, ok: true } : bt.enter ? { v: "v11の汎用内部", ok: false } : { v: "立入不可(外観のみ)", ok: null },
      hero: !bt.enter ? { v: "外観のみ", ok: null } : f2.acts > 0 ? { v: `利用可(操作できる設備${f2.acts})`, ok: true } : { v: "入れるが操作できる設備なし", ok: false },
      npc: slots ? { v: `職員の枠${slots}人(配置${f2.staff}か所)・来客は未計測`, ok: null } : { v: "職員の枠なし", ok: null },
      life: f2.fx > 0 ? { v: `施設固有の体験${f2.fx}`, ok: true } : { v: "汎用の動作のみ", ok: false },
      time: { v: "昼夜・年代・季節は未確認", ok: null },
      test: tests ? { v: `自動試験 ${tests}`, ok: true } : { v: "施設別の自動試験なし", ok: false },
      screen: { v: "画面検査は未実施(人の確認が必要)", ok: null },
      android: { v: "Android実機は未検証", ok: null }
    };
    st3.grade = rebuilt && tests ? "B 改築済み・自動試験あり(画面検査・実機は未)" : rebuilt ? "C+ 改築済み(施設別試験なし)" : bt.enter ? "C v11汎用(入れる)" : "D 外観のみ";
    st3.complete = false;
    return st3;
  }
  var AUDIT_AXES = [["ext", "外観完成"], ["int", "内部完成"], ["hero", "主人公が利用可能"], ["npc", "NPCが利用"], ["life", "施設固有の生活動作"], ["time", "昼夜・年代・季節"], ["test", "自動テスト"], ["screen", "画面検査"], ["android", "Android実機"]];
  // ---- 監査の操作(試験セッション中のみ)
  var AUD = { sel: null, mode: "ext", floor: 0, zl0: null };
  function auditBegin() {
    if (isTestSession(G3)) return true;
    const t = openTestSession(G3);
    if (!t) return false;
    devCtx().enterTest(t);
    return true;
  }
  function auditFrame(b) {
    const st0 = b.siteI != null && G3.world.map.fsites ? G3.world.map.fsites[b.siteI] : null;
    const s = st0 ? Math.max(st0.w, st0.h) * 0.6 : Math.max(b.w, b.h);
    if (AUD.zl0 == null) AUD.zl0 = R4.zl || 0;
    R4.zl = s >= 30 ? -4 : s >= 16 ? -3 : s >= 9 ? -2 : -1;
    R4.resize();
  }
  function auditView(idx, opts = {}) {
    if (!isTestSession(G3)) return { ok: false, msg: "試験セッション中のみ" };
    const b = G3.bld(idx), bt = BTYPES[b.type];
    AUD.sel = idx;
    if (opts.hour != null) devSetTime(G3, opts.hour, 0);
    const mode = opts.mode || "ext";
    AUD.mode = mode;
    R4.auditFocus = mode === "ext" || mode === "door" ? idx : null;
    if (R4.street && mode !== "street") R4.street = false;
    let r;
    if (mode === "in") {
      if (!bt.enter) return { ok: false, msg: `${b.name}は立入できない施設です(外観のみ)` };
      AUD.floor = opts.floor ?? floorList(b)[0].floor;
      r = devGotoFloor(G3, idx, AUD.floor);
      if (AUD.zl0 != null) {
        R4.zl = AUD.zl0;
        R4.resize();
      }
    } else {
      r = devGotoDoor(G3, idx);
      const L2 = G3.S.loc;
      if (mode === "ext") {
        // 建物全体が入るように、入口の少し手前から引いて見る
        L2.y = b.doorY + 0.6 + Math.min(6, Math.max(1, b.h * 0.3));
        L2.x = b.x + b.w / 2;
        const st0 = b.siteI != null && G3.world.map.fsites ? G3.world.map.fsites[b.siteI] : null;
        if (st0) {
          L2.x = st0.x + st0.w / 2;
          L2.y = st0.y + st0.h * 0.62;
        }
        const map2 = G3.world.map, k = Math.floor(L2.x) + Math.floor(L2.y) * map2.W;
        if (map2.solid[k]) {
          L2.x = b.doorX + 0.5;
          L2.y = b.doorY + 0.6;
        }
        auditFrame(b);
      } else if (mode === "street") {
        L2.x = b.doorX + 0.5;
        L2.y = b.doorY + 0.6 + 3;
        L2.f = "u";
        if (AUD.zl0 != null) {
          R4.zl = AUD.zl0;
          R4.resize();
        }
        R4.street = true;
        if (!R4.sv) initStreet(R4);
        setYawFromFacing(R4, "u");
      } else if (AUD.zl0 != null) {
        R4.zl = AUD.zl0;
        R4.resize();
      }
    }
    U.cwAt = -999;
    clearDest();
    auditBar();
    return r;
  }
  function auditEnd() {
    if (AUD.zl0 != null) {
      R4.zl = AUD.zl0;
      R4.resize();
    }
    AUD.zl0 = null;
    AUD.sel = null;
    R4.auditFocus = null;
    R4.street = false;
    auditBar();
    if (isTestSession(G3)) devCtx().leaveTest();
  }
  function auditShotName(b) {
    const fl = AUD.mode === "in" ? (floorList(b).find((f2) => f2.floor === AUD.floor) || { label: AUD.floor + "F" }).label : "-";
    const t = `${String(Math.floor(G3.S.min / 60)).padStart(2, "0")}${String(G3.S.min % 60).padStart(2, "0")}`;
    const mode = { ext: "外観", door: "入口", street: "通り視点", in: "内部" }[AUD.mode] || AUD.mode;
    return `${b.id}_${b.name}_${t}_${mode}_${fl}`.replace(/[\\/:*?"<>|\s]+/g, "_");
  }
  function auditSave() {
    const b = AUD.sel != null ? G3.bld(AUD.sel) : null;
    if (!b) return;
    try {
      const a = document.createElement("a");
      a.download = auditShotName(b) + ".png";
      a.href = cv.toDataURL("image/png");
      a.click();
      toast(`保存しました: ${a.download}`, 2400);
    } catch (e) {
      toast("保存できませんでした: " + e.message);
    }
  }
  // 監査中の操作バー(画面上部)
  function auditBar() {
    let el = $("auditBar");
    if (!el) {
      const st = document.createElement("style");
      st.textContent = `#auditBar{position:absolute;left:50%;transform:translateX(-50%);top:calc(4px + env(safe-area-inset-top,0px));z-index:8;display:none;flex-wrap:wrap;gap:4px;align-items:center;background:#2a1a00ee;border:1px solid #f90;border-radius:10px;padding:4px 6px;max-width:96vw;font-size:12px;color:#fff}
#auditBar.on{display:flex}#auditBar b{color:#ffcc66;max-width:30vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#auditBar button{min-height:32px;border:0;border-radius:8px;background:#5a3a00;color:#fff;padding:0 8px;font-size:12px}#auditBar button.x{background:#a33}`;
      document.head.appendChild(st);
      el = document.createElement("div");
      el.id = "auditBar";
      $("app").appendChild(el);
      el.addEventListener("click", (e) => {
        const a = e.target.closest("button")?.dataset.a;
        if (!a || !G3) return;
        e.stopPropagation();
        const idx = AUD.sel;
        if (a === "list") return auditModal();
        if (a === "end") return auditEnd();
        if (a === "shot") return auditSave();
        if (["ext", "door", "street"].includes(a)) return toastR(auditView(idx, { mode: a }));
        if (a === "up" || a === "dn") {
          const fl = floorList(G3.bld(idx)), i = fl.findIndex((f2) => f2.floor === AUD.floor);
          const j = AUD.mode !== "in" ? 0 : Math.max(0, Math.min(fl.length - 1, i + (a === "up" ? 1 : -1)));
          return toastR(auditView(idx, { mode: "in", floor: fl[j].floor }));
        }
        if (a.startsWith("h")) {
          devSetTime(G3, +a.slice(1), 0);
          U.cwAt = -999;
          updateHud(true);
          auditBar();
        }
      });
    }
    const on2 = !!(G3 && isTestSession(G3) && AUD.sel != null);
    el.classList.toggle("on", on2);
    if (!on2) return;
    const b = G3.bld(AUD.sel), fl = AUD.mode === "in" ? (floorList(b).find((f2) => f2.floor === AUD.floor) || {}).label || "" : "";
    el.innerHTML = `<span>🔍</span><b>${esc4(b.id)} ${esc4(b.name)}${fl ? " " + esc4(fl) : ""}</b><button data-a="list">一覧</button><button data-a="ext">外観</button><button data-a="door">入口</button><button data-a="street">通り</button>${BTYPES[b.type].enter ? '<button data-a="dn">階▼</button><button data-a="up">階▲</button>' : ""}<button data-a="h8">朝</button><button data-a="h13">昼</button><button data-a="h20">夜</button><button data-a="shot">📷</button><button data-a="end" class="x">監査終了</button>`;
  }
  var toastR = (r) => r && r.msg && toast(r.msg, 2200);
  // ---- 一覧(カテゴリ別)
  var AUDIT_PAGE = 30;
  function auditModal(st3 = AUD.list || (AUD.list = { cat: "transit", q: "", page: 0, sel: null })) {
    const g = G3, B2 = g.world.map.buildings;
    const counts = {};
    for (const b of B2) counts[auditCat(b)] = (counts[auditCat(b)] || 0) + 1;
    const rows2 = B2.filter((b) => auditCat(b) === st3.cat && (!st3.q || `${b.name}${BTYPES[b.type].label}${b.addr || ""}${b.id}`.includes(st3.q)));
    const pages = Math.max(1, Math.ceil(rows2.length / AUDIT_PAGE));
    st3.page = Math.max(0, Math.min(pages - 1, st3.page));
    const sel = st3.sel != null ? B2[st3.sel] : null;
    const on2 = isTestSession(g);
    let detail = "";
    if (sel) {
      const s = auditStatus(g, sel), bt = BTYPES[sel.type], fl = floorList(sel);
      detail = `<div class="tx small" style="border:1px solid #f90;border-radius:8px;padding:6px;margin:6px 0"><b>${esc4(sel.id)} ${esc4(sel.name)}</b>(${esc4(bt.label)}・${esc4(sel.type)})<br>${esc4(sel.addr || "")}・地区 ${esc4(districtOf2(sel))}・${fl.length}階・大きさ${sel.w}×${sel.h}<br><b>判定: ${esc4(s.grade)}</b><table style="width:100%;font-size:12px">${AUDIT_AXES.map(([k, nm]) => `<tr><td style="white-space:nowrap">${s[k].ok === true ? "✅" : s[k].ok === false ? "❌" : "⬜"} ${nm}</td><td>${esc4(s[k].v)}</td></tr>`).join("")}</table><div class="small">v11の検査軸: ${esc4(inspectLine(g, sel))}</div>
      ${on2 ? `<div class="formrow"><button class="btn acc" data-op="ext">外観を見る</button><button class="btn sec" data-op="door">入口へ</button><button class="btn sec" data-op="street">通り視点</button></div>${bt.enter ? `<div class="formrow">${fl.map((f2) => `<button class="btn sec" data-fl="${f2.floor}">${esc4(f2.label)}</button>`).join("")}</div>` : ""}` : '<div class="formrow"><button class="btn acc" data-op="begin">監査を始める(試験セッションへ・元の人生とセーブは変わりません)</button></div>'}</div>`;
    }
    showModal(`<h2>🔍 施設監査 <span class="small">全${B2.length}件(施設IDはそのまま)</span></h2>
    <div class="small">${AUDIT_CATS.map(([k, nm]) => `<span class="pill" data-cat="${k}" style="cursor:pointer;${st3.cat === k ? "background:#f90;color:#000" : ""}">${esc4(nm)} ${counts[k] || 0}</span>`).join("")}</div>
    <div class="formrow"><input id="aQ" placeholder="名称・ID・住所" value="${esc4(st3.q)}" style="flex:1"></div>${detail}
    <div class="list" style="max-height:34vh;overflow:auto">${rows2.slice(st3.page * AUDIT_PAGE, st3.page * AUDIT_PAGE + AUDIT_PAGE).map((b) => {
      const s = auditStatus(g, b);
      return `<button class="btn item" data-i="${b.idx}" style="${b.idx === st3.sel ? "outline:2px solid #fc6" : ""}">${esc4(b.id)} ${esc4(b.name)} <span class="small">${esc4(BTYPES[b.type].label)}・${esc4(districtOf2(b))}・${floorList(b).length}階・${esc4(s.grade.split(" ")[0])}</span></button>`;
    }).join("") || '<div class="small">該当なし</div>'}</div>
    <div class="formrow"><button class="btn sec" id="aP">＜</button><span class="small">${st3.page + 1}/${pages}(${rows2.length}件)</span><button class="btn sec" id="aN">＞</button><button class="btn sec" id="aX">閉じる</button>${on2 ? '<button class="btn sec" id="aE">監査終了(元の人生へ)</button>' : ""}</div>`, (c) => {
      const again = () => auditModal(st3);
      c.querySelectorAll("[data-cat]").forEach((p) => p.onclick = () => {
        st3.cat = p.dataset.cat;
        st3.page = 0;
        st3.sel = null;
        again();
      });
      c.querySelector("#aQ").onchange = (e) => {
        st3.q = e.target.value.trim();
        st3.page = 0;
        again();
      };
      c.querySelector("#aP").onclick = () => {
        st3.page--;
        again();
      };
      c.querySelector("#aN").onclick = () => {
        st3.page++;
        again();
      };
      c.querySelector("#aX").onclick = () => closeModal();
      const ae = c.querySelector("#aE");
      if (ae) ae.onclick = () => {
        closeModal();
        auditEnd();
        toast("監査を終了し、元の人生へ戻りました(監査中の変更は破棄)", 3e3);
      };
      c.querySelectorAll("[data-i]").forEach((b) => b.onclick = () => {
        st3.sel = +b.dataset.i;
        again();
      });
      c.querySelectorAll("[data-op]").forEach((b) => b.onclick = () => {
        const op = b.dataset.op;
        if (op === "begin") {
          closeModal();
          if (!auditBegin()) return toast("この版では使えません");
          return auditModal(st3);
        }
        closeModal();
        toastR(auditView(st3.sel, { mode: op }));
      });
      c.querySelectorAll("[data-fl]").forEach((b) => b.onclick = () => {
        closeModal();
        toastR(auditView(st3.sel, { mode: "in", floor: +b.dataset.fl }));
      });
    });
  }
  // 一括撮影ツール(tools/audit_shots.mjs)と完成度一覧の書き出しに使う
  function auditRows() {
    const g = G3;
    return g.world.map.buildings.map((b) => {
      const s = auditStatus(g, b);
      return { idx: b.idx, id: b.id, name: b.name, type: b.type, label: BTYPES[b.type].label, cat: auditCat(b), catName: Object.fromEntries(AUDIT_CATS)[auditCat(b)], addr: b.addr || "", district: districtOf2(b), floors: floorList(b).map((f2) => ({ floor: f2.floor, label: f2.label })), enter: !!BTYPES[b.type].enter, w: b.w, h: b.h, grade: s.grade, axes: Object.fromEntries(AUDIT_AXES.map(([k, nm]) => [nm, s[k]])), v11: inspectLine(g, b) };
    });
  }
