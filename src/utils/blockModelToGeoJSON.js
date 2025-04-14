// src/utils/blockModelToGeoJSON.js
import { processBlockModelCSV } from './blockModelUtils';

export const blockModelToGeoJSON = (blockModelData, sourceProjection = 'EPSG:4326') => {
  if (!blockModelData || blockModelData.length === 0) {
    return {
      geoJsonData: null,
      mapCenter: [0, 0],
      mapZoom: 12,
      isExportEnabled: false
    };
  }
  
  try {
    // console.log(`Processing data with projection: ${sourceProjection}`);
    
    // Process the data into GeoJSON with the specified projection
    const processedData = processBlockModelCSV(blockModelData, sourceProjection);
    // console.log("Processed GeoJSON data sample:", 
      // processedData.features.length > 0 ? processedData.features[0] : 'No features');
    console.log('DATA BLOCK',processedData)
    // Calculate initial map center if features are available
    let mapCenter = [0, 0];
    
    if (processedData.features && processedData.features.length > 0) {
      const firstFeature = processedData.features[0];
      if (firstFeature.geometry && firstFeature.geometry.coordinates && 
          firstFeature.geometry.coordinates[0] && firstFeature.geometry.coordinates[0][0]) {
        // GeoJSON uses [longitude, latitude] but Leaflet expects [latitude, longitude]
        const coords = firstFeature.geometry.coordinates[0][0];
        mapCenter = [coords[1], coords[0]];
        console.log('Setting map center to:', mapCenter);
      }
    }
    
    return {
      geoJsonData: processedData,
      mapCenter,
      mapZoom: 12,
      isExportEnabled: processedData.features.length > 0
    };
  } catch (error) {
    console.error("Error processing block model data:", error);
    return {
      geoJsonData: null,
      mapCenter: [0, 0],
      mapZoom: 12,
      isExportEnabled: false,
      error: error.message
    };
  }
};