  // src/towers.js — 塔の外観: 東都タワー(架空の展望塔。赤白の鉄骨・大展望台・特別展望台・アンテナ)と、空港の航空管制塔(別の種類 ctower)。
  // v11 ではどちらも事務所の箱の形だった。管制塔は観光施設ではない(関係者のみ・見学は空港ターミナルの管制塔見学ツアー)。
  BTYPES.ctower = { label: "航空管制塔", w: 4, h: 6, cat: "public", enter: false, interior: "office", floors: 1, slots: {} };
  KIT.ctower = { k: "ctower", f: [1, 1], roof: "flat", wall: "white" };
  SPECIAL.add("tourtower");
  SPECIAL.add("ctower");
  function paintTowerX(ctx4, e, P2, poly7, mode2) {
    const { w, h, R: R5, sp } = e, lit = mode2 !== "day";
    const cu = w / 2, cv = h / 2;
    const line = (a, b, col, lw) => {
      ctx4.strokeStyle = col;
      ctx4.lineWidth = Math.max(1, lw * R5);
      ctx4.beginPath();
      ctx4.moveTo(a[0], a[1]);
      ctx4.lineTo(b[0], b[1]);
      ctx4.stroke();
    };
    const lamp = (u, v, z, col, r) => {
      const q = P2(u, v, z);
      ctx4.fillStyle = col;
      ctx4.beginPath();
      ctx4.arc(q[0], q[1], r * R5, 0, 7);
      ctx4.fill();
    };
    if (sp.kind === "ctower") {
      // 管制塔: 低い基部・細い塔身・ガラスの管制室・レーダーとアンテナ
      const zs = 13, zc = 15.5;
      if (!lit) {
        poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#c9c9c3");
        prism(poly7, P2, 0.4, 0.6, w - 0.4, h - 0.6, 0, 1.6, "#e9ecef", "#cfd4d9", "#dfe3e6");
        prism(poly7, P2, cu - 0.7, cv - 0.7, cu + 0.7, cv + 0.7, 1.6, zs, "#eef0f2", "#cfd4d9", null);
        prism(poly7, P2, cu - 1.3, cv - 1.3, cu + 1.3, cv + 1.3, zs, zs + 0.4, "#d6dade", "#b9bfc5", "#e3e6e9");
        prism(poly7, P2, cu - 1.4, cv - 1.4, cu + 1.4, cv + 1.4, zs + 0.4, zc, "#3e6f87", "#2f5a70", null);
        prism(poly7, P2, cu - 1.5, cv - 1.5, cu + 1.5, cv + 1.5, zc, zc + 0.35, "#e9ecef", "#c9ced3", "#f2f4f6");
        // 窓の桟
        for (let k = -1; k <= 1; k++) {
          line(P2(cu + k * 0.9, cv + 1.4, zs + 0.4), P2(cu + k * 0.9, cv + 1.4, zc), "#20323c", 0.4);
          line(P2(cu + 1.4, cv + k * 0.9, zs + 0.4), P2(cu + 1.4, cv + k * 0.9, zc), "#20323c", 0.4);
        }
        // レーダーのドームとアンテナ
        const dm = P2(cu, cv, zc + 0.9);
        ctx4.fillStyle = "#f4f6f8";
        ctx4.beginPath();
        ctx4.arc(dm[0], dm[1], 0.75 * 12 * R5, Math.PI, 0);
        ctx4.fill();
        line(P2(cu + 0.8, cv - 0.8, zc + 0.35), P2(cu + 0.8, cv - 0.8, zc + 3), "#9aa3ad", 0.5);
        lamp(cu + 0.8, cv - 0.8, zc + 3, "#e8402a", 0.9);
      } else {
        prism(poly7, P2, cu - 1.4, cv - 1.4, cu + 1.4, cv + 1.4, zs + 0.4, zc, "rgba(140,220,255,0.55)", "rgba(110,190,230,0.5)", null);
        lamp(cu + 0.8, cv - 0.8, zc + 3, "#ff4a2a", 1.4);
      }
      return;
    }
    // 東都タワー: 4本の脚が上ですぼまる鉄骨の塔。赤白の塗り分け(航空障害の塗色)
    const ZT = 52, zm = 20, zu = 37;
    const half = (z) => 1.9 * (1 - z / (ZT + 6)) + 0.15;
    const ring = (z) => [[cu - half(z), cv - half(z)], [cu + half(z), cv - half(z)], [cu + half(z), cv + half(z)], [cu - half(z), cv + half(z)]];
    const col = (z) => Math.floor(z / 3) % 2 ? "#f2f2f0" : "#d8432f";
    if (!lit) {
      poly7([P2(0, 0, 0), P2(w, 0, 0), P2(w, h, 0), P2(0, h, 0)], "#c9c2b0");
      // 足もとの建物(展望台への入口)
      prism(poly7, P2, 0.3, h - 2.2, w - 0.3, h - 0.3, 0, 1.8, "#eceff1", "#cdd2d6", "#dfe3e6");
      const segs = 12;
      for (let s = 0; s < segs; s++) {
        const z0 = s * ZT / segs, z1 = (s + 1) * ZT / segs, A = ring(z0), B = ring(z1), c = col(z0);
        for (let k = 0; k < 4; k++) line(P2(A[k][0], A[k][1], z0), P2(B[k][0], B[k][1], z1), c, 3.4);
        // 筋かい(手前の2面だけ)
        for (const [i, j] of [[3, 2], [2, 1]]) {
          line(P2(A[i][0], A[i][1], z0), P2(B[j][0], B[j][1], z1), c, 1.3);
          line(P2(A[j][0], A[j][1], z0), P2(B[i][0], B[i][1], z1), c, 1.3);
          line(P2(A[i][0], A[i][1], z1), P2(A[j][0], A[j][1], z1), c, 1.1);
        }
      }
      // 大展望台・特別展望台
      for (const [z, hh] of [[zm, 1.6], [zu, 0.9]]) {
        const r = half(z) + 0.5;
        prism(poly7, P2, cu - r, cv - r, cu + r, cv + r, z, z + hh, "#7fb3d1", "#5f93b1", "#e9ecef");
      }
      // アンテナ
      line(P2(cu, cv, ZT), P2(cu, cv, ZT + 6), "#d8432f", 2.2);
      lamp(cu, cv, ZT + 6, "#e8402a", 0.8);
    } else {
      // 夜: 塔の輪郭をあかりで、展望台の窓
      for (let s = 0; s < 12; s++) {
        const z0 = s * ZT / 12, A = ring(z0);
        for (let k = 0; k < 4; k++) lamp(A[k][0], A[k][1], z0, "rgba(255,170,90,0.9)", 0.8);
      }
      for (const [z, hh] of [[zm, 1.6], [zu, 0.9]]) {
        const r = half(z) + 0.5;
        prism(poly7, P2, cu - r, cv - r, cu + r, cv + r, z, z + hh, "rgba(255,230,160,0.7)", "rgba(240,210,140,0.6)", null);
      }
      lamp(cu, cv, ZT + 6, "#ff4a2a", 1.4);
    }
  }
