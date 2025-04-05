// // src/components/CrossSection.js
// import React, { useEffect, useRef, useState } from 'react';
// import * as d3 from 'd3';
// import { processBlockModelCSV } from '../utils/blockModelUtils';

// const CrossSection = ({ blockModelData, lineGeoJson, sourceProjection }) => {
//   const svgRef = useRef(null);
//   const [crossSectionData, setCrossSectionData] = useState(null);
//   const [processedGeoJSON, setProcessedGeoJSON] = useState(null);
//   const [dimensions, setDimensions] = useState({
//     width: 800,
//     height: 400,
//     margin: { top: 40, right: 40, bottom: 60, left: 60 }
//   });

//   // First, process the blockModelData into GeoJSON using blockModelUtils
//   useEffect(() => {
//     if (!blockModelData || blockModelData.length === 0) {
//       setProcessedGeoJSON(null);
//       return;
//     }

//     try {
//       // Process the block model data into GeoJSON
//       const geoJsonData = processBlockModelCSV(blockModelData, sourceProjection);
//       setProcessedGeoJSON(geoJsonData);
//       console.log('Processed block model data into GeoJSON:', geoJsonData);
//     } catch (error) {
//       console.error('Error processing block model data:', error);
//       setProcessedGeoJSON(null);
//     }
//   }, [blockModelData, sourceProjection]);

//   // Calculate cross-section data when line or processed GeoJSON changes
//   useEffect(() => {
//     if (!processedGeoJSON || !lineGeoJson || !lineGeoJson.geometry) {
//       setCrossSectionData(null);
//       return;
//     }

//     // Extract line coordinates (already in [lng, lat] format in GeoJSON)
//     const lineCoords = lineGeoJson.geometry.coordinates;
//     console.log('Line coordinates for cross-section:', lineCoords);

//     if (lineCoords.length < 2) {
//       setCrossSectionData(null);
//       return;
//     }

//     // Calculate the cross-section data using the processed GeoJSON
//     const crossSection = calculateCrossSection(processedGeoJSON, lineCoords, sourceProjection);
//     setCrossSectionData(crossSection);
//   }, [processedGeoJSON, lineGeoJson, sourceProjection]);

//   // Draw the cross-section using D3
//   useEffect(() => {
//     if (!crossSectionData || !svgRef.current) return;

//     const svg = d3.select(svgRef.current);
//     renderCrossSection(svg, crossSectionData, dimensions);
//   }, [crossSectionData, dimensions]);

//   // Calculate the cross-section by finding exact intersections with the line
//   const calculateCrossSection = (geoJsonData, lineCoords, sourceProjection) => {
//     if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) return null;

//     // Create a line segment from the coordinates
//     const startPoint = lineCoords[0]; // [lng, lat]
//     const endPoint = lineCoords[1]; // [lng, lat]
    
//     // Extract blocks from the GeoJSON features with exact intersections
//     const intersectingBlocks = [];
    
//     // For each polygon feature, check if the line intersects it
//     geoJsonData.features.forEach(feature => {
//       const polygon = feature.geometry.coordinates[0]; // First (and only) polygon ring
      
//       // Check if the line intersects this polygon
//       if (lineIntersectsPolygon(startPoint, endPoint, polygon)) {
//         // Calculate the centroid for this block
//         const centroid = calculatePolygonCentroid(polygon);
        
//         // Project the centroid onto the line
//         const projectedDistance = projectPointOntoLine(
//           [centroid[0], centroid[1], feature.properties.centroid_z || 0],
//           startPoint, 
//           endPoint
//         );
        
//         // Add the block to our intersecting blocks with its distance along the line
//         intersectingBlocks.push({
//           centroid: [
//             centroid[0], // lng
//             centroid[1], // lat
//             feature.properties.centroid_z || 0 // z (elevation)
//           ],
//           dimensions: [
//             feature.properties.dim_x || 10,
//             feature.properties.dim_y || 10,
//             feature.properties.dim_z || 10
//           ],
//           properties: {
//             rock: feature.properties.rock || 'unknown'
//           },
//           distance: projectedDistance.distance,
//           elevation: feature.properties.centroid_z || 0,
//           projectedPoint: projectedDistance.projectedPoint
//         });
//       }
//     });
    
