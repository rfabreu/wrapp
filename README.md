# WRAPP - Weather Radar Dashboard

**A lightweight, weather radar visualization system optimized for satellite operations in targeted locations and professional meteorological applications.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview


### Key Features

- **Real-time Radar Data** - Live precipitation overlay using RainViewer API with 5-minute update intervals
- **Professional Weather Intelligence** - Current conditions, wind patterns, and 5-day (optional) forecasting
- **Satellite Operations Optimized** - Locked on targeted coordinates for operational environments
- **Multi-layer Weather Visualization** - Precipitation, clouds, and atmospheric conditions
- **Responsive Design** - Optimized for desktop workstations and mobile field operations
- **Interactive Timeline** - Live real-time reading for reliability
- **Location-Specific Data** - Centered on Markham, Ontario with precise meteorological data facilitation Nextologies' daily operations

## Technology Stack

### Frontend
- **Leaflet.js** - Interactive mapping framework with performance optimizations
- **Vanilla JavaScript** - Lightweight, dependency-free implementation
- **CSS3** - Modern styling with backdrop blur effects and animations
- **HTML5** - Semantic markup with accessibility considerations

### Data Sources
- **RainViewer API** - High-resolution radar imagery and precipitation data
- **OpenWeatherMap API** - Current conditions, forecasts, and atmospheric layers
- **CARTO Voyager** - Professional-grade base mapping tiles

### Infrastructure
- **GitHub Pages** - Automated deployment with CI/CD pipeline
- **GitHub Actions** - Secure API key injection and build automation
- **Progressive Enhancement** - Graceful degradation for various network conditions

## Quick Start

