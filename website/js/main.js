/* Ashish Kumar portfolio script.
   Content: js/defaults.js -> data/site-data.js (optional) -> live content from Supabase (edited in the admin website). */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = u => /^https?:\/\//i.test(u || "") ? u : "";
const calm = matchMedia("(prefers-reduced-motion:reduce)").matches;
const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
const CFG = window.SITE_CONFIG || {};
const SB = (CFG.supabaseUrl || "").replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const DEF = window.PF_DEFAULT;
let DATA = null, lastPull = "", roleTimer = 0;

/* ================= data ================= */
function mergeData(d) {
  d = d || {};
  const out = Object.assign(JSON.parse(JSON.stringify(DEF)), d);
  out.profile = Object.assign({}, DEF.profile, d.profile || {});
  out.profile.social = Object.assign({}, DEF.profile.social, (d.profile || {}).social || {});
  for (const k of ["stats", "skills", "projects", "experience", "education"]) if (!Array.isArray(out[k])) out[k] = DEF[k];
  return out;
}
function setData(d) { DATA = mergeData(d); renderAll(); }
window.PF = { setData };
async function pullContent() {
  if (!SB || !CFG.supabaseKey) return;
  try {
    const r = await fetch(SB + "/rest/v1/portfolio_content?id=eq.1&select=data", { headers: { apikey: CFG.supabaseKey, Authorization: "Bearer " + CFG.supabaseKey } });
    if (!r.ok) return;
    const rows = await r.json(), d = rows[0] && rows[0].data;
    if (d && Object.keys(d).length) { const s = JSON.stringify(d); if (s !== lastPull) { lastPull = s; try { localStorage.setItem("pf-data", s); } catch (e) { } setData(Object.assign({}, window.SITE_DATA || {}, d)); } }
  } catch (e) { }
}

/* ================= helpers ================= */
const tagsOf = p => String(p.tags || "").split(",").map(t => t.trim()).filter(Boolean);
const initials = s => String(s || "").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "•";
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); if (e.target.classList.contains("scr")) scramble(e.target); if (e.target.dataset.count) countUp(e.target); } }), { threshold: .14, rootMargin: "0px 0px -6% 0px" });
function reveal(root = document) {
  $$(".rv:not([data-r]),.scr:not([data-r])", root).forEach(el => { el.dataset.r = 1; if (el.classList.contains("rv") && !el.style.getPropertyValue("--d")) el.style.setProperty("--d", Math.min([...el.parentElement.children].indexOf(el), 6) * .08 + "s"); io.observe(el); });
}
/* text scramble for section titles */
function scramble(el) {
  if (calm || el.dataset.scr) return; el.dataset.scr = 1;
  const final = el.textContent, chars = "ABCDEFGHJKLMNPRSTUVWXYZabcdefghkmnprstuvwxyz*+#", t0 = performance.now(), dur = 900;
  const step = now => {
    const p = Math.min(1, (now - t0) / dur);
    el.textContent = [...final].map((c, i) => c === " " ? " " : (i / final.length < p ? c : chars[Math.floor(Math.random() * chars.length)])).join("");
    if (p < 1) requestAnimationFrame(step); else el.textContent = final;
  };
  requestAnimationFrame(step);
}
function countUp(el) {
  const v = el.dataset.count, m = String(v).match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/); if (!m || calm) return;
  const n = parseFloat(m[2]), t0 = performance.now(), dur = 1400;
  const step = now => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = m[1] + Math.round(n * e) + m[3]; if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ================= renderers ================= */
