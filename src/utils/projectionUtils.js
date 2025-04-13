import proj4 from 'proj4';

// Define common projections
const projections = {
  'EPSG:4326': '+proj=longlat +datum=WGS84 +no_defs', // WGS84
  'EPSG:32652': '+proj=utm +zone=52 +datum=WGS84 +units=m +no_defs', // UTM Zone 52
  // Add more projections as needed
};

/**
 * Converts coordinates from one projection to another
 * 
 * @param {number[]} coords - Coordinates in source projection [x, y]
 * @param {string} fromProj - Source projection code
 * @param {string} toProj - Target projection code
 * @returns {number[]} Coordinates in target projection
 */
export function convertCoordinates(coords, fromProj, toProj) {
  // Register projections if not already done
  if (!proj4.defs(fromProj)) {
    proj4.defs(fromProj, projections[fromProj]);
  }
  
  if (!proj4.defs(toProj)) {
    proj4.defs(toProj, projections[toProj]);
  }
  
  // Do the conversion
  const result = proj4(fromProj, toProj, coords);
  
  // Debug logging for conversion
//   console.log(`Converting ${fromProj} to ${toProj}: ${coords} => ${result}`);
  
  return result;
}

/**
 * Converts coordinates from one projection to another
 * 
 * @param {number[][]} coords - Array of coordinate pairs in source projection [[x1, y1], [x2, y2], ...]
 * @param {string} fromProj - Source projection code
 * @param {string} toProj - Target projection code
 * @returns {number[][]} Array of coordinate pairs in target projection
 */
export function convertCoordinatesArray(coords, fromProj, toProj) {
  return coords.map(coord => convertCoordinates(coord, fromProj, toProj));
}

/**
 * Converts a GeoJSON object from one projection to another
 * 
 * @param {Object} geojson - GeoJSON object in source projection
 * @param {string} fromProj - Source projection code
 * @param {string} toProj - Target projection code 
 * @returns {Object} GeoJSON object in target projection
 */
export function convertGeoJSON(geojson, fromProj, toProj) {
  // Create a deep copy of the GeoJSON to avoid modifying the original
  const result = JSON.parse(JSON.stringify(geojson));
  
  // Process each feature
  result.features = result.features.map(feature => {
    // Only handle polygon geometries for now
    if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates = feature.geometry.coordinates.map(ring => 
        ring.map(coord => convertCoordinates(coord, fromProj, toProj))
      );
    }
    return feature;
  });
  
  return result;
}