"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

const FIELD_BOUNDS = [[29.694, 76.978], [29.700, 76.995], [29.685, 77.005], [29.677, 76.988]];

// Same color logic as FieldVisual so the dashboard preview and the live map agree.
const NDVI_RAMP = ["#8a3b1d", "#c1622b", "#e0973b", "#e9c94a", "#c7d94a", "#93c94a", "#5fb84a", "#2f9e46", "#1f7d3a"];
const MOISTURE_RAMP = ["#d8c48a", "#c7b47a", "#a9c48f", "#7db1a8", "#4f97b6", "#3178a8", "#1f5f97", "#173f78"];

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const FieldMap = forwardRef(function FieldMap({ draw = false, onBoundaryChange, zoomControl = true, layer = "trueColor" }, ref) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const baseLayerRef = useRef(null);
  const overlayGroupRef = useRef(null);
  const boundaryRef = useRef(null);
  const LRef = useRef(null);
  const { t } = useLanguage();
  const [ready, setReady] = useState(false);

  // initial map setup (runs once)
  useEffect(() => {
    let map, drawLayer, drawControl, cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      window.L = L;
      LRef.current = L;
      await import("leaflet-draw");
      if (cancelled || !elRef.current || elRef.current._leaflet_id) return;
      map = L.map(elRef.current, { zoomControl }).setView([29.6857, 76.9905], 13);
      mapRef.current = map;
      overlayGroupRef.current = L.layerGroup().addTo(map);

      drawLayer = L.featureGroup().addTo(map);
      if (draw) {
        drawControl = new L.Control.Draw({ edit: { featureGroup: drawLayer }, draw: { polygon: true, rectangle: true, polyline: false, circle: false, marker: false, circlemarker: false } });
        map.addControl(drawControl);
        map.on(L.Draw.Event.CREATED, e => { drawLayer.clearLayers(); drawLayer.addLayer(e.layer); onBoundaryChange?.(e.layer.toGeoJSON().geometry); });
      } else {
        boundaryRef.current = L.polygon(FIELD_BOUNDS, { color: "#ffffff", weight: 2.5, fillOpacity: 0 }).addTo(map);
      }
      setTimeout(() => map.invalidateSize(), 100);
      setReady(true);
    })();
    return () => { cancelled = true; if (map) map.remove(); mapRef.current = null; setReady(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw]);

  // swap base tiles + redraw the colorized overlay whenever `layer` changes (or once the map becomes ready)
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;

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

    // rebuild the simulated NDVI / Moisture raster overlay
    const group = overlayGroupRef.current;
    if (group) group.clearLayers();
    if (!draw && group && (layer === "ndvi" || layer === "moisture")) {
      const ramp = layer === "moisture" ? MOISTURE_RAMP : NDVI_RAMP;
      const rnd = mulberry32(layer === "moisture" ? 99 : 42);
      const lats = FIELD_BOUNDS.map(p => p[0]);
      const lngs = FIELD_BOUNDS.map(p => p[1]);
      const minLat = Math.min(...lats), maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
      const fieldPoly = L.polygon(FIELD_BOUNDS);
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
          const idx = Math.round(tt * (ramp.length - 1));
          L.rectangle([[lat0, lng0], [lat1, lng1]], { color: "none", weight: 0, fillColor: ramp[idx], fillOpacity: 0.55 }).addTo(group);
        }
      }
    }
    if (boundaryRef.current) {
      const label = layer === "ndvi" ? `${t.northField} • NDVI 0.78` : layer === "moisture" ? `${t.northField} • Moisture 31%` : `${t.northField} • ${t.layerTrueColor}`;
      boundaryRef.current.bindPopup(label);
    }
  }, [layer, draw, ready, t.northField, t.layerTrueColor]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => mapRef.current?.zoomIn(),
    zoomOut: () => mapRef.current?.zoomOut(),
    getMap: () => mapRef.current
  }), []);

  return <div ref={elRef} className="h-full min-h-[360px] w-full" />;
});

export default FieldMap;