### Prerequisites
- OpenWeatherMap API key ([Get one here](https://openweathermap.org/api))
- Modern web browser with JavaScript enabled
- HTTPS environment for secure API access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/wrapp.git
   cd wrapp
   ```

2. **Configure API access**
   - Add `OWM_API_KEY` to your GitHub repository secrets
   - Or create `assets/js/config.js` locally:
   ```javascript
   window.OWM_API_KEY = 'your_api_key_here';
   ```

3. **Deploy**
   - **GitHub Pages**: Push to main branch (automatic deployment)
   - **Local Development**: Serve files via HTTP server
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js
   npx serve .
   ```

4. **Access Application**
   - GitHub Pages: `https://username.github.io/wrapp`
   - Local: `http://localhost:8000`

## Architecture

### Core Components

```
wrapp/
├── index.html              # Main application entry point
├── assets/
│   ├── css/
│   │   └── style.css       # Comprehensive styling system
│   └── js/
│       ├── main.js         # Core application logic
│       ├── forecast.js     # Weather data management
│       ├── timeline.js     # Time-based controls
│       └── config.js       # API configuration (auto-generated)
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD automation
└── README.md
```

### API Integration

**RainViewer Integration**
- Endpoint: `https://api.rainviewer.com/public/weather-maps.json`
- Data: Real-time radar reflectivity with color-coded precipitation intensity
- Update Frequency: Every 5 minutes
- Coverage: Global radar data with high resolution for North America

**OpenWeatherMap Integration**
- Current Weather: `/data/2.5/weather`
- Forecasting: `/data/2.5/forecast`
- Map Layers: Precipitation, clouds, wind overlays
- Location: Set your parameters

## Features Documentation

### Real-Time Weather Intelligence

#### Precipitation Radar
- **Reflectivity Scale**: 0-55+ dBZ with professional color coding
- **Update Cycle**: Automatic refresh every 5 minutes
- **Historical Data**: Access to recent precipitation patterns
- **Intensity Mapping**: Clear distinction between light rain and severe storms

#### Current Conditions Panel
- **Temperature**: Real-time with metric units
- **Wind Analysis**: Speed (km/h) and directional data with compass bearings
- **Precipitation Type**: Automated classification (rain, snow, freezing rain, mixed)
- **Live Status**: Connection indicator with update timestamps

#### Extended Forecasting
- **5-Day Outlook**: Daily high/low temperature trends
- **Collapsible Interface**: Space-optimized for professional use
- **Mobile Responsive**: Accessible on field devices

### Interactive Controls

#### Timeline Navigation
- **Live Mode**: Real-time data with automatic updates

#### Map Interactions
- **Zoom Controls**: Optimized for various screen sizes
- **Center Marker**: Animated ping indicator for primary location
- **Layer Management**: Multiple weather overlays with transparency controls

### Professional Design Elements

#### Dark Theme Optimization
- **Balanced Contrast Elements**: Clear visibility of critical information
- **Professional Aesthetics**: Modern glassmorphism effects with backdrop blur
- **Satellite Operations Ready**: Optimized for 24/7 operational environments

#### Responsive Interface
- **Desktop Workstations**: Full feature set with expanded panels
- **Mobile Devices**: Optimized layout with collapsible sections
- **Performance Tuned**: Efficient rendering for various hardware capabilities

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OWM_API_KEY` | OpenWeatherMap API key | Yes |

### Map Configuration

```javascript
// Default coordinates (Set your own)
const MARKHAM_COORDS = [00.000000, -00.000000];

// Zoom levels
const DESKTOP_ZOOM = 11;
const MOBILE_ZOOM = 8.5;

// Update intervals
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
```

### Performance Tuning

```javascript
// Tile layer optimizations
const tileOptions = {
  keepBuffer: 8,
  updateWhenIdle: true,
  updateWhenZooming: false,
  detectRetina: true
};
```

## Deployment

### GitHub Pages (Optional)

1. **Repository Setup**
   ```bash
   # Fork or clone repository
   git clone https://github.com/username/wrapp.git
   ```

2. **Configure Secrets**
   - Add secret: `OWM_API_KEY` with your OpenWeatherMap API key

3. **Enable GitHub Pages**


### Manual Deployment

```bash
# Build configuration
mkdir -p assets/js
echo "window.OWM_API_KEY = 'your_api_key';" > assets/js/config.js

# Deploy to web server
rsync -avz --exclude='.git' . user@server:/var/www/wrapp/
```

## Browser Support

| Browser | Minimum Version | Features |
|---------|----------------|----------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |

### Required Browser Features
- ES6+ JavaScript support
- CSS Grid and Flexbox
- Canvas API for Leaflet
- Fetch API for network requests
- CSS backdrop-filter (progressive enhancement)

## Performance Characteristics

### Optimization Features
- **Lazy Loading**: Tiles loaded on-demand
- **Caching Strategy**: Intelligent cache management for radar data
- **Efficient Rendering**: Canvas-based map rendering with hardware acceleration
- **Responsive Images**: Retina display support with appropriate tile sizes
- **Memory Management**: Automatic cleanup of unused map layers

### Network Efficiency
- **CDN Delivery**: Static assets served via GitHub Pages CDN
- **Compressed Assets**: Minified CSS and optimized image formats
- **API Rate Limiting**: Intelligent request throttling
- **Offline Graceful**: Cached data display when network unavailable

## Security Considerations

### API Key Management
- **GitHub Secrets**: Secure server-side injection during build
- **No Client Exposure**: API keys never committed to repository
- **Environment Isolation**: Separate keys for development/production

### Data Privacy
- **No User Tracking**: No analytics or user data collection
- **Secure Connections**: All API calls over HTTPS
- **Minimal Data Storage**: No persistent local storage usage

## Monitoring and Maintenance

### Health Checks
- **API Connectivity**: Automatic fallback for failed requests
- **Error Handling**: Graceful degradation with user feedback
- **Performance Monitoring**: Console logging for debugging

### Update Procedures
```bash
# Update dependencies
git pull origin main

# Verify API functionality
curl -s "https://api.rainviewer.com/public/weather-maps.json" | jq .

# Deploy updates
git push origin main  # Triggers automatic deployment if deployment configs are set
```

## Troubleshooting

### Common Issues

**API Key Configuration**
```bash
# Verify API key is set
grep "OWM_API_KEY" assets/js/config.js

# Test API connectivity
curl "https://api.openweathermap.org/data/2.5/weather?q=Markham,CA&appid=YOUR_KEY"
```

**Map Loading Issues**
- Check browser console for JavaScript errors
- Verify Leaflet.js CDN availability
- Confirm HTTPS deployment for API access

**Mobile Responsiveness**
- Clear browser cache
- Test viewport meta tag configuration
- Verify CSS media queries

### Debug Mode
```javascript
// Enable verbose logging
localStorage.setItem('wrapp_debug', 'true');
```

## Contributing

### Development Setup
```bash
# Clone repository
git clone https://github.com/username/wrapp.git
cd wrapp

# Create feature branch
git checkout -b feature/enhancement-name

# Local development server
python -m http.server 8000
```

### Code Standards
- **JavaScript**: ES6+ with clear variable naming
- **CSS**: Mobile-first responsive design
- **HTML**: Semantic markup with accessibility
- **Git**: Conventional commits with descriptive messages

### Pull Request Process
1. Fork repository and create feature branch
2. Implement changes with comprehensive testing
3. Update documentation for new features
4. Submit pull request with detailed description
5. Address code review feedback

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

### Data Sources
- **RainViewer** - Real-time radar imagery
- **OpenWeatherMap** - Weather data and atmospheric layers
- **CARTO** - Professional base mapping

### Built For
**Nextologies** – For real-time detection of inclement weather conditions impacting satellite operations.

---

**WRAPP** - Delivering accurate weather intelligence for essential daily operations.

*For technical support or feature requests, please open an issue on GitHub.*