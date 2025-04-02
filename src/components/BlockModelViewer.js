// import React, { useEffect, useState, useRef } from 'react';
// import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import { processBlockModelCSV } from '../utils/blockModelUtils';
// import L from 'leaflet';

// // Fix Leaflet icon issue
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// let DefaultIcon = L.icon({
//   iconUrl: icon,
//   shadowUrl: iconShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41]
// });

// L.Marker.prototype.options.icon = DefaultIcon;

// // Helper component to fit bounds when data changes
// const FitBoundsToData = ({ geoJsonData }) => {
//   const map = useMap();
  
//   useEffect(() => {
//     if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
//       try {
//         const geoJsonLayer = L.geoJSON(geoJsonData);
//         const bounds = geoJsonLayer.getBounds();
//         if (bounds.isValid()) {
//           map.fitBounds(bounds);
//         }
//       } catch (error) {
//         console.error("Error fitting to bounds:", error);
//       }
//     }
//   }, [geoJsonData, map]);
  
//   return null;
// };

// const BlockModelViewer = ({ blockModelData }) => {
//   const [geoJsonData, setGeoJsonData] = useState(null);
//   const [mapCenter, setMapCenter] = useState([0, 0]);
//   const [mapZoom, setMapZoom] = useState(12);
  
//   // Style function for the GeoJSON layer
//   const blockModelStyle = (feature) => {
//     const rockType = feature.properties.rock;
//     let fillColor = '#3388ff'; // Default blue
    
//     if (rockType === 'ORE') {
//       fillColor = '#ff0000'; // Red for ore
//     } else if (rockType === 'WASTE') {
//       fillColor = '#969696'; // Grey for waste
//     }
    
//     return {
//       fillColor: fillColor,
//       weight: 1,
//       opacity: 1,
//       color: 'black',
//       fillOpacity: 0.7
//     };
//   };

//   useEffect(() => {
//     if (blockModelData && blockModelData.length > 0) {
//       try {
//         // Process the data into GeoJSON
//         // console.log(typeof blockModelData)
//         const processedData = processBlockModelCSV(blockModelData);
//         // console.log(blockModelData)
//         console.log("Processed GeoJSON data:", processedData);
//         setGeoJsonData(processedData);
        
//         // Set the map center to the first feature's coordinates if available
//         if (processedData.features && processedData.features.length > 0) {
//           const firstFeature = processedData.features[0];
//           if (firstFeature.geometry && firstFeature.geometry.coordinates && 
//               firstFeature.geometry.coordinates[0] && firstFeature.geometry.coordinates[0][0]) {
//             // GeoJSON uses [longitude, latitude] but Leaflet expects [latitude, longitude]
//             const coords = firstFeature.geometry.coordinates[0][0];
//             setMapCenter([coords[1], coords[0]]);
//           }
//         }
//       } catch (error) {
//         console.error("Error processing block model data:", error);
//       }
//     }
//   }, [blockModelData]);

//   if (!blockModelData || blockModelData.length === 0) {
//     return <div className="p-4">Please upload a block model CSV file.</div>;
//   }

//   return (
//     <div className="w-full h-96 relative">
//       <MapContainer 
//         center={mapCenter}
//         zoom={mapZoom}
//         style={{ height: '100%', width: '100%' }}
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
        
//         {geoJsonData && (
//           <>
//             <GeoJSON 
//               data={geoJsonData} 
//               style={blockModelStyle}
//             />
//             <FitBoundsToData geoJsonData={geoJsonData} />
//           </>
//         )}
//       </MapContainer>
//     </div>
//   );
// };

// export default BlockModelViewer;

// // src/components/BlockModelViewer.js
// import React, { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import { processBlockModelCSV } from '../utils/blockModelUtils';
// import L from 'leaflet';

// // Fix Leaflet icon issue
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// let DefaultIcon = L.icon({
//   iconUrl: icon,
//   shadowUrl: iconShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41]
// });

// L.Marker.prototype.options.icon = DefaultIcon;

