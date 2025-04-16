!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).MaplibreGoogleStreetView=t()}(this,(function(){"use strict";return class{constructor(e){this.map=e.map,this.apiKey=e.apiKey,this.showPegmanButton=!1!==e.showPegmanButton,this.isDragging=!1,this.pegmanMarker=null,this.streetViewLayerActive=!1,this.touchStartTime=0,this.touchMoved=!1,this.isTouchInteraction=!1,this._createDOMElements(),this._init()}_createDOMElements(){this.pegmanContainer=document.createElement("div"),this.pegmanContainer.className="maplibre-streetview-pegman-container",this.pegmanContainer.id="pegman-container",this.pegman=document.createElement("div"),this.pegman.className="maplibre-streetview-pegman",this.pegman.id="pegman",this.pegman.setAttribute("draggable","true"),this.pegmanContainer.appendChild(this.pegman),this.streetView=document.createElement("div"),this.streetView.className="maplibre-streetview-street-view",this.streetView.id="street-view",this.streetViewIframe=document.createElement("iframe"),this.streetViewIframe.className="maplibre-streetview-iframe",this.streetViewIframe.id="street-view-iframe",this.streetViewIframe.setAttribute("allowfullscreen",""),this.streetView.appendChild(this.streetViewIframe),this.closeStreetView=document.createElement("div"),this.closeStreetView.className="maplibre-streetview-close",this.closeStreetView.id="close-street-view",this.closeStreetView.innerHTML="×",this.closeStreetView.setAttribute("role","button"),this.closeStreetView.setAttribute("aria-label","Close Street View"),this.streetView.appendChild(this.closeStreetView),this.showPegmanButton&&document.body.appendChild(this.pegmanContainer),document.body.appendChild(this.streetView)}_init(){this._createPegmanMarker(),this._setupEventListeners(),this.map.loaded()?this._onMapLoad():this.map.on("load",(()=>this._onMapLoad())),this._positionPegmanButton(),window.addEventListener("resize",(()=>this._positionPegmanButton()))}_createPegmanMarker(){this.pegmanMarker||(this.pegmanMarker=document.createElement("div"),this.pegmanMarker.className="maplibre-streetview-pegman-marker",document.body.appendChild(this.pegmanMarker))}_setupEventListeners(){this.pegmanContainer.addEventListener("click",(e=>{e.target!==this.pegman&&e.target!==this.pegmanContainer||(this._toggleStreetViewLayer(),e.stopPropagation())})),this.pegman.addEventListener("dragstart",(e=>{this.isDragging=!0,this.pegman.classList.add("dragging"),this.pegmanContainer.classList.add("dragging");const t=new Image;t.src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",e.dataTransfer.setDragImage(t,0,0),e.dataTransfer.effectAllowed="move",this.pegmanMarker.classList.add("active"),this._updatePegmanMarkerPosition(e),this.streetViewLayerActive||this._toggleStreetViewLayer()})),this.map.getContainer().addEventListener("dragover",(e=>{e.preventDefault(),this.isDragging&&(this._updatePegmanMarkerPosition(e),e.dataTransfer.dropEffect="move")})),document.addEventListener("mousemove",(e=>{this.isDragging&&this._updatePegmanMarkerPosition(e)})),this.map.getContainer().addEventListener("drop",(e=>{if(e.preventDefault(),this.isDragging){const t=this.map.getContainer().getBoundingClientRect(),i=e.clientX-t.left,s=e.clientY-t.top,a=this.map.unproject([i,s]);this._checkStreetViewAvailability(a.lat,a.lng,(e=>{e?this._openStreetView(a.lat,a.lng):this._showNoStreetViewMessage(),this.streetViewLayerActive&&this._toggleStreetViewLayer()}))}this._endDragging()})),this.map.getContainer().addEventListener("dragleave",(e=>{this.isDragging&&this.pegmanMarker.classList.remove("active")})),this.map.getContainer().addEventListener("dragenter",(e=>{this.isDragging&&this.pegmanMarker.classList.add("active")})),this.pegman.addEventListener("dragend",(()=>{this._endDragging()})),this.pegman.addEventListener("touchstart",(e=>{e.preventDefault(),this.touchStartTime=Date.now(),this.touchMoved=!1,this.isTouchInteraction=!0}),{passive:!1}),document.addEventListener("touchmove",(e=>{if(this.isTouchInteraction){this.touchMoved=!0,this.isDragging||(this.isDragging=!0,this.pegman.classList.add("dragging"),this.pegmanContainer.classList.add("dragging"),this.pegmanMarker.classList.add("active"),this.streetViewLayerActive||this._toggleStreetViewLayer()),e.preventDefault();const t=e.touches[0];t&&this._updatePegmanMarkerPosition(t)}}),{passive:!1}),document.addEventListener("touchend",(e=>{if(this.isTouchInteraction){const t=Date.now()-this.touchStartTime,i=e.changedTouches[0];if(!this.touchMoved&&t<300)i&&(this.pegman.contains(document.elementFromPoint(i.clientX,i.clientY))||this.pegmanContainer.contains(document.elementFromPoint(i.clientX,i.clientY)))&&(this._toggleStreetViewLayer(),e.preventDefault());else if(this.isDragging&&i){const e=this.map.getContainer().getBoundingClientRect();if(i.clientX>=e.left&&i.clientX<=e.right&&i.clientY>=e.top&&i.clientY<=e.bottom){const t=i.clientX-e.left,s=i.clientY-e.top,a=this.map.unproject([t,s]);this._checkStreetViewAvailability(a.lat,a.lng,(e=>{e?this._openStreetView(a.lat,a.lng):this._showNoStreetViewMessage(),this.streetViewLayerActive&&this._toggleStreetViewLayer()}))}}this._endDragging(),this.touchMoved=!1,this.isTouchInteraction=!1}}),{passive:!1}),this.map.on("click",(e=>{if(this.streetViewLayerActive){const t=e.lngLat;this._checkStreetViewAvailability(t.lat,t.lng,(e=>{e?(this._openStreetView(t.lat,t.lng),this.streetViewLayerActive&&this._toggleStreetViewLayer()):this._showNoStreetViewMessage()}))}})),this.closeStreetView.addEventListener("click",(e=>{e.preventDefault(),e.stopPropagation(),this.streetView.style.display="none",this.streetViewIframe.src=""})),this.closeStreetView.addEventListener("touchend",(e=>{e.preventDefault(),e.stopPropagation(),this.streetView.style.display="none",this.streetViewIframe.src=""}),{passive:!1})}_onMapLoad(){this.map.addSource("street-view-coverage",{type:"raster",tiles:["https://mt1.googleapis.com/vt?lyrs=svv&style=40&x={x}&y={y}&z={z}"],tileSize:256,attribution:"© Google"}),this.map.addLayer({id:"street-view-coverage-layer",type:"raster",source:"street-view-coverage",layout:{visibility:"none"},paint:{"raster-opacity":.8}}),this._positionPegmanButton()}_positionPegmanButton(){if(!this.showPegmanButton)return;const e=document.querySelector(".maplibregl-ctrl-top-right");if(e){const t=e.getBoundingClientRect();this.pegmanContainer.style.top=t.bottom+10+"px",this.pegmanContainer.style.right="10px"}}_toggleStreetViewLayer(){if(this.map.isStyleLoaded()&&this.map.getLayer("street-view-coverage-layer")){this.streetViewLayerActive=!this.streetViewLayerActive;try{this.map.setLayoutProperty("street-view-coverage-layer","visibility",this.streetViewLayerActive?"visible":"none"),this.streetViewLayerActive?(this.pegmanContainer.classList.add("streetview-layer-active"),this.pegman.classList.add("active")):(this.pegmanContainer.classList.remove("streetview-layer-active"),this.pegman.classList.remove("active"))}catch(e){console.error("Error toggling Street View coverage:",e)}}}_updatePegmanMarkerPosition(e){if(!this.isDragging||!this.pegmanMarker)return;const t=void 0!==e.clientX?e.clientX:e.pageX,i=void 0!==e.clientY?e.clientY:e.pageY;this.pegmanMarker.style.left=t-10+"px",this.pegmanMarker.style.top=i-30+"px"}_endDragging(){this.isDragging=!1,this.pegman.classList.remove("dragging"),this.pegmanContainer.classList.remove("dragging"),this.pegmanMarker&&this.pegmanMarker.classList.remove("active"),this.touchMoved=!1,this.isTouchInteraction=!1}_checkStreetViewAvailability(e,t,i){const s=`https://maps.googleapis.com/maps/api/streetview/metadata?location=${e},${t}&key=${this.apiKey}`;fetch(s).then((e=>e.json())).then((e=>{const t="OK"===e.status;i(t)})).catch((e=>{console.error("Error checking Street View availability:",e),i(!1)}))}_showNoStreetViewMessage(){let e=document.getElementById("sv-notification");e||(e=document.createElement("div"),e.id="sv-notification",e.className="maplibre-streetview-notification",document.body.appendChild(e)),e.textContent="Street View not available at this location",e.style.display="block",setTimeout((()=>{e.style.display="none"}),3e3)}_openStreetView(e,t){const i=`https://www.google.com/maps/embed/v1/streetview?key=${this.apiKey}&location=${e},${t}&heading=0&pitch=0&fov=90`;this.streetViewIframe.src=i,this.streetViewIframe.setAttribute("allow","accelerometer; gyroscope; geolocation"),this.streetView.style.display="block"}remove(){window.removeEventListener("resize",this._positionPegmanButton),this.pegmanContainer&&this.pegmanContainer.parentNode&&this.pegmanContainer.parentNode.removeChild(this.pegmanContainer),this.streetView&&this.streetView.parentNode&&this.streetView.parentNode.removeChild(this.streetView),this.pegmanMarker&&this.pegmanMarker.parentNode&&this.pegmanMarker.parentNode.removeChild(this.pegmanMarker),this.map.getLayer("street-view-coverage-layer")&&this.map.removeLayer("street-view-coverage-layer"),this.map.getSource("street-view-coverage")&&this.map.removeSource("street-view-coverage")}}}));
