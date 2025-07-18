// —— CONFIG ——
const OWM_API_KEY = window.OWM_API_KEY;
if (!OWM_API_KEY) {
  console.error('Missing OpenWeatherMap API key – create assets/js/config.js with window.OWM_API_KEY');
}


const MARKHAM_COORDS        = [43.8561, -79.3370];
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

console.log('main.js loaded');

// —— INITIALIZE MAP ——
const map = L.map('map', {
  center: MARKHAM_COORDS,
  zoom: 11,
  zoomControl: false
});

// Dark base‐map
L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  { attribution: '&copy; CartoDB; &copy; OpenStreetMap', maxZoom: 19 }
).addTo(map);

// —— LIVE CLOUDS & WIND LAYERS —— 
const cloudsLayer = L.tileLayer(
  `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
  { opacity: 0.45, zIndex: 100 }
).addTo(map);

const windLayer = L.tileLayer(
  `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
  { opacity: 0.6, zIndex: 150 }
).addTo(map);

// Refresh cloud & wind every 5 minutes to bypass tile caching
setInterval(() => {
  cloudsLayer.redraw();
  windLayer.redraw();
}, AUTO_REFRESH_INTERVAL);

// —— PERSISTENT NEUTRAL RINGS —— 
[5, 10, 20, 40, 80].forEach(km => {
  L.circle(MARKHAM_COORDS, {
    radius: km * 1000,
    color: '#888',
    weight: 2,
    fill: false
  }).addTo(map);
});

// —— COMPACT LEGEND —— 
const legend = L.control({ position: 'bottomleft' });
legend.onAdd = () => {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = `
    <h4>Radius (km)</h4>
    <div><span class="swatch"></span>5</div>
    <div><span class="swatch"></span>10</div>
    <div><span class="swatch"></span>20</div>
    <div><span class="swatch"></span>40</div>
    <div><span class="swatch"></span>80</div>
  `;
  return div;
};
legend.addTo(map);

// —— RAINVIEWER RADAR LAYER —— 
let radarLayer = null;
async function loadRadar() {
  console.log('↻ loadRadar()');
  document.getElementById('loader').style.display = 'block';
  try {
    const res  = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    const json = await res.json();
    const latest = json.radar[ json.radar.length - 1 ].time;
    const url = `https://tilecache.rainviewer.com/v2/radar/${latest}/{z}/{x}/{y}/2/1_1.png`;

    if (radarLayer) map.removeLayer(radarLayer);
    radarLayer = L.tileLayer(url, {
      opacity: 0.7,
      zIndex: 200
    }).addTo(map);

    console.log('✔ Radar overlaid');
  } catch (err) {
    console.error('✖ Radar load failed', err);
  } finally {
    document.getElementById('loader').style.display = 'none';
  }
}

// —— AUTO-REFRESH RADAR —— 
loadRadar();
setInterval(loadRadar, AUTO_REFRESH_INTERVAL);