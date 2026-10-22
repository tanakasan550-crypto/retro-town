  // src/rideart.js
  var DEFAULT_SPEC = {
    skin: "#f3d0b0",
    skinSh: "#e4b894",
    hair: "#3b2a22",
    hairSh: "#2a1e18",
    shirt: "#4a7fd0",
    shirtSh: "#375fa0",
    pants: "#3a4a6a",
    pantsSh: "#2a3650",
    helmet: "#e6c33a",
    helmetSh: "#b8962a",
    body: "#d83a3a",
    bodySh: "#a82a2a",
    iris: "#2a2230",
    faceRx: 7.2,
    faceRy: 6.8,
    eye: "round",
    lash: 0,
    brow: "arc",
    mouth: "smile",
    hairKey: "short",
    glass: "",
    facial: "",
    freckles: 0,
    mole: 0,
    wrinkle: 0,
    fem: false
  };
  var K = { visor: "#2c4256", black: "#1c1d22", tire: "#16171b", chrome: "#c9cdd3", chromeSh: "#8d939c", seat: "#2a2a30", white: "#ffffff", blush: "#f0a0a0", shoe: "#5a4a3a", lamp: "#fff6c8", tail: "#e0262a", mouthC: "#b0605a", eyeW: "#ffffff", glassC: "#5a6070" };
  var f = (c) => `fill="${c}"`;
  var n = (v) => +v.toFixed(2);
  var FACE = [{ rx: 34, ry: 31 }, { rx: 32, ry: 33 }, { rx: 36, ry: 30 }, { rx: 33, ry: 32 }];
  var faceDims = (shape) => {
    const q = FACE[shape & 3] || FACE[0];
    return { faceRx: n(7.2 * q.rx / 34), faceRy: n(6.8 * q.ry / 31) };
  };
  var HAIR_CLASS = { baby: "baby", bowl: "bowl", short: "short", spiky: "spiky", swept: "swept", side: "side", fringe: "fringe", curly: "curly", gshort: "short", thin: "thin", bald: "bald", bobkid: "bob", bob: "bob", twin: "twin", ponytail: "ponytail", long: "long", pixie: "pixie", bun: "bun" };
  function eyes(view, s, cx, cy, sx) {
    const out = [];
    const iris = s.iris, drawEye = (x, flip) => {
      const t = s.eye;
      let e = "";
      if (t === "arc") e = `<path d="M${n(x - 1.15)} ${n(cy + 0.4)} Q${x} ${n(cy - 1.1)} ${n(x + 1.15)} ${n(cy + 0.4)}" fill="none" stroke="${iris}" stroke-width=".8" stroke-linecap="round"/>`;
      else if (t === "sleepy") e = `<ellipse cx="${x}" cy="${n(cy + 0.1)}" rx="1.05" ry="1.0" ${f(iris)}/><path d="M${n(x - 1.3)} ${n(cy - 0.3)} Q${x} ${n(cy - 1.2)} ${n(x + 1.3)} ${n(cy - 0.3)} L${n(x + 1.3)} ${n(cy - 0.45)} Q${x} ${n(cy - 1.5)} ${n(x - 1.3)} ${n(cy - 0.45)}Z" ${f(s.skinSh)}/>`;
      else {
        const ry = t === "narrow" ? 0.9 : t === "almond" ? 1.2 : t === "cat" ? 1.25 : 1.5, rx = t === "narrow" ? 1.15 : 1, rot = t === "cat" ? flip ? 12 : -12 : t === "almond" ? flip ? 6 : -6 : 0;
        e = `<ellipse cx="${x}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${cy})" ${f(iris)}/><circle cx="${n(x + 0.3)}" cy="${n(cy - 0.5)}" r=".42" ${f(K.eyeW)}/>`;
      }
      if (s.lash) e += `<path d="M${n(x + (flip ? -1 : 1) * 1)} ${n(cy - 0.6)} l${flip ? -0.9 : 0.9} -.7" stroke="${iris}" stroke-width=".55" stroke-linecap="round"/>`;
      return e;
    };
    const brow = (x, flip) => {
      const y = cy - 2.3, b = s.brow;
      const w = b === "thick" ? 0.95 : 0.6;
      const d = b === "flat" ? `M${n(x - 1.3)} ${n(y)} L${n(x + 1.3)} ${n(y)}` : b === "tilt" ? `M${n(x - 1.3)} ${n(y + (flip ? -0.5 : 0.5))} L${n(x + 1.3)} ${n(y + (flip ? 0.5 : -0.5))}` : b === "up" ? `M${n(x - 1.3)} ${n(y + 0.3)} Q${x} ${n(y - 1)} ${n(x + 1.3)} ${n(y - 0.2)}` : `M${n(x - 1.3)} ${n(y + 0.3)} Q${x} ${n(y - 0.6)} ${n(x + 1.3)} ${n(y + 0.3)}`;
      return `<path d="${d}" fill="none" stroke="${s.hairSh}" stroke-width="${w}" stroke-linecap="round"/>`;
    };
    const glass = (x) => s.glass === "shades" ? `<rect x="${n(x - 1.9)}" y="${n(cy - 1.4)}" width="3.8" height="2.6" rx=".8" ${f(K.black)} opacity=".85"/>` : s.glass === "rect" ? `<rect x="${n(x - 1.9)}" y="${n(cy - 1.6)}" width="3.8" height="3.0" rx=".6" fill="rgba(200,230,255,.25)" stroke="${K.glassC}" stroke-width=".5"/>` : `<circle cx="${x}" cy="${cy}" r="1.9" fill="rgba(200,230,255,.25)" stroke="${K.glassC}" stroke-width=".5"/>`;
    if (view === "F") {
      for (const [x, fl] of [[sx[0], false], [sx[1], true]]) {
        out.push(drawEye(x, fl), brow(x, fl));
        if (s.glass) out.push(glass(x));
      }
      if (s.glass) out.push(`<path d="M${n(sx[0] + 1.9)} ${cy} L${n(sx[1] - 1.9)} ${cy}" stroke="${K.glassC}" stroke-width=".4"/>`);
    } else {
      const x = sx[1];
      out.push(drawEye(x, true), brow(x, true));
      if (s.glass) out.push(glass(x), `<path d="M${n(x - 1.9)} ${cy} L${n(x - 5)} ${n(cy - 0.6)}" stroke="${K.glassC}" stroke-width=".4"/>`);
    }
    return out.join("");
  }
  function mouth(view, s, x, y) {
    const m = s.mouth;
    const c = K.mouthC;
    if (m === "open") return `<ellipse cx="${x}" cy="${n(y + 0.3)}" rx="1.0" ry=".9" ${f("#8a3a3a")}/>`;
    if (m === "teeth") return `<path d="M${n(x - 1.2)} ${y} Q${x} ${n(y + 1.5)} ${n(x + 1.2)} ${y}Z" ${f(K.white)} stroke="${c}" stroke-width=".4"/>`;
    if (m === "flat") return `<path d="M${n(x - 0.9)} ${n(y + 0.2)} L${n(x + 0.9)} ${n(y + 0.2)}" stroke="${c}" stroke-width=".65" stroke-linecap="round"/>`;
    if (m === "small") return `<path d="M${n(x - 0.6)} ${y} Q${x} ${n(y + 0.6)} ${n(x + 0.6)} ${y}" fill="none" stroke="${c}" stroke-width=".65" stroke-linecap="round"/>`;
    return `<path d="M${n(x - 1)} ${y} Q${x} ${n(y + 0.95)} ${n(x + 1)} ${y}" fill="none" stroke="${c}" stroke-width=".7" stroke-linecap="round"/>`;
  }
  function hairBack(view, cls, s, rx, ry) {
    const cx = 10, cy = 8.4, h = f(s.hair), hs = f(s.hairSh);
    if (view === "B") {
      if (cls === "long") return `<path d="M${n(cx - rx - 0.6)} ${cy} Q${n(cx - rx - 1.2)} 18 ${n(cx - rx + 1)} 19.6 L${n(cx + rx - 1)} 19.6 Q${n(cx + rx + 1.2)} 18 ${n(cx + rx + 0.6)} ${cy}Z" ${h}/>`;
      if (cls === "bob") return `<path d="M${n(cx - rx - 0.5)} ${cy} Q${n(cx - rx - 0.8)} 14.6 ${n(cx - rx + 1.4)} 14.8 L${n(cx + rx - 1.4)} 14.8 Q${n(cx + rx + 0.8)} 14.6 ${n(cx + rx + 0.5)} ${cy}Z" ${h}/>`;
      return "";
    }
    if (cls === "long") return `<path d="M${n(cx - rx - 0.4)} ${cy} Q${n(cx - rx - 1.6)} 16 ${n(cx - rx + 0.6)} 19.8 L${n(cx - 1)} 19.8 L${n(cx - 1)} ${cy}Z" ${h}/>`;
    if (cls === "bob") return `<path d="M${n(cx - rx - 0.4)} ${cy} Q${n(cx - rx - 1)} 13.6 ${n(cx - rx + 1.6)} 14.2 L${n(cx - 1)} 12 L${n(cx - 1)} ${cy}Z" ${h}/>`;
    if (cls === "ponytail") return `<path d="M${n(cx - rx + 0.6)} 5 Q${n(cx - rx - 3.6)} 7 ${n(cx - rx - 2.4)} 13.6 Q${n(cx - rx - 1.2)} 9.6 ${n(cx - rx + 1.2)} 8.4Z" ${h}/>`;
    if (cls === "bun") return "";
    return "";
  }
  function hairFront(view, cls, s, rx, ry) {
    const cx = 10, cy = 8.4, h = f(s.hair), hs = f(s.hairSh), L2 = n(cx - rx), Rr = n(cx + rx), top = n(cy - ry - 0.2);
    if (cls === "bald") return view === "B" ? `<path d="M${L2} ${cy} Q${n(L2 - 0.2)} 7 ${n(cx - rx + 1.2)} 7.8 L${n(cx - rx + 1.2)} 10.4 Q${n(L2 - 0.2)} 10.2 ${L2} ${cy}Z M${Rr} ${cy} Q${n(Rr + 0.2)} 7 ${n(cx + rx - 1.2)} 7.8 L${n(cx + rx - 1.2)} 10.4 Q${n(Rr + 0.2)} 10.2 ${Rr} ${cy}Z" ${h}/>` : `<path d="M${L2} ${n(cy + 0.4)} Q${n(L2 - 0.2)} 6.4 ${n(L2 + 1.2)} 6.8 L${n(L2 + 1.4)} 10.4Z" ${h}/>`;
    if (cls === "thin") return view === "B" ? `<path d="M${n(L2 + 1)} 6.4 Q${cx} 3.2 ${n(Rr - 1)} 6.4 Q${cx} 5 ${n(L2 + 1)} 6.4Z M${L2} ${cy} L${n(L2 + 1.2)} 7 L${n(L2 + 1.2)} 10.6Z M${Rr} ${cy} L${n(Rr - 1.2)} 7 L${n(Rr - 1.2)} 10.6Z" ${h}/>` : `<path d="M${n(L2 + 0.6)} 5.6 Q${cx} 1.6 ${n(Rr - 0.6)} 5.6 Q${cx} 3.4 ${n(L2 + 0.6)} 5.6Z M${L2} ${n(cy + 0.4)} L${n(L2 + 1.2)} 6.6 L${n(L2 + 1.4)} 10.6Z" ${h}/>`;
    if (view === "B") {
      const base = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${h}/>`;
      if (cls === "bun") return base + `<circle cx="${cx}" cy="${n(top - 0.6)}" r="2.8" ${h}/><path d="M${n(cx - 2)} ${n(top + 0.4)} Q${cx} ${n(top - 1.4)} ${n(cx + 2)} ${n(top + 0.4)}" fill="none" stroke="${s.hairSh}" stroke-width=".6"/>`;
      if (cls === "twin") return base + `<circle cx="${n(L2 - 1.4)}" cy="${n(cy + 2)}" r="2.4" ${h}/><circle cx="${n(Rr + 1.4)}" cy="${n(cy + 2)}" r="2.4" ${h}/>`;
      if (cls === "ponytail") return base + `<path d="M${n(cx - 1.2)} 8 Q${n(cx - 2.2)} 15 ${cx} 19 Q${n(cx + 2.2)} 15 ${n(cx + 1.2)} 8Z" ${h}/>`;
      if (cls === "spiky") return base + `<path d="M${n(L2 + 1)} 3.6 L${n(L2 + 2.2)} ${n(top - 1.6)} L${n(L2 + 3.6)} ${n(top + 0.2)} L${cx} ${n(top - 2)} L${n(Rr - 3.6)} ${n(top + 0.2)} L${n(Rr - 2.2)} ${n(top - 1.6)} L${n(Rr - 1)} 3.6Z" ${h}/>`;
      if (cls === "curly") return `<g ${h}>${[[-4.6, 3], [-2, 0.4], [1.6, 0], [4.4, 2.6], [-6, 6.4], [6, 6.4]].map(([dx, dy]) => `<circle cx="${n(cx + dx)}" cy="${n(top + dy + 1.6)}" r="3.1"/>`).join("")}<ellipse cx="${cx}" cy="${cy}" rx="${n(rx + 0.8)}" ry="${n(ry - 0.4)}"/></g>`;
      return base + `<path d="M${n(L2 + 1)} 5 Q${cx} 2.4 ${n(Rr - 1)} 5 Q${cx} 4.2 ${n(L2 + 1)} 5Z" ${hs}/><path d="M${n(cx - 3.8)} 8.6 Q${cx} 11 ${n(cx + 3.8)} 8.6" fill="none" stroke="${s.hairSh}" stroke-width=".7"/>`;
    }
    const sideF = view === "F";
    const cap2 = (fringeY, fringeShape) => `M${L2} ${n(cy + 0.4)} Q${n(L2 - 0.4)} ${top} ${cx} ${top} Q${n(Rr + 0.4)} ${top} ${Rr} ${n(cy + 0.4)} ${fringeShape || `Q${n(Rr - 1.4)} ${fringeY} ${cx} ${n(fringeY - 0.2)} Q${n(L2 + 1.4)} ${fringeY} ${L2} ${n(cy + 0.4)}`}Z`;
    if (sideF) {
      switch (cls) {
        case "baby":
          return `<path d="M${n(cx - 3)} ${n(top + 1.2)} Q${cx} ${n(top - 1.6)} ${n(cx + 3)} ${n(top + 1.2)} Q${cx} ${n(top + 0.4)} ${n(cx - 3)} ${n(top + 1.2)}Z" ${h}/>`;
        case "spiky":
          return `<path d="${cap2(5.6)}" ${h}/><path d="M${n(L2 + 1.2)} ${n(top + 1)} L${n(L2 + 2)} ${n(top - 1.8)} L${n(L2 + 3.6)} ${n(top + 0.4)} L${cx} ${n(top - 2.2)} L${n(Rr - 3.6)} ${n(top + 0.4)} L${n(Rr - 2)} ${n(top - 1.8)} L${n(Rr - 1.2)} ${n(top + 1)}Z" ${h}/>`;
        case "curly":
          return `<g ${h}>${[[-5.2, 6.4], [-5.6, 2.6], [-3, -0.2], [0, -0.8], [3, -0.2], [5.6, 2.6], [5.2, 6.4]].map(([dx, dy]) => `<circle cx="${n(cx + dx)}" cy="${n(top + dy + 1.4)}" r="2.7"/>`).join("")}</g>`;
        case "bowl":
          return `<path d="${cap2(5.2)}" ${h}/><path d="M${L2} ${n(cy + 0.4)} Q${n(L2 - 0.2)} 10 ${n(L2 + 0.8)} 11 L${n(L2 + 1.2)} 8Z M${Rr} ${n(cy + 0.4)} Q${n(Rr + 0.2)} 10 ${n(Rr - 0.8)} 11 L${n(Rr - 1.2)} 8Z" ${h}/>`;
        case "fringe":
          return `<path d="${cap2(6.2)}" ${h}/>`;
        case "swept":
          return `<path d="${cap2(5, `Q${n(Rr - 2)} 4.4 ${n(cx + 1)} 5.6 Q${n(cx - 3)} 7.6 ${n(L2 + 0.6)} 8.6 Q${n(L2 - 0.2)} 8.4 ${L2} ${n(cy + 0.4)}`)}" ${h}/>`;
        case "side":
          return `<path d="${cap2(5.4, `Q${n(Rr - 1.6)} 5 ${n(cx - 2.4)} 4.6 Q${n(cx - 4)} 6.4 ${n(L2 + 0.8)} 8 Q${n(L2 - 0.2)} 8.2 ${L2} ${n(cy + 0.4)}`)}" ${h}/><path d="M${n(cx - 2.4)} ${n(top + 0.6)} L${n(cx - 2.4)} 4.8" stroke="${s.hairSh}" stroke-width=".5"/>`;
        case "pixie":
          return `<path d="${cap2(5.8)}" ${h}/>`;
        case "bob":
          return `<path d="${cap2(5.8)}" ${h}/><path d="M${L2} ${n(cy + 0.4)} Q${n(L2 - 0.8)} 12 ${n(L2 + 1)} 14 L${n(L2 + 2)} 9 Z M${Rr} ${n(cy + 0.4)} Q${n(Rr + 0.8)} 12 ${n(Rr - 1)} 14 L${n(Rr - 2)} 9Z" ${h}/>`;
        case "long":
          return `<path d="${cap2(5.6)}" ${h}/><path d="M${L2} ${n(cy + 0.4)} Q${n(L2 - 1)} 14 ${n(L2 + 0.6)} 18.8 L${n(L2 + 2.4)} 18.4 L${n(L2 + 2.2)} 9Z M${Rr} ${n(cy + 0.4)} Q${n(Rr + 1)} 14 ${n(Rr - 0.6)} 18.8 L${n(Rr - 2.4)} 18.4 L${n(Rr - 2.2)} 9Z" ${h}/>`;
        case "twin":
          return `<path d="${cap2(5.8)}" ${h}/><path d="M${L2} 8 Q${n(L2 - 3.6)} 9 ${n(L2 - 2.8)} 15 Q${n(L2 - 0.6)} 12 ${n(L2 + 1)} 10Z M${Rr} 8 Q${n(Rr + 3.6)} 9 ${n(Rr + 2.8)} 15 Q${n(Rr + 0.6)} 12 ${n(Rr - 1)} 10Z" ${h}/>`;
        case "ponytail":
          return `<path d="${cap2(5.6)}" ${h}/>`;
        case "bun":
          return `<path d="${cap2(5.6)}" ${h}/><circle cx="${cx}" cy="${n(top - 0.8)}" r="2.6" ${h}/>`;
        default:
          return `<path d="${cap2(5.4)}" ${h}/><path d="M${L2} ${n(cy + 0.4)} Q${n(L2 - 0.2)} 11 ${n(L2 + 0.8)} 12.4 L${n(L2 + 1)} 8Z M${Rr} ${n(cy + 0.4)} Q${n(Rr + 0.2)} 11 ${n(Rr - 0.8)} 12.4 L${n(Rr - 1)} 8Z" ${h}/>`;
      }
    }
    const back = `M${n(L2 - 0.1)} ${n(cy + 0.4)} Q${n(L2 - 0.8)} ${top} ${n(cx - 0.4)} ${top} Q${n(Rr)} ${n(top + 0.2)} ${n(Rr - 0.3)} 5.4 Q${n(cx + 3)} 4 ${n(cx + 1)} 5.4 Q${n(cx - 0.2)} 6.4 ${n(cx - 0.6)} 9.2 Q${n(cx - 1.4)} 11.8 ${n(cx - 4)} 12.4 Q${n(L2 - 0.2)} 11.8 ${n(L2 - 0.1)} ${n(cy + 0.4)}Z`;
    switch (cls) {
      case "baby":
        return `<path d="M${n(cx - 2)} ${n(top + 1)} Q${n(cx + 1)} ${n(top - 1.6)} ${n(cx + 3.6)} ${n(top + 1.4)} Q${cx} ${n(top + 0.4)} ${n(cx - 2)} ${n(top + 1)}Z" ${h}/>`;
      case "spiky":
        return `<path d="${back}" ${h}/><path d="M${n(L2 + 1)} ${n(top + 1)} L${n(L2 + 1.8)} ${n(top - 1.8)} L${n(L2 + 3.4)} ${n(top + 0.4)} L${n(cx + 1)} ${n(top - 2.2)} L${n(Rr - 2.6)} ${n(top + 0.4)} L${n(Rr - 1.2)} ${n(top - 1.2)} L${n(Rr - 0.4)} 5.4Z" ${h}/>`;
      case "curly":
        return `<g ${h}>${[[-5.4, 6.6], [-5.6, 2.8], [-3, -0.2], [0, -0.8], [3, -0.2], [5, 2.6]].map(([dx, dy]) => `<circle cx="${n(cx - 0.4 + dx)}" cy="${n(top + dy + 1.4)}" r="2.8"/>`).join("")}</g>`;
      case "bob":
        return `<path d="${back}" ${h}/><path d="M${n(L2 - 0.1)} ${n(cy + 0.4)} Q${n(L2 - 1)} 13 ${n(L2 + 2)} 14.6 L${n(cx - 2)} 11 L${n(cx - 2)} 8Z" ${h}/>`;
      case "long":
        return `<path d="${back}" ${h}/><path d="M${n(L2 - 0.1)} ${n(cy + 0.4)} Q${n(L2 - 1.4)} 15 ${n(L2 + 0.8)} 19.6 L${n(cx - 1)} 19 L${n(cx - 1.4)} 9Z" ${h}/>`;
      case "twin":
        return `<path d="${back}" ${h}/><circle cx="${n(L2 - 0.6)}" cy="12.6" r="2.6" ${h}/>`;
      case "ponytail":
        return `<path d="${back}" ${h}/><path d="M${n(L2 + 0.8)} 4.4 Q${n(L2 - 3.8)} 6 ${n(L2 - 2.8)} 13.4 Q${n(L2 - 1)} 9.6 ${n(L2 + 1.4)} 8.6Z" ${h}/>`;
      case "bun":
        return `<path d="${back}" ${h}/><circle cx="${n(L2 + 1.8)}" cy="${n(top - 0.6)}" r="2.6" ${h}/>`;
      default:
        return `<path d="${back}" ${h}/>`;
    }
  }
  function headSVG(view, sIn, { helmet = false } = {}) {
    const s = { ...DEFAULT_SPEC, ...sIn };
    const cls = HAIR_CLASS[s.hairKey] || "short";
    const rx = s.faceRx, ry = s.faceRy, cx = view === "R" ? 9.6 : 10, cy = 8.4;
    let o = "";
    const back = hairBack(view, cls, s, rx, ry);
    o += back;
    if (view === "B") {
      o += `<ellipse cx="10" cy="${cy}" rx="${rx}" ry="${ry}" ${f(s.skin)}/>`;
      o += `<path d="M${n(10 - 2.2)} 11.8 L${n(10 + 2.2)} 11.8 L${n(10 + 1.6)} 14 L${n(10 - 1.6)} 14Z" ${f(s.skin)}/>`;
      o += `<circle cx="${n(10 - rx - 0.1)}" cy="9.8" r="1.3" ${f(s.skinSh)}/><circle cx="${n(10 + rx + 0.1)}" cy="9.8" r="1.3" ${f(s.skinSh)}/>`;
      o += hairFront("B", cls, s, rx, ry);
    } else if (view === "R") {
      o += `<ellipse cx="${cx}" cy="${cy}" rx="${n(rx - 0.3)}" ry="${ry}" ${f(s.skin)}/><ellipse cx="${n(cx + rx - 0.6)}" cy="10" rx="1.1" ry="1.1" ${f(s.skin)}/>`;
      o += `<circle cx="${n(cx - 1)}" cy="10.2" r="1.35" ${f(s.skinSh)}/>`;
      o += `<ellipse cx="${n(cx + 3.6)}" cy="11.5" rx="1.4" ry=".85" ${f(K.blush)}/>`;
      o += eyes("R", s, cx, 9, [0, n(cx + 3.8)]);
      o += mouth("R", s, n(cx + 5), 12.7);
      if (s.freckles) o += `<g ${f("#c98a5a")}><circle cx="${n(cx + 2.6)}" cy="11.2" r=".28"/><circle cx="${n(cx + 3.6)}" cy="12.1" r=".28"/><circle cx="${n(cx + 4.4)}" cy="11.2" r=".28"/></g>`;
      o += hairFront("R", cls, s, rx, ry);
      if (s.facial === "mustache") o += `<path d="M${n(cx + 3.6)} 12 Q${n(cx + 5.2)} 12.1 ${n(cx + 6.2)} 11.8" stroke="${s.hairSh}" stroke-width=".7" fill="none"/>`;
      if (s.facial === "beard") o += `<path d="M${n(cx + 1)} 11 Q${n(cx + 3)} 15.4 ${n(cx + 6)} 12.6 Q${n(cx + 4)} 12.2 ${n(cx + 2)} 10.6Z" ${f(s.hairSh)}/>`;
    } else {
      o += `<ellipse cx="10" cy="${cy}" rx="${rx}" ry="${ry}" ${f(s.skin)}/>`;
      o += `<ellipse cx="${n(10 - rx * 0.68)}" cy="11.5" rx="1.4" ry=".85" ${f(K.blush)}/><ellipse cx="${n(10 + rx * 0.68)}" cy="11.5" rx="1.4" ry=".85" ${f(K.blush)}/>`;
      o += eyes("F", s, 10, 9.4, [n(10 - rx * 0.46), n(10 + rx * 0.46)]);
      o += mouth("F", s, 10, 12.5);
      if (s.freckles) o += `<g ${f("#c98a5a")}>${[-1, 1].map((sg) => `<circle cx="${n(10 + sg * rx * 0.62)}" cy="10.8" r=".28"/><circle cx="${n(10 + sg * rx * 0.72)}" cy="11.6" r=".28"/><circle cx="${n(10 + sg * rx * 0.5)}" cy="11.6" r=".28"/>`).join("")}</g>`;
      if (s.mole) o += `<circle cx="${n(10 + rx * 0.5)}" cy="${s.mole > 1 ? 13 : 11.8}" r=".4" ${f(s.hairSh)}/>`;
      if (s.wrinkle) o += `<path d="M${n(10 - rx * 0.5)} 5.4 Q10 ${5.4 - 0.5 * s.wrinkle} ${n(10 + rx * 0.5)} 5.4" stroke="${s.skinSh}" stroke-width=".4" fill="none"/>`;
      if (s.facial === "mustache") o += `<path d="M8.4 11.7 Q10 11.2 11.6 11.7" stroke="${s.hairSh}" stroke-width=".8" fill="none" stroke-linecap="round"/>`;
      if (s.facial === "beard") o += `<path d="M${n(10 - rx * 0.85)} 10 Q${n(10 - rx * 0.6)} 15.4 10 15.6 Q${n(10 + rx * 0.6)} 15.4 ${n(10 + rx * 0.85)} 10 Q${n(10 + rx * 0.5)} 12 10 12 Q${n(10 - rx * 0.5)} 12 ${n(10 - rx * 0.85)} 10Z" ${f(s.hairSh)}/>`;
      o += hairFront("F", cls, s, rx, ry);
    }
    if (helmet) {
      const hx2 = view === "R" ? cx : 10;
      const top = cy - ry - 1.2;
      o += view === "B" ? `<path d="M${n(hx2 - rx - 0.9)} 9.4 Q${n(hx2 - rx - 1)} ${n(top)} ${hx2} ${n(top - 0.2)} Q${n(hx2 + rx + 1)} ${n(top)} ${n(hx2 + rx + 0.9)} 9.4 L${n(hx2 + rx - 0.4)} 11.6 Q${hx2} 13.4 ${n(hx2 - rx + 0.4)} 11.6Z" ${f(s.helmet)}/><path d="M${n(hx2 - rx)} 5.4 Q${hx2} ${n(top + 1.2)} ${n(hx2 + rx)} 5.4" fill="none" stroke="${s.helmetSh}" stroke-width=".9"/>` : `<path d="M${n(hx2 - rx - 0.9)} 9.8 Q${n(hx2 - rx - 1)} ${n(top)} ${hx2} ${n(top - 0.2)} Q${n(hx2 + rx + 0.9)} ${n(top)} ${n(hx2 + rx + 0.9)} 7.4 L${n(hx2 + rx - 0.6)} 7.2 Q${n(hx2 + rx * 0.3)} 6 ${n(hx2 - rx * 0.3)} 8.8 L${n(hx2 - rx * 0.5)} 11.6 Q${n(hx2 - rx - 0.9)} 11 ${n(hx2 - rx - 0.9)} 9.8Z" ${f(s.helmet)}/><path d="M${n(hx2 - rx)} 5 Q${n(hx2 - 1)} ${n(top + 1)} ${n(hx2 + 2)} ${n(top + 0.8)}" fill="none" stroke="${s.helmetSh}" stroke-width=".9"/><path d="M${n(hx2 + rx * 0.35)} 4.4 Q${n(hx2 + rx + 0.8)} 4.8 ${n(hx2 + rx + 0.8)} 7.4 L${n(hx2 + rx * 0.2)} 7.6Z" ${f(K.visor)}/>`;
    }
    return o;
  }
  function bustSVG(view, sIn, o = {}) {
    const s = { ...DEFAULT_SPEC, ...sIn };
    const dx = view === "R" ? 0.4 : 0;
    const sh2 = `<path d="M${2.5 + dx} 20 Q${2.5 + dx} 15.4 ${10 + dx} 15 Q${17.5 + dx} 15.4 ${17.5 + dx} 20Z" ${f(s.shirt)}/><path d="M${10 + dx} 15 Q${7 + dx} 15.4 ${6.2 + dx} 17.4 Q${10 + dx} 19.2 ${13.8 + dx} 17.4 Q${13 + dx} 15.4 ${10 + dx} 15Z" ${f(s.shirtSh)}/><rect x="${8.6 + dx}" y="13.2" width="2.8" height="2.4" ${f(s.skinSh)}/>`;
    const cls = HAIR_CLASS[s.hairKey] || "short";
    const longBehind = view !== "B" && (cls === "long" || cls === "bob" || cls === "twin") ? "" : "";
    const head = headSVG(view, s, { helmet: !!o.helmet });
    return `<g>${sh2}${head}</g>`;
  }
  function bikeSVG(opt, sIn) {
    const s = { ...DEFAULT_SPEC, ...sIn };
    const { view = "f", rider = true, helmet = true, frame: frame2 = 0, parked = false } = opt;
    const back = view === "b";
    const rw = back ? [11, 36] : [11, 34], fw = back ? [37, 31.6] : [37, 35.2];
    const wheel = ([cx, cy]) => {
      const a = frame2 ? 0.785 : 0;
      const sp = [0, 1, 2, 3].map((i) => {
        const t = a + i * Math.PI / 2;
        return `<line x1="${n(cx - Math.cos(t) * 3.9)}" y1="${n(cy - Math.sin(t) * 3.6)}" x2="${n(cx + Math.cos(t) * 3.9)}" y2="${n(cy + Math.sin(t) * 3.6)}" stroke="${K.chromeSh}" stroke-width=".7"/>`;
      }).join("");
      return `<ellipse cx="${cx}" cy="${cy}" rx="6.8" ry="6.3" ${f(K.tire)}/><ellipse cx="${cx}" cy="${cy}" rx="4.3" ry="4" ${f(K.chrome)}/><ellipse cx="${cx}" cy="${cy}" rx="3.4" ry="3.1" ${f(K.tire)}/>${sp}<circle cx="${cx}" cy="${cy}" r="1.1" ${f(K.chromeSh)}/>`;
    };
    const dy = back ? 2 : 0;
    let o = wheel(rw);
    o += `<path d="M3 ${29 + dy} Q5 22 14 22 L27 23 L30 30 Q22 33 14 31 Q6 32 3 ${29 + dy}Z" ${f(s.body)}/><path d="M4 ${29.4 + dy} Q6 31.4 14 30.8 Q22 32.4 29.6 29.8 L30 30 Q22 33 14 31 Q6 32 3 ${29 + dy}Z" ${f(s.bodySh)}/><rect x="14" y="30" width="16" height="1.8" rx=".8" ${f(K.seat)}/><ellipse cx="3.6" cy="${27 + (back ? 2.4 : 0)}" rx="${back ? 1.5 : 1}" ry="${back ? 2.1 : 1.6}" ${f(K.tail)}/><path d="M12 21.2 Q13 19.6 20 20 L27 21.4 L26.6 23.6 L12.4 23.6Z" ${f(K.seat)}/>`;
    if (parked && !rider) o += `<line x1="17" y1="31.4" x2="13.6" y2="37.4" stroke="${K.chromeSh}" stroke-width="1.1" stroke-linecap="round"/>`;
    o += wheel(fw) + `<path d="M29 31 L31 17 Q33 14 35 15 L36.2 20 L33.4 32Z" ${f(s.body)}/><path d="M33.4 32 L36.2 20 L35.4 19.6 L32.4 32Z" ${f(s.bodySh)}/><line x1="35.4" y1="19" x2="${fw[0]}" y2="${fw[1]}" stroke="${K.chromeSh}" stroke-width="1.7" stroke-linecap="round"/><path d="M${fw[0] - 6} ${fw[1] - 4} Q${fw[0]} ${fw[1] - 10} ${fw[0] + 6} ${fw[1] - 4} L${fw[0] + 5} ${n(fw[1] - 2.6)} Q${fw[0]} ${fw[1] - 7} ${fw[0] - 5} ${n(fw[1] - 2.6)}Z" ${f(s.body)}/><line x1="32" y1="14.6" x2="36.6" y2="12.8" stroke="${K.black}" stroke-width="1.4" stroke-linecap="round"/>`;
    if (!rider) o += `<line x1="33.6" y1="13.8" x2="32.6" y2="8.8" stroke="${K.chromeSh}" stroke-width=".7"/><ellipse cx="32.4" cy="8.4" rx="1.5" ry="1" ${f(K.chrome)}/>`;
    o += `<ellipse cx="38.2" cy="18.4" rx="2" ry="2.5" ${f(K.chrome)}/><ellipse cx="38.5" cy="18.4" rx="1.3" ry="1.8" ${f(K.lamp)}/>`;
    if (parked && !rider) o += `<ellipse cx="32.4" cy="6.2" rx="3.3" ry="2.7" ${f(s.helmet)}/><path d="M33.5 6 Q35.4 6.2 35.6 7.4 L33 7.8Z" ${f(K.visor)}/>`;
    if (rider) {
      const Kk = 1.18, inv = (x, y) => `${n(24 + (x - 24) / Kk)},${n(28 + (y - 28) / Kk)}`, iv = (x, y) => inv(x, y).split(",");
      o += `<g transform="translate(24 28) scale(${Kk}) translate(-24 -28)">`;
      o += `<polyline points="17,22.4 25,25.6 ${back ? 27.6 : 28},30.4" fill="none" stroke="${s.pants}" stroke-width="3.8" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="${back ? 28.4 : 28.8}" cy="31.4" rx="2.5" ry="1.3" ${f(K.shoe)}/>`;
      if (!back) {
        o += `<path d="M14.4 23.4 Q14.6 14 21 11.4 L26.4 13 Q26.8 19 24.4 23.6Z" ${f(s.shirt)}/><path d="M14.4 23.4 Q14.6 17 17.6 13.6 Q16.4 19 18 23.6Z" ${f(s.shirtSh)}/><polyline points="23.4,14 27.6,17.6 ${inv(32.6, 14.2)}" fill="none" stroke="${s.shirt}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${iv(33.3, 13.9)[0]}" cy="${iv(33.3, 13.9)[1]}" r="1.6" ${f(s.skin)}/>`;
        o += `<g transform="translate(25.8 6.8) scale(.95) translate(-9.6 -8.4)">${headSVG("R", s, { helmet })}</g>`;
      } else {
        o += `<path d="M13.4 24 Q13.8 14 20 12 L27.4 12.6 Q28.4 19 25.4 24Z" ${f(s.shirt)}/><path d="M20 12 L27.4 12.6 Q27.8 14 27.6 16 Q23.6 14.6 20 14.4Z" ${f(s.shirtSh)}/><polyline points="19.6,14.4 23.4,18.6 ${inv(33, 14.8)}" fill="none" stroke="${s.shirt}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><polyline points="26.6,15 30.6,14.6 ${inv(35.6, 13.4)}" fill="none" stroke="${s.shirt}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${iv(33, 14.8)[0]}" cy="${iv(33, 14.8)[1]}" r="1.5" ${f(s.skin)}/>`;
        o += `<g transform="translate(23.6 6.8) scale(.95) translate(-10 -8.4)">${headSVG("B", s, { helmet })}</g>`;
      }
      o += "</g>";
    }
    return `<g transform="translate(0 8)">${o}</g>`;
  }
  function bicycleSVG(opt, sIn) {
    const s = { ...DEFAULT_SPEC, ...sIn };
    const { view = "f", rider = true, helmet = false, frame: frame2 = 0, parked = false } = opt;
    const back = view === "b";
    const R0 = 8.2, rw = [10.5, 33], fw = [37.5, 33], bb = [22.4, 33.4], seat = [19.4, 18.6], head = [34, 19.6];
    const frameC = s.body || "#3a6ad8", FR = `stroke="${frameC}" stroke-width="1.5" stroke-linecap="round" fill="none"`;
    const wheel = ([cx, cy]) => {
      const a = frame2 ? 0.6 : 0;
      let w = `<circle cx="${cx}" cy="${cy}" r="${R0}" fill="none" stroke="${K.tire}" stroke-width="1.9"/><circle cx="${cx}" cy="${cy}" r="${R0 - 1.1}" fill="none" stroke="${K.chromeSh}" stroke-width=".5"/>`;
      for (let i = 0; i < 5; i++) {
        const t = a + i * Math.PI / 5;
        w += `<line x1="${n(cx - Math.cos(t) * (R0 - 1.2))}" y1="${n(cy - Math.sin(t) * (R0 - 1.2))}" x2="${n(cx + Math.cos(t) * (R0 - 1.2))}" y2="${n(cy + Math.sin(t) * (R0 - 1.2))}" stroke="${K.chrome}" stroke-width=".35"/>`;
      }
      return w + `<circle cx="${cx}" cy="${cy}" r="1" ${f(K.chromeSh)}/>`;
    };
    let o = `<ellipse cx="24" cy="${n(33 + R0)}" rx="19" ry="2" fill="rgba(0,0,0,.18)"/>` + wheel(rw);
    o += `<path d="M${bb[0]} ${bb[1]} L${rw[0]} ${rw[1]} M${seat[0]} ${seat[1] + 2} L${rw[0]} ${rw[1]} M${bb[0]} ${bb[1]} L${seat[0]} ${seat[1]} M${seat[0]} ${seat[1] + 1.6} L${head[0] - 0.6} ${head[1] + 0.6} M${bb[0]} ${bb[1]} L${head[0]} ${head[1] + 1.8} M${head[0]} ${head[1]} L${fw[0]} ${fw[1]}" ${FR}/>`;
    o += `<path d="M${rw[0] + 1.4} ${rw[1] - R0 + 1} Q22 ${rw[1] - R0 - 0.6} ${fw[0] - 1.4} ${fw[1] - R0 + 1}" fill="none" stroke="${frameC}" stroke-width=".7" opacity=".55"/>`;
    o += `<ellipse cx="${seat[0]}" cy="${seat[1] - 0.6}" rx="3" ry="1.1" ${f(K.seat)}/><line x1="${head[0]}" y1="${head[1] - 0.4}" x2="${head[0] - 0.6}" y2="${head[1] - 4}" stroke="${K.chromeSh}" stroke-width="1"/><path d="M${head[0] - 3} ${head[1] - 4.2} Q${head[0] - 0.6} ${head[1] - 5.6} ${head[0] + 2.8} ${head[1] - 4.2}" fill="none" stroke="${K.chromeSh}" stroke-width="1.1" stroke-linecap="round"/>`;
    o += `<rect x="${fw[0] - 7}" y="${fw[1] - 13.4}" width="3.2" height="2" rx=".6" ${f(K.lamp)}/>`;
    const ph = frame2 ? 1 : -1, pa = [bb[0] + 4.2 * ph, bb[1] + 1.6], pb = [bb[0] - 4.2 * ph, bb[1] - 1.6];
    o += `<circle cx="${bb[0]}" cy="${bb[1]}" r="2" fill="none" stroke="${K.chromeSh}" stroke-width=".8"/>`;
    if (parked && !rider) {
      o += `<line x1="${rw[0] + 3}" y1="${n(rw[1] + R0 - 0.6)}" x2="${rw[0] + 5}" y2="${n(rw[1] + R0 + 0.6)}" stroke="${K.chromeSh}" stroke-width="1"/>`;
      return `<g transform="translate(0 6)">${o}</g>`;
    }
    o += `<rect x="${pb[0] - 1.8}" y="${pb[1] - 0.5}" width="3.6" height="1.1" rx=".4" ${f(K.black)}/>`;
    if (rider) {
      const hip = [seat[0] - 0.4, seat[1] - 2.6], kn = (a) => [(hip[0] + a[0]) / 2 + 2.6, (hip[1] + a[1]) / 2 - 1.4];
      const leg = (a, c) => {
        const k = kn(a);
        return `<polyline points="${n(hip[0])},${n(hip[1])} ${n(k[0])},${n(k[1])} ${n(a[0])},${n(a[1] - 1)}" fill="none" stroke="${c}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="${n(a[0] + 0.8)}" cy="${n(a[1] + 0.2)}" rx="2.1" ry="1.2" ${f(K.shoe)}/>`;
      };
      o += leg(pb, s.pantsSh) + leg(pa, s.pants);
      const sh2 = back ? [hip[0] + 6.6, hip[1] - 11.2] : [hip[0] + 7.6, hip[1] - 11];
      const hand = [head[0] + 0.8, head[1] - 4.2];
      o += `<path d="M${hip[0] - 3.2} ${hip[1] + 1} Q${hip[0] - 3} ${hip[1] - 8} ${sh2[0] - 3} ${sh2[1]} L${sh2[0] + 3} ${sh2[1] + 0.6} Q${hip[0] + 4.6} ${hip[1] - 4} ${hip[0] + 3.4} ${hip[1] + 1}Z" ${f(s.shirt)}/><path d="M${hip[0] - 3.2} ${hip[1] + 1} Q${hip[0] - 3} ${hip[1] - 8} ${sh2[0] - 3} ${sh2[1]} L${sh2[0] - 1} ${sh2[1] + 0.4} Q${hip[0] - 1.6} ${hip[1] - 6} ${hip[0] - 0.6} ${hip[1] + 1}Z" ${f(s.shirtSh)}/>`;
      o += `<polyline points="${n(sh2[0] + 1.4)},${n(sh2[1] + 1.8)} ${n((sh2[0] + hand[0]) / 2 + 0.4)},${n((sh2[1] + hand[1]) / 2 + 1.6)} ${n(hand[0])},${n(hand[1])}" fill="none" stroke="${s.shirt}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${n(hand[0])}" cy="${n(hand[1])}" r="1.3" ${f(s.skin)}/>`;
      o += `<g transform="translate(${n(sh2[0] + 1.2)} ${n(sh2[1] - 5.6)}) scale(.95) translate(-9.6 -8.4)">${headSVG(back ? "B" : "R", s, { helmet })}</g>`;
    }
    o += wheel(fw);
    return `<g transform="translate(0 6)">${o}</g>`;
  }
  var helmetHandSVG = (s0) => {
    const s = { ...DEFAULT_SPEC, ...s0 };
    return `<ellipse cx="5" cy="5.4" rx="4.2" ry="3.6" ${f(s.helmet)}/><path d="M5.6 4.6 Q8.6 4.8 8.8 6.4 L5.4 7Z" ${f(K.visor)}/><path d="M2 4.2 Q4 1.6 6.4 2" fill="none" stroke="${s.helmetSh}" stroke-width=".7"/>`;
  };
  var wrapSVG = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;