//     console.log(`Found ${intersectingBlocks.length} blocks that intersect with the cross-section line`);

//     // Sort blocks by distance along the line
//     intersectingBlocks.sort((a, b) => a.distance - b.distance);

//     return {
//       blocks: intersectingBlocks,
//       lineLength: calculateLineLength(startPoint, endPoint),
//       startPoint,
//       endPoint
//     };
//   };

//   // Check if a line segment intersects a polygon
//   const lineIntersectsPolygon = (lineStart, lineEnd, polygon) => {
//     // For each edge of the polygon, check if it intersects with the line segment
//     for (let i = 0; i < polygon.length - 1; i++) {
//       const polyPointA = polygon[i];
//       const polyPointB = polygon[i + 1];
      
//       if (lineSegmentIntersection(
//           lineStart[0], lineStart[1], 
//           lineEnd[0], lineEnd[1],
//           polyPointA[0], polyPointA[1],
//           polyPointB[0], polyPointB[1]
//       )) {
//         return true;
//       }
//     }
    
//     // Also check if any of the line endpoints are inside the polygon
//     if (pointInPolygon(lineStart, polygon) || pointInPolygon(lineEnd, polygon)) {
//       return true;
//     }
    
//     return false;
//   };

//   // Check if a point is inside a polygon
//   const pointInPolygon = (point, polygon) => {
//     // Ray-casting algorithm
//     let inside = false;
//     const x = point[0];
//     const y = point[1];
    
//     for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
//       const xi = polygon[i][0], yi = polygon[i][1];
//       const xj = polygon[j][0], yj = polygon[j][1];
      
//       const intersect = ((yi > y) !== (yj > y)) &&
//           (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
//       if (intersect) inside = !inside;
//     }
    
//     return inside;
//   };

//   // Check if two line segments intersect
//   const lineSegmentIntersection = (x1, y1, x2, y2, x3, y3, x4, y4) => {
//     // Calculate denominators
//     const den = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    
//     // Lines are parallel or coincident
//     if (den === 0) {
//       return false;
//     }
    
//     // Calculate the line intersection parameters
//     const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / den;
//     const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / den;
    
//     // Check if the intersection is within both line segments
//     return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
//   };

//   // Helper function to calculate the centroid of a polygon
//   const calculatePolygonCentroid = (polygon) => {
//     // Simple average of all vertices (excluding the last if it's the same as the first)
//     const points = polygon.length > 0 && polygon[0][0] === polygon[polygon.length - 1][0] && 
//                   polygon[0][1] === polygon[polygon.length - 1][1] 
//                   ? polygon.slice(0, -1) : polygon;
    
//     const sumX = points.reduce((sum, point) => sum + point[0], 0);
//     const sumY = points.reduce((sum, point) => sum + point[1], 0);
    
//     return [sumX / points.length, sumY / points.length];
//   };

//   // Project a point onto a line and calculate the distance along the line
//   const projectPointOntoLine = (point, lineStart, lineEnd) => {
//     const x0 = point[0];
//     const y0 = point[1];
//     const x1 = lineStart[0];
//     const y1 = lineStart[1];
//     const x2 = lineEnd[0];
//     const y2 = lineEnd[1];
    
//     // Vector from start to end of line
//     const lineVectorX = x2 - x1;
//     const lineVectorY = y2 - y1;
    
//     // Vector from start of line to point
//     const pointVectorX = x0 - x1;
//     const pointVectorY = y0 - y1;
    
//     // Calculate dot product
//     const dotProduct = pointVectorX * lineVectorX + pointVectorY * lineVectorY;
    
//     // Calculate squared length of the line
//     const lineSquaredLength = lineVectorX ** 2 + lineVectorY ** 2;
    
//     // Calculate the projection ratio (0 means at start, 1 means at end)
//     const ratio = Math.max(0, Math.min(1, dotProduct / lineSquaredLength));
    
//     // Calculate the projected point
//     const projectedX = x1 + ratio * lineVectorX;
//     const projectedY = y1 + ratio * lineVectorY;
    
