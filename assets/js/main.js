const OWM_API_KEY = window.OWM_API_KEY;

if (!OWM_API_KEY) {
  console.error('Missing OpenWeatherMap API key - check GitHub Secrets configuration');
}

// Updated coordinates for the new center location
const MARKHAM_COORDS = [43.828491, -79.332114];
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

console.log('Weather Radar App - main.js loaded');
console.log('API Key present:', !!OWM_API_KEY);

// —— MAP INITIALIZATION (will be done after DOM loads) ——
let map = null;
let baseLayer = null;

// —— MAP SETUP ——
// Store center marker
let centerMarker = null;

function getInitialZoom() {
  // Check if mobile (using same breakpoint as CSS)
  const isMobile = window.innerWidth <= 480;
  return isMobile ? 8.5 : 11; // Slightly more zoomed in on mobile to show Markham
}

function initializeMap() {
  console.log('Initializing Leaflet map...');
  
  const initialZoom = getInitialZoom();
  console.log(`Setting initial zoom level: ${initialZoom} (mobile: ${window.innerWidth <= 480})`);
  
  // Initialize the map
  map = L.map('map', {
    center: MARKHAM_COORDS,
    zoom: initialZoom,
    zoomControl: true,
    preferCanvas: true
  });

  // Add zoom control
  map.zoomControl.setPosition('topleft');

  // Simple terrain base map - clean satellite view without excessive detail
  baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd'
  });
  baseLayer.addTo(map);

  // Add center marker for main location with ping effect
  centerMarker = L.marker(MARKHAM_COORDS, {
    icon: L.divIcon({
      className: 'center-marker-container',
      html: '<div class="center-marker-dot"></div><div class="center-marker-ping"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    }),
    interactive: false
  });
  centerMarker.addTo(map);

  console.log('Map initialized successfully');
}

// —— WEATHER LAYERS ——
let precipitationLayer = null;
let cloudsLayer = null;
let windLayer = null;

// —— UTILITY FUNCTIONS ——
function showLoader() {
  document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}

// —— WEATHER DATA FUNCTIONS ——
async function loadWeatherData() {
  if (!OWM_API_KEY) {
    console.warn('OpenWeatherMap API key not configured');
    displayWeatherError('API key not configured');
    return;
  }

  try {
    console.log('Loading weather data...');
    
    // Current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${MARKHAM_COORDS[0]}&lon=${MARKHAM_COORDS[1]}&appid=${OWM_API_KEY}&units=metric`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    console.log('Current weather response status:', currentResponse.status);
    
    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();
      console.error('Current weather API error response:', errorText);
      throw new Error(`Weather API error: ${currentResponse.status} - ${errorText}`);
    }
    
    const currentData = await currentResponse.json();
    console.log('Current weather data loaded successfully');

    // Update current weather display
    updateCurrentWeather(currentData);

    // 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${MARKHAM_COORDS[0]}&lon=${MARKHAM_COORDS[1]}&appid=${OWM_API_KEY}&units=metric`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    console.log('Forecast response status:', forecastResponse.status);
    
    if (!forecastResponse.ok) {
      const errorText = await forecastResponse.text();
      console.error('Forecast API error response:', errorText);
      throw new Error(`Forecast API error: ${forecastResponse.status} - ${errorText}`);
    }
    
    const forecastData = await forecastResponse.json();
    console.log('Forecast data loaded successfully');
    
    updateForecast(forecastData);

    console.log('All weather data updated successfully');
  } catch (error) {
    console.error('Error loading weather data:', error);
    displayWeatherError(error.message);
  }
}

function updateCurrentWeather(data) {
  try {
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    console.log('Current weather display updated');
  } catch (error) {
    console.error('Error updating current weather display:', error);
  }
}

function updateForecast(data) {
  try {
    // Process forecast data (daily highs/lows)
    const dailyData = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toDateString();
      
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = {
          temps: [],
          date: date
        };
      }
      dailyData[dateStr].temps.push(item.main.temp);
    });

    const forecastHTML = Object.values(dailyData)
      .slice(0, 5)
      .map(day => {
        const high = Math.round(Math.max(...day.temps));
        const low = Math.round(Math.min(...day.temps));
        const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' });
        
        return `
          <div class="forecast-day">
            <span class="day-name">${dayName}</span>
            <span class="day-temps">
              <span class="day-high">${high}°</span> / ${low}°
            </span>
          </div>
        `;
      }).join('');

    document.getElementById('forecast').innerHTML = forecastHTML;
    console.log('Forecast display updated');
  } catch (error) {
    console.error('Error updating forecast display:', error);
  }
}

