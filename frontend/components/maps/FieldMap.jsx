// "use client";
// import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
// import { useLanguage } from "@/hooks/useLanguage";

// const FIELD_BOUNDS = [[29.694, 76.978], [29.700, 76.995], [29.685, 77.005], [29.677, 76.988]];

// // Same color logic as FieldVisual so the dashboard preview and the live map agree.
// const NDVI_RAMP = ["#8a3b1d", "#c1622b", "#e0973b", "#e9c94a", "#c7d94a", "#93c94a", "#5fb84a", "#2f9e46", "#1f7d3a"];
// const MOISTURE_RAMP = ["#d8c48a", "#c7b47a", "#a9c48f", "#7db1a8", "#4f97b6", "#3178a8", "#1f5f97", "#173f78"];

// function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// const FieldMap = forwardRef(function FieldMap({ draw = false, onBoundaryChange, zoomControl = true, layer = "trueColor" }, ref) {
//   const elRef = useRef(null);
//   const mapRef = useRef(null);
//   const baseLayerRef = useRef(null);
//   const overlayGroupRef = useRef(null);
//   const boundaryRef = useRef(null);
//   const LRef = useRef(null);
//   const { t } = useLanguage();
//   const [ready, setReady] = useState(false);

//   // initial map setup (runs once)
//   useEffect(() => {
//     let map, drawLayer, drawControl, cancelled = false;
//     (async () => {
//       const L = (await import("leaflet")).default;
//       window.L = L;
//       LRef.current = L;
//       await import("leaflet-draw");
//       if (cancelled || !elRef.current || elRef.current._leaflet_id) return;
//       map = L.map(elRef.current, { zoomControl }).setView([29.6857, 76.9905], 13);
//       mapRef.current = map;
//       overlayGroupRef.current = L.layerGroup().addTo(map);

//       drawLayer = L.featureGroup().addTo(map);
//       if (draw) {
//         drawControl = new L.Control.Draw({ edit: { featureGroup: drawLayer }, draw: { polygon: true, rectangle: true, polyline: false, circle: false, marker: false, circlemarker: false } });
//         map.addControl(drawControl);
//         map.on(L.Draw.Event.CREATED, e => { drawLayer.clearLayers(); drawLayer.addLayer(e.layer); onBoundaryChange?.(e.layer.toGeoJSON().geometry); });
//       } else {
//         boundaryRef.current = L.polygon(FIELD_BOUNDS, { color: "#ffffff", weight: 2.5, fillOpacity: 0 }).addTo(map);
//       }
//       setTimeout(() => map.invalidateSize(), 100);
//       setReady(true);
//     })();
//     return () => { cancelled = true; if (map) map.remove(); mapRef.current = null; setReady(false); };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [draw]);

//   // swap base tiles + redraw the colorized overlay whenever `layer` changes (or once the map becomes ready)
//   useEffect(() => {
//     const L = LRef.current;
//     const map = mapRef.current;
//     if (!ready || !L || !map) return;

//     if (baseLayerRef.current) { map.removeLayer(baseLayerRef.current); baseLayerRef.current = null; }
//     if (layer === "trueColor") {
//       baseLayerRef.current = L.tileLayer(
//         "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
//         { attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics", maxZoom: 18 }
//       ).addTo(map);
//     } else {
//       baseLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(map);
//     }
//     if (boundaryRef.current) boundaryRef.current.bringToFront();