//     // Calculate the distance from the start of the line
//     const distance = ratio * Math.sqrt(lineSquaredLength);
    
//     return {
//       projectedPoint: [projectedX, projectedY],
//       distance: distance
//     };
//   };

//   // Calculate the length of a line segment
//   const calculateLineLength = (start, end) => {
//     return Math.sqrt((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2);
//   };

//   // Render the cross-section visualization using D3
//   const renderCrossSection = (svg, data, dims) => {
//     // Clear previous content
//     svg.selectAll("*").remove();
    
//     const { width, height, margin } = dims;
//     const innerWidth = width - margin.left - margin.right;
//     const innerHeight = height - margin.top - margin.bottom;
    
//     // Create a group element for the visualization
//     const g = svg.append("g")
//       .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
//     // Find min and max elevation values for scaling
//     const blocks = data.blocks || [];
    
//     if (blocks.length === 0) {
//       // No blocks to render
//       g.append("text")
//         .attr("x", innerWidth / 2)
//         .attr("y", innerHeight / 2)
//         .attr("text-anchor", "middle")
//         .text("No blocks intersect with the current line.");
//       return;
//     }
    
//     const elevations = blocks.map(b => b.elevation);
//     const minElevation = Math.min(...elevations) - 10;
//     const maxElevation = Math.max(...elevations) + 10;
    
//     // Create scales
//     const xScale = d3.scaleLinear()
//       .domain([0, data.lineLength])
//       .range([0, innerWidth]);
    
//     const yScale = d3.scaleLinear()
//       .domain([minElevation, maxElevation])
//       .range([innerHeight, 0]);
    
//     // Create axes
//     const xAxis = d3.axisBottom(xScale);
//     const yAxis = d3.axisLeft(yScale);
    
//     // Add axes to the visualization
//     g.append("g")
//       .attr("class", "x-axis")
//       .attr("transform", `translate(0, ${innerHeight})`)
//       .call(xAxis);
    
//     g.append("g")
//       .attr("class", "y-axis")
//       .call(yAxis);
    
//     // Add axis labels
//     g.append("text")
//       .attr("class", "x-axis-label")
//       .attr("x", innerWidth / 2)
//       .attr("y", innerHeight + 40)
//       .attr("text-anchor", "middle")
//       .text("Distance along cross-section (m)");
    
//     g.append("text")
//       .attr("class", "y-axis-label")
//       .attr("transform", "rotate(-90)")
//       .attr("x", -innerHeight / 2)
//       .attr("y", -40)
//       .attr("text-anchor", "middle")
//       .text("Elevation (m)");
    
//     // Draw a reference line for the cross-section path
//     g.append("line")
//       .attr("x1", 0)
//       .attr("y1", innerHeight)
//       .attr("x2", innerWidth)
//       .attr("y2", innerHeight)
//       .attr("stroke", "#aaa")
//       .attr("stroke-width", 1)
//       .attr("stroke-dasharray", "5,5");
    
//     // Create a color scale for rock types
//     const rockTypes = [...new Set(blocks.map(b => b.properties.rock))];
    
//     // Add blocks to the visualization
//     g.selectAll(".block")
//       .data(blocks)
//       .enter()
//       .append("rect")
//       .attr("class", "block")
//       .attr("x", d => xScale(d.distance) - 5)
//       .attr("y", d => yScale(d.elevation + d.dimensions[2] / 2))
//       .attr("width", 10)
//       .attr("height", d => Math.abs(yScale(d.elevation - d.dimensions[2] / 2) - yScale(d.elevation + d.dimensions[2] / 2)))
//       .attr("fill", d => {
//         // Use the same color scheme as in BlockModelViewer
//         const rockType = d.properties.rock;
//         if (rockType === 'sap') return '#ff0000'; // Red for ore
//         if (rockType === 'lim') return '#969696'; // Grey for waste
//         return '#3388ff'; // Default blue
//       })
//       .attr("stroke", "black")
//       .attr("stroke-width", 0.5)
//       .append("title")
//       .text(d => `Rock type: ${d.properties.rock}, Elevation: ${d.elevation.toFixed(2)}m, Distance: ${d.distance.toFixed(2)}m`);
    
