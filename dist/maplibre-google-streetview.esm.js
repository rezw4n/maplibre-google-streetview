/**
 * MapLibre Google Street View Plugin
 * A MapLibre GL JS plugin that adds Google Street View functionality with pegman control
 */


/**
 * MapLibreGoogleStreetView class
 * @class
 */
class MapLibreGoogleStreetView {
  /**
   * Create a new MapLibreGoogleStreetView instance
   * @param {Object} options - Configuration options
   * @param {Object} options.map - MapLibre GL JS map instance
   * @param {string} options.apiKey - Google Maps API Key
   * @param {boolean} [options.showPegmanButton=true] - Whether to show the pegman button
   * @param {boolean} [options.allowFullscreen=true] - Whether to allow fullscreen mode
   * @param {Object} [options.iframeOptions] - Additional options for the iframe
   */
  constructor(options) {
    this.map = options.map;
    this.apiKey = options.apiKey;
    this.showPegmanButton = options.showPegmanButton !== false;
    this.allowFullscreen = options.allowFullscreen !== false;
    this.iframeOptions = options.iframeOptions || {};
    
    this.isDragging = false;
    this.pegmanMarker = null;
    this.streetViewLayerActive = false;
    
    // Create DOM elements
    this._createDOMElements();
    
    // Initialize the plugin
    this._init();
  }
  
  /**
   * Create the necessary DOM elements
   * @private
   */
  _createDOMElements() {
    // Create pegman container
    this.pegmanContainer = document.createElement('div');
    this.pegmanContainer.className = 'maplibre-streetview-pegman-container';
    this.pegmanContainer.id = 'pegman-container';

    // Create pegman element
    this.pegman = document.createElement('div');
    this.pegman.className = 'maplibre-streetview-pegman';
    this.pegman.id = 'pegman';
    this.pegman.setAttribute('draggable', 'true');
    this.pegmanContainer.appendChild(this.pegman);

    // Create street view container
    this.streetView = document.createElement('div');
    this.streetView.className = 'maplibre-streetview-street-view';
    this.streetView.id = 'street-view';

    // Create street view iframe
    this.streetViewIframe = document.createElement('iframe');
    this.streetViewIframe.className = 'maplibre-streetview-iframe';
    this.streetViewIframe.id = 'street-view-iframe';
    if (this.allowFullscreen) {
      this.streetViewIframe.setAttribute('allowfullscreen', '');
    }
    this.streetView.appendChild(this.streetViewIframe);

    // Create close button
    this.closeStreetView = document.createElement('div');
    this.closeStreetView.className = 'maplibre-streetview-close';
    this.closeStreetView.id = 'close-street-view';
    this.closeStreetView.innerHTML = '×';
    this.streetView.appendChild(this.closeStreetView);

    // Append elements to the document
    if (this.showPegmanButton) {
      document.body.appendChild(this.pegmanContainer);
    }
    document.body.appendChild(this.streetView);
  }
  
  /**
   * Initialize the plugin
   * @private
   */
  _init() {
    // Create pegman marker
    this._createPegmanMarker();
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Wait for map to load before adding layers
    if (this.map.loaded()) {
      this._onMapLoad();
    } else {
      this.map.on('load', () => this._onMapLoad());
    }
    
    // Position pegman button
    this._positionPegmanButton();
    
    // Handle window resize
    window.addEventListener('resize', () => this._positionPegmanButton());
  }
  
  /**
   * Create the pegman marker that appears when dragging
   * @private
   */
  _createPegmanMarker() {
    if (this.pegmanMarker) return;
    
    this.pegmanMarker = document.createElement('div');
    this.pegmanMarker.className = 'maplibre-streetview-pegman-marker';
    document.body.appendChild(this.pegmanMarker);
  }
  
  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Toggle Street View coverage when clicking on pegman button
    this.pegmanContainer.addEventListener('click', (e) => {
      // Only toggle if it's a direct click (not the start of a drag)
      if (e.target === this.pegman || e.target === this.pegmanContainer) {
        this._toggleStreetViewLayer();
        e.stopPropagation(); // Prevent the click from propagating to the map
      }
    });
    
