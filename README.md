# MapLibre Google Street View

A MapLibre GL JS plugin that adds Google Street View functionality with a draggable pegman control, similar to Google Maps.
![chrome_TdOBF8ex2S](https://github.com/user-attachments/assets/0ea7189d-ae0b-412d-98f4-730f2d8eabe6)


## Features

- 🚶‍♂️ Draggable pegman control that shows Street View coverage
- 🌐 Street View opens in an overlay with close button
- 🔎 Clicking on the pegman button toggles Street View coverage layer
- 📱 Fully responsive design
- 🛠️ Customizable options

## Installation

### npm

```bash
npm install @rezw4n/maplibre-google-streetview
```

### CDN

```html
<link href="https://cdn.jsdelivr.net/npm/@rezw4n/maplibre-google-streetview@latest/dist/maplibre-google-streetview.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/@rezw4n/maplibre-google-streetview@latest/dist/maplibre-google-streetview.js"></script>
```

## Requirements

- MapLibre GL JS (v2.0.0 or higher)
- A Google Maps API key with the following APIs enabled:
  - Street View Static API
  - Maps Embed API

## Usage

### Basic Usage

```javascript
import MapLibreGL from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MaplibreGoogleStreetView from "@rezw4n/maplibre-google-streetview";
import "@rezw4n/maplibre-google-streetview/dist/maplibre-google-streetview.css";

// Initialize MapLibre map
const map = new MapLibreGL.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json', // or your own style
  center: [-74.0066, 40.7135], // New York City
  zoom: 15
});

// Add navigation control
map.addControl(new MapLibreGL.NavigationControl());

// Initialize Street View plugin
const streetViewPlugin = new MaplibreGoogleStreetView({
  map: map,
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `map` | Object | (required) | MapLibre GL JS map instance |
| `apiKey` | String | (required) | Google Maps API key |
| `showPegmanButton` | Boolean | `true` | Whether to show the pegman button |

### Methods

#### `remove()`

Removes the Street View plugin from the map and cleans up all event listeners and DOM elements.

```javascript
streetViewPlugin.remove();
```

## How It Works

1. Click the pegman button or start dragging it to show Street View coverage (blue lines).
2. Drag the pegman to a location with Street View coverage.
3. Drop the pegman to open Street View at that location.
4. Click the X button to close Street View and return to the map.

## Browser Support

This plugin works with all modern browsers that support MapLibre GL JS.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build: `npm run build`

## License

MIT

## Credits

- Street View coverage tiles are provided by Google Maps
- Street View functionality uses Google Maps Embed API
