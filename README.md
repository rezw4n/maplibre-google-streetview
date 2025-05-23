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
Follow these steps to add Google Street View to your MapLibre map:

### 1. Include Dependencies

First, you need to include the MapLibre GL JS library and the `maplibre-google-streetview` plugin in your HTML file.

**CSS:**

```html
<!-- MapLibre GL JS CSS -->
<link href="https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css" rel="stylesheet" />

<!-- MapLibre Google Street View CSS -->
<link href="https://cdn.jsdelivr.net/npm/@rezw4n/maplibre-google-streetview@latest/dist/maplibre-google-streetview.css" rel="stylesheet" />
```

**JavaScript:**

```html
<!-- MapLibre GL JS -->
<script src="https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js"></script>

<!-- MapLibre Google Street View JS -->
<script src="https://cdn.jsdelivr.net/npm/@rezw4n/maplibre-google-streetview@latest/dist/maplibre-google-streetview.js"></script>
```

### 2. Add a Map Container

Add a `div` element to your HTML to serve as the map container:

```html
<div id="map"></div>
```

Make sure to style the container appropriately (e.g., to take up the full screen or a specific portion of your page):

```css
#map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
}
```

### 3. Initialize MapLibre GL JS

Initialize your MapLibre map in your JavaScript code:

```javascript
const map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        sources: {
            'osm-tiles': {
                type: 'raster',
                tiles: [
                    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                ],
                tileSize: 256,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        },
        layers: [
            {
                id: 'osm-tiles',
                type: 'raster',
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19
            }
        ]
    },
    center: [-74.0066, 40.7135],
    zoom: 15
});

// Optional: Add navigation control
map.addControl(new maplibregl.NavigationControl());
```

### 4. Initialize the Street View Plugin

After the map has loaded, initialize the `MaplibreGoogleStreetView` plugin. You will need a Google Street View Static API key.

```javascript
map.on('load', () => streetViewPlugin = new MaplibreGoogleStreetView({ map, apiKey: "YOUR_GOOGLE_STREET_VIEW_API_KEY", showPegmanButton: true }));

```

**Important:** Replace `"YOUR_GOOGLE_STREET_VIEW_API_KEY"` with your actual Google Street View Static API key.


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
