(() => {
  const SIZES = ["320x50", "300x250"];
  const p = new URLSearchParams(location.hash.slice(1));
  const key = p.get("k") || "";
  const w = Number(p.get("w")), h = Number(p.get("h"));
  if (location.hostname !== "ad.swad.147.93.168.43.sslip.io" || window.top === window || !/^[a-f0-9]{32}$/.test(key) || !SIZES.includes(w + "x" + h)) return;

  window.atOptions = { key, format: "iframe", height: h, width: w, params: {} };
  const s = document.createElement("script");
  s.src = "https://bauval.org/22/" + key;
  document.body.appendChild(s);
})();
