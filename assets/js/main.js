const OWM_API_KEY = window.OWM_API_KEY;
if (!OWM_API_KEY) {
  console.error('Missing OpenWeatherMap API key – create assets/js/config.js with window.OWM_API_KEY');
}

const MARKHAM_COORDS = [43.8561, -79.3370];
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

console.log('Weather Radar App - main.js loaded');

// —— INITIALIZE MAP ——
const map = L.map('map', {
  center: MARKHAM_COORDS,
  zoom: 10,
  zoomControl: true,
  preferCanvas: true
});

// Add zoom control
map.zoomControl.setPosition('topleft');

// Dark base map - using CartoDB Dark Matter-
const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  maxZoom: 19,
  subdomains: 'abcd'
});
baseLayer.addTo(map);

// —— DISTANCE RINGS & MARKERS ——
const ringDistances = [10, 25, 50, 75, 100]; // km
ringDistances.forEach(distance => {
  const ring = L.circle(MARKHAM_COORDS, {
    radius: distance * 1000, // Convert to meters
    className: 'distance-ring',
    interactive: false
  });
  ring.addTo(map);
});

// Add center marker for Markham
const centerMarker = L.circleMarker(MARKHAM_COORDS, {
  radius: 6,
  fillColor: '#10b981',
  color: '#ffffff',
  weight: 2,
  opacity: 1,
  fillOpacity: 1
});
centerMarker.addTo(map);

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
    return;
  }

  try {
    console.log('Loading weather data...');
    
    // Current weather - USING HTTPS
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
    console.log('Current weather data:', currentData);

    // Update current weather display
    updateCurrentWeather(currentData);

    // 5-day forecast - USING HTTPS
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
    console.log('Forecast data:', forecastData);
    
    updateForecast(forecastData);

    console.log('Weather data updated successfully');
  } catch (error) {
    console.error('Error loading weather data:', error);
    displayWeatherError();
  }
}

function updateCurrentWeather(data) {
  console.log('Updating current weather display:', data);
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  document.getElementById('windSpeed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
}

function updateForecast(data) {
  console.log('Updating forecast display:', data);
  
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
}

function displayWeatherError() {
  console.log('Displaying weather error state');
  document.getElementById('temperature').textContent = 'Error';
  document.getElementById('humidity').textContent = 'Error';
  document.getElementById('windSpeed').textContent = 'Error';
  document.getElementById('pressure').textContent = 'Error';
  document.getElementById('forecast').innerHTML = '<div style="color: #ef4444; font-size: 12px;">Unable to load forecast</div>';
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
    
    if (data.radar && data.radar.length > 0) {
      const latest = data.radar[data.radar.length - 1];
      const radarUrl = `https://tilecache.rainviewer.com/v2/radar/${latest.time}/{z}/{x}/{y}/2/1_1.png`;
      
      // Remove existing precipitation layer
      if (precipitationLayer) {
        map.removeLayer(precipitationLayer);
      }
      
      // Add new precipitation layer
      precipitationLayer = L.tileLayer(radarUrl, {
        opacity: 0.6,
        zIndex: 200
      });
      precipitationLayer.addTo(map);
      
      console.log('Radar updated successfully');
    } else {
      throw new Error('No radar data available');
    }
  } catch (error) {
    console.error('Error loading radar:', error);
  }
  
  hideLoader();
}

// —— ADDITIONAL WEATHER LAYERS ——
function addWeatherLayers() {
  if (!OWM_API_KEY) {
    console.warn('Skipping OpenWeatherMap layers - API key not configured');
    return;
  }

  try {
    // Clouds layer - USING HTTPS
    cloudsLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
      {
        opacity: 0.3,
        zIndex: 100
      }
    );
    cloudsLayer.addTo(map);

    // Wind layer - USING HTTPS
    windLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
      {
        opacity: 0.4,
        zIndex: 150
      }
    );
    windLayer.addTo(map);

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
  if (windLayer) {
    windLayer.redraw();
  }
}

// —— INITIALIZATION ——
async function initialize() {
  console.log('Initializing weather radar app...');
  console.log('API Key present:', !!OWM_API_KEY);
  
  try {
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
  map.invalidateSize();
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
// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}