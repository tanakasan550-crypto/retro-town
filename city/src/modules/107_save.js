  // src/save.js
  var DB_NAME = "nagayama_japan_lifestory_db";
  var DB_VER = 1;
  var STORE = "saves";
  var ARR = ["born", "gone", "goneAt", "spouse", "mother", "father", "home", "work", "job", "school", "edu", "apt", "needs", "look", "flags", "quals", "kids", "slot", "sur"];
  var b64 = (u8) => {
    if (typeof Buffer !== "undefined") return Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength).toString("base64");
    let s = "";
    for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
    return btoa(s);
  };
  var unb64 = (s) => {
    if (typeof Buffer !== "undefined") {
      const b = Buffer.from(s, "base64");
      return new Uint8Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
    }
    const bin = atob(s);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  };
  var CTOR = { born: Int32Array, gone: Uint8Array, goneAt: Int32Array, spouse: Int32Array, mother: Int32Array, father: Int32Array, home: Int16Array, work: Int16Array, job: Uint8Array, school: Int16Array, edu: Uint8Array, apt: Uint8Array, needs: Uint8Array, look: Uint32Array, flags: Uint8Array, quals: Uint16Array, kids: Uint8Array, slot: Int32Array, sur: Uint8Array };
  function toJSON(data) {
    const w = { ...data.world, arrays: {} };
    for (const k of ARR) {
      const a = data.world.arrays[k];
      w.arrays[k] = b64(new Uint8Array(a.buffer, a.byteOffset, a.byteLength));
    }
    return JSON.stringify({ format: "nagayama_japan_lifestory/save", version: 2, S: data.S, world: w });
  }
  function fromJSON(txt2) {
    const o = JSON.parse(txt2);
    if (o.format !== "nagayama_japan_lifestory/save") throw new Error("\u3053\u306E\u30B2\u30FC\u30E0\u306E\u30BB\u30FC\u30D6\u30C7\u30FC\u30BF\u3067\u306F\u3042\u308A\u307E\u305B\u3093");
    if (o.version !== 1 && o.version !== 2) throw new Error("\u30BB\u30FC\u30D6\u30C7\u30FC\u30BF\u306E\u7248\u304C\u9055\u3044\u307E\u3059(version " + o.version + ")");
    const w = { ...o.world, arrays: {} };
    for (const k of ARR) {
      if (!o.world.arrays[k]) continue;
      const u = unb64(o.world.arrays[k]);
      w.arrays[k] = new CTOR[k](u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength));
    }
    return { S: o.S, world: w };
  }
  function open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, DB_VER);
      r.onupgradeneeded = () => {
        r.result.createObjectStore(STORE, { keyPath: "id" });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  var MEM = /* @__PURE__ */ new Map();
  var MODE3 = null;
  var LSK = (id) => "nagayama_japan_lifestory_save_" + id;
  var withTimeout = (p, ms) => new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error("timeout")), ms);
    p.then((v) => {
      clearTimeout(t);
      res(v);
    }, (e) => {
      clearTimeout(t);
      rej(e);
    });
  });
  async function mode() {
    if (MODE3) return MODE3;
    try {
      const db = await withTimeout(open(), 2500);
      db.close();
      MODE3 = "idb";
    } catch (e) {
      try {
        localStorage.setItem("__nls_t", "1");
        localStorage.removeItem("__nls_t");
        MODE3 = "ls";
      } catch (e2) {
        MODE3 = "mem";
      }
    }
    return MODE3;
  }
  async function gz(str) {
    if (typeof CompressionStream === "undefined") return str;
    const cs = new Blob([str]).stream().pipeThrough(new CompressionStream("gzip"));
    const u = new Uint8Array(await new Response(cs).arrayBuffer());
    return "gz:" + b64(u);
  }
  async function ungz(t) {
    if (!t.startsWith("gz:")) return t;
    const ds = new Blob([unb64(t.slice(3))]).stream().pipeThrough(new DecompressionStream("gzip"));
    return await new Response(ds).text();
  }
  async function saveSlot(slot, game, meta = {}) {
    if (isTestState(game) && slot !== "devtest") throw new Error("\u8A66\u9A13\u30BB\u30C3\u30B7\u30E7\u30F3\u4E2D\u306F\u901A\u5E38\u306E\u30BB\u30FC\u30D6\u67A0\u3078\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093(\u958B\u767A\u5C02\u7528\u306E\u5225\u67A0\u306E\u307F)");
    const m = await mode();
    const data = game.serialize();
    const mm = { ...meta, ts: meta.ts || Date.now(), version: 1 };
    if (m === "idb") {
      const db = await open();
      await new Promise((res, rej) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put({ id: slot, meta: mm, data });
        tx.oncomplete = res;
        tx.onerror = () => rej(tx.error);
      });
      db.close();
      return;
    }
    MEM.set(slot, { id: slot, meta: mm, data });
    if (m === "ls") {
      try {
        localStorage.setItem(LSK(slot), JSON.stringify({ meta: mm, json: await gz(toJSON(data)) }));
      } catch (e) {
        throw new Error("\u3053\u306E\u958B\u304D\u65B9\u3067\u306F\u7AEF\u672B\u5185\u306B\u4FDD\u5B58\u3057\u304D\u308C\u307E\u305B\u3093(\u8A2D\u5B9A\u306E\u300C\u30BB\u30FC\u30D6\u3092\u66F8\u304D\u51FA\u3059\u300D\u3067\u30D5\u30A1\u30A4\u30EB\u306B\u4FDD\u5B58\u3057\u3066\u304F\u3060\u3055\u3044)");
      }
    } else throw new Error("\u3053\u306E\u958B\u304D\u65B9\u3067\u306F\u7AEF\u672B\u5185\u306B\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3002\u8A2D\u5B9A\u306E\u300C\u30BB\u30FC\u30D6\u3092\u66F8\u304D\u51FA\u3059\u300D\u3067\u30D5\u30A1\u30A4\u30EB\u306B\u4FDD\u5B58\u3057\u3066\u304F\u3060\u3055\u3044(\u3053\u306E\u30BF\u30D6\u3092\u958B\u3044\u3066\u3044\u308B\u9593\u306F\u7D9A\u304D\u304B\u3089\u904A\u3079\u307E\u3059)");
  }
  async function loadSlot(slot) {
    const m = await mode();
    if (m === "idb") {
      const db = await open();
      const r = await new Promise((res, rej) => {
        const q = db.transaction(STORE).objectStore(STORE).get(slot);
        q.onsuccess = () => res(q.result);
        q.onerror = () => rej(q.error);
      });
      db.close();
      return r || null;
    }
    if (m === "ls") {
      try {
        const t = localStorage.getItem(LSK(slot));
        if (t) {
          const o = JSON.parse(t);
          return { id: slot, meta: o.meta, data: fromJSON(await ungz(o.json)) };
        }
      } catch (e) {
      }
    }
    return MEM.get(slot) || null;
  }
  async function verifySlot(slot, ts) {
    try {
      const r = await loadSlot(slot);
      return !!(r && r.meta && r.meta.ts === ts && r.data);
    } catch (e) {
      return false;
    }
  }
  async function listSlots() {
    const m = await mode();
    if (m === "idb") {
      const db = await open();
      const r = await new Promise((res, rej) => {
        const q = db.transaction(STORE).objectStore(STORE).getAll();
        q.onsuccess = () => res(q.result);
        q.onerror = () => rej(q.error);
      });
      db.close();
      return r.map((x) => ({ id: x.id, meta: x.meta }));
    }
    const out = /* @__PURE__ */ new Map();
    if (m === "ls") {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(LSK(""))) {
            const o = JSON.parse(localStorage.getItem(k));
            out.set(k.slice(LSK("").length), { id: k.slice(LSK("").length), meta: o.meta });
          }
        }
      } catch (e) {
      }
    }
    for (const [id, v] of MEM) if (!out.has(id)) out.set(id, { id, meta: v.meta });
    return [...out.values()];
  }

