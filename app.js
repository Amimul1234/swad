(() => {
  const SITE = "amimul1234.github.io/swad";
  const STORE = "swad:v1";
  const DIVS = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"];
  const KEYS = Object.keys(MAP.d).sort();
  const BY = Object.fromEntries(FOODS.map(f => [f.key, f]));
  const $ = id => document.getElementById(id);

  const bn = n => String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
  const clean = v => typeof v === "string" ? [...v.replace(/[\p{Cc}\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069\u2028\u2029\uFEFF]/gu, "").replace(/\s+/g, " ").trim()].slice(0, 28).join("") : "";

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
      const eaten = Array.isArray(v.eaten) ? v.eaten.filter(k => typeof k === "string" && Object.prototype.hasOwnProperty.call(BY, k)) : [];
      return { eaten: new Set(eaten), name: clean(v.name) };
    } catch { return { eaten: new Set(), name: "" }; }
  };
  const state = load();
  const save = () => {
    try { localStorage.setItem(STORE, JSON.stringify({ eaten: [...state.eaten], name: state.name })); } catch {}
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
      let n = [...s].reduce((a, c) => a * 36n + BigInt(parseInt(c, 36)), 0n);
      KEYS.forEach((k, i) => { if ((n >> BigInt(i)) & 1n) out.add(k); });
    } catch {}
    return out;
  };

  const today = new Date();
  $("today").textContent = "তারিখ: " + bn(today.getDate()) + "/" + bn(today.getMonth() + 1) + "/" + bn(today.getFullYear());

  const svg = $("map");
  svg.setAttribute("viewBox", `-4 -4 ${MAP.w + 8} ${MAP.h + 8}`);
  const paths = {};
  KEYS.forEach(k => {
    const f = BY[k];
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", MAP.d[k]);
    p.setAttribute("tabindex", "0");
    p.setAttribute("role", "checkbox");
    p.setAttribute("aria-label", f ? `${f.bn} — ${f.food}` : k);
    p.dataset.k = k;
    svg.appendChild(p);
    paths[k] = p;
  });

  let peekTimer;
  const peek = k => {
    const f = BY[k];
    const el = $("peek");
    el.innerHTML = "";
    const t = document.createElement("span");
    t.textContent = f.bn + " — ";
    const b = document.createElement("b");
    b.textContent = f.food;
    el.append(t, b);
    el.hidden = false;
    clearTimeout(peekTimer);
    peekTimer = setTimeout(() => { el.hidden = true; }, 1800);
  };

  const toggle = (k, from) => {
    if (!BY[k]) return;
    state.eaten.has(k) ? state.eaten.delete(k) : state.eaten.add(k);
    save();
    paint();
    const p = paths[k];
    p.classList.remove("pop");
    void p.getBBox();
    p.classList.add("pop");
    if (from === "map") peek(k);
    if (navigator.vibrate && state.eaten.has(k)) navigator.vibrate(8);
  };

  svg.addEventListener("click", e => {
    const k = e.target.dataset && e.target.dataset.k;
    if (k) toggle(k, "map");
  });
  svg.addEventListener("keydown", e => {
    const k = e.target.dataset && e.target.dataset.k;
    if (k && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggle(k, "map"); }
  });

  const tick = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
  const list = $("list");
  const rows = {};
  const blocks = DIVS.map(div => {
    const items = FOODS.filter(f => f.division === div).sort((a, b) => a.bn.localeCompare(b.bn, "bn"));
    const wrap = document.createElement("div");
    wrap.className = "div-block";
    const head = document.createElement("div");
    head.className = "div-head";
    const h = document.createElement("h2");
    h.textContent = div + " বিভাগ";
    const c = document.createElement("span");
    head.append(h, c);
    wrap.appendChild(head);
    items.forEach(f => {
      const r = document.createElement("button");
      r.type = "button";
      r.className = "row";
      r.setAttribute("role", "checkbox");
      r.innerHTML = `<span class="box">${tick}</span><span class="food"></span><span class="dist"></span>`;
      r.querySelector(".dist").textContent = f.bn;
      const fd = r.querySelector(".food");
      fd.textContent = f.food;
      if (f.alt) { const em = document.createElement("em"); em.textContent = "বা " + f.alt; fd.appendChild(em); }
      r.addEventListener("click", () => toggle(f.key, "list"));
      r.dataset.q = [f.bn, f.food, f.alt, f.key].join(" ").toLowerCase();
      rows[f.key] = r;
      wrap.appendChild(r);
    });
    list.appendChild(wrap);
    return { div, wrap, count: c, items };
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
      b.items.forEach(f => {
        const hit = !q || rows[f.key].dataset.q.includes(q);
        rows[f.key].hidden = !hit;
        if (hit) shown++;
      });
      b.wrap.hidden = !shown;
      any = any || shown > 0;
    });
    empty.hidden = any;
    Object.values(paths).forEach(p => p.classList.toggle("hit", !!q && !rows[p.dataset.k].hidden));
  });

  $("clear").addEventListener("click", () => {
    if (!state.eaten.size) return;
    if (!confirm(`${bn(state.eaten.size)}টা টিক মুছে যাবে, আর ফেরত আসবে না। মুছবেন?`)) return;
    state.eaten.clear();
    save();
    paint();
  });

  const paint = () => {
    const n = state.eaten.size;
    $("count").textContent = bn(n);
    $("rank").textContent = rankOf(n);
    $("bar").style.width = (n / 64 * 100) + "%";
    $("make").disabled = n === 0;
    $("makeLabel").textContent = n ? `আমার কার্ড বানাই · ${bn(n)}/৬৪` : "আগে অন্তত একটা টিক দিন";
    KEYS.forEach(k => {
      const on = state.eaten.has(k);
      paths[k].classList.toggle("on", on);
      paths[k].setAttribute("aria-checked", on);
      if (rows[k]) { rows[k].classList.toggle("on", on); rows[k].setAttribute("aria-checked", on); }
    });
    blocks.forEach(b => {
      const got = b.items.filter(f => state.eaten.has(f.key)).length;
      b.count.textContent = bn(got) + "/" + bn(b.items.length);
    });
  };
  paint();

  const params = new URLSearchParams(location.search);
  if (params.has("m")) {
    const theirs = decode(params.get("m"));
    const who = clean(params.get("n")) || "আপনার বন্ধু";
    const el = $("friend");
    const b = document.createElement("b");
    b.textContent = who;
    el.append(b, document.createTextNode(` ৬৪ জেলার ${bn(theirs.size)}টার বিখ্যাত খাবার খেয়েছে। আপনি কয়টা?`));
    el.hidden = false;
  }

  const toast = msg => {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 2200);
  };

  const shareUrl = () => {
    const u = new URL("https://" + SITE + "/");
    u.searchParams.set("m", encode(state.eaten));
    if (state.name) u.searchParams.set("n", state.name);
    return u.toString();
  };

  let photo = null;
  const fontsReady = (async () => {
    const t = "স্বাদের ম্যাপ ০১২৩৪৫৬৭৮৯ জেলা খাবার";
    try {
      await Promise.all([
        document.fonts.load('400 40px "Tiro Bangla"', t),
        document.fonts.load('400 40px "Anek Bangla"', t),
        document.fonts.load('600 40px "Anek Bangla"', t),
        document.fonts.load('800 40px "Anek Bangla"', t)
      ]);
    } catch {}
  })();

  const C = {
    memo: "#f4dfe0", slip: "#fbf0f0", ink: "#1d3687", soft: "#4a5ea3",
    rule: "rgba(29,54,135,.1)", stamp: "#c4213f", deep: "#9b1730", carbon: "#24233a"
  };
  const shapes = {};
  KEYS.forEach(k => { shapes[k] = new Path2D(MAP.d[k]); });

  const fit = (ctx, text, max, size, weight, fam) => {
    let s = size;
    do { ctx.font = `${weight} ${s}px ${fam}`; s -= 2; } while (ctx.measureText(text).width > max && s > 18);
  };

  const draw = async () => {
    await fontsReady;
    const W = 1080, H = 1350;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const D = '"Tiro Bangla", serif';
    const B = '"Anek Bangla", sans-serif';
    const n = state.eaten.size;

    g.fillStyle = C.memo;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = C.rule;
    g.lineWidth = 2;
    for (let y = 330; y < H - 130; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.fillStyle = "#e7c9cb";
    for (let x = 18; x < W; x += 36) { g.beginPath(); g.arc(x, 0, 10, 0, Math.PI); g.fill(); }

    g.fillStyle = C.soft;
    g.font = `500 28px ${B}`;
    g.textBaseline = "alphabetic";
    g.fillText("ক্যাশমেমো নং ০৬৪", 64, 92);
    g.textAlign = "right";
    g.fillText("তারিখ: " + bn(today.getDate()) + "/" + bn(today.getMonth() + 1) + "/" + bn(today.getFullYear()), W - 64, 92);
    g.textAlign = "left";
    g.fillStyle = C.ink;
    g.font = `400 96px ${D}`;
    g.fillText("স্বাদের ম্যাপ", 60, 196);
    g.font = `500 34px ${B}`;
    g.fillText("৬৪ জেলার বিখ্যাত খাবার — কয়টা খেয়েছি", 64, 252);
    g.fillRect(60, 282, W - 120, 4);
    g.fillRect(60, 294, W - 120, 1.5);

    const mh = 900, s = mh / MAP.h, mw = MAP.w * s, mx = 40, my = 320;
    g.save();
    g.translate(mx, my);
    g.scale(s, s);
    g.lineJoin = "round";
    KEYS.forEach(k => {
      const on = state.eaten.has(k);
      g.fillStyle = on ? C.stamp : C.slip;
      g.fill(shapes[k]);
      g.strokeStyle = on ? C.deep : C.ink;
      g.lineWidth = 1.1;
      g.stroke(shapes[k]);
    });
    g.restore();

    const cx = 660, cw = W - 64 - cx;
    let y = 360;
    if (photo) {
      const r = 66;
      g.save();
      g.beginPath(); g.arc(cx + r, y + r, r, 0, Math.PI * 2); g.closePath(); g.clip();
      const sc = Math.max(2 * r / photo.width, 2 * r / photo.height);
      g.drawImage(photo, cx + r - photo.width * sc / 2, y + r - photo.height * sc / 2, photo.width * sc, photo.height * sc);
      g.restore();
      g.strokeStyle = C.ink; g.lineWidth = 4;
      g.beginPath(); g.arc(cx + r, y + r, r, 0, Math.PI * 2); g.stroke();
      y += 2 * r + 28;
    }
    const name = state.name || "আমি";
    g.fillStyle = C.ink;
    fit(g, name, cw, 52, 700, B);
    g.fillText(name, cx, y + 40);
    y += 72;
    g.fillStyle = C.stamp;
    g.font = `400 168px ${D}`;
    const big = bn(n);
    g.fillText(big, cx - 4, y + 140);
    const bw = g.measureText(big).width;
    g.fillStyle = C.soft;
    g.font = `400 64px ${D}`;
    g.fillText("/৬৪", cx + bw + 6, y + 140);
    y += 176;
    g.fillStyle = C.ink;
    fit(g, rankOf(n), cw, 46, 800, B);
    g.fillText(rankOf(n), cx, y + 30);
    y += 76;

    const picked = FOODS.filter(f => state.eaten.has(f.key));
    const room = Math.max(0, Math.floor((1196 - y) / 44));
    const show = picked.length > room ? picked.slice(0, room - 1) : picked;
    g.font = `500 32px ${B}`;
    show.forEach(f => {
      g.font = `400 24px ${B}`;
      const dw = g.measureText(f.bn).width;
      g.fillStyle = C.soft;
      g.textAlign = "right";
      g.fillText(f.bn, W - 64, y);
      g.textAlign = "left";
      g.fillStyle = C.ink;
      fit(g, f.food, cw - dw - 14, 32, 500, B);
      g.fillText(f.food, cx, y);
      y += 44;
    });
    if (picked.length > show.length) {
      g.fillStyle = C.stamp;
      g.font = `600 30px ${B}`;
      g.fillText(`+ আরও ${bn(picked.length - show.length)}টা`, cx, y);
    }
    if (!picked.length) {
      g.fillStyle = C.soft;
      g.font = `500 32px ${B}`;
      g.fillText("খাতা এখনো খালি…", cx, y);
    }

    g.save();
    g.translate(500, 1130);
    g.rotate(-0.2);
    g.globalAlpha = .82;
    g.strokeStyle = C.stamp;
    g.lineWidth = 6;
    g.beginPath(); g.arc(0, 0, 92, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2.5;
    g.beginPath(); g.arc(0, 0, 78, 0, Math.PI * 2); g.stroke();
    g.fillStyle = C.stamp;
    g.textAlign = "center";
    g.font = `800 40px ${B}`;
    g.fillText(n >= 32 ? "পেট ভরা" : n ? "খিদে বাকি" : "উপোস", 0, 6);
    g.font = `600 22px ${B}`;
    g.fillText(bn(Math.round(n / 64 * 100)) + "% বাংলাদেশ", 0, 42);
    g.restore();

    g.fillStyle = C.carbon;
    g.fillRect(0, H - 120, W, 120);
    g.fillStyle = "#fbf0f0";
    g.font = `600 38px ${B}`;
    g.textAlign = "left";
    g.fillText("আপনি কয়টা খেয়েছেন?", 64, H - 50);
    g.textAlign = "right";
    g.fillStyle = "#ffb3c0";
    g.font = `600 32px ${B}`;
    g.fillText(SITE, W - 64, H - 50);
    g.textAlign = "left";
    return cv;
  };

  let blob = null;
  const render = async () => {
    const cv = await draw();
    $("out").src = cv.toDataURL("image/jpeg", .9);
    blob = await new Promise(r => cv.toBlob(r, "image/png"));
  };

  const dlg = $("sheet");
  $("name").value = state.name;
  $("make").addEventListener("click", async () => {
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    await render();
  });
  let nameT;
  $("name").addEventListener("input", e => {
    state.name = clean(e.target.value);
    save();
    clearTimeout(nameT);
    nameT = setTimeout(render, 250);
  });
  let photoUrl = null;
  $("photo").addEventListener("change", async e => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file || !/^image\//.test(file.type) || file.size > 25e6) {
      if (file) toast("এই ফাইলটা ছবি হিসেবে খোলা গেল না");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      photoUrl = url;
      photo = img;
      const face = $("face");
      face.style.backgroundImage = `url("${url}")`;
      face.classList.add("has");
      await render();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast("এই ফাইলটা ছবি হিসেবে খোলা গেল না");
    };
    img.src = url;
  });

  const fileName = () => "swad-map-" + state.eaten.size + ".png";
  const caption = () => `আমি ৬৪ জেলার ${bn(state.eaten.size)}টার বিখ্যাত খাবার খেয়েছি — ${rankOf(state.eaten.size)}। আপনি কয়টা? ${shareUrl()}`;

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
    toast("ছবি সেভ হয়েছে — ফেসবুকে পোস্ট করুন");
  });

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
  $("save").addEventListener("click", async () => {
    if (!blob) await render();
    download();
    toast("ডাউনলোড শুরু হয়েছে — না হলে ছবিতে চেপে ধরে সেভ করুন");
  });
  $("copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(caption()); toast("লিংক কপি হয়েছে"); }
    catch { prompt("কপি করুন", caption()); }
  });
})();