function displayWeatherError(message = 'Unable to load data') {
  console.log('Displaying weather error state:', message);
  document.getElementById('temperature').textContent = 'Error';
  document.getElementById('humidity').textContent = 'Error';
  document.getElementById('windSpeed').textContent = 'Error';
  document.getElementById('pressure').textContent = 'Error';
  document.getElementById('forecast').innerHTML = `<div style="color: #ef4444; font-size: 12px;">${message}</div>`;
}

// —— RADAR FUNCTIONS ——
async function loadRadar() {
  console.log('↻ Loading radar data...');
  showLoader();
  
  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    
    if (!response.ok) {
      throw new Error(`RainViewer API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('RainViewer API response structure:', Object.keys(data));
    
    let radarTimestamp = null;
    
    // Try different possible API response structures
    if (data.radar && data.radar.past && Array.isArray(data.radar.past) && data.radar.past.length > 0) {
      radarTimestamp = data.radar.past[data.radar.past.length - 1].time;
      console.log('Using past radar data');
    } else if (data.radar && data.radar.nowcast && Array.isArray(data.radar.nowcast) && data.radar.nowcast.length > 0) {
      radarTimestamp = data.radar.nowcast[0].time;
      console.log('Using nowcast radar data');
    } else if (data.radar && Array.isArray(data.radar) && data.radar.length > 0) {
      radarTimestamp = data.radar[data.radar.length - 1].time;
      console.log('Using direct radar array');
    } else if (data.past && Array.isArray(data.past) && data.past.length > 0) {
      radarTimestamp = data.past[data.past.length - 1].time;
      console.log('Using top-level past array');
    }
    
    if (radarTimestamp) {
      const radarUrl = `https://tilecache.rainviewer.com/v2/radar/${radarTimestamp}/256/{z}/{x}/{y}/2/1_1.png`;
      
      // Remove existing precipitation layer
      if (precipitationLayer && map) {
        map.removeLayer(precipitationLayer);
      }
      
      // Add new precipitation layer
      precipitationLayer = L.tileLayer(radarUrl, {
        opacity: 0.7,
        zIndex: 200
      });
      
      if (map) {
        precipitationLayer.addTo(map);
      }
      
      console.log('Radar updated successfully with timestamp:', radarTimestamp);
    } else {
      console.warn('No radar data found in any expected format');
      console.log('Full API response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error loading radar:', error);
    // Don't let radar errors block the application
  }
  
  hideLoader();
}

// —— ADDITIONAL WEATHER LAYERS ——
function addWeatherLayers() {
  if (!OWM_API_KEY || !map) {
    console.warn('Skipping OpenWeatherMap layers - API key not configured or map not initialized');
    return;
  }

  try {
    // Clouds layer
    cloudsLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
      {
        opacity: 0.25,
        zIndex: 100
      }
    );
    cloudsLayer.addTo(map);

    console.log('Weather layers added successfully');
  } catch (error) {
    console.error('Error adding weather layers:', error);
  }
}

// —— AUTO-REFRESH FUNCTIONS ——
function refreshAllLayers() {
  console.log('Refreshing all layers...');
  
  // Refresh weather data
  loadWeatherData();
  
  // Refresh radar
  loadRadar();
  
  // Refresh tile layers to bypass caching
  if (cloudsLayer) {
    cloudsLayer.redraw();
  }
}

// —— INITIALIZATION ——
async function initialize() {
  console.log('Initializing weather radar app...');
  console.log('Environment: GitHub Pages deployment with secure API key injection');
  
  try {
    // Initialize the map first
    initializeMap();
    
    // Load initial data
    await Promise.all([
      loadRadar(),
      loadWeatherData()
    ]);
    
    // Add weather layers
    addWeatherLayers();
    
    // Set up auto-refresh
    setInterval(refreshAllLayers, AUTO_REFRESH_INTERVAL);
    
    console.log('Weather radar app initialized successfully');
    console.log(`Auto-refresh enabled: ${AUTO_REFRESH_INTERVAL / 1000 / 60} minutes`);
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

// —— EVENT HANDLERS ——
// Handle map resize
window.addEventListener('resize', () => {
  if (map && typeof map.invalidateSize === 'function') {
    map.invalidateSize();
  }
});

// Handle errors
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

// —— START THE APP ——
// Wait for DOM and Leaflet to be fully loaded
function startApp() {
  if (typeof L === 'undefined') {
    console.log('Waiting for Leaflet to load...');
    setTimeout(startApp, 100);
    return;
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
}

// Start the application
startApp();