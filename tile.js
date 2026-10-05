(() => {
  const SIZES = ["320x50", "300x250"];
  const p = new URLSearchParams(location.hash.slice(1));
  const key = p.get("k") || "";
  const w = Number(p.get("w")), h = Number(p.get("h"));
  if (self.origin !== "null" || !/^[a-f0-9]{32}$/.test(key) || !SIZES.includes(w + "x" + h)) return;

  const memory = () => {
    const m = new Map();
    return {
      getItem: k => m.has(String(k)) ? m.get(String(k)) : null,
      setItem: (k, v) => { m.set(String(k), String(v)); },
      removeItem: k => { m.delete(String(k)); },
      clear: () => { m.clear(); },
      key: i => [...m.keys()][i] ?? null,
      get length() { return m.size; }
    };
  };
  ["localStorage", "sessionStorage"].forEach(n => {
    try { void window[n].length; }
    catch { Object.defineProperty(window, n, { value: memory(), configurable: true }); }
  });

  try { void document.cookie; }
  catch {
    const jar = new Map();
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => [...jar].map(([k, v]) => k + "=" + v).join("; "),
      set: raw => {
        const [pair, ...attrs] = String(raw).split(";");
        const i = pair.indexOf("=");
        const k = (i < 0 ? "" : pair.slice(0, i)).trim();
        const v = (i < 0 ? pair : pair.slice(i + 1)).trim();
        const dead = attrs.some(a => {
          const [n, ...rest] = a.split("=");
          const val = rest.join("=").trim();
          const name = n.trim().toLowerCase();
          if (name === "max-age") return Number(val) <= 0;
          if (name === "expires") return Date.parse(val) <= Date.now();
          return false;
        });
        if (dead) jar.delete(k); else jar.set(k, v);
      }
    });
  }

  window.atOptions = { key, format: "iframe", height: h, width: w, params: {} };
  const s = document.createElement("script");
  s.src = "https://bauval.org/22/" + key;
  document.body.appendChild(s);
})();
