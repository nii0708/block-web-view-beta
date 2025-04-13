// src/components/BlockModelViewer.js
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { blockModelToGeoJSON } from '../utils/blockModelToGeoJSON';
import { addPointToLine, pointsToGeoJSONLine, calculateLineDistance } from '../utils/lineDrawerUtils';
import L from 'leaflet';
import proj4 from 'proj4';
import { processPitDataToGeoJSON } from '../utils/processPitData';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

window.proj4 = proj4;

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
const LineDrawer = ({ isDrawingMode, onPointSelected }) => {
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



const BlockModelViewer = ({ blockModelData, pitData, sourceProjection = 'EPSG:4326', onLineCreated }) => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [pitGeoJsonData, setPitGeoJsonData] = useState(null);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(12);
  const [isExportEnabled, setIsExportEnabled] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [linePoints, setLinePoints] = useState([]);
  const [lineGeoJson, setLineGeoJson] = useState(null);
  const mapRef = useRef(null);

  // Style function for the GeoJSON layer
  const blockModelStyle = (feature) => {
    const rockType = feature.properties.rock;
    let fillColor = '#3388ff'; // Default blue

    if (rockType === 'sap') {
      fillColor = '#ff0000'; // Red for ore
    } else if (rockType === 'lim') {
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

  // Style function for pit boundary lines
  const pitBoundaryStyle = (feature) => {
    return {
      color: '#ff8c00', // Orange for pit boundaries
      weight: 2,
      opacity: 0.8,
      dashArray: '5, 5' // Dashed line for boundary
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

  // Add popup content to pit boundary features
  const onEachPitFeature = (feature, layer) => {
    if (feature.properties) {
      const props = feature.properties;
      const popupContent = `
        <div>
          <strong>Type:</strong> Pit Boundary<br>
          <strong>Elevation:</strong> ${props.level.toFixed(2)}
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  const handlePointSelected = (point) => {
    // Use the helper function to add the point to our line
    const updatedPoints = addPointToLine(linePoints, point);
    setLinePoints(updatedPoints);

    // If we have 2 points, create a GeoJSON line
    if (updatedPoints.length === 2) {
      const newLineGeoJson = pointsToGeoJSONLine(updatedPoints);
      setLineGeoJson(newLineGeoJson);
      console.log('Created GeoJSON line:', newLineGeoJson);

      // Notify parent component about the new line
      if (onLineCreated) {
        onLineCreated(newLineGeoJson);
      }

      // Calculate and log the line distance
      const distance = calculateLineDistance(updatedPoints);
      console.log(`Line distance: ${distance.toFixed(2)} meters`);
    } else if (updatedPoints.length < 2) {
      setLineGeoJson(null);

      // Clear the line in parent component
      if (onLineCreated) {
        onLineCreated(null);
      }
    }
  };

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    if (isDrawingMode) {
      // Coming out of drawing mode - reset points
      setLinePoints([]);
      setLineGeoJson(null);

      // Clear the line in parent component
      if (onLineCreated) {
        onLineCreated(null);
      }
    }
  };

  const clearLine = () => {
    setLinePoints([]);
    setLineGeoJson(null);

    // Clear the line in parent component
    if (onLineCreated) {
      onLineCreated(null);
    }
  };

  // Generate cross-section from the current line
  const generateCrossSection = () => {
    if (linePoints.length < 2) {
      alert('Please select two points to create a cross-section');
      return;
    }

    if (!lineGeoJson) {
      alert('Unable to create GeoJSON line for cross-section');
      return;
    }

    // Notify parent component about the line for cross-section
    if (onLineCreated) {
      onLineCreated(lineGeoJson);
    }

    // Scroll to the cross-section view
    const crossSectionElement = document.getElementById('cross-section-view');
    if (crossSectionElement) {
      crossSectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Process block model data
  useEffect(() => {
    if (blockModelData && blockModelData.length > 0) {
      try {
        // Use the helper function to process the block model data
        const { geoJsonData: processedData, mapCenter: initialMapCenter,
          isExportEnabled: canExport } = blockModelToGeoJSON(blockModelData, sourceProjection);

        setGeoJsonData(processedData);
        setMapCenter(initialMapCenter);
        setIsExportEnabled(canExport);
      } catch (error) {
        console.error("Error processing block model data:", error);
      }
    }
  }, [blockModelData, sourceProjection]);

  // Process pit data
  useEffect(() => {
    if (pitData && pitData.length > 0) {
      try {
        // Process the pit data to GeoJSON
        const processedPitData = processPitDataToGeoJSON(pitData, sourceProjection);
        setPitGeoJsonData(processedPitData);
      } catch (error) {
        console.error("Error processing pit data:", error);
      }
    }
  }, [pitData, sourceProjection]);

  // Export GeoJSON to a file
  const exportGeoJSON = () => {
    if (!geoJsonData) return;

    const dataStr = JSON.stringify(geoJsonData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'block_model.geojson';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Export Pit GeoJSON to a file
  const exportPitGeoJSON = () => {
    if (!pitGeoJsonData) return;

    const dataStr = JSON.stringify(pitGeoJsonData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'pit_boundary.geojson';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Export Line GeoJSON to a file
  const exportLineGeoJSON = () => {
    if (!lineGeoJson) return;

    const dataStr = JSON.stringify(lineGeoJson, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'cross_section_line.geojson';

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
      // Replace your current toolbar div with this enhanced version
      {/* Replace the toolbar div with this properly formatted JSX */}
      <div className="absolute top-2 right-2 z-10 flex flex-wrap gap-2 max-w-xl bg-white bg-opacity-80 p-2 rounded">
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
          onClick={exportLineGeoJSON}
          disabled={!lineGeoJson}
          className="bg-indigo-500 text-white px-2 py-1 text-sm rounded disabled:bg-indigo-300"
        >
          Export Line GeoJSON
        </button>

        <button
          onClick={exportGeoJSON}
          disabled={!isExportEnabled}
          className="bg-blue-500 text-white px-2 py-1 text-sm rounded disabled:bg-blue-300"
        >
          Export Block Model
        </button>

        <button
          onClick={exportPitGeoJSON}
          className="bg-orange-500 text-white px-2 py-1 text-sm rounded"
        >
          Export Pit Data
        </button>

        {/* Add debug information */}
        <div className="text-xs bg-gray-100 p-1 rounded w-full mt-1">
          Pit data: {pitGeoJsonData ? `${pitGeoJsonData.features.length} features` : 'None'}
        </div>
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
            {linePoints.length === 2 && (
              <div className="mt-2">
                Line distance: {calculateLineDistance(linePoints).toFixed(2)} meters
              </div>
            )}
          </div>
        )}

        {pitGeoJsonData && (
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-2 rounded my-2">
            Pit boundary data loaded: {pitGeoJsonData.features.length} line segments
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

          {/* INSERT THE ENHANCED PIT GEOJSON COMPONENT HERE */}
          {pitGeoJsonData && pitGeoJsonData.features && pitGeoJsonData.features.length > 0 && (
            <GeoJSON
              data={pitGeoJsonData}
              style={() => ({
                color: '#ff8c00',
                weight: 3,
                opacity: 1,
                dashArray: '5, 5',
                fillColor: '#ff8c00',
                fillOpacity: 0.2
              })}
              onEachFeature={(feature, layer) => {
                if (feature.properties) {
                  const props = feature.properties;
                  const popupContent = `
            <div>
              <strong>Type:</strong> Pit Boundary<br>
              <strong>Elevation:</strong> ${props.level.toFixed(2)}
            </div>
          `;
                  layer.bindPopup(popupContent);
                }
                console.log("Added pit boundary feature to map:", feature);
              }}
              coordsToLatLng={(coords) => {
                console.log("Converting pit coords to LatLng:", coords);
                return L.latLng(coords[1], coords[0]);
              }}
            />
          )}

          {/* Display pit boundary data as an overlay */}
          {pitGeoJsonData && pitGeoJsonData.features && pitGeoJsonData.features.length > 0 && (
            <GeoJSON
              data={pitGeoJsonData}
              style={pitBoundaryStyle}
              onEachFeature={onEachPitFeature}
              coordsToLatLng={(coords) => {
                // Explicitly convert GeoJSON [lng, lat] to Leaflet [lat, lng]
                return L.latLng(coords[1], coords[0]);
              }}
            />
          )}

          {/* Line drawing components */}
          <LineDrawer
            isDrawingMode={isDrawingMode}
            onPointSelected={handlePointSelected}
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