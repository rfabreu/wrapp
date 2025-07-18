// —— CONFIG ——
const MARKHAM_COORDS        = [43.8561, -79.3370];
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

console.log('🛠️ main.js loaded');

// —— INIT MAP ——
const map = L.map('map', {
  center: MARKHAM_COORDS,
  zoom: 11,
  zoomControl: false
});

// Dark (CartoDB) base layer
L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  { attribution: '&copy; CartoDB; &copy; OpenStreetMap', maxZoom: 19 }
).addTo(map);

// —— PERSISTENT RADIUS RINGS —— 
[5, 10, 20, 40, 80].forEach(km => {
  L.circle(MARKHAM_COORDS, {
    radius: km * 1000,
    color: '#888',   // neutral gray
    weight: 2,
    fill: false
  }).addTo(map);
});

// —— LEGEND —— 
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

// —— RADAR LAYER ——
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