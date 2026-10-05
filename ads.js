const ADS = {
  adsterra: { mid: "", sheet: "" },
  adsense: { client: "", mid: "", sheet: "" },
  house: {
    title: "আপনার জেলার মিষ্টির দোকান বা ব্র্যান্ড এখানে",
    text: "হাজারো খাদ্যরসিক রোজ এই ম্যাপ দেখছে",
    cta: "হোয়াটসঅ্যাপে বিজ্ঞাপন দিন",
    href: "https://wa.me/8801731304074?text=" + encodeURIComponent("স্বাদের ম্যাপে বিজ্ঞাপন দিতে চাই")
  }
};

(() => {
  const SIZES = { mid: [320, 100], sheet: [300, 250] };
  const adsterra = (el, key, w, h) => {
    const f = document.createElement("iframe");
    f.width = w;
    f.height = h;
    f.loading = "lazy";
    f.title = "বিজ্ঞাপন";
    f.setAttribute("sandbox", "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin");
    f.srcdoc = `<!doctype html><html><body style="margin:0"><script>atOptions={key:"${key}",format:"iframe",height:${h},width:${w},params:{}};<\/script><script src="https://www.highperformanceformat.com/${key}/invoke.js"><\/script></body></html>`;
    el.appendChild(f);
  };
  const adsense = (el, client, slot, w, h) => {
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
  };
  const fill = () => {
    document.querySelectorAll(".ad[data-slot]").forEach(el => {
      if (el.dataset.done) return;
      const slot = el.dataset.slot;
      const [w, h] = SIZES[slot] || [300, 250];
      if (ADS.adsense.client && ADS.adsense[slot]) adsense(el, ADS.adsense.client, ADS.adsense[slot], w, h);
      else if (ADS.adsterra[slot]) adsterra(el, ADS.adsterra[slot], w, h);
      else if (ADS.house.href) house(el);
      else return;
      el.hidden = false;
      el.dataset.done = "1";
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fill);
  else fill();
})();