function iconLabel(k) { return k; }
function socialLinks(p) { return Object.entries(p.social || {}).filter(([k, v]) => safeUrl(v)).map(([k, v]) => `<li><a href="${esc(v)}" target="_blank" rel="noopener" aria-label="${esc(k)}">${esc(k)}</a></li>`).join(""); }
function renderHero() {
  const p = DATA.profile;
  document.title = `${p.name} | ${String(p.roles).split(",")[0].trim() || "Portfolio"}`;
  $("#logoName").textContent = p.name; $("#fName").textContent = p.name;
  $("#hName").setAttribute("aria-label", p.name);
  let i = 0;
  $("#hName").innerHTML = String(p.name).split(/\s+/).filter(Boolean).map(w => `<span class="wd" aria-hidden="true">${[...w].map(c => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join("")}</span>`).join(" ");
  const roles = String(p.roles).split(",").map(r => r.trim()).filter(Boolean); const rl = $("#roleList");
  rl.innerHTML = (roles.length ? roles : [""]).concat(roles.slice(0, 1)).map(r => `<span>${esc(r)}</span>`).join("");
  rl.style.transition = "none"; rl.style.transform = "none"; clearInterval(roleTimer);
  if (roles.length > 1 && !calm) { let k = 0; roleTimer = setInterval(() => { k++; rl.style.transition = ""; rl.style.transform = `translateY(-${k * 1.3}em)`; if (k === roles.length) setTimeout(() => { rl.style.transition = "none"; rl.style.transform = "none"; k = 0; }, 720); }, 2400); }
  $("#hTag").textContent = p.tagline;
  $("#hPhoto").src = p.photo || "images/ashish.jpg";
  const av = $("#avail"); $("#availT").textContent = p.available ? "Available for new projects" : "Currently busy, but say hello"; av.parentElement.classList.toggle("off", !p.available);
  const rb = $("#resumeBtn"); if (safeUrl(p.resume)) { rb.href = p.resume; rb.target = "_blank"; rb.rel = "noopener"; rb.firstElementChild.textContent = "Download résumé"; } else { rb.href = "#contact"; rb.removeAttribute("target"); rb.firstElementChild.textContent = "Get in touch"; }
  $("#heroSocial").innerHTML = socialLinks(p);
  const words = DATA.skills.map(s => s.name); const row = (words.length ? words : ["Web", "Design"]);
  $("#mq").innerHTML = [...row, ...row, ...row, ...row].map(w => `<span>${esc(w)}</span>`).join("");
  $("#sample").hidden = !!DATA.saved;
}
function renderAbout() {
  const p = DATA.profile;
  $("#aText").innerHTML = String(p.about).split(/\n\s*\n/).map(t => `<p>${esc(t)}</p>`).join("");
  const facts = [["Location", p.location], ["Email", p.email && `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`], ["Phone", p.phone && `<a href="tel:${esc(String(p.phone).replace(/[^+\d]/g, ""))}">${esc(p.phone)}</a>`]].filter(f => f[1]);
  $("#facts").innerHTML = facts.map(f => `<li><b>${f[0]}</b>${f[0] === "Location" ? esc(f[1]) : f[1]}</li>`).join(""); $("#facts").hidden = !facts.length;
  $("#stats").innerHTML = DATA.stats.filter(s => s.value || s.label).map(s => `<div class="stat rv"><b data-count="${esc(s.value)}">${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join("");
  reveal($("#stats"));
}
function renderSkills() {
  const cats = {}; DATA.skills.forEach(s => (cats[s.cat || "Skills"] = cats[s.cat || "Skills"] || []).push(s));
  $("#skillGrid").innerHTML = Object.entries(cats).map(([c, list]) => `<div class="sk-cat rv"><h3>${esc(c)}</h3>${list.map((s, i) => `<div class="sk"><div class="sk-row"><span>${esc(s.name)}</span><span>${Math.max(0, Math.min(100, +s.level || 0))}%</span></div><div class="sk-bar"><i style="--w:${Math.max(0, Math.min(100, +s.level || 0))}%;--d:${i * .12 + .2}s"></i></div></div>`).join("")}</div>`).join("");
  reveal($("#skillGrid"));
}
let filter = "All";
function renderProjects() {
  const tags = ["All", ...new Set(DATA.projects.flatMap(tagsOf))];
  if (!tags.includes(filter)) filter = "All";
  $("#filters").innerHTML = tags.map(t => `<button type="button" aria-pressed="${t === filter}">${esc(t)}</button>`).join(""); $("#filters").hidden = tags.length < 3;
  $("#projGrid").innerHTML = DATA.projects.map((p, i) => `<button class="proj rv${filter === "All" || tagsOf(p).includes(filter) ? "" : " hide"}" type="button" data-i="${i}" aria-label="Open project ${esc(p.title)}"><div class="p-cover${p.cover ? "" : " gen"}" style="--g:${i * 55}deg">${p.cover ? `<img src="${esc(p.cover)}" alt="" loading="lazy">` : `<span class="ini">${esc(initials(p.title))}</span>`}<span class="p-go"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M8 7h9v9"/></svg></span></div><div class="p-body"><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><div class="p-tags">${tagsOf(p).map(t => `<span>${esc(t)}</span>`).join("")}</div></div></button>`).join("");
  reveal($("#projGrid"));
}
function renderJourney() {
  const li = it => `<li class="rv"><span class="per">${esc(it.period)}</span><h4>${esc(it.role)}</h4><p class="org">${esc(it.org)}</p><p>${esc(it.desc)}</p></li>`;
  $("#expList").innerHTML = DATA.experience.map(li).join(""); $("#eduList").innerHTML = DATA.education.map(li).join("");
  reveal($("#expList")); reveal($("#eduList"));
}
function renderContact() {
  const p = DATA.profile, items = [];
  if (p.email) items.push(`<li><b>Email</b><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>`);
  if (p.phone) items.push(`<li><b>Phone</b><a href="tel:${esc(String(p.phone).replace(/[^+\d]/g, ""))}">${esc(p.phone)}</a></li>`);
  if (p.location) items.push(`<li><b>Based in</b>${esc(p.location)}</li>`);
  $("#cList").innerHTML = items.join(""); $("#cSocial").innerHTML = socialLinks(p);
}
function renderAll() { renderHero(); renderAbout(); renderSkills(); renderProjects(); renderJourney(); renderContact(); reveal(); }

/* ================= project modal ================= */
const M = { p: null };
function openProject(i) {
  const p = DATA.projects[i]; if (!p) return; M.p = p;
  const imgs = [p.cover, ...(p.photos || [])].filter(Boolean);
  $("#mTags").textContent = tagsOf(p).join(" · "); $("#mTitle").textContent = p.title; $("#mDesc").textContent = p.desc;
  $("#mLinks").innerHTML = (safeUrl(p.link) ? `<a class="btn mag" href="${esc(p.link)}" target="_blank" rel="noopener"><span>Live site</span><i class="arr"></i></a>` : "") + (safeUrl(p.repo) ? `<a class="btn btn-line mag" href="${esc(p.repo)}" target="_blank" rel="noopener"><span>Source code</span></a>` : "");
  const stage = $("#mStage"), th = $("#mThumbs");
  const show = k => { stage.innerHTML = imgs.length ? `<img src="${esc(imgs[k])}" alt="${esc(p.title)} screenshot ${k + 1}">` : `<span class="ini">${esc(initials(p.title))}</span>`; $$("button", th).forEach((b, n) => n === k ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")); };
  th.innerHTML = imgs.length > 1 ? imgs.map((u, k) => `<button type="button" aria-label="Image ${k + 1}" data-k="${k}"><img src="${esc(u)}" alt="" loading="lazy"></button>`).join("") : "";
  th.onclick = e => { const b = e.target.closest("button"); if (b) show(+b.dataset.k); };
  show(0); $("#modal").showModal();
}
function closeModal() { const d = $("#modal"); if (!d.open) return; if (calm) { d.close(); return; } d.classList.add("closing"); setTimeout(() => { d.close(); d.classList.remove("closing"); }, 300); }
function initModal() {
  const d = $("#modal");
  $("#projGrid").addEventListener("click", e => { const b = e.target.closest(".proj"); if (b) openProject(+b.dataset.i); });
  $("#mClose").onclick = closeModal; d.addEventListener("cancel", e => { e.preventDefault(); closeModal(); });
  d.addEventListener("click", e => { if (e.target === d) closeModal(); });
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return; filter = b.textContent;
    $$("#filters button").forEach(x => x.setAttribute("aria-pressed", x === b));
    $$("#projGrid .proj").forEach((c, i) => { const p = DATA.projects[i], show = filter === "All" || tagsOf(p).includes(filter); c.classList.toggle("hide", !show); c.classList.remove("pop"); if (show) { void c.offsetWidth; c.classList.add("in", "pop"); c.style.animationDelay = i * 50 + "ms"; } });
  });
}

/* ================= navigation, scrolling, effects ================= */
let scrollRaf = 0;
function smoothTo(y, done) {
  cancelAnimationFrame(scrollRaf);
  const max = document.documentElement.scrollHeight - innerHeight; y = Math.max(0, Math.min(y, max));
  const y0 = scrollY, dist = y - y0;
  if (calm || Math.abs(dist) < 2) { scrollTo(0, y); done && done(); return; }
  const dur = Math.max(700, Math.min(1400, Math.abs(dist) * .5)), t0 = performance.now(), ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const stop = () => { cancelAnimationFrame(scrollRaf); removeEventListener("wheel", stop); removeEventListener("touchstart", stop); };
  addEventListener("wheel", stop, { passive: true }); addEventListener("touchstart", stop, { passive: true });
  const step = now => { const t = Math.min(1, (now - t0) / dur); scrollTo(0, y0 + dist * ease(t)); if (t < 1) scrollRaf = requestAnimationFrame(step); else { stop(); done && done(); } };
  scrollRaf = requestAnimationFrame(step);
}
function initNav() {
  const dock = $("#dock"), links = $$("#dock a[href^='#']"), prog = $("#prog");
  let lastY = scrollY, ticking = false;
  const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => { const on = a.getAttribute("href") === "#" + e.target.id; a.classList.toggle("on", on); on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"); }); }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => spy.observe(s));
  const tl = $$(".tl");
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`; $(".top").classList.toggle("solid", y > 24);
    if (innerWidth > 640) dock.classList.toggle("away", false); else dock.classList.toggle("away", y > 300 && y > lastY + 6 ? true : (y < lastY - 6 ? false : dock.classList.contains("away")));
    lastY = y;
    tl.forEach(t => { const r = t.getBoundingClientRect(), p = Math.max(0, Math.min(1, (innerHeight * .7 - r.top) / r.height)); t.style.setProperty("--p", p.toFixed(3)); });
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll();
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const id = a.getAttribute("href").slice(1), el = id ? document.getElementById(id) : document.body; if (!el) return; e.preventDefault();
    const off = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 80;
    smoothTo(id && id !== "home" ? el.getBoundingClientRect().top + scrollY - off + 1 : 0, () => { try { history.replaceState(null, "", id ? "#" + id : location.pathname + location.search); } catch (_) { } });
  });
  /* dock magnification (mouse only) */
  if (fine && !calm) {
    const items = $$("#dock li > a, #dock li > button");
    dock.addEventListener("pointermove", e => items.forEach(it => { const r = it.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2)); it.style.setProperty("--s", (1 + Math.max(0, 1 - d / 110) * .55).toFixed(3)); }));
    dock.addEventListener("pointerleave", () => items.forEach(it => it.style.setProperty("--s", 1)));
  }
}
function initEffects() {
  /* custom cursor */
  if (fine && !calm) {
    document.documentElement.classList.add("has-cursor");
    const dot = $("#cur"), ring = $("#curRing"); let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; ring.classList.toggle("big", !!e.target.closest("a,button,.proj,input,textarea")); });
    (function loop() { rx += (x - rx) * .16; ry += (y - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  }
  /* ripple + magnetic buttons */
  document.addEventListener("pointerdown", e => {
    if (calm) return; const b = e.target.closest(".btn"); if (!b) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = document.createElement("span");
    s.className = "ripple"; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`; b.appendChild(s); s.addEventListener("animationend", () => s.remove());
  });
  if (fine && !calm) {
    document.addEventListener("pointermove", e => {
      const b = e.target.closest && e.target.closest(".mag"); if (b) { const r = b.getBoundingClientRect(); b.style.translate = `${((e.clientX - r.left) / r.width - .5) * 12}px ${((e.clientY - r.top) / r.height - .5) * 10}px`; }
      const c = e.target.closest && e.target.closest(".proj"); if (c) { const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-6px)`; c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px"); }
    });
    document.addEventListener("pointerout", e => { const b = e.target.closest && e.target.closest(".mag"); if (b && !b.contains(e.relatedTarget)) b.style.translate = ""; const c = e.target.closest && e.target.closest(".proj"); if (c && !c.contains(e.relatedTarget)) c.style.transform = ""; });
    /* photo tilt */
    const hero = $(".hero"), fr = $("#frame");
    hero.addEventListener("pointermove", e => { const r = fr.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; fr.style.transform = `perspective(1000px) rotateY(${px * 10}deg) rotateX(${-py * 8}deg)`; });
    hero.addEventListener("pointerleave", () => { fr.style.transform = ""; });
  }
}

/* ================= contact form ================= */
function initForm() {
  const f = $("#form"), ok = $("#ok"), btn = $("button[type=submit]", f), label = btn.firstElementChild;
  const setErr = (id, m) => { $(`.err[data-for="${id}"]`).textContent = m || ""; };
  f.addEventListener("submit", async e => {
    e.preventDefault(); ok.textContent = ""; ok.style.color = "";
    const name = $("#f-name").value.trim(), email = $("#f-email").value.trim(), msg = $("#f-msg").value.trim(); let bad = 0;
    setErr("f-name", name ? "" : (bad++, "Please enter your name.")); setErr("f-email", /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? "" : (bad++, "Please enter a valid email address.")); setErr("f-msg", msg ? "" : (bad++, "Please write a message."));
    if (bad) return;
    btn.disabled = true; label.textContent = "Sending…";
    try {
      if (!SB || !CFG.supabaseKey) throw 0;
      const r = await fetch(SB + "/rest/v1/portfolio_messages", { method: "POST", headers: { apikey: CFG.supabaseKey, Authorization: "Bearer " + CFG.supabaseKey, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ name, email, message: msg, subject: "Portfolio message" }) });
      if (!r.ok) throw 0; f.reset(); ok.textContent = "Thank you! Your message has been sent. I will reply soon.";
    } catch (x) {
      const to = DATA.profile.email;
      if (to) { location.href = `mailto:${to}?subject=${encodeURIComponent("Message from your portfolio")}&body=${encodeURIComponent(msg + "\n\n" + name + " (" + email + ")")}`; ok.textContent = "Opening your email app to send the message."; }
      else { ok.style.color = "#e5484d"; ok.textContent = "Sorry, the message could not be sent just now. Please try again later."; }
    }
    btn.disabled = false; label.textContent = "Send message";
  });
}

/* ================= light / dark mode ================= */
function initTheme() {
  const root = document.documentElement, btn = $("#themeBtn");
  const sync = () => { const d = root.getAttribute("data-theme") === "dark"; btn.setAttribute("aria-pressed", d); btn.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode"); const m = $('meta[name="theme-color"]'); if (m) m.content = d ? "#0a0b10" : "#f5f2ec"; };
  const apply = t => { root.setAttribute("data-theme", t); try { localStorage.setItem("pf-theme", t); } catch (e) { } sync(); };
  sync();
  btn.addEventListener("click", () => {
    const t = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    if (calm) { apply(t); return; }
    if (!document.startViewTransition) { root.classList.add("theming"); apply(t); setTimeout(() => root.classList.remove("theming"), 750); return; }
    const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const ring = document.createElement("div"); ring.className = "theme-ring"; ring.style.left = x + "px"; ring.style.top = y + "px"; document.body.appendChild(ring);
    const vt = document.startViewTransition(() => apply(t));
    vt.ready.then(() => {
      const opts = { duration: 950, easing: "cubic-bezier(.5,0,.15,1)", fill: "both" };
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] }, Object.assign({ pseudoElement: "::view-transition-new(root)" }, opts));
      ring.animate([{ transform: "scale(.1)", opacity: .95 }, { opacity: .5, offset: .6 }, { transform: `scale(${end / 50 * 2})`, opacity: 0 }], opts);
    }).catch(() => { });
    vt.finished.finally(() => ring.remove());
  });
  matchMedia("(prefers-color-scheme:dark)").addEventListener && matchMedia("(prefers-color-scheme:dark)").addEventListener("change", e => { let s = null; try { s = localStorage.getItem("pf-theme"); } catch (x) { } if (!s) apply(e.matches ? "dark" : "light"); });
}

/* ================= start ================= */
$("#yr").textContent = new Date().getFullYear();
initTheme(); initNav(); initEffects(); initModal(); initForm();
let cached = null; try { cached = JSON.parse(localStorage.getItem("pf-data") || "null"); } catch (e) { }
setData(Object.assign({}, window.SITE_DATA || {}, cached || {}));
pullContent(); setInterval(pullContent, 60000);
/* intro: short preloader (first visit per session), then the hero animates in */
(function intro() {
  const pre = $("#pre"), bar = $("#preBar"), root = document.documentElement, go = () => { root.classList.add("ready"); };
  try { sessionStorage.setItem("pf-seen", "1"); } catch (e) { }
  if (calm || root.classList.contains("seen")) { go(); return; }
  let p = 0; const t = setInterval(() => { p = Math.min(100, p + 8 + Math.random() * 14); bar.style.width = p + "%"; if (p >= 100) { clearInterval(t); setTimeout(() => { pre.classList.add("done"); setTimeout(go, 350); setTimeout(() => pre.remove(), 1400); }, 250); } }, 90);
})();