// // Helper component to fit bounds when data changes
// const FitBoundsToData = ({ geoJsonData }) => {
//   const map = useMap();
  
//   useEffect(() => {
//     if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
//       try {
//         const geoJsonLayer = L.geoJSON(geoJsonData);
//         const bounds = geoJsonLayer.getBounds();
//         if (bounds.isValid()) {
//           map.fitBounds(bounds);
//         }
//       } catch (error) {
//         console.error("Error fitting to bounds:", error);
//       }
//     }
//   }, [geoJsonData, map]);
  
//   return null;
// };

// const BlockModelViewer = ({ blockModelData, sourceProjection = 'EPSG:4326' }) => {
//   const [geoJsonData, setGeoJsonData] = useState(null);
//   const [mapCenter, setMapCenter] = useState([0, 0]);
//   const [mapZoom, setMapZoom] = useState(12);
  
//   // Style function for the GeoJSON layer
//   const blockModelStyle = (feature) => {
//     const rockType = feature.properties.rock;
//     let fillColor = '#3388ff'; // Default blue
    
//     if (rockType === 'ORE') {
//       fillColor = '#ff0000'; // Red for ore
//     } else if (rockType === 'WASTE') {
//       fillColor = '#969696'; // Grey for waste
//     }
    
//     return {
//       fillColor: fillColor,
//       weight: 1,
//       opacity: 1,
//       color: 'black',
//       fillOpacity: 0.7
//     };
//   };

//   // Add popup content to each feature
//   const onEachFeature = (feature, layer) => {
//     if (feature.properties) {
//       const props = feature.properties;
//       const popupContent = `
//         <div>
//           <strong>Rock Type:</strong> ${props.rock || 'Unknown'}<br>
//           <strong>Centroid:</strong> X=${props.centroid_x.toFixed(2)}, Y=${props.centroid_y.toFixed(2)}, Z=${props.centroid_z.toFixed(2)}<br>
//           <strong>Dimensions:</strong> ${props.dim_x.toFixed(2)} × ${props.dim_y.toFixed(2)} × ${props.dim_z.toFixed(2)}
//         </div>
//       `;
//       layer.bindPopup(popupContent);
//     }
//   };

//   useEffect(() => {
//     if (blockModelData && blockModelData.length > 0) {
//       try {
//         console.log(`Processing data with projection: ${sourceProjection}`);
        
//         // Process the data into GeoJSON with the specified projection
//         const processedData = processBlockModelCSV(blockModelData, sourceProjection);
//         console.log("Processed GeoJSON data:", processedData);
        
//         setGeoJsonData(processedData);
        
//         // Set the map center to the first feature's coordinates if available
//         if (processedData.features && processedData.features.length > 0) {
//           const firstFeature = processedData.features[0];
//           if (firstFeature.geometry && firstFeature.geometry.coordinates && 
//               firstFeature.geometry.coordinates[0] && firstFeature.geometry.coordinates[0][0]) {
//             // GeoJSON uses [longitude, latitude] but Leaflet expects [latitude, longitude]
//             const coords = firstFeature.geometry.coordinates[0][0];
//             setMapCenter([coords[1], coords[0]]);
//           }
//         }
//       } catch (error) {
//         console.error("Error processing block model data:", error);
//       }
//     }
//   }, [blockModelData, sourceProjection]);

//   if (!blockModelData || blockModelData.length === 0) {
//     return <div className="p-4">Please upload a block model CSV file.</div>;
//   }
//   console.log(geoJsonData)
//   return (
//     <div className="w-full h-96 relative">
//       <h1>TESTTTTTT</h1>
//       <MapContainer 
//         center={mapCenter}
//         zoom={mapZoom}
//         style={{ height: '100%', width: '100%' }}
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
        
//         {geoJsonData && (
//           <>
//             <GeoJSON 
//               data={geoJsonData} 
//               style={blockModelStyle}
//               onEachFeature={onEachFeature}
//             />
//             <FitBoundsToData geoJsonData={geoJsonData} />
//           </>
//         )}
//       </MapContainer>
//     </div>
//   );
// };

