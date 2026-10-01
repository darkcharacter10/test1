# Gau Drishti — static version (no npm)

## Run
1. Open this folder in VS Code.
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.

(Needs internet: Tailwind, Leaflet, fonts and map tiles load from CDNs.)

## Files
- `index.html`        page shell + CDN scripts
- `css/styles.css`    original global styles + replacement animations
- `js/tailwind-config.js`  brand colours/fonts
- `js/config.js`      text content, city list, icons, DETECTIONS_URL
- `js/app.js`         routing (#/ #/tracker #/impact), pages, map, report modal
- `data/detections.json`   put detections here (see below)

## Detections format (data/detections.json)
[{ "id":"1","animal":"Cow","location":"Near Ahmedabad","city":"Ahmedabad","lat":23.02,"lng":72.57,
   "timestamp":"2026-10-01T10:30:00+05:30","status":"active|in-progress|resolved","imagePath":"" }]

## Removed
Next.js, React, framer-motion, react-leaflet, lucide-react, TypeScript, PostCSS, ESLint, package.json,
and the Node backend (app/api, lib/server, /admin) — these need Node and can't run on Live Server.
The raspberry-pi/ folder is unchanged and not included; point DETECTIONS_URL at a server later if you want live data.