    // Make pegman draggable
    this.pegman.addEventListener('dragstart', (e) => {
      this.isDragging = true;
      this.pegman.classList.add('dragging');
      this.pegmanContainer.classList.add('dragging');
      
      // Make the drag image transparent
      const emptyImg = new Image();
      emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      e.dataTransfer.setDragImage(emptyImg, 0, 0);
      e.dataTransfer.effectAllowed = 'move';
    
      // Show and position the pegman marker at the cursor
      this.pegmanMarker.classList.add('active');
      this._updatePegmanMarkerPosition(e);
      
      // Make sure Street View coverage is visible when dragging starts
      if (!this.streetViewLayerActive) {
        this._toggleStreetViewLayer();
      }
    });
    
    // Handle pegman dragging over map
    this.map.getContainer().addEventListener('dragover', (e) => {
      e.preventDefault();
      if (this.isDragging) {
        this._updatePegmanMarkerPosition(e);
        e.dataTransfer.dropEffect = 'move';
      }
    });
    
    // Handle mousemove for updating pegman marker position
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this._updatePegmanMarkerPosition(e);
      }
    });
    
    // Handle pegman drop on map
    this.map.getContainer().addEventListener('drop', (e) => {
      e.preventDefault();
      
      if (this.isDragging) {
        const rect = this.map.getContainer().getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert drop point to geographic coordinates
        const coords = this.map.unproject([x, y]);
        
        // Check if Street View is available at this location before opening
        this._checkStreetViewAvailability(coords.lat, coords.lng, (isAvailable) => {
          if (isAvailable) {
            this._openStreetView(coords.lat, coords.lng);
          } else {
            this._showNoStreetViewMessage();
          }
          
          // Hide Street View coverage layer
          if (this.streetViewLayerActive) {
            this._toggleStreetViewLayer();
          }
        });
      }
    
      // Reset dragging state
      this._endDragging();
    });
    
    // End drag if it leaves the map area
    this.map.getContainer().addEventListener('dragleave', (e) => {
      if (this.isDragging) {
        // Don't end dragging completely, just update marker visibility
        this.pegmanMarker.classList.remove('active');
      }
    });
    
    // Handle dragenter to show marker again when re-entering map
    this.map.getContainer().addEventListener('dragenter', (e) => {
      if (this.isDragging) {
        this.pegmanMarker.classList.add('active');
      }
    });
    
    // Handle the end of dragging
    this.pegman.addEventListener('dragend', () => {
      this._endDragging();
    });
    
    // Close street view when clicking the close button
    this.closeStreetView.addEventListener('click', () => {
      this.streetView.style.display = 'none';
      this.streetViewIframe.src = '';
    });
  }
  
  /**
   * Handle map load event
   * @private
   */
  _onMapLoad() {
    // Add Street View coverage source as a raster source
    this.map.addSource('street-view-coverage', {
      type: 'raster',
      tiles: ['https://mt1.googleapis.com/vt?lyrs=svv&style=40&x={x}&y={y}&z={z}'],
      tileSize: 256,
      attribution: '© Google'
    });
    
    // Add Street View coverage layer (hidden by default)
    this.map.addLayer({
      id: 'street-view-coverage-layer',
      type: 'raster',
      source: 'street-view-coverage',
      layout: {
        'visibility': 'none' // Hidden by default
      },
      paint: {
        'raster-opacity': 0.8
      }
    });
    
    // Position the pegman button below the MapLibre controls
    this._positionPegmanButton();
  }
  
  /**
   * Position pegman button below MapLibre controls
   * @private
   */
  _positionPegmanButton() {
    if (!this.showPegmanButton) return;
    
    // Find the MapLibre navigation control container
    const mapControls = document.querySelector('.maplibregl-ctrl-top-right');
    if (mapControls) {
      // Get the bottom position of the map controls
      const controlsRect = mapControls.getBoundingClientRect();
      
      // Position the pegman button below the controls with 10px spacing
      this.pegmanContainer.style.top = (controlsRect.bottom + 10) + 'px';
      this.pegmanContainer.style.right = '10px';
    }
  }
  
  /**
   * Toggle Street View coverage layer
   * @private
   */
  _toggleStreetViewLayer() {
    if (!this.map.isStyleLoaded() || !this.map.getLayer('street-view-coverage-layer')) {
      return;
    }
    
    this.streetViewLayerActive = !this.streetViewLayerActive;
    
    try {
      // Update layer visibility
      this.map.setLayoutProperty(
        'street-view-coverage-layer',
        'visibility',
        this.streetViewLayerActive ? 'visible' : 'none'
      );
      
      // Update pegman container state
      if (this.streetViewLayerActive) {
        this.pegmanContainer.classList.add('streetview-layer-active');
        this.pegman.classList.add('active');
      } else {
        this.pegmanContainer.classList.remove('streetview-layer-active');
        this.pegman.classList.remove('active');
      }
      
    } catch (error) {
      console.error("Error toggling Street View coverage:", error);
    }
  }
  
  /**
   * Update pegman marker position during drag
   * @private
   * @param {Event} e - Mouse event
   */
  _updatePegmanMarkerPosition(e) {
    if (!this.isDragging || !this.pegmanMarker) return;
    
    this.pegmanMarker.style.left = (e.clientX - 10) + 'px';
    this.pegmanMarker.style.top = (e.clientY - 30) + 'px';
  }
  
  /**
   * End dragging state
   * @private
   */
  _endDragging() {
    this.isDragging = false;
    this.pegman.classList.remove('dragging');
    this.pegmanContainer.classList.remove('dragging');
    
    if (this.pegmanMarker) {
      this.pegmanMarker.classList.remove('active');
    }
  }
  
  /**
   * Check if Street View is available at a given location
   * @private
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {Function} callback - Callback function
   */
  _checkStreetViewAvailability(lat, lng, callback) {
    // Create a new request to the Google Street View API
    const checkUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${this.apiKey}`;
    
    fetch(checkUrl)
      .then(response => response.json())
      .then(data => {
        // If status is OK, Street View is available
        const isAvailable = data.status === 'OK';
        callback(isAvailable);
      })
      .catch(error => {
        console.error("Error checking Street View availability:", error);
        callback(false); // Assume not available on error
      });
  }
  
  /**
   * Show a message when Street View is not available
   * @private
   */
  _showNoStreetViewMessage() {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('sv-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'sv-notification';
      notification.className = 'maplibre-streetview-notification';
      document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = 'Street View not available at this location';
    notification.style.display = 'block';
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  
  /**
   * Open Street View at given coordinates
   * @private
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   */
  _openStreetView(lat, lng) {
    // Create Google Street View URL that works with the embedded iframe
    const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview?key=${this.apiKey}&location=${lat},${lng}&heading=0&pitch=0&fov=90`;
    
    // Set the src attribute for the iframe
    this.streetViewIframe.src = streetViewUrl;
    
    // Apply custom iframe options and necessary permissions
    // Use allow="*" syntax to ensure broader compatibility
    let allowPermissions = 'accelerometer *; gyroscope *; magnetometer *';
    
    if (this.iframeOptions && this.iframeOptions.allow) {
      allowPermissions = this.iframeOptions.allow.replace(/;/g, ' *;') + ' *';
    }
    
    this.streetViewIframe.setAttribute('allow', allowPermissions);
    
    // Display the Street View container
    this.streetView.style.display = 'block';
  }
  
  /**
   * Remove the Street View plugin
   * Useful for cleaning up when the map is being destroyed
   */
  remove() {
    // Remove event listeners
    window.removeEventListener('resize', this._positionPegmanButton);
    
    // Remove DOM elements
    if (this.pegmanContainer && this.pegmanContainer.parentNode) {
      this.pegmanContainer.parentNode.removeChild(this.pegmanContainer);
    }
    
    if (this.streetView && this.streetView.parentNode) {
      this.streetView.parentNode.removeChild(this.streetView);
    }
    
    if (this.pegmanMarker && this.pegmanMarker.parentNode) {
      this.pegmanMarker.parentNode.removeChild(this.pegmanMarker);
    }
    
    // Remove map layers and sources
    if (this.map.getLayer('street-view-coverage-layer')) {
      this.map.removeLayer('street-view-coverage-layer');
    }
    
    if (this.map.getSource('street-view-coverage')) {
      this.map.removeSource('street-view-coverage');
    }
  }
}

export { MapLibreGoogleStreetView as default };
