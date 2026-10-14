import type { StyleSpecification } from "maplibre-gl";

export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>';

export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "osm-raster-tiles": {
      type: "raster",
      tiles: [OSM_TILE_URL],
      tileSize: 256,
      maxzoom: 19,
      attribution: OSM_ATTRIBUTION,
    },
  },
  layers: [
    {
      id: "osm-raster-layer",
      type: "raster",
      source: "osm-raster-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

/**
 * Creates a GeoJSON Polygon approximating a geodesic circle around [longitude, latitude]
 * for accurate radius overlay representation.
 */
export function createGeoJsonCircle(
  center: [number, number],
  radiusKm: number,
  points: number = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center;
  const coordinates: [number, number][] = [];
  const distanceRadians = radiusKm / 6371; // Earth radius ~6371 km
  const centerLatRad = (lat * Math.PI) / 180;
  const centerLngRad = (lng * Math.PI) / 180;

  for (let i = 0; i <= points; i++) {
    const bearing = (i * 2 * Math.PI) / points;
    const pointLatRad = Math.asin(
      Math.sin(centerLatRad) * Math.cos(distanceRadians) +
        Math.cos(centerLatRad) * Math.sin(distanceRadians) * Math.cos(bearing)
    );
    const pointLngRad =
      centerLngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(distanceRadians) * Math.cos(centerLatRad),
        Math.cos(distanceRadians) - Math.sin(centerLatRad) * Math.sin(pointLatRad)
      );

    coordinates.push([(pointLngRad * 180) / Math.PI, (pointLatRad * 180) / Math.PI]);
  }

  return {
    type: "Feature",
    properties: {
      radiusKm,
    },
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
  };
}