// export default BlockModelViewer;

// NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN

// src/components/BlockModelViewer.js
// import React, { useEffect, useState, useRef } from 'react';
// import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import { processBlockModelCSV } from '../utils/blockModelUtils';
// import L from 'leaflet';

// // Fix Leaflet icon issue
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// let DefaultIcon = L.icon({
//   iconUrl: icon,
//   shadowUrl: iconShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41]
// });

// L.Marker.prototype.options.icon = DefaultIcon;

// // Helper component to fit bounds when data changes
// const FitBoundsToData = ({ geoJsonData }) => {
//   const map = useMap();
  
//   useEffect(() => {
//     if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
//       try {
//         // Create a temporary layer to calculate bounds
//         const geoJsonLayer = L.geoJSON(geoJsonData, {
//           coordsToLatLng: (coords) => {
//             return L.latLng(coords[1], coords[0]); // [lat, lng] for Leaflet
//           }
//         });
//         console.log(geoJsonLayer)
//         console.log(geoJsonLayer)
//         const bounds = geoJsonLayer.getBounds();
        
//         if (bounds.isValid()) {
//           map.fitBounds(bounds, { padding: [50, 50] });
//           console.log('Map fit to bounds:', bounds);
//         } else {
//           console.warn('Invalid bounds, cannot fit map');
//         }
//       } catch (error) {
//         console.error("Error fitting to bounds:", error);
//       }
//     }
//   }, [geoJsonData, map]);
  
//   return null;
// };

// // Debug component to show GeoJSON coordinates for debugging
// const DebugLayer = ({ geoJsonData }) => {
//   const map = useMap();
  
//   useEffect(() => {
//     if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) return;
    
//     // Add a marker at the center of the first polygon
//     try {
//       const firstFeature = geoJsonData.features[0];
//       const coords = firstFeature.geometry.coordinates[0][0];
      
//       // GeoJSON coordinates are [lng, lat]
//       const marker = L.marker([coords[1], coords[0]]).addTo(map);
//       marker.bindPopup(`First point: [${coords[1]}, ${coords[0]}]`).openPopup();
      
//       console.log('Added debug marker at:', coords);
      
//       // Add a small red polygon for the first feature
//       const debugPolygon = L.polygon(
//         firstFeature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]),
//         { color: 'red', weight: 3, fillOpacity: 0.5 }
//       ).addTo(map);
      
//       return () => {
//         map.removeLayer(marker);
//         map.removeLayer(debugPolygon);
//       };
//     } catch (error) {
//       console.error('Error creating debug layer:', error);
//     }
//   }, [geoJsonData, map]);
  
//   return null;
// };

// const BlockModelViewer = ({ blockModelData, sourceProjection = 'EPSG:4326' }) => {
//   const [geoJsonData, setGeoJsonData] = useState(null);
//   const [mapCenter, setMapCenter] = useState([0, 0]);
//   const [mapZoom, setMapZoom] = useState(12);
//   const [isExportEnabled, setIsExportEnabled] = useState(false);
//   const mapRef = useRef(null);
  
//   // Style function for the GeoJSON layer
//   const blockModelStyle = (feature) => {
//     const rockType = feature.properties.rock;
//     let fillColor = '#3388ff'; // Default blue
    
//     if (rockType === 'ORE') {
//       fillColor = '#ff0000'; // Red for ore
//     } else if (rockType === 'WASTE') {
//       fillColor = '#969696'; // Grey for waste
//     }
    
//     return {
//       fillColor: fillColor,
//       weight: 1,
//       opacity: 1,
//       color: 'black',
//       fillOpacity: 0.7
//     };
//   };

