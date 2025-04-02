// // src/utils/blockModelUtils.js

// /**
//  * Creates GeoJSON feature collection from block model data
//  * 
//  * @param {Array} data - Array of objects containing block model data
//  * @param {string} longCol - Name of the longitude/x column
//  * @param {string} latCol - Name of the latitude/y column
//  * @param {string} widthCol - Name of the width column
//  * @param {string} lengthCol - Name of the length column
//  * @returns {Object} GeoJSON FeatureCollection
//  */

// export function createPolygonsFromCoordsAndDims(data, longCol, latCol, widthCol, lengthCol) {
//     const features = [];
    
//     data.forEach((row, index) => {
//       const lon = parseFloat(row[longCol]);
//       const lat = parseFloat(row[latCol]);
//       const width = parseFloat(row[widthCol]);
//       const length = parseFloat(row[lengthCol]);
      
//       // Check if any of the values are NaN or invalid
//       if (isNaN(lon) || isNaN(lat) || isNaN(width) || isNaN(length)) {
//         console.warn(`Skipping feature at index ${index} due to invalid data:`, 
//           { lon, lat, width, length });
//         return; // Skip this feature
//       }
      
//       // Calculate the corner points of the rectangle
//       const halfWidth = width / 2;
//       const halfLength = length / 2;
      
//       // Create a GeoJSON feature manually (without using turf)
//       const feature = {
//         type: "Feature",
//         properties: {
//           ...row,
//           id: index
//         },
//         geometry: {
//           type: "Polygon",
//           coordinates: [
//             [
//               [lon - halfWidth, lat - halfLength], // bottom-left
//               [lon + halfWidth, lat - halfLength], // bottom-right
//               [lon + halfWidth, lat + halfLength], // top-right
//               [lon - halfWidth, lat + halfLength], // top-left
//               [lon - halfWidth, lat - halfLength]  // closing point (same as first)
//             ]
//           ]
//         }
//       };
      
//       features.push(feature);
//     });
    
//     // Create a GeoJSON FeatureCollection
//     return {
//       type: "FeatureCollection",
//       features: features
//     };
//   }
//   /**
//    * Removes duplicate polygons based on their geometry
//    * 
//    * @param {Object} featureCollection - GeoJSON FeatureCollection
//    * @returns {Object} Deduplicated GeoJSON FeatureCollection
//    */
//   export function removeDuplicateGeometries(featureCollection) {
//     const uniqueGeometries = new Map();
    
//     featureCollection.features.forEach(feature => {
//       const geometryString = JSON.stringify(feature.geometry.coordinates);
//       if (!uniqueGeometries.has(geometryString)) {
//         uniqueGeometries.set(geometryString, feature);
//       }
//     });
    
//     return {
//       type: "FeatureCollection",
//       features: Array.from(uniqueGeometries.values())
//     };
//   }
  
//   /**
//    * Processes the CSV data for block models
//    * 
//    * @param {Array} data - Parsed CSV data as array of objects
//    * @returns {Object} Processed GeoJSON FeatureCollection
//    */
//   export function processBlockModelCSV(data) {
//     try {
//       // Filter to only the columns we need
//       const filteredData = data.map(row => ({
//         centroid_x: row.centroid_x,
//         centroid_y: row.centroid_y,
//         centroid_z: row.centroid_z,
//         dim_x: row.dim_x,
//         dim_y: row.dim_y,
//         dim_z: row.dim_z,
//         rock: row.rock
//       }));
      
//       // Create polygon features
//       const polygons = createPolygonsFromCoordsAndDims(
//         filteredData,
//         'centroid_x',
//         'centroid_y',
//         'dim_x',
//         'dim_y'
//       );
//     //   console.log(polygons)
//       // Remove duplicates
//       return removeDuplicateGeometries(polygons);
//     } catch (error) {
//       console.error("Error in processBlockModelCSV:", error);
//       throw error;
//     }
//   }

// NEW 
// src/utils/blockModelUtils.js
// import { convertCoordinates } from './projectionUtils';

