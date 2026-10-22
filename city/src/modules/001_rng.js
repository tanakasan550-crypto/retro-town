  // src/rng.js
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function hash2(a, b) {
    let h = (a ^ 2654435769) >>> 0;
    h = Math.imul(h ^ b + 2135587861, 2246822507);
    h ^= h >>> 13;
    h = Math.imul(h, 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  }
  var Rng = class {
    constructor(seed, stream = "") {
      this.a = hashStr(String(seed) + "|" + stream) >>> 0;
    }
    next() {
      this.a = this.a + 1831565813 | 0;
      let t = Math.imul(this.a ^ this.a >>> 15, 1 | this.a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    int(n2) {
      return Math.floor(this.next() * n2);
    }
    range(a, b) {
      return a + this.int(b - a + 1);
    }
    pick(arr) {
      return arr[this.int(arr.length)];
    }
    chance(p) {
      return this.next() < p;
    }
    weighted(entries) {
      let tot = 0;
      for (const e of entries) tot += e[1];
      let r = this.next() * tot;
      for (const e of entries) {
        r -= e[1];
        if (r < 0) return e[0];
      }
      return entries[entries.length - 1][0];
    }
    gauss() {
      let u = 0, v = 0;
      while (u === 0) u = this.next();
      v = this.next();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = this.int(i + 1);
        const t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }
  };
  var monthRng = (seed, monthIdx2, tag) => new Rng(seed, tag + ":" + monthIdx2);