//     // rebuild the simulated NDVI / Moisture raster overlay
//     const group = overlayGroupRef.current;
//     if (group) group.clearLayers();
//     if (!draw && group && (layer === "ndvi" || layer === "moisture")) {
//       const ramp = layer === "moisture" ? MOISTURE_RAMP : NDVI_RAMP;
//       const rnd = mulberry32(layer === "moisture" ? 99 : 42);
//       const lats = FIELD_BOUNDS.map(p => p[0]);
//       const lngs = FIELD_BOUNDS.map(p => p[1]);
//       const minLat = Math.min(...lats), maxLat = Math.max(...lats);
//       const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
//       const fieldPoly = L.polygon(FIELD_BOUNDS);
//       const cells = 9;
//       for (let r = 0; r < cells; r++) {
//         for (let c = 0; c < cells; c++) {
//           const lat0 = minLat + ((maxLat - minLat) * r) / cells;
//           const lat1 = minLat + ((maxLat - minLat) * (r + 1)) / cells;
//           const lng0 = minLng + ((maxLng - minLng) * c) / cells;
//           const lng1 = minLng + ((maxLng - minLng) * (c + 1)) / cells;
//           const cLat = (lat0 + lat1) / 2, cLng = (lng0 + lng1) / 2;
//           if (!fieldPoly.getBounds().contains([cLat, cLng])) continue;
//           const n = (Math.sin(r * 12.9898 + c * 78.233) + 1) / 2;
//           const tt = Math.min(1, Math.max(0, 0.55 + n * 0.35 + (rnd() - 0.5) * 0.3));
//           const idx = Math.round(tt * (ramp.length - 1));
//           L.rectangle([[lat0, lng0], [lat1, lng1]], { color: "none", weight: 0, fillColor: ramp[idx], fillOpacity: 0.55 }).addTo(group);
//         }
//       }
//     }
//     if (boundaryRef.current) {
//       const label = layer === "ndvi" ? `${t.northField} • NDVI 0.78` : layer === "moisture" ? `${t.northField} • Moisture 31%` : `${t.northField} • ${t.layerTrueColor}`;
//       boundaryRef.current.bindPopup(label);
//     }
//   }, [layer, draw, ready, t.northField, t.layerTrueColor]);

//   useImperativeHandle(ref, () => ({
//     zoomIn: () => mapRef.current?.zoomIn(),
//     zoomOut: () => mapRef.current?.zoomOut(),
//     getMap: () => mapRef.current
//   }), []);

//   return <div ref={elRef} className="h-full min-h-[360px] w-full" />;
// });

// export default FieldMap;


// "use client";
// import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
// import { Search, LocateFixed, Loader2 } from "lucide-react";
// import { useLanguage } from "@/hooks/useLanguage";
// import { NDVI_RAMP, MOISTURE_RAMP, STATUS_FILL, mulberry32, getNdviStatus } from "@/lib/ndvi";

// const DEFAULT_BOUNDS = [[29.694, 76.978], [29.700, 76.995], [29.685, 77.005], [29.677, 76.988]];

// const FieldMap = forwardRef(function FieldMap(
//   { draw = false, onBoundaryChange, zoomControl = true, layer = "trueColor", bounds, fieldLabel, ndviValue, moistureValue, onCellSelect },
//   ref
// ) {
//   const elRef = useRef(null);
//   const mapRef = useRef(null);
//   const baseLayerRef = useRef(null);
//   const overlayGroupRef = useRef(null);
//   const boundaryRef = useRef(null);
//   const locateMarkerRef = useRef(null);
//   const LRef = useRef(null);
//   const { t } = useLanguage();
//   const [ready, setReady] = useState(false);

//   const [query, setQuery] = useState("");
//   const [searching, setSearching] = useState(false);
//   const [locating, setLocating] = useState(false);
//   const [findError, setFindError] = useState("");

//   const fieldBounds = bounds && bounds.length >= 3 ? bounds : DEFAULT_BOUNDS;

//   useEffect(() => {
//     let map, drawLayer, drawControl, cancelled = false;
//     (async () => {
//       const L = (await import("leaflet")).default;
//       window.L = L;
//       LRef.current = L;
//       await import("leaflet-draw");
//       if (cancelled || !elRef.current || elRef.current._leaflet_id) return;

//       const lats = fieldBounds.map(p => p[0]);
//       const lngs = fieldBounds.map(p => p[1]);
//       const center = [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2];

//       const boundsLatLng = L.latLngBounds(fieldBounds.map(p => L.latLng(p[0], p[1])));
//       map = L.map(elRef.current, { zoomControl }).fitBounds(boundsLatLng, { padding: [40, 40], maxZoom: 18 });
//       mapRef.current = map;
//       overlayGroupRef.current = L.layerGroup().addTo(map);

//       drawLayer = L.featureGroup().addTo(map);
//       if (draw) {
//         drawControl = new L.Control.Draw({ edit: { featureGroup: drawLayer }, draw: { polygon: true, rectangle: true, polyline: false, circle: false, marker: false, circlemarker: false } });
//         map.addControl(drawControl);
//         map.on(L.Draw.Event.CREATED, e => { drawLayer.clearLayers(); drawLayer.addLayer(e.layer); onBoundaryChange?.(e.layer.toGeoJSON().geometry); });
//       } else {
//         boundaryRef.current = L.polygon(fieldBounds, { color: "#ffffff", weight: 2.5, fillOpacity: 0 }).addTo(map);
//       }
//       setTimeout(() => map.invalidateSize(), 100);
//       setReady(true);
//     })();
//     return () => { cancelled = true; if (map) map.remove(); mapRef.current = null; setReady(false); };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [draw, JSON.stringify(fieldBounds)]);