// /**
//  * Creates GeoJSON feature collection from block model data
//  * 
//  * @param {Array} data - Array of objects containing block model data
//  * @param {string} longCol - Name of the longitude/x column
//  * @param {string} latCol - Name of the latitude/y column
//  * @param {string} widthCol - Name of the width column
//  * @param {string} lengthCol - Name of the length column
//  * @param {string} sourceProjection - Projection of the input data
//  * @returns {Object} GeoJSON FeatureCollection
//  */
// export function createPolygonsFromCoordsAndDims(data, longCol, latCol, widthCol, lengthCol, sourceProjection = 'EPSG:4326') {
//   const features = [];
  
//   data.forEach((row, index) => {
//     const x = parseFloat(row[longCol]);
//     const y = parseFloat(row[latCol]);
//     const width = parseFloat(row[widthCol]);
//     const length = parseFloat(row[lengthCol]);


//     if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(length)) {
//                 console.warn(`Skipping feature at index ${index} due to invalid data:`, 
//                   { x, y, width, length });
//                 return; // Skip this feature
//               }
    
//     // Calculate the corner points of the rectangle
//     const halfWidth = width / 2;
//     const halfLength = length / 2;
    
//     // Create corner points in the source projection
//     const corners = [
//       [x - halfWidth, y - halfLength], // bottom-left
//       [x + halfWidth, y - halfLength], // bottom-right
//       [x + halfWidth, y + halfLength], // top-right
//       [x - halfWidth, y + halfLength], // top-left
//       [x - halfWidth, y - halfLength]  // closing point (same as first)
//     ];
    
//     // Convert each corner to WGS84 if needed
//     const convertedCorners = sourceProjection !== 'EPSG:4326' 
//       ? corners.map(point => convertCoordinates(point, sourceProjection, 'EPSG:4326'))
//       : corners;
    
//     // Create a GeoJSON feature
//     const feature = {
//       type: "Feature",
//       properties: {
//         ...row,
//         id: index
//       },
//       geometry: {
//         type: "Polygon",
//         coordinates: [convertedCorners]
//       }
//     };
    
//     features.push(feature);
//   });
  
//   // Create a GeoJSON FeatureCollection
//   return {
//     type: "FeatureCollection",
//     features: features
//   };
// }

// /**
//  * Removes duplicate polygons based on their geometry
//  * 
//  * @param {Object} featureCollection - GeoJSON FeatureCollection
//  * @returns {Object} Deduplicated GeoJSON FeatureCollection
//  */
// export function removeDuplicateGeometries(featureCollection) {
//   const uniqueGeometries = new Map();
  
//   featureCollection.features.forEach(feature => {
//     const geometryString = JSON.stringify(feature.geometry.coordinates);
//     if (!uniqueGeometries.has(geometryString)) {
//       uniqueGeometries.set(geometryString, feature);
//     }
//   });
  
//   return {
//     type: "FeatureCollection",
//     features: Array.from(uniqueGeometries.values())
//   };
// }

// /**
//  * Processes the CSV data for block models
//  * 
//  * @param {Array} data - Parsed CSV data as array of objects
//  * @param {string} sourceProjection - Projection of the input data
//  * @returns {Object} Processed GeoJSON FeatureCollection
//  */
// export function processBlockModelCSV(data, sourceProjection = 'EPSG:4326') {
//   try {
//     // Filter to only the columns we need
//     const filteredData = data.map(row => ({
//       centroid_x: row.centroid_x,
//       centroid_y: row.centroid_y,
//       centroid_z: row.centroid_z,
//       dim_x: row.dim_x,
//       dim_y: row.dim_y,
//       dim_z: row.dim_z,
//       rock: row.rock
//     }));
    
//     // Create polygon features with projection conversion
//     const polygons = createPolygonsFromCoordsAndDims(
//       filteredData,
//       'centroid_x',
//       'centroid_y',
//       'dim_x',
//       'dim_y',
//       sourceProjection
//     );
    
//     // Remove duplicates
//     return removeDuplicateGeometries(polygons);
//   } catch (error) {
//     console.error("Error in processBlockModelCSV:", error);
//     throw error;
//   }
// }

// src/utils/blockModelUtils.js
import { convertCoordinates } from './projectionUtils';

/**
 * Creates GeoJSON feature collection from block model data
 * 
 * @param {Array} data - Array of objects containing block model data
 * @param {string} longCol - Name of the longitude/x column
 * @param {string} latCol - Name of the latitude/y column
 * @param {string} widthCol - Name of the width column
 * @param {string} lengthCol - Name of the length column
 * @param {string} sourceProjection - Projection of the input data
 * @returns {Object} GeoJSON FeatureCollection
 */