//   // Add popup content to each feature
//   const onEachFeature = (feature, layer) => {
//     if (feature.properties) {
//       const props = feature.properties;
//       const popupContent = `
//         <div>
//           <strong>Rock Type:</strong> ${props.rock || 'Unknown'}<br>
//           <strong>Centroid:</strong> X=${props.centroid_x.toFixed(2)}, Y=${props.centroid_y.toFixed(2)}, Z=${props.centroid_z.toFixed(2)}<br>
//           <strong>Dimensions:</strong> ${props.dim_x.toFixed(2)} × ${props.dim_y.toFixed(2)} × ${props.dim_z.toFixed(2)}
//         </div>
//       `;
//       layer.bindPopup(popupContent);
//     }
//   };

//   useEffect(() => {
//     if (blockModelData && blockModelData.length > 0) {
//       try {
//         console.log(`Processing data with projection: ${sourceProjection}`);
        
//         // Process the data into GeoJSON with the specified projection
//         const processedData = processBlockModelCSV(blockModelData, sourceProjection);
//         console.log("Processed GeoJSON data sample:", 
//           processedData.features.length > 0 ? processedData.features[0] : 'No features');
        
//         setGeoJsonData(processedData);
//         setIsExportEnabled(processedData.features.length > 0);
        
//         // Set the map center to the first feature's coordinates if available
//         if (processedData.features && processedData.features.length > 0) {
//           const firstFeature = processedData.features[0];
//           if (firstFeature.geometry && firstFeature.geometry.coordinates && 
//               firstFeature.geometry.coordinates[0] && firstFeature.geometry.coordinates[0][0]) {
//             // GeoJSON uses [longitude, latitude] but Leaflet expects [latitude, longitude]
//             const coords = firstFeature.geometry.coordinates[0][0];
//             setMapCenter([coords[1], coords[0]]);
//             console.log('Setting map center to:', [coords[1], coords[0]]);
//           }
//         }
//       } catch (error) {
//         console.error("Error processing block model data:", error);
//       }
//     }
//   }, [blockModelData, sourceProjection]);

//   // Export GeoJSON to a file
//   const exportGeoJSON = () => {
//     if (!geoJsonData) return;
    
//     const dataStr = JSON.stringify(geoJsonData, null, 2);
//     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
//     const exportFileDefaultName = 'block_model.geojson';
    
//     const linkElement = document.createElement('a');
//     linkElement.setAttribute('href', dataUri);
//     linkElement.setAttribute('download', exportFileDefaultName);
//     linkElement.click();
//   };

//   if (!blockModelData || blockModelData.length === 0) {
//     return <div className="p-4">Please upload a block model CSV file.</div>;
//   }

//   console.log('-------------------------------------------------')
//   console.log(geoJsonData)
//   console.log(blockModelStyle)
//   return (
//     <div className="w-full h-96 relative flex flex-col">
//       <div className="absolute top-2 right-2 z-10 flex space-x-2">
//         <button
//           onClick={exportGeoJSON}
//           disabled={!isExportEnabled}
//           className="bg-blue-500 text-white px-2 py-1 text-sm rounded disabled:bg-blue-300"
//         >
//           Export GeoJSON
//         </button>
//       </div>
      
//       <div className="flex-grow">
//         <MapContainer 
//           center={mapCenter}
//           zoom={mapZoom}
//           style={{ width: "100%", height: "100vh" }}
//           ref={mapRef}
//         >
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />
          
//           {geoJsonData && geoJsonData.features && geoJsonData.features.length > 0 && (
//             <>
//               <GeoJSON 
//                 data={geoJsonData} 
//                 style={blockModelStyle}
//                 onEachFeature={onEachFeature}
//                 coordsToLatLng={(coords) => {
//                   // Explicitly convert GeoJSON [lng, lat] to Leaflet [lat, lng]
//                   return L.latLng(coords[1], coords[0]);
//                 }}
//               />
//               <FitBoundsToData geoJsonData={geoJsonData} />
//               <DebugLayer geoJsonData={geoJsonData} />
//             </>
//           )}
//         </MapContainer>
//       </div>
//     </div>
//   );
// };

// export default BlockModelViewer;

