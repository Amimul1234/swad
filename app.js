(() => {
  const SITE = location.hostname === "amimul1234.github.io" ? "amimul1234.github.io/swad" : "swad.147.93.168.43.sslip.io";
  const STORE = "swad:v1";
  const DIVS = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"];
  const KEYS = Object.keys(MAP.d).sort();
  const BY = Object.fromEntries(FOODS.map(d => [d.key, d]));
  const $ = id => document.getElementById(id);

  const bn = n => String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
  const clean = v => typeof v === "string" ? [...v.replace(/[\p{Cc}\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069\u2028\u2029\uFEFF]/gu, "").replace(/\s+/g, " ").trim()].slice(0, 28).join("") : "";

  const THEMES = {
    ember:  { label: "মশলা",    bg: "#fff6ef", ink: "#4a1607", soft: "#8a4a36", on: "#c2410c", off: "#ffffff", line: "#f0cdb8", accent: "#f5a000", foot: "#4a1607", footInk: "#fff6ef", swatch: ["#c2410c", "#fff6ef"] },
    dusk:   { label: "সন্ধ্যা",  bg: "#f6f5ff", ink: "#221d6e", soft: "#5a5690", on: "#4038c2", off: "#ffffff", line: "#c9c6ee", accent: "#ff6a3d", foot: "#221d6e", footInk: "#f6f5ff", swatch: ["#4038c2", "#f6f5ff"] },
    leaf:   { label: "সবুজ",    bg: "#eef7f1", ink: "#0f3b26", soft: "#4a6f5c", on: "#13804f", off: "#ffffff", line: "#bfdccb", accent: "#e8b21c", foot: "#0f3b26", footInk: "#eef7f1", swatch: ["#13804f", "#eef7f1"] },
    night:  { label: "রাত",     bg: "#14172b", ink: "#f2f3fb", soft: "#a3a8c6", on: "#ff6a3d", off: "#262a46", line: "#3b4066", accent: "#7c74ff", foot: "#0b0d1a", footInk: "#f2f3fb", swatch: ["#14172b", "#ff6a3d"] },
    rose:   { label: "গোলাপি",  bg: "#fff1f6", ink: "#5a0f33", soft: "#8f4a6b", on: "#d6246e", off: "#ffffff", line: "#f2c3d6", accent: "#2f2a8f", foot: "#5a0f33", footInk: "#fff1f6", swatch: ["#d6246e", "#fff1f6"] }
  };

  const RANKS = [
    [0, "এখনো খাতা খালি"],
    [1, "ঘরের ভাতেই খুশি"],
    [6, "পাড়ার ভোজনরসিক"],
    [16, "জেলায় জেলায় পেটুক"],
    [31, "পাক্কা দেশি খাদক"],
    [46, "স্বাদের জমিদার"],
    [64, "চৌষট্টি জেলার মহারাজ"]
  ];
  const rankOf = n => RANKS.filter(r => n >= r[0]).pop()[1];

  const load = () => {
    try {
      const v = JSON.parse(localStorage.getItem(STORE) || "{}") || {};
      const got = Array.isArray(v.eaten) ? v.eaten.filter(k => typeof k === "string" && Object.prototype.hasOwnProperty.call(BY, k)) : [];
      return { friends: new Set(got), name: clean(v.name), theme: Object.prototype.hasOwnProperty.call(THEMES, v.theme) ? v.theme : "ember" };
    } catch { return { friends: new Set(), name: "", theme: "ember" }; }
  };
  const state = load();
  const save = () => {
    try { localStorage.setItem(STORE, JSON.stringify({ eaten: [...state.friends], name: state.name, theme: state.theme })); } catch {}
  };

  const encode = set => {
    let n = 0n;
    KEYS.forEach((k, i) => { if (set.has(k)) n |= 1n << BigInt(i); });
    return n.toString(36);
  };
  const decode = s => {
    const out = new Set();
    if (typeof s !== "string" || !/^[0-9a-z]{1,13}$/i.test(s)) return out;
    try {
      const n = [...s].reduce((a, c) => a * 36n + BigInt(parseInt(c, 36)), 0n);
      KEYS.forEach((k, i) => { if ((n >> BigInt(i)) & 1n) out.add(k); });
    } catch {}
    return out;
  };

  const NS = "http://www.w3.org/2000/svg";
  const vb = `-4 -4 ${MAP.w + 8} ${MAP.h + 8}`;
  const heroMap = $("heroMap");
  heroMap.setAttribute("viewBox", vb);
  const heroPaths = {};
  const svg = $("map");
  svg.setAttribute("viewBox", vb);
  const paths = {};
  KEYS.forEach(k => {
    const h = document.createElementNS(NS, "path");
    h.setAttribute("d", MAP.d[k]);
    heroMap.appendChild(h);
    heroPaths[k] = h;
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", MAP.d[k]);
    p.setAttribute("tabindex", "0");
    p.setAttribute("role", "checkbox");
    p.setAttribute("aria-label", BY[k] ? `${BY[k].bn} — ${BY[k].food}` : k);
    p.dataset.k = k;
    svg.appendChild(p);
    paths[k] = p;
  });

  let peekTimer;
  const peek = k => {
    const el = $("peek");
    const t = document.createElement("span");
    t.textContent = BY[k].bn + " — ";
    const b = document.createElement("b");
    b.textContent = BY[k].food + (state.friends.has(k) ? " ✓" : "");
    el.replaceChildren(t, b);
    el.hidden = false;
    clearTimeout(peekTimer);
    peekTimer = setTimeout(() => { el.hidden = true; }, 1500);
  };

  const pop = k => {
    const p = paths[k];
    p.classList.remove("pop");
    void p.getBBox();
    p.classList.add("pop");
  };

  let blob = null;

  const toggle = (k, from) => {
    if (!BY[k]) return;
    state.friends.has(k) ? state.friends.delete(k) : state.friends.add(k);
    save();
    paint();
    pop(k);
    if (from === "map") peek(k);
    if (navigator.vibrate && state.friends.has(k)) navigator.vibrate(8);
  };

  svg.addEventListener("click", e => {
    const k = e.target.dataset && e.target.dataset.k;
    if (k) toggle(k, "map");
  });
  svg.addEventListener("keydown", e => {
    const k = e.target.dataset && e.target.dataset.k;
    if (k && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggle(k, "map"); }
  });

  const tick = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
  const list = $("list");
  const chips = {};
  const blocks = DIVS.map(div => {
    const items = FOODS.filter(d => d.division === div).sort((a, b) => a.bn.localeCompare(b.bn, "bn"));
    const wrap = document.createElement("div");
    wrap.className = "div-block";
    const head = document.createElement("div");
    head.className = "div-head";
    const h = document.createElement("h3");
    h.textContent = div + " বিভাগ";
    const c = document.createElement("span");
    h.appendChild(c);
    const all = document.createElement("button");
    all.type = "button";
    all.className = "text-btn";
    all.textContent = "সব বাছাই";
    all.addEventListener("click", () => {
      const every = items.every(d => state.friends.has(d.key));
      items.forEach(d => { every ? state.friends.delete(d.key) : state.friends.add(d.key); });
      save();
      paint();
      items.forEach(d => pop(d.key));
    });
    head.append(h, all);
    const grid = document.createElement("div");
    grid.className = "chips";
    wrap.append(head, grid);
    items.forEach(d => {
      const r = document.createElement("button");
      r.type = "button";
      r.className = "chip";
      r.setAttribute("role", "checkbox");
      r.innerHTML = tick + '<span class="food-name"></span><small></small>';
      r.querySelector(".food-name").textContent = d.food;
      r.querySelector("small").textContent = d.bn;
      r.addEventListener("click", () => toggle(d.key, "list"));
      r.dataset.q = [d.bn, d.food, d.alt, d.key].join(" ").toLowerCase();
      chips[d.key] = r;
      grid.appendChild(r);
    });
    list.appendChild(wrap);
    return { wrap, count: c, items, all };
  });
  const empty = document.createElement("p");
  empty.className = "empty";
  empty.textContent = "কিছু পাওয়া গেল না";
  empty.hidden = true;
  list.appendChild(empty);

  $("q").addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    let any = false;
    blocks.forEach(b => {
      let shown = 0;
      b.items.forEach(d => {
        const hit = !q || chips[d.key].dataset.q.includes(q);
        chips[d.key].hidden = !hit;
        if (hit) shown++;
      });
      b.wrap.hidden = !shown;
      any = any || shown > 0;
    });
    empty.hidden = any;
    KEYS.forEach(k => paths[k].classList.toggle("hit", !!q && !chips[k].hidden));
  });

  $("clear").addEventListener("click", () => {
    if (!state.friends.size) return;
    if (!confirm(`${bn(state.friends.size)}টা খাবারের টিক মুছে যাবে, আর ফেরত আসবে না। মুছবেন?`)) return;
    state.friends.clear();
    save();
    paint();
  });

  const swatches = $("swatches");
  const sw = {};
  const applyTheme = () => {
    const t = THEMES[state.theme];
    const pv = $("preview").style;
    pv.setProperty("--pv-bg", t.bg);
    pv.setProperty("--pv-ink", t.ink);
    pv.setProperty("--pv-soft", t.soft);
    pv.setProperty("--pv-on", t.on);
    pv.setProperty("--pv-off", t.off);
    pv.setProperty("--pv-line", t.line);
    pv.setProperty("--pv-accent", t.accent);
    pv.setProperty("--pv-foot", t.foot);
    pv.setProperty("--pv-foot-ink", t.footInk);
    Object.entries(sw).forEach(([id, b]) => b.setAttribute("aria-checked", id === state.theme));
    blob = null;
  };
  Object.entries(THEMES).forEach(([id, t]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "swatch";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-label", t.label + " থিম");
    const i = document.createElement("i");
    i.style.background = `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)`;
    i.style.boxShadow = "inset 0 0 0 1px rgba(0,0,0,.12)";
    b.appendChild(i);
    b.addEventListener("click", () => { state.theme = id; save(); applyTheme(); });
    sw[id] = b;
    swatches.appendChild(b);
  });

  const missing = () => KEYS.filter(k => !state.friends.has(k)).map(k => BY[k].bn).sort((a, b) => a.localeCompare(b, "bn"));
  const listShort = (arr, n) => arr.slice(0, n).join(", ") + (arr.length > n ? ` আর ${bn(arr.length - n)}টা` : "");

  let friend = null;
  const params = new URLSearchParams(location.hash.slice(1) || location.search);
  if (location.search) history.replaceState(null, "", location.pathname + (params.has("m") ? "#" + params : ""));
  if (params.has("m")) friend = { who: clean(params.get("n")) || "আপনার বন্ধু", set: decode(params.get("m")) };

  const renderFriend = () => {
    if (!friend) return;
    const el = $("friend");
    const mine = state.friends.size, theirs = friend.set.size;
    const b = document.createElement("b");
    b.textContent = friend.who;
    let line;
    if (!mine) line = ` ৬৪ জেলার ${bn(theirs)}টার বিখ্যাত খাবার খেয়েছে। আপনি কয়টা? নিচে বাছাই করে দেখুন।`;
    else if (mine > theirs) line = ` ${bn(theirs)}টা, আপনি ${bn(mine)}টা — আপনি ${bn(mine - theirs)}টা এগিয়ে!`;
    else if (mine < theirs) line = ` ${bn(theirs)}টা, আপনি ${bn(mine)}টা — আর ${bn(theirs - mine)}টা হলেই সমান।`;
    else line = ` আর আপনি সমান সমান — দুজনেই ${bn(mine)}টা।`;
    el.replaceChildren(b, document.createTextNode(line));
    const both = [...friend.set].filter(k => state.friends.has(k)).length;
    if (mine && both) {
      const s = document.createElement("small");
      s.textContent = `দুজনেই খেয়েছেন ${bn(both)}টা`;
      el.appendChild(s);
    }
    el.hidden = false;
  };

  const paint = () => {
    const n = state.friends.size;
    $("count").textContent = bn(n);
    $("pvCount").textContent = bn(n);
    $("dockCount").textContent = bn(n);
    $("rank").textContent = rankOf(n);
    $("pvRank").textContent = rankOf(n);
    $("pvName").textContent = state.name || "আমি";
    $("dock").hidden = n === 0;
    ["share", "save", "copy"].forEach(id => { $(id).disabled = n === 0; });
    KEYS.forEach(k => {
      const on = state.friends.has(k);
      paths[k].classList.toggle("on", on);
      paths[k].setAttribute("aria-checked", on);
      heroPaths[k].classList.toggle("on", on);
      chips[k].classList.toggle("on", on);
      chips[k].setAttribute("aria-checked", on);
    });
    blocks.forEach(b => {
      const got = b.items.filter(d => state.friends.has(d.key)).length;
      b.count.textContent = bn(got) + "/" + bn(b.items.length);
      b.all.textContent = got === b.items.length ? "সব মুছুন" : "সব বাছাই";
    });
    renderFriend();
    blob = null;
  };

  const toast = msg => {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 2400);
  };

  const shareUrl = () => {
    const u = new URL("https://" + SITE + "/");
    const h = new URLSearchParams({ m: encode(state.friends) });
    if (state.name) h.set("n", state.name);
    u.hash = h.toString();
    return u.toString();
  };

  let photo = null;
  const fontsReady = (async () => {
    const t = "স্বাদের ম্যাপ ০১২৩৪৫৬৭৮৯ জেলা খাবার আমি";
    try {
      await Promise.all([
        document.fonts.load('800 40px "Anek Bangla"', t),
        document.fonts.load('500 40px "Hind Siliguri"', t),
        document.fonts.load('600 40px "Hind Siliguri"', t),
        document.fonts.load('700 40px "Hind Siliguri"', t)
      ]);
    } catch {}
  })();

  const shapes = {};
  KEYS.forEach(k => { shapes[k] = new Path2D(MAP.d[k]); });

  const fit = (g, text, max, size, weight, fam) => {
    let s = size;
    do { g.font = `${weight} ${s}px ${fam}`; s -= 2; } while (g.measureText(text).width > max && s > 18);
  };
  const wrapText = (g, text, x, y, max, lh, maxLines) => {
    const words = text.split(" ");
    let line = "", lines = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + " " + words[i] : words[i];
      if (g.measureText(test).width > max && line) {
        g.fillText(line, x, y);
        y += lh;
        lines++;
        if (lines >= maxLines) return y;
        line = words[i];
      } else line = test;
    }
    if (line) { g.fillText(line, x, y); y += lh; }
    return y;
  };

  const draw = async () => {
    await fontsReady;
    const t = THEMES[state.theme];
    const W = 1080, H = 1350;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const D = '"Anek Bangla", sans-serif';
    const B = '"Hind Siliguri", sans-serif';
    const n = state.friends.size;
    g.textBaseline = "alphabetic";

    g.fillStyle = t.bg;
    g.fillRect(0, 0, W, H);

    g.fillStyle = t.soft;
    g.font = `600 30px ${B}`;
    g.fillText("৬৪ জেলার বিখ্যাত খাবার — কয়টা খেয়েছি", 72, 110);
    g.fillStyle = t.ink;
    g.font = `800 112px ${D}`;
    g.fillText("স্বাদের ম্যাপ", 66, 222);

    const mh = 900, s = mh / MAP.h, mx = 40, my = 290;
    g.save();
    g.translate(mx, my);
    g.scale(s, s);
    g.lineJoin = "round";
    KEYS.forEach(k => {
      const on = state.friends.has(k);
      g.fillStyle = on ? t.on : t.off;
      g.fill(shapes[k]);
      g.strokeStyle = on ? t.on : t.line;
      g.lineWidth = 1.2;
      g.stroke(shapes[k]);
    });
    g.restore();

    const cx = 676, cw = W - 64 - cx;
    let y = 330;
    if (photo) {
      const r = 70;
      g.save();
      g.beginPath(); g.arc(cx + r, y + r, r, 0, Math.PI * 2); g.clip();
      const sc = Math.max(2 * r / photo.width, 2 * r / photo.height);
      g.drawImage(photo, cx + r - photo.width * sc / 2, y + r - photo.height * sc / 2, photo.width * sc, photo.height * sc);
      g.restore();
      g.strokeStyle = t.on; g.lineWidth = 6;
      g.beginPath(); g.arc(cx + r, y + r, r + 3, 0, Math.PI * 2); g.stroke();
      y += 2 * r + 40;
    }
    g.fillStyle = t.ink;
    fit(g, state.name || "আমি", cw, 50, 700, B);
    g.fillText(state.name || "আমি", cx, y + 36);
    y += 60;
    g.fillStyle = t.on;
    g.font = `800 168px ${D}`;
    const big = bn(n);
    g.fillText(big, cx - 6, y + 146);
    const bw = g.measureText(big).width;
    g.fillStyle = t.soft;
    g.font = `600 38px ${B}`;
    g.fillText("/৬৪", cx + bw + 8, y + 140);
    y += 182;

    const rk = rankOf(n);
    g.font = `700 32px ${B}`;
    const rw = Math.min(cw, g.measureText(rk).width + 44);
    g.fillStyle = t.accent;
    g.beginPath(); g.roundRect(cx, y, rw, 58, 29); g.fill();
    g.fillStyle = "#ffffff";
    fit(g, rk, rw - 40, 32, 700, B);
    g.fillText(rk, cx + 22, y + 40);
    y += 112;

    const picked = FOODS.filter(f => state.friends.has(f.key));
    const room = Math.max(0, Math.floor((1180 - y) / 44));
    const show = picked.length > room ? picked.slice(0, Math.max(0, room - 1)) : picked;
    show.forEach(f => {
      g.font = `500 24px ${B}`;
      const dw = g.measureText(f.bn).width;
      g.fillStyle = t.soft;
      g.textAlign = "right";
      g.fillText(f.bn, W - 64, y);
      g.textAlign = "left";
      g.fillStyle = t.ink;
      fit(g, f.food, cw - dw - 14, 30, 600, B);
      g.fillText(f.food, cx, y);
      y += 44;
    });
    if (picked.length > show.length) {
      g.fillStyle = t.on;
      g.font = `700 28px ${B}`;
      g.fillText(`+ আরও ${bn(picked.length - show.length)}টা`, cx, y);
    }

    g.fillStyle = t.foot;
    g.fillRect(0, H - 118, W, 118);
    g.fillStyle = t.footInk;
    g.font = `700 36px ${B}`;
    g.fillText("আপনি কয়টা খেয়েছেন?", 64, H - 46);
    g.textAlign = "right";
    g.globalAlpha = .82;
    g.font = `600 28px ${B}`;
    g.fillText(SITE, W - 64, H - 47);
    g.globalAlpha = 1;
    g.textAlign = "left";
    return cv;
  };

  const render = async () => {
    const cv = await draw();
    blob = await new Promise(r => cv.toBlob(r, "image/png"));
    return cv;
  };

  $("name").value = state.name;
  $("name").addEventListener("input", e => {
    state.name = clean(e.target.value);
    save();
    $("pvName").textContent = state.name || "আমি";
    blob = null;
  });

  let photoUrl = null;
  $("photo").addEventListener("change", e => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file || !/^image\//.test(file.type) || file.size > 25e6) {
      if (file) toast("এই ফাইলটা ছবি হিসেবে খোলা গেল না");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      photoUrl = url;
      photo = img;
      $("face").style.backgroundImage = `url("${url}")`;
      $("face").classList.add("has");
      $("photoLabel").textContent = "ছবি বদলান";
      const pf = $("pvFace");
      pf.style.backgroundImage = `url("${url}")`;
      pf.hidden = false;
      blob = null;
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast("এই ফাইলটা ছবি হিসেবে খোলা গেল না");
    };
    img.src = url;
  });

  const fileName = () => "swad-map-" + state.friends.size + ".png";
  const caption = () => {
    const n = state.friends.size;
    const beat = friend && n > friend.set.size ? ` ${friend.who}-কে ${bn(n - friend.set.size)}টায় হারালাম।` : "";
    return `আমি ৬৪ জেলার ${bn(n)}টার বিখ্যাত খাবার খেয়েছি — ${rankOf(n)}।${beat} আপনি কয়টা? ${shareUrl()}`;
  };

  const showLongpress = async () => {
    const cv = await render();
    const img = $("out");
    img.src = cv.toDataURL("image/jpeg", .9);
    img.hidden = false;
    $("lpTip").hidden = false;
  };

  const download = () => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  $("share").addEventListener("click", async () => {
    if (!blob) await render();
    const file = new File([blob], fileName(), { type: "image/png" });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: caption() });
        return;
      }
      if (navigator.share) { await navigator.share({ text: caption(), url: shareUrl() }); return; }
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
    download();
    await showLongpress();
    toast("ছবি নামানো হয়েছে — ফেসবুকে পোস্ট করুন");
  });
  $("save").addEventListener("click", async () => {
    if (!blob) await render();
    download();
    await showLongpress();
    toast("ডাউনলোড শুরু হয়েছে");
  });
  $("copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(caption()); toast("লেখা আর লিংক কপি হয়েছে"); }
    catch { prompt("কপি করুন", caption()); }
  });

  $("dockShare").addEventListener("click", () => {
    const make = $("makeTitle").getBoundingClientRect();
    if (make.top > window.innerHeight || make.bottom < 0) { $("makeTitle").scrollIntoView({ behavior: "smooth" }); return; }
    $("share").click();
  });

  applyTheme();
  paint();
})();