//   useEffect(() => {
//     const L = LRef.current;
//     const map = mapRef.current;
//     if (!ready || !L || !map) return;

//     if (baseLayerRef.current) { map.removeLayer(baseLayerRef.current); baseLayerRef.current = null; }
//     if (layer === "trueColor") {
//       baseLayerRef.current = L.tileLayer(
//         "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
//         { attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics", maxZoom: 18 }
//       ).addTo(map);
//     } else {
//       baseLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(map);
//     }
//     if (boundaryRef.current) boundaryRef.current.bringToFront();

//     const group = overlayGroupRef.current;
//     if (group) group.clearLayers();
//     if (!draw && group && (layer === "ndvi" || layer === "moisture")) {
//       const ramp = layer === "moisture" ? MOISTURE_RAMP : NDVI_RAMP;
//       const seedBase = (fieldLabel || "field").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
//       const rnd = mulberry32(seedBase + (layer === "moisture" ? 99 : 42));
//       const lats = fieldBounds.map(p => p[0]);
//       const lngs = fieldBounds.map(p => p[1]);
//       const minLat = Math.min(...lats), maxLat = Math.max(...lats);
//       const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
//       const fieldPoly = L.polygon(fieldBounds);
//       const cellGeoms = [];
//       const cells = 9;
//       for (let r = 0; r < cells; r++) {
//         for (let c = 0; c < cells; c++) {
//           const lat0 = minLat + ((maxLat - minLat) * r) / cells;
//           const lat1 = minLat + ((maxLat - minLat) * (r + 1)) / cells;
//           const lng0 = minLng + ((maxLng - minLng) * c) / cells;
//           const lng1 = minLng + ((maxLng - minLng) * (c + 1)) / cells;
//           const cLat = (lat0 + lat1) / 2, cLng = (lng0 + lng1) / 2;
//           if (!fieldPoly.getBounds().contains([cLat, cLng])) continue;
//           const n = (Math.sin(r * 12.9898 + c * 78.233) + 1) / 2;
//           const tt = Math.min(1, Math.max(0, 0.55 + n * 0.35 + (rnd() - 0.5) * 0.3));
//           const idx = Math.round(tt * (ramp.length - 1));

//           const cellNdvi = Math.round((0.15 + tt * 0.7) * 100) / 100;
//           const cellMoisture = Math.round(10 + tt * 30);
//           const cellPestRisk = Math.round((1 - tt) * 80);

//           const rect = L.rectangle([[lat0, lng0], [lat1, lng1]], { color: "none", weight: 0, fillColor: ramp[idx], fillOpacity: 0.55 }).addTo(group);
//           cellGeoms.push({ rect, lat0, lat1, lng0, lng1 });

//           const cellData = {
//             row: r, col: c, lat: cLat, lng: cLng,
//             ndvi: cellNdvi, moisture: cellMoisture, pestRisk: cellPestRisk,
//             status: getNdviStatus(cellNdvi),
//           };
//           rect.bindTooltip(`NDVI ${cellNdvi} • ${cellData.status}`, { sticky: true });
//           rect.on("click", () => {
//             cellGeoms.forEach(g => g.rect.setStyle({ weight: 0 }));
//             rect.setStyle({ color: "#ffffff", weight: 2 });
//             onCellSelect?.(cellData);
//           });
//         }
//       }
//     }
//     if (boundaryRef.current) {
//       const name = fieldLabel || t.northField;
//       const label = layer === "ndvi"
//         ? `${name} • NDVI ${ndviValue ?? "0.72"}`
//         : layer === "moisture"
//         ? `${name} • Moisture ${moistureValue ?? "31"}%`
//         : `${name} • ${t.layerTrueColor}`;
//       boundaryRef.current.bindPopup(label);
//     }
//   }, [layer, draw, ready, fieldLabel, ndviValue, moistureValue, t.northField, t.layerTrueColor]);

//   const flyTo = (lat, lng, zoom = 16) => {
//     const L = LRef.current, map = mapRef.current;
//     if (!L || !map) return;
//     map.setView([lat, lng], zoom);
//     if (locateMarkerRef.current) map.removeLayer(locateMarkerRef.current);
//     locateMarkerRef.current = L.circleMarker([lat, lng], { radius: 8, color: "#1f7d3a", weight: 3, fillColor: "#5fb84a", fillOpacity: 0.9 }).addTo(map);
//   };