//     // Add distance markers along the x-axis
//     const blocksByDistance = d3.group(blocks, d => Math.floor(d.distance));
    
//     g.selectAll(".distance-marker")
//       .data(Array.from(blocksByDistance.keys()))
//       .enter()
//       .append("line")
//       .attr("class", "distance-marker")
//       .attr("x1", d => xScale(d))
//       .attr("y1", innerHeight)
//       .attr("x2", d => xScale(d))
//       .attr("y2", innerHeight + 10)
//       .attr("stroke", "#555")
//       .attr("stroke-width", 1);
    
//     // Add legend
//     const legend = g.append("g")
//       .attr("class", "legend")
//       .attr("transform", `translate(${innerWidth - 100}, 20)`);
    
//     rockTypes.forEach((rockType, i) => {
//       let color = '#3388ff'; // Default blue
//       if (rockType === 'sap') color = '#ff0000'; // Red for ore
//       if (rockType === 'lim') color = '#969696'; // Grey for waste
      
//       legend.append("rect")
//         .attr("x", 0)
//         .attr("y", i * 20)
//         .attr("width", 15)
//         .attr("height", 15)
//         .attr("fill", color);
      
//       legend.append("text")
//         .attr("x", 20)
//         .attr("y", i * 20 + 12)
//         .text(rockType);
//     });
//   };

//   if (!blockModelData) {
//     return (
//       <div className="p-4 text-center text-gray-500">
//         Please upload block model data to see the cross-section.
//       </div>
//     );
//   }

//   if (!lineGeoJson) {
//     return (
//       <div className="p-4 text-center text-gray-500">
//         Please draw a line on the map to generate a cross-section.
//       </div>
//     );
//   }

//   return (
//     <div className="w-full" id="cross-section-view">
//       <div className="p-4">
//         <h3 className="text-lg font-semibold mb-2">Cross-Section View</h3>
//         {crossSectionData ? (
//           <div className="text-sm text-gray-600 mb-4">
//             {crossSectionData.blocks.length} blocks exactly intersect with the cross-section line.
//           </div>
//         ) : (
//           <div className="text-sm text-gray-600 mb-4">
//             {processedGeoJSON ? 'Calculating cross-section...' : 'Processing block model data...'}
//           </div>
//         )}
//         <div className="border rounded p-2 bg-white overflow-x-auto">
//           <svg
//             ref={svgRef}
//             width={dimensions.width}
//             height={dimensions.height}
//             className="mx-auto"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CrossSection;

// src/components/CrossSection.js
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { processBlockModelCSV } from '../utils/blockModelUtils';
import { generateElevationProfile } from '../utils/elevationUtils';

