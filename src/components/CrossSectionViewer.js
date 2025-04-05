// src/components/CrossSectionViewer.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as turf from '@turf/turf';

const CrossSectionViewer = ({ geoJsonData, linePoints, onClose }) => {
  const d3Container = useRef(null);
  
  useEffect(() => {
    if (geoJsonData && linePoints.length === 2 && d3Container.current) {
      generateCrossSection();
    }
  }, [geoJsonData, linePoints]);
  
  const generateCrossSection = () => {
    const svg = d3.select(d3Container.current);
    svg.selectAll("*").remove(); // Clear previous content
    
    // Convert Leaflet points [lat, lng] to GeoJSON format [lng, lat]
    const startPoint = turf.point([linePoints[0][1], linePoints[0][0]]);
    const endPoint = turf.point([linePoints[1][1], linePoints[1][0]]);
    
    // Create a line between the points
    const line = turf.lineString([
      [linePoints[0][1], linePoints[0][0]],
      [linePoints[1][1], linePoints[1][0]]
    ]);
    
    // Calculate the total distance of the line in meters
    const totalDistance = turf.length(line, { units: 'meters' });
    console.log(`Total line distance: ${totalDistance.toFixed(2)} meters`);
    
    // Sample points along the line
    const samplingDistance = 5; // meters between sample points
    const numSamples = Math.max(20, Math.ceil(totalDistance / samplingDistance));
    
    // Generate points along the line
    const points = Array.from({ length: numSamples }, (_, i) => {
      const fraction = i / (numSamples - 1);
      const point = turf.along(line, totalDistance * fraction, { units: 'meters' });
      return point;
    });
    
    // For each point, find the nearest block and get its height (centroid_z)
    const profileData = points.map((point, index) => {
      // Convert point to [lat, lng] for distance calculations
      const pointCoords = [point.geometry.coordinates[1], point.geometry.coordinates[0]];
      
      // Find the nearest block by checking which polygon contains the point
      // or is closest to the point
      let nearestBlock = null;
      let minDistance = Infinity;
      
      geoJsonData.features.forEach(feature => {
        // Convert Turf.js polygon coordinates from [lng, lat] to [lat, lng] for contains check
        const leafletPolygon = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
        
        // Calculate distance to this feature
        const featureCenter = [
          feature.properties.centroid_y,
          feature.properties.centroid_x
        ];
        
        const distance = turf.distance(
          turf.point([pointCoords[1], pointCoords[0]]),
          turf.point([featureCenter[1], featureCenter[0]]),
          { units: 'meters' }
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestBlock = feature;
        }
      });
      
      // Get distance from start point
      const distanceFromStart = turf.distance(
        startPoint,
        point,
        { units: 'meters' }
      );
      
      // Get height from the nearest block
      const height = nearestBlock ? nearestBlock.properties.centroid_z : 0;
      const rockType = nearestBlock ? nearestBlock.properties.rock : 'UNKNOWN';
      
      return {
        distance: distanceFromStart,
        height,
        rockType,
        point: [point.geometry.coordinates[1], point.geometry.coordinates[0]]
      };
    });
    
    console.log('Profile data points:', profileData.length);
    
    // Set up D3 visualization
    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    // Clear the SVG and set dimensions
    svg.attr('width', width)
       .attr('height', height);
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(profileData, d => d.distance)])
      .range([margin.left, width - margin.right]);
    
    // Find the min and max heights
    const minHeight = d3.min(profileData, d => d.height);
    const maxHeight = d3.max(profileData, d => d.height);
    const heightPadding = (maxHeight - minHeight) * 0.1;
    
    const yScale = d3.scaleLinear()
      .domain([minHeight - heightPadding, maxHeight + heightPadding])
      .range([height - margin.bottom, margin.top]);
    
    // Create a color scale for rock types
    const rockTypes = [...new Set(profileData.map(d => d.rockType))];
    const colorScale = d3.scaleOrdinal()
      .domain(rockTypes)
      .range(d3.schemeCategory10);
    
    // Add X and Y axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => `${d.toFixed(0)}m`);
    
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);
    
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${d.toFixed(1)}m`);
    
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);
    
    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text('Distance Along Line (meters)');
    
    svg.append('text')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('Elevation (meters)');
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('Vertical Profile Along Line');
    
    // Create the line generator
    const line1 = d3.line()
      .x(d => xScale(d.distance))
      .y(d => yScale(d.height))
      .curve(d3.curveMonotoneX);
    
    // Draw the line
    svg.append('path')
      .datum(profileData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line1);
    
    // Add dots for each sample point
    svg.selectAll('.dot')
      .data(profileData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.distance))
      .attr('cy', d => yScale(d.height))
      .attr('r', 4)
      .attr('fill', d => colorScale(d.rockType))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 6);
        
        // Add tooltip
        svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${xScale(d.distance)}, ${yScale(d.height) - 10})`)
          .append('text')
          .attr('text-anchor', 'middle')
          .text(`Z: ${d.height.toFixed(1)}m, Rock: ${d.rockType}`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 4);
        svg.select('.tooltip').remove();
      });
    
    // Add a legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);
    
    rockTypes.forEach((rockType, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
      
      legendRow.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', colorScale(rockType));
      
      legendRow.append('text')
        .attr('x', 15)
        .attr('y', 10)
        .text(rockType);
    });
  };
  
  return (
    <div className="p-4 border rounded shadow bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cross-Section View</h2>
        <button 
          className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      
      <div className="flex justify-center">
        <svg 
          className="bg-gray-50 border"
          ref={d3Container}
          width={800}
          height={400}
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Showing elevation profile along the line ({linePoints.length} points).</p>
        <p>First point: {linePoints[0][0].toFixed(6)}, {linePoints[0][1].toFixed(6)}</p>
        <p>Second point: {linePoints[1][0].toFixed(6)}, {linePoints[1][1].toFixed(6)}</p>
      </div>
    </div>
  );
};

export default CrossSectionViewer;