//   const handleLocateMe = () => {
//     setFindError("");
//     if (!navigator.geolocation) { setFindError(t.locateUnsupported || "Location not supported on this device."); return; }
//     setLocating(true);
//     navigator.geolocation.getCurrentPosition(
//       (pos) => { flyTo(pos.coords.latitude, pos.coords.longitude, 17); setLocating(false); },
//       () => { setFindError(t.locateFailed || "Couldn't get your location. Please allow location access."); setLocating(false); },
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!query.trim()) return;
//     setFindError("");
//     setSearching(true);
//     try {
//       const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
//       const results = await res.json();
//       if (!results?.length) { setFindError(t.locateNotFound || "Place not found. Try a different name."); return; }
//       flyTo(parseFloat(results[0].lat), parseFloat(results[0].lon), 15);
//     } catch {
//       setFindError(t.locateSearchFailed || "Search failed. Check your connection.");
//     } finally {
//       setSearching(false);
//     }
//   };

//   useImperativeHandle(ref, () => ({
//     zoomIn: () => mapRef.current?.zoomIn(),
//     zoomOut: () => mapRef.current?.zoomOut(),
//     getMap: () => mapRef.current
//   }), []);

//   return (
//     <div className="relative h-full min-h-[360px] w-full">
//       {draw && (
//         <div className="absolute left-1/2 top-3 z-[1000] flex w-[92%] max-w-md -translate-x-1/2 flex-col gap-2 sm:flex-row">
//           <form onSubmit={handleSearch} className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-md">
//             <Search size={16} className="shrink-0 text-slate-400" />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder={t.searchLocationPlaceholder || "Search village or town..."}
//               className="min-w-0 flex-1 bg-transparent text-sm outline-none"
//             />
//             {searching && <Loader2 size={16} className="shrink-0 animate-spin text-slate-400" />}
//           </form>
//           <button
//             type="button"
//             onClick={handleLocateMe}
//             disabled={locating}
//             className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-fasai-700 shadow-md disabled:opacity-60"
//           >
//             {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
//             {t.locateMe || "Locate Me"}
//           </button>
//         </div>
//       )}
//       {draw && findError && (
//         <div className="absolute left-1/2 top-16 z-[1000] w-[92%] max-w-md -translate-x-1/2 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-600 shadow-md">
//           {findError}
//         </div>
//       )}
//       <div ref={elRef} className="h-full w-full" />
//     </div>
//   );
// });

// export default FieldMap;

// export default FieldMap;
"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Search, LocateFixed, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { NDVI_RAMP, MOISTURE_RAMP, STATUS_FILL, mulberry32, getNdviStatus } from "@/lib/ndvi";

const DEFAULT_BOUNDS = [[29.694, 76.978], [29.700, 76.995], [29.685, 77.005], [29.677, 76.988]];

