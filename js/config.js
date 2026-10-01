// ===== SETTINGS & STATIC COPY (edit here) =====
const SUPPORT_EMAIL = 'gaudrishti@gmail.com';

// Detections are read from this URL. Default: the static file data/detections.json (edit by hand).
// For a real backend later, set e.g. 'https://your-server.com/api/detections'
// (must return an array or { detections: [...] }).
const DETECTIONS_URL = 'data/detections.json';
const POLL_MS = 5000;

const NAV_LINKS = [
  { label: 'Home', href: '#/' },
  { label: 'Live Tracker', href: '#/tracker' },
  { label: 'Impact', href: '#/impact' },
];
const GUJARAT_CITIES = ['All Locations','Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Gandhinagar','Junagadh','Gandhidham','Anand','Nadiad','Morbi','Surendranagar','Bharuch','Vapi','Navsari','Veraval','Porbandar','Godhra','Dahod','Botad','Amreli','Palanpur','Patan','Mahesana'];
const DATE_RANGES = ['All Time','Today','Yesterday','This Week','This Month'];
const STATUS_FILTERS = ['All Status','Active','In Progress','Resolved'];
const PROCESS_STEPS = [
  { title: 'AI Camera Detects', desc: 'Advanced computer vision scans roads 24/7, identifying animals with high accuracy.' },
  { title: 'Alert Sent', desc: 'Instant notification dispatched to the nearest municipal response team with exact GPS location.' },
  { title: 'Team Dispatched', desc: 'Trained animal rescue personnel rush to the location equipped for safe handling.' },
  { title: 'Animal Relocated', desc: 'Safely transported to shelters or designated safe zones, preventing accidents.' },
];
const MISSION_CARDS = [
  { title: 'Our Mission', desc: 'To eliminate animal-related road accidents through real-time AI detection and rapid municipal response, ensuring safety for all beings.' },
  { title: 'Our Vision', desc: 'A world where technology serves compassion — where every road is safe for both humans and animals to coexist peacefully.' },
  { title: 'Our Values', desc: 'Compassion first, technology second. We believe in transparency, rapid action, and treating every animal with dignity and care.' },
];
const STATS = [{ label: 'Animals Saved' }, { label: 'Accidents Prevented' }, { label: 'Reports Resolved', suffix: '%' }];
const STATUS_LABEL = { active: 'Active', 'in-progress': 'In Progress', resolved: 'Resolved' };
const STATUS_STYLE = { active: 'bg-alert text-white', 'in-progress': 'bg-amber text-white', resolved: 'bg-success text-white' };
const RANGE_KEY = { 'All Time': null, Today: 'today', Yesterday: 'yesterday', 'This Week': 'week', 'This Month': 'month' };
const STATUS_KEY = { 'All Status': null, Active: 'active', 'In Progress': 'in-progress', Resolved: 'resolved' };

// Inline SVG icons (Lucide-style) — no icon library needed
const _i = (p) => (size = 20, cls = '', sw = 2) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" class="${cls}">${p}</svg>`;
const HEART = '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>';
const SHIELD = '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>';
const ICON = {
  menu: _i('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  x: _i('<path d="M18 6 6 18M6 6l12 12"/>'),
  arrowRight: _i('<path d="M5 12h14M12 5l7 7-7 7"/>'),
  bell: _i('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
  shield: _i(SHIELD + '<path d="m9 12 2 2 4-4"/>'),
  shieldAlert: _i(SHIELD + '<path d="M12 8v4M12 16h.01"/>'),
  mail: _i('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
  check: _i('<path d="M20 6 9 17l-5-5"/>'),
  checkCircle: _i('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  download: _i('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
  imageOff: _i('<path d="M2 2l20 20M10.41 10.41a2 2 0 1 1-2.83-2.83M13.5 13.5 6 21M18 12l3 3M3.59 3.59A2 2 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.05-.22 1.41-.59M21 15V5a2 2 0 0 0-2-2H9"/>'),
  imagePlus: _i('<path d="M16 5h6M19 2v6M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/><circle cx="9" cy="9" r="2"/>'),
  pin: _i('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>'),
  locate: _i('<path d="M2 12h3M19 12h3M12 2v3M12 19v3"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>'),
  alert: _i('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01"/>'),
  chart: _i('<path d="M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3"/>'),
  heart: _i(HEART),
  handshake: _i(HEART + '<path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/>'),
  target: _i('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  eye: _i('<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>'),
  camera: _i('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>'),
  mapPinned: _i('<path d="M18 8c0 3.61-6.12 9.8-6.38 10.06a.85.85 0 0 1-1.24 0C10.12 17.8 4 11.61 4 8a7 7 0 0 1 14 0"/><circle cx="11" cy="8" r="2"/>'),
  truck: _i('<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>'),
  heartPulse: _i(HEART + '<path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>'),
};