// src/components/BlockModelViewer.js
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { processBlockModelCSV } from '../utils/blockModelUtils';
import L from 'leaflet';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to fit bounds when data changes
const FitBoundsToData = ({ geoJsonData }) => {
  const map = useMap();
  
  useEffect(() => {
    if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
      try {
        // Create a temporary layer to calculate bounds
        const geoJsonLayer = L.geoJSON(geoJsonData, {
          coordsToLatLng: (coords) => {
            return L.latLng(coords[1], coords[0]); // [lat, lng] for Leaflet
          }
        });
        
        const bounds = geoJsonLayer.getBounds();
        
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
          console.log('Map fit to bounds:', bounds);
        } else {
          console.warn('Invalid bounds, cannot fit map');
        }
      } catch (error) {
        console.error("Error fitting to bounds:", error);
      }
    }
  }, [geoJsonData, map]);
  
  return null;
};

// Component to handle map clicks and record points
const LineDrawer = ({ isDrawingMode, onPointSelected, linePoints }) => {
  const map = useMapEvents({
    click: (e) => {
      if (isDrawingMode) {
        const { lat, lng } = e.latlng;
        onPointSelected([lat, lng]);
      }
    }
  });

  return null;
};

const BlockModelViewer = ({ blockModelData, sourceProjection = 'EPSG:4326' }) => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(12);
  const [isExportEnabled, setIsExportEnabled] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [linePoints, setLinePoints] = useState([]);
  const mapRef = useRef(null);
  
  // Style function for the GeoJSON layer
  const blockModelStyle = (feature) => {
    const rockType = feature.properties.rock;
    let fillColor = '#3388ff'; // Default blue
    
    if (rockType === 'ORE') {
      fillColor = '#ff0000'; // Red for ore
    } else if (rockType === 'WASTE') {
      fillColor = '#969696'; // Grey for waste
    }
    
    return {
      fillColor: fillColor,
      weight: 1,
      opacity: 1,
      color: 'black',
      fillOpacity: 0.7
    };
  };

  // Add popup content to each feature
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const props = feature.properties;
      const popupContent = `
        <div>
          <strong>Rock Type:</strong> ${props.rock || 'Unknown'}<br>
          <strong>Centroid:</strong> X=${props.centroid_x.toFixed(2)}, Y=${props.centroid_y.toFixed(2)}, Z=${props.centroid_z.toFixed(2)}<br>
          <strong>Dimensions:</strong> ${props.dim_x.toFixed(2)} × ${props.dim_y.toFixed(2)} × ${props.dim_z.toFixed(2)}
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  const handlePointSelected = (point) => {
    // Add the point to our line
    setLinePoints(prevPoints => {
      // If we already have 2 points, reset to the new point to start a new line
      if (prevPoints.length >= 2) {
        return [point];
      }
      // Otherwise add this point to the existing line
      return [...prevPoints, point];
    });
  };

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    if (isDrawingMode) {
      // Coming out of drawing mode - reset points
      setLinePoints([]);
    }
  };

  const clearLine = () => {
    setLinePoints([]);
  };

  // Generate cross-section from the current line
  const generateCrossSection = () => {
    if (linePoints.length < 2) {
      alert('Please select two points to create a cross-section');
      return;
    }

    // Here you would implement the logic to create a cross-section
    // For now, just output the line points to console
    console.log('Creating cross-section between points:', linePoints);
    
    // Convert Leaflet [lat, lng] coordinates back to your original coordinate system
    // This would be more complex in real implementation
    alert(`Line created from (${linePoints[0][0].toFixed(6)}, ${linePoints[0][1].toFixed(6)}) to (${linePoints[1][0].toFixed(6)}, ${linePoints[1][1].toFixed(6)})`);
  };

  useEffect(() => {
    if (blockModelData && blockModelData.length > 0) {
      try {
        console.log(`Processing data with projection: ${sourceProjection}`);
        
        // Process the data into GeoJSON with the specified projection
        const processedData = processBlockModelCSV(blockModelData, sourceProjection);
        console.log("Processed GeoJSON data sample:", 
          processedData.features.length > 0 ? processedData.features[0] : 'No features');
        
        setGeoJsonData(processedData);
        setIsExportEnabled(processedData.features.length > 0);
        
        // Set the map center to the first feature's coordinates if available
        if (processedData.features && processedData.features.length > 0) {
          const firstFeature = processedData.features[0];
          if (firstFeature.geometry && firstFeature.geometry.coordinates && 
              firstFeature.geometry.coordinates[0] && firstFeature.geometry.coordinates[0][0]) {
            // GeoJSON uses [longitude, latitude] but Leaflet expects [latitude, longitude]
            const coords = firstFeature.geometry.coordinates[0][0];
            setMapCenter([coords[1], coords[0]]);
            console.log('Setting map center to:', [coords[1], coords[0]]);
          }
        }
      } catch (error) {
        console.error("Error processing block model data:", error);
      }
    }
  }, [blockModelData, sourceProjection]);

  // Export GeoJSON to a file
  const exportGeoJSON = () => {
    if (!geoJsonData) return;
    
    const dataStr = JSON.stringify(geoJsonData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'block_model.geojson';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!blockModelData || blockModelData.length === 0) {
    return <div className="p-4">Please upload a block model CSV file.</div>;
  }

  return (
    <div className="w-full relative flex flex-col">
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <button
          onClick={toggleDrawingMode}
          className={`px-2 py-1 text-sm rounded ${isDrawingMode ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
        >
          {isDrawingMode ? 'Drawing Mode (ON)' : 'Drawing Mode (OFF)'}
        </button>
        
        <button
          onClick={clearLine}
          disabled={linePoints.length === 0}
          className="bg-yellow-500 text-white px-2 py-1 text-sm rounded disabled:bg-yellow-300"
        >
          Clear Line
        </button>
        
        <button
          onClick={generateCrossSection}
          disabled={linePoints.length < 2}
          className="bg-purple-500 text-white px-2 py-1 text-sm rounded disabled:bg-purple-300"
        >
          Create Cross-Section
        </button>
        
        <button
          onClick={exportGeoJSON}
          disabled={!isExportEnabled}
          className="bg-blue-500 text-white px-2 py-1 text-sm rounded disabled:bg-blue-300"
        >
          Export GeoJSON
        </button>
      </div>
      
      <div className="mt-10 text-center">
        {isDrawingMode && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded my-2">
            Click on the map to select points. {linePoints.length === 0 ? 'Select first point.' : 'Select second point.'}
          </div>
        )}
        
        {linePoints.length > 0 && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded my-2">
            Points selected: {linePoints.length}/2
            {linePoints.map((point, idx) => (
              <div key={idx}>
                Point {idx + 1}: Lat {point[0].toFixed(6)}, Lng {point[1].toFixed(6)}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex-grow" style={{ height: '80vh' }}>
        <MapContainer 
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: "100%", height: "100vh" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {geoJsonData && geoJsonData.features && geoJsonData.features.length > 0 && (
            <>
              <GeoJSON 
                data={geoJsonData} 
                style={blockModelStyle}
                onEachFeature={onEachFeature}
                coordsToLatLng={(coords) => {
                  // Explicitly convert GeoJSON [lng, lat] to Leaflet [lat, lng]
                  return L.latLng(coords[1], coords[0]);
                }}
              />
              <FitBoundsToData geoJsonData={geoJsonData} />
            </>
          )}
          
          {/* Line drawing components */}
          <LineDrawer 
            isDrawingMode={isDrawingMode} 
            onPointSelected={handlePointSelected}
            linePoints={linePoints}
          />
          
          {/* Show markers for each point */}
          {linePoints.map((point, index) => (
            <Marker key={`marker-${index}`} position={point}>
            </Marker>
          ))}
          
          {/* Draw line if we have 2 points */}
          {linePoints.length === 2 && (
            <Polyline 
              positions={linePoints}
              color="blue"
              weight={3}
              dashArray="5, 10"
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default BlockModelViewer;