const FieldMap = forwardRef(function FieldMap(
  { draw = false, onBoundaryChange, zoomControl = true, layer = "trueColor", bounds, fieldLabel, ndviValue, moistureValue, onCellSelect, grid = null },
  ref
) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const baseLayerRef = useRef(null);
  const overlayGroupRef = useRef(null);
  const boundaryRef = useRef(null);
  const locateMarkerRef = useRef(null);
  const LRef = useRef(null);
  const { t } = useLanguage();
  const [ready, setReady] = useState(false);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [findError, setFindError] = useState("");

  const fieldBounds = bounds && bounds.length >= 3 ? bounds : DEFAULT_BOUNDS;

  useEffect(() => {
    let map, drawLayer, drawControl, cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      window.L = L;
      LRef.current = L;
      await import("leaflet-draw");
      if (cancelled || !elRef.current || elRef.current._leaflet_id) return;

      const lats = fieldBounds.map(p => p[0]);
      const lngs = fieldBounds.map(p => p[1]);
      const center = [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2];

      const boundsLatLng = L.latLngBounds(fieldBounds.map(p => L.latLng(p[0], p[1])));
      map = L.map(elRef.current, { zoomControl }).fitBounds(boundsLatLng, { padding: [40, 40], maxZoom: 18 });
      mapRef.current = map;
      overlayGroupRef.current = L.layerGroup().addTo(map);

      drawLayer = L.featureGroup().addTo(map);
      if (draw) {
        drawControl = new L.Control.Draw({ edit: { featureGroup: drawLayer }, draw: { polygon: true, rectangle: true, polyline: false, circle: false, marker: false, circlemarker: false } });
        map.addControl(drawControl);
        map.on(L.Draw.Event.CREATED, e => { drawLayer.clearLayers(); drawLayer.addLayer(e.layer); onBoundaryChange?.(e.layer.toGeoJSON().geometry); });
      } else {
        boundaryRef.current = L.polygon(fieldBounds, { color: "#ffffff", weight: 2.5, fillOpacity: 0 }).addTo(map);
      }
      setTimeout(() => map.invalidateSize(), 100);
      setReady(true);
    })();
    return () => { cancelled = true; if (map) map.remove(); mapRef.current = null; setReady(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw, JSON.stringify(fieldBounds)]);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;

    // console.log("FieldMap debug:", { ready, layer, gridLength: grid?.length, gridSample: grid?.[0] });

    if (baseLayerRef.current) { map.removeLayer(baseLayerRef.current); baseLayerRef.current = null; }
    if (layer === "trueColor") {
      baseLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics", maxZoom: 18 }
      ).addTo(map);
    } else {
      baseLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19 }).addTo(map);
    }
    if (boundaryRef.current) boundaryRef.current.bringToFront();

    const group = overlayGroupRef.current;
    if (group) group.clearLayers();
    if (!draw && group && (layer === "ndvi" || layer === "moisture")) {
      const ramp = layer === "moisture" ? MOISTURE_RAMP : NDVI_RAMP;
      const lats = fieldBounds.map(p => p[0]);
      const lngs = fieldBounds.map(p => p[1]);
      const minLat = Math.min(...lats), maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
      const fieldPoly = L.polygon(fieldBounds);
      const cellGeoms = [];

      if (grid && grid.length > 0 && layer === "ndvi") {
        // REAL DATA PATH — uses actual NDVI values from our backend.
        // Only applies to the "ndvi" layer, since our grid has no
        // moisture data — moisture layer still uses the demo fallback.
        const rows = grid.length;
        const cols = grid[0].length;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const ndviVal = grid[r][c]; // real value, range -1.0 to 1.0
            const lat0 = minLat + ((maxLat - minLat) * r) / rows;
            const lat1 = minLat + ((maxLat - minLat) * (r + 1)) / rows;
            const lng0 = minLng + ((maxLng - minLng) * c) / cols;
            const lng1 = minLng + ((maxLng - minLng) * (c + 1)) / cols;
            const cLat = (lat0 + lat1) / 2, cLng = (lng0 + lng1) / 2;
            if (!fieldPoly.getBounds().contains([cLat, cLng])) continue;

            // Map real NDVI (-1 to 1) onto the color ramp (0 to 1 position)
            const status = getNdviStatus(ndviVal);
            const fillColor = STATUS_FILL[status];

            const rect = L.rectangle([[lat0, lng0], [lat1, lng1]], {
              color: "#ffffff", weight: 1.5, opacity: 0.9, fillColor, fillOpacity: 0.75,
            }).addTo(group);
            cellGeoms.push({ rect, lat0, lat1, lng0, lng1 });

            const cellData = {
              row: r, col: c, lat: cLat, lng: cLng,
              ndvi: ndviVal, status: getNdviStatus(ndviVal),
            };
            rect.bindTooltip(`NDVI ${ndviVal.toFixed(2)} • ${cellData.status}`, { sticky: true });
            rect.on("click", () => {
              cellGeoms.forEach(g => g.rect.setStyle({ weight: 0 }));
              rect.setStyle({ color: "#ffffff", weight: 2 });
              onCellSelect?.(cellData);
            });
          }
        }
      } else {
        // FALLBACK: fake demo grid — used when no real grid data is
        // passed yet (e.g. pages not updated), or for the moisture
        // layer, which our backend doesn't provide real data for.
        const seedBase = (fieldLabel || "field").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        const rnd = mulberry32(seedBase + (layer === "moisture" ? 99 : 42));
        const cells = 9;
        for (let r = 0; r < cells; r++) {
          for (let c = 0; c < cells; c++) {
            const lat0 = minLat + ((maxLat - minLat) * r) / cells;
            const lat1 = minLat + ((maxLat - minLat) * (r + 1)) / cells;
            const lng0 = minLng + ((maxLng - minLng) * c) / cells;
            const lng1 = minLng + ((maxLng - minLng) * (c + 1)) / cells;
            const cLat = (lat0 + lat1) / 2, cLng = (lng0 + lng1) / 2;
            if (!fieldPoly.getBounds().contains([cLat, cLng])) continue;
            const n = (Math.sin(r * 12.9898 + c * 78.233) + 1) / 2;
                        const tt = Math.min(1, Math.max(0, 0.55 + n * 0.35 + (rnd() - 0.5) * 0.3));
            const cellNdvi = Math.round((0.15 + tt * 0.7) * 100) / 100;
            const cellMoisture = Math.round(10 + tt * 30);
            const cellPestRisk = Math.round((1 - tt) * 80);
            const cellStatus = getNdviStatus(cellNdvi);
            const fillColor = STATUS_FILL[cellStatus];

            const rect = L.rectangle([[lat0, lng0], [lat1, lng1]], { color: "#ffffff", weight: 1.5, opacity: 0.9, fillColor, fillOpacity: 0.75 }).addTo(group);
            cellGeoms.push({ rect, lat0, lat1, lng0, lng1 });

            const cellData = {
              row: r, col: c, lat: cLat, lng: cLng,
              ndvi: cellNdvi, moisture: cellMoisture, pestRisk: cellPestRisk,
              status: getNdviStatus(cellNdvi),
            };
            rect.bindTooltip(`NDVI ${cellNdvi} • ${cellData.status}`, { sticky: true });
            rect.on("click", () => {
              cellGeoms.forEach(g => g.rect.setStyle({ weight: 0 }));
              rect.setStyle({ color: "#ffffff", weight: 2 });
              onCellSelect?.(cellData);
            });
          }
        }
      }
    }
    if (boundaryRef.current) {
      const name = fieldLabel || t.northField;
      const label = layer === "ndvi"
        ? `${name} • NDVI ${ndviValue ?? "0.72"}`
        : layer === "moisture"
        ? `${name} • Moisture ${moistureValue ?? "31"}%`
        : `${name} • ${t.layerTrueColor}`;
      boundaryRef.current.bindPopup(label);
    }
  }, [layer, draw, ready, fieldLabel, ndviValue, moistureValue, t.northField, t.layerTrueColor, grid]);

  const flyTo = (lat, lng, zoom = 16) => {
    const L = LRef.current, map = mapRef.current;
    if (!L || !map) return;
    map.setView([lat, lng], zoom);
    if (locateMarkerRef.current) map.removeLayer(locateMarkerRef.current);
    locateMarkerRef.current = L.circleMarker([lat, lng], { radius: 8, color: "#1f7d3a", weight: 3, fillColor: "#5fb84a", fillOpacity: 0.9 }).addTo(map);
  };

  const handleLocateMe = () => {
    setFindError("");
    if (!navigator.geolocation) { setFindError(t.locateUnsupported || "Location not supported on this device."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { flyTo(pos.coords.latitude, pos.coords.longitude, 17); setLocating(false); },
      () => { setFindError(t.locateFailed || "Couldn't get your location. Please allow location access."); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setFindError("");
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
      const results = await res.json();
      if (!results?.length) { setFindError(t.locateNotFound || "Place not found. Try a different name."); return; }
      flyTo(parseFloat(results[0].lat), parseFloat(results[0].lon), 15);
    } catch {
      setFindError(t.locateSearchFailed || "Search failed. Check your connection.");
    } finally {
      setSearching(false);
    }
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => mapRef.current?.zoomIn(),
    zoomOut: () => mapRef.current?.zoomOut(),
    getMap: () => mapRef.current
  }), []);

  return (
    <div className="relative h-full min-h-[360px] w-full">
      {draw && (
        <div className="absolute left-1/2 top-3 z-[1000] flex w-[92%] max-w-md -translate-x-1/2 flex-col gap-2 sm:flex-row">
          <form onSubmit={handleSearch} className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-md">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchLocationPlaceholder || "Search village or town..."}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {searching && <Loader2 size={16} className="shrink-0 animate-spin text-slate-400" />}
          </form>
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locating}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-fasai-700 shadow-md disabled:opacity-60"
          >
            {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
            {t.locateMe || "Locate Me"}
          </button>
        </div>
      )}
      {draw && findError && (
        <div className="absolute left-1/2 top-16 z-[1000] w-[92%] max-w-md -translate-x-1/2 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-600 shadow-md">
          {findError}
        </div>
      )}
      <div ref={elRef} className="h-full w-full" />
    </div>
  );
});

export default FieldMap;