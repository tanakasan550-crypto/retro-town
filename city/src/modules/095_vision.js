  // src/vision.js
  var VISION_TYPES = { dept: [0.1, 0.1, 0.8, 0.26], mall: [0.1, 0.1, 0.8, 0.28], media: [0.1, 0.12, 0.8, 0.3], tourtower: [0.2, 0.18, 0.6, 0.16], station: [0.2, 0.06, 0.6, 0.22] };
  var ADS = [
    ["\u6F6E\u98A8\u30D9\u30FC\u30AB\u30EA\u30FC", "\u713C\u304D\u305F\u3066\u30D1\u30F3 \u671D7\u6642\u304B\u3089"],
    ["\u30CA\u30AC\u30E4\u30DE\u96FB\u9244", "\u6CBF\u7DDA\u30D5\u30A7\u30A2 \u958B\u50AC\u4E2D"],
    ["\u306A\u304E\u3055\u4FE1\u7528\u91D1\u5EAB", "\u3086\u3063\u304F\u308A\u80B2\u3066\u308B\u7A4D\u7ACB"],
    ["\u307F\u3069\u308A\u85AC\u5C40", "\u5B63\u7BC0\u306E\u5065\u5EB7\u76F8\u8AC7 \u627F\u308A\u307E\u3059"],
    ["\u3072\u304B\u308A\u98DF\u5802", "\u65E5\u66FF\u308F\u308A\u5B9A\u98DF \u30EF\u30F3\u30B3\u30A4\u30F3"],
    ["\u304F\u3058\u3089\u753A\u5DE5\u5834", "\u8857\u306E\u3082\u306E\u3065\u304F\u308A \u898B\u5B66\u4F1A"],
    ["\u3042\u304A\u305E\u3089\u65C5\u884C\u793E", "\u9031\u672B\u3077\u3061\u65C5\u884C \u53D7\u4ED8\u4E2D"],
    ["\u661F\u898B\u66F8\u5E97", "\u65B0\u520A\u305E\u304F\u305E\u304F\u5165\u8377"],
    ["\u6E2F\u307E\u3061\u6620\u753B\u9928", "\u4ECA\u9031\u306E\u4E0A\u6620\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB"],
    ["\u3055\u304F\u3089\u4E73\u696D", "\u30DF\u30EB\u30AF\u306E\u65E5 \u30AD\u30E3\u30F3\u30DA\u30FC\u30F3"],
    ["\u6771\u90FD\u30BF\u30EF\u30FC", "\u5C55\u671B\u30E9\u30A4\u30C8\u30A2\u30C3\u30D7 \u6BCE\u6669"],
    ["\u6E4A\u30BC\u30EA\u30FC\u672C\u8217", "\u590F\u306E\u3072\u3093\u3084\u308A\u65B0\u5473"]
  ];
  function visionSlides(g, b) {
    const y = g.year(), m0 = g.month0(), out = [];
    for (let k = 0; k < 3; k++) {
      const a = ADS[(b.idx * 5 + k * 4 + y) % ADS.length];
      out.push({ tag: "CM", title: a[0], sub: a[1], hue: 205 + k * 40 });
    }
    const nat = WORLD_EVENTS.filter((e) => e.y === y || e.y === y - 1 && m0 <= 2).slice(-3);
    for (const e of nat) out.push({ tag: "\u30CB\u30E5\u30FC\u30B9", title: e.text, sub: `${e.y}\u5E74${e.m ? e.m + "\u6708" : ""}`, hue: 0 });
    if (g.S.vis && g.S.vis.y === y - 1 && m0 <= 2) {
      out.push({ tag: "\u5E74\u59CB\u7279\u756A", title: `${g.S.vis.y}\u5E74\u306E\u3075\u308A\u304B\u3048\u308A`, sub: g.S.vis.town[0], hue: 30 });
      if (g.S.vis.town[1]) out.push({ tag: "\u8857\u306E\u30CB\u30E5\u30FC\u30B9", title: g.S.vis.town[1], sub: "\u6628\u5E74\u306E\u8857\u306E\u3067\u304D\u3054\u3068", hue: 30 });
    }
    if (m0 >= 10) {
      const t = g.S.yt && g.S.yt.y === y ? g.S.yt : null;
      out.push({ tag: "\u5E74\u672B\u7279\u756A", title: `${y}\u5E74 \u4ECA\u5E74\u306E\u5341\u5927\u30CB\u30E5\u30FC\u30B9`, sub: nat[0] ? nat[0].text : "\u4E00\u5E74\u3092\u3075\u308A\u304B\u3048\u308A\u307E\u3059", hue: 345 });
      if (t) out.push({ tag: "\u8857\u306E\u4E00\u5E74", title: `\u4ECA\u5E74\u306E\u8857: \u8A95\u751F${t.born}\u4EBA\u30FB\u7D50\u5A5A${t.married}\u7D44`, sub: "\u77E5\u3063\u3066\u3044\u308B\u4EBA\u306E\u7BC4\u56F2", hue: 345 });
    }
    if (m0 === 11 || m0 === 0) out.push({ tag: m0 === 0 ? "\u65B0\u5E74" : "\u5E74\u672B", title: m0 === 0 ? `${y}\u5E74 \u3042\u3051\u307E\u3057\u3066\u304A\u3081\u3067\u3068\u3046\u3054\u3056\u3044\u307E\u3059` : "\u3088\u3044\u304A\u5E74\u3092", sub: "\u30CA\u30AC\u30E4\u30DE\u2606LAB \u7279\u5225\u7DE8\u6210", hue: 345 });
    return out;
  }
  var SLIDE_SEC = 6;
  function visionAt(g, b, tSec) {
    const s = visionSlides(g, b);
    const i = Math.floor(tSec / SLIDE_SEC + b.idx * 3) % s.length;
    return { slide: s[i], i, n: s.length, phase: (tSec / SLIDE_SEC + b.idx * 3) % 1 };
  }
  function drawVision(ctx4, g, b, x, y, w, h, S2, tSec, night) {
    const r = VISION_TYPES[b.type];
    if (!r || b.status === "closed") return;
    const sx = x + w * r[0], sy = y + h * r[1], sw = w * r[2], sh2 = h * r[3];
    if (sw < 14 || sh2 < 7) return;
    const { slide: s, phase } = visionAt(g, b, tSec);
    const hue = s.hue;
    ctx4.save();
    ctx4.fillStyle = "#10131a";
    ctx4.fillRect(sx - S2, sy - S2, sw + 2 * S2, sh2 + 2 * S2);
    const gr = ctx4.createLinearGradient(sx, sy, sx + sw, sy + sh2);
    gr.addColorStop(0, `hsl(${hue},70%,${night ? 38 : 30}%)`);
    gr.addColorStop(1, `hsl(${(hue + 40) % 360},65%,${night ? 26 : 20}%)`);
    ctx4.fillStyle = gr;
    ctx4.fillRect(sx, sy, sw, sh2);
    const fade2 = phase < 0.08 ? phase / 0.08 : phase > 0.94 ? (1 - phase) / 0.06 : 1;
    ctx4.globalAlpha = Math.max(0.15, fade2);
    ctx4.beginPath();
    ctx4.rect(sx, sy, sw, sh2);
    ctx4.clip();
    ctx4.textBaseline = "top";
    ctx4.textAlign = "left";
    const tagPx = Math.max(4, Math.round(sh2 * 0.22));
    ctx4.font = `bold ${tagPx}px sans-serif`;
    const tw = ctx4.measureText(s.tag).width + tagPx * 0.8;
    ctx4.fillStyle = s.tag === "CM" ? "#ffd54f" : "#ff5252";
    ctx4.fillRect(sx + S2, sy + S2, tw, tagPx + S2);
    ctx4.fillStyle = s.tag === "CM" ? "#222" : "#fff";
    ctx4.fillText(s.tag, sx + S2 + tagPx * 0.4, sy + S2 * 1.5);
    const fit2 = (txt2, px2, yy, col) => {
      let p = px2;
      ctx4.font = `bold ${p}px sans-serif`;
      const mw = sw - 2 * S2;
      const t = ctx4.measureText(txt2).width;
      if (t > mw) {
        p = Math.max(3, Math.floor(p * mw / t));
        ctx4.font = `bold ${p}px sans-serif`;
      }
      ctx4.fillStyle = col;
      ctx4.fillText(txt2, sx + S2, yy);
    };
    fit2(s.title, Math.round(sh2 * 0.3), sy + S2 * 2 + tagPx + S2, "#fff");
    fit2(s.sub, Math.round(sh2 * 0.2), sy + sh2 - Math.round(sh2 * 0.26), "#ffe9a8");
    ctx4.globalAlpha = 0.12;
    ctx4.fillStyle = "#fff";
    for (let yy = sy; yy < sy + sh2; yy += 2 * S2) ctx4.fillRect(sx, yy, sw, 1);
    ctx4.restore();
  }

