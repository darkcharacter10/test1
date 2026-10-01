// ===== GAU DRISHTI — plain JavaScript app (no npm, no build step) =====
// Pages are switched with the URL hash: #/ (home), #/tracker, #/impact

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BTN_SOLID = 'btn-anim btn-anim--solid relative rounded-full bg-saffron text-white font-semibold shadow-[0_4px_15px_rgba(224,123,57,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-saffron-dark';

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
const istDay = (d) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const isTodayIST = (iso) => istDay(new Date(iso)) === istDay(new Date());

// ---------- DATA (polls DETECTIONS_URL) ----------
const store = { list: [], loaded: false, error: false, subs: new Set() };
async function loadDetections() {
  try {
    const res = await fetch(DETECTIONS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    const json = await res.json();
    const arr = Array.isArray(json) ? json : json.detections || [];
    store.list = arr.slice().sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
    store.error = false;
  } catch (e) { store.error = true; }
  store.loaded = true;
  store.subs.forEach((fn) => fn());
}
loadDetections();
setInterval(() => { if (!document.hidden) loadDetections(); }, POLL_MS);

function inRange(iso, key) {
  if (!key) return true;
  const t = Date.parse(iso), day = 86400000, IST = 330 * 60000;
  const sod = Math.floor((Date.now() + IST) / day) * day - IST;
  if (key === 'today') return t >= sod;
  if (key === 'yesterday') return t >= sod - day && t < sod;
  if (key === 'week') return t >= sod - 6 * day;
  if (key === 'month') return t >= sod - 29 * day;
  return true;
}

// ---------- SCROLL REVEAL + COUNTERS ----------
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
}, { rootMargin: '0px 0px -80px 0px' });
const reveal = (cls, delay = 0, extra = '') => `class="reveal ${cls}" style="transition-delay:${delay}s" ${extra}`;
function observeReveals(root = document) { root.querySelectorAll('.reveal:not(.in)').forEach((el) => revealIO.observe(el)); }

const counterIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    counterIO.unobserve(e.target);
    runCounter(e.target);
  });
});
function runCounter(el) {
  const target = Number(el.dataset.target || 0), suffix = el.dataset.suffix || '';
  el.dataset.started = '1';
  if (!target) { el.textContent = '0' + suffix; return; }
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / 1200, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ---------- NAVBAR / FOOTER ----------
function renderNavbar() {
  const links = (cls) => NAV_LINKS.map((l) => `<a href="${l.href}" data-nav="${l.href}" class="${cls}">${l.label}</a>`).join('');
  $('#navbar').innerHTML = `
  <nav id="nav" class="fixed top-0 inset-x-0 z-[100] px-[5%] py-4 transition-all duration-500 sm:py-5">
    <div class="mx-auto flex max-w-6xl items-center justify-between">
      <a href="#/" class="relative flex items-center gap-2 font-display text-xl text-ink-dark sm:text-2xl">Gau Drishti
        <span class="absolute -right-3 top-0.5 h-2 w-2 rounded-full bg-saffron"></span></a>
      <ul class="hidden list-none items-center gap-6 lg:flex xl:gap-10">
        ${NAV_LINKS.map((l) => `<li><a href="${l.href}" data-nav="${l.href}" class="nav-link relative py-1 text-[0.95rem] font-medium text-ink-dark transition-colors hover:text-saffron-dark">${l.label}<span class="nav-ul absolute -bottom-0.5 left-0 h-0.5 w-0 bg-saffron transition-all duration-300"></span></a></li>`).join('')}
        <li><button data-open-report class="${BTN_SOLID} whitespace-nowrap px-5 py-3 xl:px-7">Report a Sighting</button></li>
        <li><div data-webapp></div></li>
      </ul>
      <button id="menuBtn" class="p-2.5 lg:hidden" aria-label="Toggle menu">${ICON.menu(24)}</button>
    </div>
  </nav>
  <div id="backdrop" class="fixed inset-0 z-[98] hidden bg-black/50 lg:hidden"></div>
  <div id="drawer" class="closed fixed right-0 top-0 z-[99] flex h-screen w-[85%] max-w-sm flex-col gap-6 overflow-y-auto bg-cream px-8 pb-10 pt-24 shadow-[-10px_0_40px_rgba(0,0,0,0.1)] lg:hidden">
    ${links('drawer-link py-1 text-lg font-medium text-ink-dark')}
    <button data-open-report class="${BTN_SOLID} mt-4 px-7 py-3 text-center">Report a Sighting</button>
    <div data-webapp data-full="1"></div>
  </div>`;
  const nav = $('#nav'), drawer = $('#drawer'), backdrop = $('#backdrop'), btn = $('#menuBtn');
  const onScroll = () => {
    const s = window.scrollY > 20;
    nav.classList.toggle('bg-cream/95', s); nav.classList.toggle('backdrop-blur-xl', s);
    nav.classList.toggle('shadow-soft', s); nav.classList.toggle('py-3', s);
  };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  const setMenu = (open) => {
    drawer.classList.toggle('closed', !open); backdrop.classList.toggle('hidden', !open);
    btn.innerHTML = open ? ICON.x(24) : ICON.menu(24);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.onclick = () => setMenu(drawer.classList.contains('closed'));
  backdrop.onclick = () => setMenu(false);
  drawer.addEventListener('click', (e) => { if (e.target.closest('a,[data-open-report]')) setMenu(false); });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => m.matches && setMenu(false));
  document.querySelectorAll('[data-webapp]').forEach(initWebAppButton);
}
function setActiveNav() {
  const cur = location.hash.replace(/\/$/, '') || '#/';
  document.querySelectorAll('.nav-link').forEach((a) => {
    const on = a.dataset.nav === cur;
    a.classList.toggle('text-saffron-dark', on);
    $('.nav-ul', a).classList.toggle('w-full', on); $('.nav-ul', a).classList.toggle('w-0', !on);
  });
}
function renderFooter() {
  $('#footer').innerHTML = `
  <footer class="bg-cream-dark px-[5%] pb-8 pt-14 sm:pt-20">
    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 md:grid-cols-3">
      <div><div class="font-display text-2xl text-ink-dark">Gau Drishti</div>
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-ink-medium">AI-powered animal safety platform bridging technology and compassion. Protecting every life that shares our roads.</p></div>
      <div><h4 class="mb-4 font-semibold text-ink-dark">Platform</h4>
        <ul class="space-y-3 text-sm text-ink-medium">
          <li><a href="#/tracker" class="transition-colors hover:text-saffron-dark">Live Tracker</a></li>
          <li><a href="#/impact" class="transition-colors hover:text-saffron-dark">Impact History</a></li>
          <li><button data-open-report class="text-left transition-colors hover:text-saffron-dark">Report Sighting</button></li></ul></div>
      <div><h4 class="mb-4 font-semibold text-ink-dark">Support</h4>
        <ul class="space-y-3 text-sm text-ink-medium">
          <li><a href="mailto:${SUPPORT_EMAIL}" class="inline-flex items-center gap-2 break-all transition-colors hover:text-saffron-dark">${ICON.mail(15)}${SUPPORT_EMAIL}</a></li>
          <li><a href="#" class="transition-colors hover:text-saffron-dark">Privacy Policy</a></li>
          <li><a href="#" class="transition-colors hover:text-saffron-dark">Terms of Service</a></li></ul></div>
    </div>
    <div class="mx-auto mt-12 max-w-6xl border-t border-peach-dark/60 pt-8 text-center text-sm text-ink-light sm:mt-16">© 2026 Gau Drishti. Built with compassion for every living being.</div>
  </footer>`;
}

// ---------- "WEB APP" BUTTON (decorative animation) ----------
function initWebAppButton(host) {
  const full = host.dataset.full === '1';
  const COLORS = ['#E07B39', '#F4A261', '#E8A33D', '#C84B31', '#FFD4B2'];
  host.className = `relative ${full ? 'w-full' : 'inline-flex'}`;
  host.innerHTML = `
    <div class="tip pointer-events-none absolute -top-2 left-1/2 z-30 hidden w-max -translate-x-1/2 -translate-y-3.5 whitespace-nowrap rounded-full bg-ink-dark px-4 py-1.5 text-xs font-semibold text-white shadow-heavy"></div>
    <button type="button" aria-label="Download the Gau Drishti web app" class="web-app-btn ${BTN_SOLID} flex items-center justify-center gap-2 px-7 py-3 ${full ? 'w-full' : ''}">
      <span class="web-app-glow" aria-hidden="true"></span>
      <span class="ico relative z-10 flex h-[18px] w-[18px] items-center justify-center">${ICON.download(18)}</span>
      <span class="relative z-10">Web App</span>
      <span class="parts pointer-events-none absolute inset-0 z-20 overflow-visible"></span>
    </button>`;
  const b = $('button', host), tip = $('.tip', host), ico = $('.ico', host), parts = $('.parts', host);
  let busy = false;
  b.onclick = () => {
    if (busy) return; busy = true;
    b.classList.add('is-active'); tip.classList.remove('hidden'); tip.textContent = 'Preparing your download…';
    const iv = setInterval(() => {
      const p = document.createElement('span'), side = Math.random() < 0.5 ? -1 : 1, sz = 3 + Math.random() * 3;
      p.className = 'particle';
      p.style.cssText = `width:${sz}px;height:${sz}px;background:${COLORS[Math.floor(Math.random() * 5)]};--dx:${side * (18 + Math.random() * 26)}px;--dy:${-(30 + Math.random() * 26)}px`;
      parts.appendChild(p); setTimeout(() => p.remove(), 1700);
    }, 140);
    setTimeout(() => { clearInterval(iv); ico.innerHTML = ICON.check(18, '', 2.5); tip.textContent = 'Web App launching soon 🚀'; }, 2400);
    setTimeout(() => { b.classList.remove('is-active'); tip.classList.add('hidden'); ico.innerHTML = ICON.download(18); parts.innerHTML = ''; busy = false; }, 4400);
  };
}

// ---------- PAGES ----------
const emptyBox = (icon, title, text, pad = 'py-14') => `
  <div ${reveal(`mx-auto max-w-lg rounded-lg border border-dashed border-peach-dark bg-white/60 px-8 ${pad} text-center`)}>
    ${icon}<h3 class="mt-4 font-display text-lg text-ink-dark">${title}</h3><p class="mt-2 text-sm text-ink-light">${text}</p></div>`;
const sectionHead = (kicker, title, text, h = 'h2') => `
  <div ${reveal('mx-auto mb-10 max-w-2xl text-center sm:mb-16')}>
    <div class="mb-3 text-sm font-medium text-saffron-dark">${kicker}</div>
    <${h} class="font-display text-fluid-${h} text-ink-dark">${title}</${h}><p class="mt-4 text-ink-medium">${text}</p></div>`;
const photo = (d) => d.imagePath
  ? `<img src="${esc(d.imagePath)}" alt="${esc(d.animal)}" loading="lazy" class="aspect-[4/3] w-full object-cover" />`
  : `<div class="flex aspect-[4/3] items-center justify-center bg-cream-dark text-ink-light">${ICON.imageOff(24)}</div>`;

let cleanup = null; // called when leaving a page (stops maps / subscriptions)

function pageHome() {
  const cardsHtml = () => {
    const recent = store.list.filter((d) => d.status === 'resolved').slice(0, 3);
    return recent.length === 0
      ? emptyBox(ICON.imageOff(48, 'mx-auto text-ink-light', 1.4), 'No Rescues Recorded Yet', 'When our AI cameras detect animals on the road, their photos and rescue details will automatically appear here.')
      : `<div class="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">${recent.map((d) => `
        <div class="overflow-hidden rounded-lg bg-white shadow-soft">${photo(d)}<div class="p-4">
          <div class="font-display text-lg text-ink-dark">${esc(d.animal)}</div>
          <p class="mt-1 text-sm text-ink-medium">${esc(d.location)}</p>
          <p class="mt-0.5 text-xs text-ink-light">${formatTime(d.timestamp)}</p></div></div>`).join('')}</div>`;
  };
  const statIcons = [ICON.handshake, ICON.shieldAlert, ICON.checkCircle];
  const stepIcons = [ICON.camera, ICON.mapPinned, ICON.truck, ICON.heartPulse];
  const misIcons = [ICON.target, ICON.eye, ICON.heart];
  $('#app').innerHTML = `
  <section class="relative overflow-hidden px-[5%] pb-16 pt-28 sm:pb-24 md:pt-40">
    <div class="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-peach/50 blur-3xl"></div>
    <div class="pointer-events-none absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-saffron-light/20 blur-3xl"></div>
    <div class="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 sm:gap-16 lg:grid-cols-2">
      <div class="fade-up text-center lg:text-left">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-dark shadow-soft"><span class="pulse-dot"></span>Live Protection Active</div>
        <h1 class="font-display text-fluid-hero text-ink-dark">Every animal deserves a safe road</h1>
        <p class="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink-medium sm:mt-6 sm:text-lg lg:mx-0">AI-powered cameras detect stray animals on roads and instantly alert municipal teams for rapid, humane relocation — protecting lives, both human and animal.</p>
        <div class="mt-9 flex flex-wrap justify-center gap-4 lg:justify-start">
          <a href="#/tracker" class="${BTN_SOLID} group inline-flex items-center gap-2 px-7 py-3.5">See Live Tracker ${ICON.arrowRight(18, 'transition-transform duration-300 group-hover:translate-x-1')}</a>
          <button id="learnMore" class="btn-anim btn-anim--ghost relative inline-flex items-center gap-2 rounded-full border-2 border-ink-dark/15 px-7 py-3.5 font-semibold text-ink-dark transition-all duration-300 hover:border-saffron hover:text-saffron-dark">Learn More</button>
        </div>
      </div>
      <div class="fade-up relative mx-auto max-w-md lg:max-w-none" style="animation-delay:.25s">
        <div class="hero-cow-wrap h-[min(380px,60vw)] min-h-[260px] overflow-hidden shadow-heavy sm:h-[440px]">
          <img src="https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=800&h=600&fit=crop" alt="Cow resting safely by the roadside" class="h-full w-full object-cover" /></div>
        <div class="float-soft absolute -bottom-6 -left-6 hidden items-center gap-3 rounded-lg bg-white px-5 py-4 shadow-medium sm:flex">
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-saffron/10 text-saffron">${ICON.shield(22)}</div>
          <div><div class="text-sm font-semibold text-ink-dark">System Active</div><div class="text-xs text-ink-light">Monitoring roads</div></div></div>
        <div class="float-soft absolute -right-3 bottom-16 hidden items-center gap-2 rounded-full bg-[#3F7D5C] px-4 py-2.5 text-white shadow-medium sm:flex" style="animation-delay:1.4s">${ICON.bell(16)}<span class="text-xs font-semibold">Protection Alerts</span></div>
      </div>
    </div>
  </section>

  <section class="relative -mt-10 px-[5%]">
    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-6 rounded-lg bg-white p-6 shadow-medium sm:grid-cols-3 sm:p-10">
      ${STATS.map((s, i) => `<div ${reveal('text-center', i * 0.1)}>
        <div class="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-peach text-saffron-dark">${statIcons[i](20)}</div>
        <div class="stat font-display text-4xl text-saffron" data-i="${i}" data-suffix="${s.suffix || ''}" data-target="0">0${s.suffix || ''}</div>
        <div class="mt-1 text-sm text-ink-light">${s.label}</div></div>`).join('')}
    </div>
  </section>

  <section id="how-it-works" class="px-[5%] py-16 sm:py-24 lg:py-28">
    ${sectionHead('Our Process', 'How It Works', 'From detection to safe relocation — a seamless chain of compassion and technology.')}
    <div class="relative mx-auto grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4">
      <div class="pointer-events-none absolute left-0 right-0 top-8 hidden lg:block"><div class="relative h-[6px] w-full overflow-hidden rounded-full bg-ink-dark/15">
        <div class="absolute inset-y-0 left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.85)_0_16px,transparent_16px_30px)]"></div></div></div>
      ${PROCESS_STEPS.map((s, i) => `<div ${reveal('relative text-center', i * 0.12)}>
        <div class="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-saffron shadow-medium ring-4 ring-cream">${stepIcons[i](26, '', 1.7)}</div>
        <h3 class="font-display text-lg text-ink-dark">${s.title}</h3><p class="mt-2 text-sm leading-relaxed text-ink-medium">${s.desc}</p></div>`).join('')}
    </div>
  </section>

  <section id="mission" class="bg-cream-dark px-[5%] py-16 sm:py-24 lg:py-28">
    ${sectionHead('Why Gau Drishti', 'Technology With a Heart', 'Gau Drishti was born from a simple belief: no animal should lose its life to a road accident, and no human should suffer because of it. We combine AI with municipal collaboration to create safer roads for everyone.')}
    <div class="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
      ${MISSION_CARDS.map((c, i) => `<div ${reveal('group rounded-lg bg-white p-6 shadow-soft hover:-translate-y-1.5 hover:shadow-medium sm:p-8', i * 0.1)}>
        <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-peach text-saffron-dark transition-colors duration-300 group-hover:bg-saffron group-hover:text-white">${misIcons[i](26, '', 1.6)}</div>
        <h3 class="font-display text-xl text-ink-dark">${c.title}</h3><p class="mt-3 text-sm leading-relaxed text-ink-medium">${c.desc}</p></div>`).join('')}
    </div>
  </section>

  <section class="px-[5%] py-16 sm:py-24 lg:py-28">
    ${sectionHead('Our Impact', 'Recent Rescues', 'Every photo tells a story of a life saved. Rescued animals will appear here once detected by our cameras.')}
    <div id="recent"></div>
  </section>

  <section class="px-[5%] py-16 sm:py-24">
    <div ${reveal('mx-auto max-w-4xl rounded-lg bg-saffron-gradient px-6 py-12 text-center text-white shadow-heavy sm:px-16 sm:py-16')}>
      <h2 class="font-display text-fluid-h2">Join the movement for safer roads</h2>
      <p class="mx-auto mt-4 max-w-xl text-white/90">Be part of a compassionate community protecting animals and humans alike. Report sightings, track rescues, and help us grow.</p>
      <div class="mt-9 flex flex-wrap justify-center gap-4">
        <button data-open-report class="btn-anim relative rounded-full bg-white px-7 py-3.5 font-semibold text-saffron-dark shadow-medium transition-transform duration-300 hover:-translate-y-0.5">Report a Sighting</button>
        <a href="mailto:${SUPPORT_EMAIL}" class="btn-anim btn-anim--ghost relative inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-7 py-3.5 font-semibold text-white transition-colors duration-300 hover:border-white">${ICON.mail(17)}Contact Us</a>
      </div>
    </div>
  </section>`;
  $('#learnMore').onclick = () => $('#how-it-works').scrollIntoView({ behavior: 'smooth' });
  const refresh = () => {
    $('#recent').innerHTML = cardsHtml(); observeReveals($('#recent'));
    const resolved = store.list.filter((d) => d.status === 'resolved').length;
    const pct = store.list.length ? Math.round((resolved / store.list.length) * 100) : 0;
    document.querySelectorAll('.stat').forEach((el) => {
      el.dataset.target = [resolved, resolved, pct][el.dataset.i];
      if (el.dataset.started) runCounter(el);
    });
  };
  document.querySelectorAll('.stat').forEach((el) => counterIO.observe(el));
  refresh(); store.subs.add(refresh);
  cleanup = () => store.subs.delete(refresh);
}

function pageTracker() {
  $('#app').innerHTML = `
  <section class="px-[5%] pb-16 pt-28 sm:pb-24 md:pt-40">
    <div ${reveal('mx-auto mb-8 max-w-2xl text-center sm:mb-12')}>
      <div class="mb-3 text-sm font-medium text-saffron-dark">Real-Time Monitoring</div>
      <h1 class="font-display text-fluid-h1 text-ink-dark">Live Tracker</h1>
      <p class="mt-4 text-ink-medium">Monitor active animal detections in real time. Red markers indicate animals currently on roads requiring immediate attention.</p></div>
    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div ${reveal('relative isolate h-[60vh] min-h-[340px] max-h-[620px] overflow-hidden rounded-lg shadow-medium lg:h-[620px]', 0.1)}>
        <div id="map" style="position:absolute;inset:0;width:100%;height:100%"></div>
        <div class="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-md bg-white px-3 py-2.5 shadow-medium sm:bottom-6 sm:left-6 sm:px-5 sm:py-4">
          <div class="mb-2 flex items-center gap-2 text-sm font-medium text-ink-dark"><span class="h-3 w-3 rounded-full bg-alert"></span>Active Alert</div>
          <div class="flex items-center gap-2 text-sm font-medium text-ink-dark"><span class="h-3 w-3 rounded-full bg-success"></span>Resolved</div></div></div>
      <div class="flex flex-col gap-6">
        <div ${reveal('rounded-lg bg-white p-6 shadow-soft', 0.2)}>
          <div class="mb-4 flex items-center gap-2 font-semibold text-ink-dark">${ICON.alert(18, 'text-alert')}Active Alerts
            <span id="alertCount" class="ml-auto rounded-full bg-alert px-3 py-0.5 text-xs font-semibold text-white">0</span></div>
          <div id="alerts"></div><p id="err" class="mt-3 hidden text-xs text-alert">Can't load detection data — retrying…</p></div>
        <div ${reveal('rounded-lg bg-white p-6 shadow-soft', 0.3)}>
          <div class="mb-4 flex items-center gap-2 font-semibold text-ink-dark">${ICON.chart(18, 'text-saffron')}Today's Overview</div>
          <div id="overview" class="grid grid-cols-2 gap-4"></div></div>
      </div>
    </div>
  </section>`;
  const map = L.map('map', { center: [25, 20], zoom: 2, minZoom: 2, maxZoom: 18, worldCopyJump: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', subdomains: 'abc' }).addTo(map);
  // Leaflet must re-measure its box once layout/Tailwind/animations settle, otherwise only part of the map gets tiles.
  const fix = () => map.invalidateSize();
  const ro = new ResizeObserver(fix); ro.observe($('#map'));
  [100, 400, 900, 1800].forEach((t) => setTimeout(fix, t));
  window.addEventListener('load', fix);
  const layer = L.layerGroup().addTo(map);
  const icon = (st) => L.divIcon({ className: '', html: `<div class="${st === 'resolved' ? 'gd-marker-resolved' : 'gd-marker-alert'}"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
  const refresh = () => {
    const all = store.list, active = all.filter((d) => d.status === 'active'), today = all.filter((d) => isTodayIST(d.timestamp));
    layer.clearLayers();
    all.forEach((d) => L.marker([d.lat, d.lng], { icon: icon(d.status) }).addTo(layer).bindPopup(
      `<div class="text-sm">${d.imagePath ? `<img src="${esc(d.imagePath)}" class="mb-2 h-28 w-48 max-w-full rounded object-cover">` : ''}<strong>${esc(d.animal)}</strong><br>${esc(d.location)}<br><span class="text-xs opacity-70">${formatTime(d.timestamp)}</span></div>`));
    $('#alertCount').textContent = active.length;
    $('#alerts').innerHTML = active.length === 0
      ? `<div class="py-6 text-center">${ICON.checkCircle(40, 'mx-auto mb-2 text-success/70', 1.4)}<p class="font-medium text-ink-dark">All Clear</p><p class="mt-1 text-sm text-ink-light">No active alerts at the moment.</p></div>`
      : `<ul class="space-y-3">${active.map((d) => `<li class="flex gap-3 rounded-md bg-cream p-3 text-sm text-ink-medium">${d.imagePath ? `<img src="${esc(d.imagePath)}" class="h-14 w-14 shrink-0 rounded object-cover">` : ''}<div><div class="font-medium text-ink-dark">${esc(d.animal)}</div><div>${esc(d.location)}</div><div class="text-xs text-ink-light">${formatTime(d.timestamp)}</div></div></li>`).join('')}</ul>`;
    const ov = [['Detections', today.length, 'text-saffron'], ['Resolved', today.filter((d) => d.status === 'resolved').length, 'text-success'], ['Pending', today.filter((d) => d.status === 'in-progress').length, 'text-amber'], ['Accidents', 0, 'text-terracotta']];
    $('#overview').innerHTML = ov.map(([l, v, c]) => `<div class="rounded-md bg-cream p-4 text-center"><div class="font-display text-2xl ${c}">${v}</div><div class="mt-1 text-xs text-ink-light">${l}</div></div>`).join('');
    $('#err').classList.toggle('hidden', !store.error);
  };
  refresh(); store.subs.add(refresh);
  cleanup = () => { store.subs.delete(refresh); ro.disconnect(); window.removeEventListener('load', fix); map.remove(); };
}

function pageImpact() {
  const sel = (id, label, opts) => `<div class="flex-1"><label class="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-light">${label}</label>
    <select id="${id}" class="w-full rounded-md border border-peach-dark bg-cream px-4 py-3 text-base text-ink-dark outline-none transition-colors focus:border-saffron sm:text-sm">${opts.map((o) => `<option>${o}</option>`).join('')}</select></div>`;
  $('#app').innerHTML = `
  <section class="px-[5%] pb-16 pt-28 sm:pb-24 md:pt-40">
    <div ${reveal('mx-auto mb-8 max-w-2xl text-center sm:mb-12')}>
      <div class="mb-3 text-sm font-medium text-saffron-dark">Rescue History</div>
      <h1 class="font-display text-fluid-h1 text-ink-dark">Impact &amp; History</h1>
      <p class="mt-4 text-ink-medium">Every detection, every rescue, every life saved — documented with photos, locations, and timestamps. Transparency in every action we take.</p></div>
    <div ${reveal('mx-auto mb-8 flex max-w-5xl flex-col gap-4 rounded-lg bg-white p-4 shadow-soft sm:mb-10 sm:flex-row sm:items-end sm:p-5', 0.1)}>
      ${sel('fDate', 'Date Range', DATE_RANGES)}${sel('fCity', 'Location', GUJARAT_CITIES)}${sel('fStatus', 'Status', STATUS_FILTERS)}</div>
    <div id="records"></div>
  </section>`;
  const refresh = () => {
    const range = RANGE_KEY[$('#fDate').value], city = $('#fCity').value, st = STATUS_KEY[$('#fStatus').value];
    const list = store.list.filter((d) => (!st || d.status === st) && (city === GUJARAT_CITIES[0] || d.city === city) && inRange(d.timestamp, range));
    $('#records').innerHTML = !store.loaded ? '<p class="text-center text-sm text-ink-light">Loading records…</p>'
      : list.length === 0 ? emptyBox(ICON.imageOff(56, 'mx-auto text-ink-light', 1.3), 'No Records Yet', 'When animals are detected and rescued, their photos, locations, and timestamps will be saved and displayed here automatically.', 'py-16')
      : `<div class="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">${list.map((d) => `
        <div class="overflow-hidden rounded-lg bg-white shadow-soft">${photo(d)}<div class="p-4">
          <div class="flex items-center justify-between"><span class="font-display text-lg text-ink-dark">${esc(d.animal)}</span>
            <span class="rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_STYLE[d.status] || ''}">${STATUS_LABEL[d.status] || ''}</span></div>
          <p class="mt-1 text-sm text-ink-medium">${esc(d.location)}</p><p class="mt-0.5 text-xs text-ink-light">${formatTime(d.timestamp)}</p></div></div>`).join('')}</div>`;
    observeReveals($('#records'));
  };
  ['fDate', 'fCity', 'fStatus'].forEach((id) => ($('#' + id).onchange = refresh));
  refresh(); store.subs.add(refresh);
  cleanup = () => store.subs.delete(refresh);
}

// ---------- ROUTER ----------
const ROUTES = { '#/': [pageHome, 'Gau Drishti — AI-Powered Animal Safety'], '#/tracker': [pageTracker, 'Live Tracker — Gau Drishti'], '#/impact': [pageImpact, 'Impact & History — Gau Drishti'] };
function route() {
  if (cleanup) { cleanup(); cleanup = null; }
  const key = (location.hash.replace(/\/$/, '') || '#/');
  const [fn, title] = ROUTES[key === '#' ? '#/' : key] || ROUTES['#/'];
  document.title = title; fn(); setActiveNav(); observeReveals(); window.scrollTo(0, 0);
}

// ---------- REPORT MODAL ----------
const GUJ_BOX = '68.0,24.9,74.6,19.5';
const inGujarat = (p) => p.lng >= 68 && p.lng <= 74.6 && p.lat >= 19.5 && p.lat <= 24.9;
const PIN_SVG = '<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))"><path d="M16 1C7.7 1 1 7.6 1 15.8 1 26.6 16 41 16 41s15-14.4 15-25.2C31 7.6 24.3 1 16 1z" fill="#DC2626" stroke="#fff" stroke-width="2"/><circle cx="16" cy="15.5" r="5.5" fill="#fff"/></svg>';

const modal = { pin: null, picker: null, marker: null, revCtl: null, searchCtl: null, deb: null, downOnBackdrop: false };
function openModal() {
  const root = $('#modal-root');
  modal.pin = null; modal.picker = null; modal.marker = null;
  root.innerHTML = `
  <div id="mBackdrop" class="fixed inset-0 z-[200] flex items-center justify-center bg-ink-dark/50 p-3 backdrop-blur-sm sm:p-4">
    <div class="modal-card relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 shadow-heavy sm:p-8">
      <button id="mClose" aria-label="Close modal" class="absolute right-5 top-5 text-ink-light transition-colors hover:text-ink-dark">${ICON.x(20)}</button>
      <div id="mForm">
        <h3 class="font-display text-2xl text-ink-dark">Report a Sighting</h3>
        <p class="mt-1 text-sm text-ink-light">Help us keep roads safe for animals and people.</p>
        <form id="rForm" class="mt-6 space-y-5">
          <div><label class="mb-2 block text-sm font-medium text-ink-dark">Photo</label>
            <label class="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-peach-dark bg-cream px-4 py-3 text-sm text-ink-medium transition-colors hover:border-saffron hover:bg-peach/40">
              ${ICON.imagePlus(18, 'text-saffron')}<span id="photoName">Add a photo</span><input id="photo" type="file" accept="image/*" class="hidden" /></label></div>
          <div class="relative"><label class="mb-2 block text-sm font-medium text-ink-dark">Location</label>
            <div class="relative"><span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light">${ICON.pin(16)}</span>
              <input id="loc" type="text" required autocomplete="off" placeholder="Search any place in the world..." class="w-full rounded-md border border-peach-dark bg-cream py-3 pl-10 pr-4 text-base text-ink-dark outline-none transition-colors focus:border-saffron sm:text-sm" /></div>
            <div id="sugg" class="absolute z-10 mt-1 hidden w-full overflow-hidden rounded-md border border-peach-dark bg-white shadow-medium"></div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button type="button" id="mapBtn" class="inline-flex items-center gap-1.5 rounded-full border border-peach-dark bg-cream px-3.5 py-2.5 text-xs font-medium text-ink-dark transition-colors hover:border-saffron hover:bg-peach/40"><span class="text-saffron">${ICON.mapPinned(14)}</span><span id="mapBtnTxt">Pin on map</span></button>
              <button type="button" id="gpsBtn" class="inline-flex items-center gap-1.5 rounded-full border border-peach-dark bg-cream px-3.5 py-2.5 text-xs font-medium text-ink-dark transition-colors hover:border-saffron hover:bg-peach/40"><span class="text-saffron">${ICON.locate(14)}</span><span id="gpsTxt">Use my location</span></button></div>
            <div id="mapWrap" class="mt-3 hidden"><div class="relative isolate h-56 overflow-hidden rounded-md border border-peach-dark sm:h-64"><div id="pickMap" style="position:absolute;inset:0;width:100%;height:100%"></div>
              <div id="mapHint" class="pointer-events-none absolute inset-x-0 top-2 z-[400] mx-auto w-max max-w-[90%] rounded-full bg-white/95 px-3 py-1 text-xs text-ink-medium shadow-soft">Tap the map to drop a pin</div></div>
              <p class="mt-1.5 text-xs text-ink-light">Drag the pin to adjust. Use +/− or pinch to zoom in for an exact spot.</p></div>
            <div id="pinInfo" class="mt-2 hidden items-center justify-between gap-3 rounded-md bg-cream px-3 py-2 text-xs text-ink-medium"></div>
            <p id="locErr" class="mt-2 hidden text-xs text-alert"></p></div>
          <div><label class="mb-2 block text-sm font-medium text-ink-dark">Description</label>
            <textarea id="desc" required rows="3" placeholder="Brief description of the animal and situation..." class="w-full resize-none rounded-md border border-peach-dark bg-cream px-4 py-3 text-base text-ink-dark outline-none transition-colors focus:border-saffron sm:text-sm"></textarea></div>
          <button type="submit" id="submitBtn" class="${BTN_SOLID} flex w-full items-center justify-center py-3.5 disabled:opacity-70">Submit Report</button>
        </form></div>
    </div></div>`;
  document.body.style.overflow = 'hidden';
  const bd = $('#mBackdrop'), loc = $('#loc'), sugg = $('#sugg'), err = $('#locErr');
  bd.onmousedown = (e) => (modal.downOnBackdrop = e.target === bd);
  bd.onclick = () => modal.downOnBackdrop && closeModal();
  $('#mClose').onclick = closeModal;
  $('#photo').onchange = (e) => ($('#photoName').textContent = e.target.files[0]?.name || 'Add a photo');
  const showErr = (m) => { err.textContent = m; err.classList.toggle('hidden', !m); };

  function setPin(lat, lng, fly, zoom) {
    modal.pin = { lat, lng }; showErr('');
    $('#mapHint').classList.add('hidden');
    const info = $('#pinInfo'); info.classList.remove('hidden'); info.classList.add('flex');
    info.innerHTML = `<span class="min-w-0 break-words"><span class="mr-1 inline-block align-middle text-alert">${ICON.pin(12)}</span>Pinned: ${lat.toFixed(5)}, ${lng.toFixed(5)}<span id="resolving" class="ml-2 hidden text-ink-light">Finding address…</span></span><button type="button" id="clearPin" class="shrink-0 font-medium text-saffron-dark hover:underline">Clear</button>`;
    $('#clearPin').onclick = () => { modal.pin = null; loc.value = ''; info.classList.add('hidden'); info.classList.remove('flex'); if (modal.marker) { modal.marker.remove(); modal.marker = null; } $('#mapHint').classList.remove('hidden'); };
    if (modal.picker) {
      if (!modal.marker) {
        modal.marker = L.marker([lat, lng], { draggable: true, icon: L.divIcon({ className: '', html: PIN_SVG, iconSize: [32, 42], iconAnchor: [16, 41] }) }).addTo(modal.picker);
        modal.marker.on('dragend', () => { const p = modal.marker.getLatLng(); setPin(p.lat, p.lng); fillAddress(p.lat, p.lng); });
      } else modal.marker.setLatLng([lat, lng]);
      if (fly) modal.picker.flyTo([lat, lng], zoom, { duration: 0.8 });
    }
  }
  function showMap() {
    $('#mapWrap').classList.remove('hidden'); $('#mapBtnTxt').textContent = 'Hide map';
    if (modal.picker) return;
    modal.picker = L.map('pickMap', { center: modal.pin ? [modal.pin.lat, modal.pin.lng] : [22.7, 71.6], zoom: modal.pin ? 16 : 7, minZoom: 2, maxZoom: 18, worldCopyJump: true, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', subdomains: 'abc' }).addTo(modal.picker);
    modal.picker.on('click', (e) => { setPin(e.latlng.lat, e.latlng.lng); fillAddress(e.latlng.lat, e.latlng.lng); });
    new ResizeObserver(() => modal.picker && modal.picker.invalidateSize()).observe($('#pickMap'));
    setTimeout(() => { modal.picker.invalidateSize(); if (modal.pin) { const p = modal.pin; modal.pin = null; setPin(p.lat, p.lng); } }, 350);
  }
  $('#mapBtn').onclick = () => {
    if ($('#mapWrap').classList.contains('hidden')) showMap();
    else { $('#mapWrap').classList.add('hidden'); $('#mapBtnTxt').textContent = 'Pin on map'; }
  };
  async function fillAddress(lat, lng) {
    modal.revCtl?.abort(); const ctl = (modal.revCtl = new AbortController());
    $('#resolving')?.classList.remove('hidden');
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18`, { signal: ctl.signal });
      const d = r.ok ? await r.json() : null; loc.value = d?.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch (e) { if (e.name === 'AbortError') return; loc.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`; }
    $('#resolving')?.classList.add('hidden');
  }
  loc.oninput = () => {
    clearTimeout(modal.deb); const v = loc.value.trim();
    if (v.length < 3) return sugg.classList.add('hidden');
    modal.deb = setTimeout(async () => {
      modal.searchCtl?.abort(); const ctl = (modal.searchCtl = new AbortController());
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(v)}&limit=6`, { signal: ctl.signal });
        if (!r.ok) return; const data = await r.json();
        sugg.classList.remove('hidden');
        sugg.innerHTML = data.length === 0 ? '<div class="px-4 py-3 text-sm text-ink-light">No matching places found.</div>'
          : data.map((p, i) => `<button type="button" data-i="${i}" class="block w-full px-4 py-2.5 text-left text-sm text-ink-medium transition-colors hover:bg-peach">${esc(p.display_name)}</button>`).join('');
        sugg.onclick = (e) => {
          const b = e.target.closest('button'); if (!b) return; const p = data[b.dataset.i];
          loc.value = p.display_name; sugg.classList.add('hidden'); modal.revCtl?.abort();
          showMap(); setTimeout(() => setPin(parseFloat(p.lat), parseFloat(p.lon), true, 16), 360);
        };
      } catch (e) { /* offline/aborted: ignore */ }
    }, 400);
  };
  loc.onblur = () => setTimeout(() => sugg.classList.add('hidden'), 150);
  $('#gpsBtn').onclick = () => {
    if (!navigator.geolocation) return showErr('Your browser does not support location access.');
    $('#gpsTxt').textContent = 'Locating…'; showErr('');
    navigator.geolocation.getCurrentPosition((pos) => {
      $('#gpsTxt').textContent = 'Use my location';
      const { latitude: lat, longitude: lng } = pos.coords; showMap();
      setTimeout(() => { setPin(lat, lng, true, 17); fillAddress(lat, lng); }, 360);
    }, (e) => {
      $('#gpsTxt').textContent = 'Use my location';
      showErr(e.code === e.PERMISSION_DENIED ? 'Location permission was denied. Allow it in your browser, or pin the spot on the map.' : 'Could not get your location. Please pin the spot on the map.');
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  };
  $('#rForm').onsubmit = (e) => {
    e.preventDefault();
    if (!modal.pin) { showMap(); return showErr('Please drop a pin on the map (or pick a search result / use your location).'); }
    const b = $('#submitBtn'); b.disabled = true; b.textContent = 'Submitting...';
    // No backend in this static build — the report is only acknowledged locally.
    setTimeout(() => {
      $('#mForm').innerHTML = `<div class="fade-up py-4 text-center"><div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">${ICON.check(28, '', 2.5)}</div>
        <h4 class="font-display text-xl text-ink-dark">Thank you!</h4><p class="mt-2 text-sm text-ink-light">Your report has been received. Our team will act on it shortly.</p>
        <button id="thanksClose" class="btn-anim btn-anim--ghost mt-6 rounded-full bg-cream px-6 py-2.5 text-sm font-medium text-ink-dark transition-colors hover:bg-peach">Close</button></div>`;
      $('#thanksClose').onclick = closeModal;
    }, 700);
  };
}
function closeModal() {
  modal.revCtl?.abort(); modal.searchCtl?.abort(); clearTimeout(modal.deb);
  modal.picker?.remove(); modal.picker = null;
  $('#modal-root').innerHTML = ''; document.body.style.overflow = '';
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-open-report]')) openModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#mBackdrop')) closeModal(); });

// ---------- START ----------
renderNavbar(); renderFooter();
window.addEventListener('hashchange', route);
route();
window.addEventListener('load', () => setTimeout(() => $('#preloader').classList.add('hide'), 900));
setTimeout(() => $('#preloader').classList.add('hide'), 2500); // safety net