export function createPolygonsFromCoordsAndDims(data, longCol, latCol, widthCol, lengthCol, sourceProjection = 'EPSG:4326') {
  const features = [];
  
  data.forEach((row, index) => {
    const x = parseFloat(row[longCol]);
    const y = parseFloat(row[latCol]);
    const width = parseFloat(row[widthCol]);
    const length = parseFloat(row[lengthCol]);
    
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(length)) {
      console.warn(`Skipping invalid data row at index ${index}:`, row);
      return; // Skip this row
    }
    
    // Calculate the corner points of the rectangle
    const halfWidth = width / 2;
    const halfLength = length / 2;
    
    // Create corner points in the source projection
    const corners = [
      [x - halfWidth, y - halfLength], // bottom-left
      [x + halfWidth, y - halfLength], // bottom-right
      [x + halfWidth, y + halfLength], // top-right
      [x - halfWidth, y + halfLength], // top-left
      [x - halfWidth, y - halfLength]  // closing point (same as first)
    ];
    
    // Convert each corner to WGS84 if needed
    const convertedCorners = sourceProjection !== 'EPSG:4326' 
      ? corners.map(point => {
          const converted = convertCoordinates(point, sourceProjection, 'EPSG:4326');
          // GeoJSON format requires [longitude, latitude] order
          return converted; // proj4 returns [lng, lat] for EPSG:4326
        })
      : corners;
      
    // Log the first corner points for debugging
    if (index === 0) {
      console.log('Original corners (first block):', corners);
      console.log('Converted corners (first block):', convertedCorners);
    }
    
    // Create a GeoJSON feature
    const feature = {
      type: "Feature",
      properties: {
        ...row,
        id: index
      },
      geometry: {
        type: "Polygon",
        coordinates: [convertedCorners]
      }
    };
    
    features.push(feature);
  });
  
  // Create a GeoJSON FeatureCollection
  return {
    type: "FeatureCollection",
    features: features
  };
}

/**
 * Removes duplicate polygons based on their geometry
 * 
 * @param {Object} featureCollection - GeoJSON FeatureCollection
 * @returns {Object} Deduplicated GeoJSON FeatureCollection
 */
export function removeDuplicateGeometries(featureCollection) {
  const uniqueGeometries = new Map();
  
  featureCollection.features.forEach(feature => {
    const geometryString = JSON.stringify(feature.geometry.coordinates);
    if (!uniqueGeometries.has(geometryString)) {
      uniqueGeometries.set(geometryString, feature);
    }
  });
  
  return {
    type: "FeatureCollection",
    features: Array.from(uniqueGeometries.values())
  };
}

/**
 * Processes the CSV data for block models
 * 
 * @param {Array} data - Parsed CSV data as array of objects
 * @param {string} sourceProjection - Projection of the input data
 * @returns {Object} Processed GeoJSON FeatureCollection
 */
export function processBlockModelCSV(data, sourceProjection = 'EPSG:4326') {
  try {
    // Log the number of rows being processed
    console.log(`Processing ${data.length} rows with projection ${sourceProjection}`);
    
    // Log a sample of the data
    console.log('Sample data row:', data[0]);
    
    // Filter to only the columns we need
    const filteredData = data.map(row => ({
      centroid_x: row.centroid_x,
      centroid_y: row.centroid_y,
      centroid_z: row.centroid_z,
      dim_x: row.dim_x,
      dim_y: row.dim_y,
      dim_z: row.dim_z,
      rock: row.rock
    }));
    
    // Create polygon features with projection conversion
    const polygons = createPolygonsFromCoordsAndDims(
      filteredData,
      'centroid_x',
      'centroid_y',
      'dim_x',
      'dim_y',
      sourceProjection
    );
    
    // Log number of features created
    console.log(`Created ${polygons.features.length} GeoJSON features`);
    
    // Remove duplicates
    const deduplicated = removeDuplicateGeometries(polygons);
    
    // Log number of features after deduplication
    console.log(`${deduplicated.features.length} features after deduplication`);
    
    return deduplicated;
  } catch (error) {
    console.error("Error in processBlockModelCSV:", error);
    throw error;
  }
}