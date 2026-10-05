const ADS = {
  adsterra: { mid: "848ce651b8098d29f37b476856567acd", sheet: "29636748a37573a209d9713a0131f039" },
  adsense: { client: "", mid: "", sheet: "" },
  house: {
    title: "আপনার জেলার মিষ্টির দোকান বা ব্র্যান্ড এখানে",
    text: "হাজারো খাদ্যরসিক রোজ এই ম্যাপ দেখছে",
    cta: "হোয়াটসঅ্যাপে বিজ্ঞাপন দিন",
    href: "https://wa.me/8801731304074?text=" + encodeURIComponent("স্বাদের ম্যাপে বিজ্ঞাপন দিতে চাই")
  }
};

(() => {
  const SIZES = { mid: [320, 50], sheet: [300, 250] };
  const adsterra = (el, key, w, h) => {
    if (!/^[a-f0-9]{32}$/.test(key)) return false;
    const f = document.createElement("iframe");
    f.width = w;
    f.height = h;
    f.loading = "lazy";
    f.title = "বিজ্ঞাপন";
    f.referrerPolicy = "origin";
    f.setAttribute("sandbox", "allow-scripts allow-popups allow-popups-to-escape-sandbox");
    f.src = "tile.html#" + new URLSearchParams({ k: key, w, h });
    el.appendChild(f);
    return true;
  };
  const adsense = (el, client, slot, w, h) => {
    if (!/^ca-pub-\d{10,20}$/.test(client) || !/^\d{5,20}$/.test(slot)) return false;
    if (!document.querySelector("script[data-ads]")) {
      const s = document.createElement("script");
      s.async = true;
      s.dataset.ads = "1";
      s.crossOrigin = "anonymous";
      s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + client;
      document.head.appendChild(s);
    }
    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.cssText = `display:inline-block;width:${w}px;height:${h}px`;
    ins.dataset.adClient = client;
    ins.dataset.adSlot = slot;
    el.appendChild(ins);
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    return true;
  };
  const house = el => {
    const a = document.createElement("a");
    a.className = "house";
    a.href = ADS.house.href;
    a.target = "_blank";
    a.rel = "noopener";
    const b = document.createElement("b");
    b.textContent = ADS.house.title;
    const s = document.createElement("span");
    s.textContent = ADS.house.text;
    const i = document.createElement("i");
    i.textContent = ADS.house.cta + " →";
    a.append(b, s, i);
    el.appendChild(a);
    return true;
  };
  const fill = () => {
    document.querySelectorAll(".ad[data-slot]").forEach(el => {
      if (el.dataset.done) return;
      const slot = el.dataset.slot;
      const [w, h] = SIZES[slot] || [300, 250];
      const ok = (ADS.adsense.client && ADS.adsense[slot] && adsense(el, ADS.adsense.client, ADS.adsense[slot], w, h))
        || (ADS.adsterra[slot] && adsterra(el, ADS.adsterra[slot], w, h))
        || (ADS.house.href && house(el));
      if (!ok) return;
      el.hidden = false;
      el.dataset.done = "1";
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fill);
  else fill();
})();