const CrossSection = ({ blockModelData, lineGeoJson, sourceProjection, elevationData }) => {
  const svgRef = useRef(null);
  const [crossSectionData, setCrossSectionData] = useState(null);
  const [elevationProfile, setElevationProfile] = useState(null);
  const [processedGeoJSON, setProcessedGeoJSON] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 400,
    margin: { top: 40, right: 40, bottom: 60, left: 60 }
  });

  // First, process the blockModelData into GeoJSON using blockModelUtils
  useEffect(() => {
    if (!blockModelData || blockModelData.length === 0) {
      setProcessedGeoJSON(null);
      return;
    }

    try {
      // Process the block model data into GeoJSON
      const geoJsonData = processBlockModelCSV(blockModelData, sourceProjection);
      setProcessedGeoJSON(geoJsonData);
      console.log('Processed block model data into GeoJSON:', geoJsonData);
    } catch (error) {
      console.error('Error processing block model data:', error);
      setProcessedGeoJSON(null);
    }
  }, [blockModelData, sourceProjection]);

  // Generate elevation profile if we have elevation data and a line
  useEffect(() => {
    if (!elevationData || !lineGeoJson) {
      setElevationProfile(null);
      return;
    }

    try {
      // Generate elevation profile with 500 points along the line
      const profile = generateElevationProfile(elevationData, lineGeoJson, 500);
      setElevationProfile(profile);
      console.log('Generated elevation profile with', profile.length, 'points');
    } catch (error) {
      console.error('Error generating elevation profile:', error);
      setElevationProfile(null);
    }
  }, [elevationData, lineGeoJson]);

  // Calculate cross-section data when line or processed GeoJSON changes
  useEffect(() => {
    if (!processedGeoJSON || !lineGeoJson || !lineGeoJson.geometry) {
      setCrossSectionData(null);
      return;
    }

    // Extract line coordinates (already in [lng, lat] format in GeoJSON)
    const lineCoords = lineGeoJson.geometry.coordinates;
    console.log('Line coordinates for cross-section:', lineCoords);

    if (lineCoords.length < 2) {
      setCrossSectionData(null);
      return;
    }

    // Calculate the cross-section data using the processed GeoJSON
    const crossSection = calculateCrossSection(processedGeoJSON, lineCoords, sourceProjection);
    setCrossSectionData(crossSection);
  }, [processedGeoJSON, lineGeoJson, sourceProjection]);

  // Draw the cross-section using D3
  useEffect(() => {
    if (!crossSectionData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    renderCrossSection(svg, crossSectionData, dimensions, elevationProfile);
  }, [crossSectionData, dimensions, elevationProfile]);

  // Calculate the cross-section by finding exact intersections with the line
  const calculateCrossSection = (geoJsonData, lineCoords, sourceProjection) => {
    if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) return null;

    // Create a line segment from the coordinates
    const startPoint = lineCoords[0]; // [lng, lat]
    const endPoint = lineCoords[1]; // [lng, lat]
    
    // Extract blocks from the GeoJSON features with exact intersections
    const intersectingBlocks = [];
    
    // For each polygon feature, check if the line intersects it
    geoJsonData.features.forEach(feature => {
      const polygon = feature.geometry.coordinates[0]; // First (and only) polygon ring
      
      // Check if the line intersects this polygon
      if (lineIntersectsPolygon(startPoint, endPoint, polygon)) {
        // Calculate the centroid for this block
        const centroid = calculatePolygonCentroid(polygon);
        
        // Project the centroid onto the line
        const projectedDistance = projectPointOntoLine(
          [centroid[0], centroid[1], feature.properties.centroid_z || 0],
          startPoint, 
          endPoint
        );
        
        // Add the block to our intersecting blocks with its distance along the line
        intersectingBlocks.push({
          centroid: [
            centroid[0], // lng
            centroid[1], // lat
            feature.properties.centroid_z || 0 // z (elevation)
          ],
          dimensions: [
            feature.properties.dim_x || 10,
            feature.properties.dim_y || 10,
            feature.properties.dim_z || 10
          ],
          properties: {
            rock: feature.properties.rock || 'unknown'
          },
          distance: projectedDistance.distance,
          elevation: feature.properties.centroid_z || 0,
          projectedPoint: projectedDistance.projectedPoint
        });
      }
    });
    
    console.log(`Found ${intersectingBlocks.length} blocks that intersect with the cross-section line`);

    // Sort blocks by distance along the line
    intersectingBlocks.sort((a, b) => a.distance - b.distance);

    return {
      blocks: intersectingBlocks,
      lineLength: calculateLineLength(startPoint, endPoint),
      startPoint,
      endPoint
    };
  };

  // Check if a line segment intersects a polygon
  const lineIntersectsPolygon = (lineStart, lineEnd, polygon) => {
    // For each edge of the polygon, check if it intersects with the line segment
    for (let i = 0; i < polygon.length - 1; i++) {
      const polyPointA = polygon[i];
      const polyPointB = polygon[i + 1];
      
      if (lineSegmentIntersection(
          lineStart[0], lineStart[1], 
          lineEnd[0], lineEnd[1],
          polyPointA[0], polyPointA[1],
          polyPointB[0], polyPointB[1]
      )) {
        return true;
      }
    }
    
    // Also check if any of the line endpoints are inside the polygon
    if (pointInPolygon(lineStart, polygon) || pointInPolygon(lineEnd, polygon)) {
      return true;
    }
    
    return false;
  };

  // Check if a point is inside a polygon
  const pointInPolygon = (point, polygon) => {
    // Ray-casting algorithm
    let inside = false;
    const x = point[0];
    const y = point[1];
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      
      const intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  };

  // Check if two line segments intersect
  const lineSegmentIntersection = (x1, y1, x2, y2, x3, y3, x4, y4) => {
    // Calculate denominators
    const den = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    
    // Lines are parallel or coincident
    if (den === 0) {
      return false;
    }
    
    // Calculate the line intersection parameters
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / den;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / den;
    
    // Check if the intersection is within both line segments
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  };

  // Helper function to calculate the centroid of a polygon
  const calculatePolygonCentroid = (polygon) => {
    // Simple average of all vertices (excluding the last if it's the same as the first)
    const points = polygon.length > 0 && polygon[0][0] === polygon[polygon.length - 1][0] && 
                  polygon[0][1] === polygon[polygon.length - 1][1] 
                  ? polygon.slice(0, -1) : polygon;
    
    const sumX = points.reduce((sum, point) => sum + point[0], 0);
    const sumY = points.reduce((sum, point) => sum + point[1], 0);
    
    return [sumX / points.length, sumY / points.length];
  };

  // Project a point onto a line and calculate the distance along the line
  const projectPointOntoLine = (point, lineStart, lineEnd) => {
    const x0 = point[0];
    const y0 = point[1];
    const x1 = lineStart[0];
    const y1 = lineStart[1];
    const x2 = lineEnd[0];
    const y2 = lineEnd[1];
    
    // Vector from start to end of line
    const lineVectorX = x2 - x1;
    const lineVectorY = y2 - y1;
    
    // Vector from start of line to point
    const pointVectorX = x0 - x1;
    const pointVectorY = y0 - y1;
    
    // Calculate dot product
    const dotProduct = pointVectorX * lineVectorX + pointVectorY * lineVectorY;
    
    // Calculate squared length of the line
    const lineSquaredLength = lineVectorX ** 2 + lineVectorY ** 2;
    
    // Calculate the projection ratio (0 means at start, 1 means at end)
    const ratio = Math.max(0, Math.min(1, dotProduct / lineSquaredLength));
    
    // Calculate the projected point
    const projectedX = x1 + ratio * lineVectorX;
    const projectedY = y1 + ratio * lineVectorY;
    
    // Calculate the distance from the start of the line
    const distance = ratio * Math.sqrt(lineSquaredLength);
    
    return {
      projectedPoint: [projectedX, projectedY],
      distance: distance
    };
  };

  // Calculate the length of a line segment
  const calculateLineLength = (start, end) => {
    return Math.sqrt((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2);
  };

  // Render the cross-section visualization using D3
  const renderCrossSection = (svg, data, dims, elevationProfile) => {
    // Clear previous content
    svg.selectAll("*").remove();
    
    const { width, height, margin } = dims;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create a group element for the visualization
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Find min and max elevation values for scaling
    const blocks = data.blocks || [];
    
    if (blocks.length === 0 && (!elevationProfile || elevationProfile.length === 0)) {
      // No blocks or elevation data to render
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .text("No data intersects with the current line.");
      return;
    }
    
    // Collect all elevation values from blocks and elevation profile
    let allElevations = blocks.map(b => b.elevation);
    
    if (elevationProfile && elevationProfile.length > 0) {
      allElevations = [...allElevations, ...elevationProfile.map(p => p.elevation)];
    }
    
    const minElevation = Math.min(...allElevations) - 10;
    const maxElevation = Math.max(...allElevations) + 10;
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, data.lineLength])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([minElevation, maxElevation])
      .range([innerHeight, 0]);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
    // Add axes to the visualization
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis);
    
    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis);
    
    // Add axis labels
    g.append("text")
      .attr("class", "x-axis-label")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .text("Distance along cross-section (m)");
    
    g.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .text("Elevation (m)");
    
    // Draw a reference line for the cross-section path
    g.append("line")
      .attr("x1", 0)
      .attr("y1", innerHeight)
      .attr("x2", innerWidth)
      .attr("y2", innerHeight)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");
      
    // Draw elevation profile if available
    if (elevationProfile && elevationProfile.length > 0) {
      // Create a line generator
      const line = d3.line()
        .x(d => xScale(d.distance))
        .y(d => yScale(d.elevation))
        .curve(d3.curveBasis);
      
      // Add the elevation profile path
      g.append("path")
        .datum(elevationProfile)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("d", line);
        
      // Add a label for the elevation profile
      g.append("text")
        .attr("x", innerWidth - 150)
        .attr("y", 20)
        .attr("fill", "green")
        .attr("font-weight", "bold")
        .text("Terrain Elevation Profile");
    }
    
    // Add blocks to the visualization
    g.selectAll(".block")
      .data(blocks)
      .enter()
      .append("rect")
      .attr("class", "block")
      .attr("x", d => xScale(d.distance) - 5)
      .attr("y", d => yScale(d.elevation + d.dimensions[2] / 2))
      .attr("width", 10)
      .attr("height", d => Math.abs(yScale(d.elevation - d.dimensions[2] / 2) - yScale(d.elevation + d.dimensions[2] / 2)))
      .attr("fill", d => {
        // Use the same color scheme as in BlockModelViewer
        const rockType = d.properties.rock;
        if (rockType === 'sap') return '#ff0000'; // Red for ore
        if (rockType === 'lim') return '#969696'; // Grey for waste
        return '#3388ff'; // Default blue
      })
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .append("title")
      .text(d => `Rock type: ${d.properties.rock}, Elevation: ${d.elevation.toFixed(2)}m, Distance: ${d.distance.toFixed(2)}m`);
    
    // Add distance markers along the x-axis
    const blocksByDistance = d3.group(blocks, d => Math.floor(d.distance));
    
    g.selectAll(".distance-marker")
      .data(Array.from(blocksByDistance.keys()))
      .enter()
      .append("line")
      .attr("class", "distance-marker")
      .attr("x1", d => xScale(d))
      .attr("y1", innerHeight)
      .attr("x2", d => xScale(d))
      .attr("y2", innerHeight + 10)
      .attr("stroke", "#555")
      .attr("stroke-width", 1);
    
    // Create a unified legend
    const legendItems = [];
    
    // Add rock types to legend
    const rockTypes = [...new Set(blocks.map(b => b.properties.rock))];
    rockTypes.forEach(rockType => {
      let color = '#3388ff'; // Default blue
      if (rockType === 'sap') color = '#ff0000'; // Red for ore
      if (rockType === 'lim') color = '#969696'; // Grey for waste
      
      legendItems.push({
        label: rockType,
        color: color,
        type: 'rect'
      });
    });
    
    // Add elevation profile to legend if available
    if (elevationProfile && elevationProfile.length > 0) {
      legendItems.push({
        label: 'Terrain Elevation',
        color: 'green',
        type: 'line'
      });
    }
    
    // Draw the legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${innerWidth - 120}, 20)`);
    
    legendItems.forEach((item, i) => {
      if (item.type === 'rect') {
        legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 20)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", item.color);
      } else if (item.type === 'line') {
        legend.append("line")
          .attr("x1", 0)
          .attr("y1", i * 20 + 7.5)
          .attr("x2", 15)
          .attr("y2", i * 20 + 7.5)
          .attr("stroke", item.color)
          .attr("stroke-width", 2);
      }
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 12)
        .text(item.label);
    });
  };

  if (!blockModelData) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please upload block model data to see the cross-section.
      </div>
    );
  }

  if (!lineGeoJson) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please draw a line on the map to generate a cross-section.
      </div>
    );
  }

  return (
    <div className="w-full" id="cross-section-view">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Cross-Section View</h3>
        <div className="text-sm text-gray-600 mb-4">
          {crossSectionData ? (
            <div>
              {crossSectionData.blocks.length > 0 ? (
                <span>{crossSectionData.blocks.length} blocks intersect with the cross-section line. </span>
              ) : (
                <span>No blocks intersect with the cross-section line. </span>
              )}
              {elevationProfile ? (
                <span>Elevation profile generated with {elevationProfile.length} points.</span>
              ) : (
                <span>No elevation data available.</span>
              )}
            </div>
          ) : (
            <div>
              {processedGeoJSON ? 'Calculating cross-section...' : 'Processing data...'}
            </div>
          )}
        </div>
        <div className="border rounded p-2 bg-white overflow-x-auto">
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default CrossSection;