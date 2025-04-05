// src/utils/elevationUtils.js
import Papa from 'papaparse';
import { convertCoordinates } from './projectionUtils';

export const processElevationData = (data, sourceProjection, lonField = 'x', latField = 'y', elevField = 'z') => {
  if (!data || data.length === 0) {
    console.warn('No elevation data to process');
    return [];
  }

  console.log(`Processing ${data.length} elevation points from projection ${sourceProjection}`);
  console.log('Sample elevation data:', data[0]);

  return data.map((point, index) => {
    const x = parseFloat(point[lonField]);
    const y = parseFloat(point[latField]);
    const elevation = parseFloat(point[elevField]);

    if (isNaN(x) || isNaN(y) || isNaN(elevation)) {
      console.warn(`Invalid elevation data at index ${index}:`, point);
      return null;
    }

    let wgs84Coords;
    if (sourceProjection !== 'EPSG:4326') {
      wgs84Coords = convertCoordinates([x, y], sourceProjection, 'EPSG:4326');
    } else {
      wgs84Coords = [x, y];
    }

    return {
      original: { x, y },
      wgs84: { lng: wgs84Coords[0], lat: wgs84Coords[1] },
      elevation
    };
  }).filter(point => point !== null);
};

export const generateElevationProfile = (elevationPoints, lineGeoJson, sampleCount = 100) => {
  if (!elevationPoints || elevationPoints.length === 0 || !lineGeoJson) {
    return [];
  }

  const lineCoords = lineGeoJson.geometry.coordinates;
  if (lineCoords.length < 2) {
    return [];
  }

  const startPoint = lineCoords[0]; // [lng, lat]
  const endPoint = lineCoords[1]; // [lng, lat]
  const lineLength = calculateDistance(
    startPoint[0], startPoint[1],
    endPoint[0], endPoint[1]
  );

  const samplePoints = [];
  for (let i = 0; i < sampleCount; i++) {
    const ratio = i / (sampleCount - 1);
    
    const lng = startPoint[0] + ratio * (endPoint[0] - startPoint[0]);
    const lat = startPoint[1] + ratio * (endPoint[1] - startPoint[1]);
    const distanceAlongLine = ratio * lineLength;
    console.log('long ', lng)
    console.log('lat  ', lat)
    
    const elevation = interpolateElevation(lng, lat, elevationPoints);
    
    samplePoints.push({
      lng,
      lat,
      distance: distanceAlongLine,
      elevation
    });
  }

  return samplePoints;
};

const interpolateElevation = (lng, lat, elevationPoints, power = 2, searchRadius = 0.00005) => {
  const nearbyPoints = elevationPoints.filter(point => 
    Math.abs(point.wgs84.lng - lng) < searchRadius && 
    Math.abs(point.wgs84.lat - lat) < searchRadius
  );
  
  if (nearbyPoints.length === 0) {
    const extendedPoints = elevationPoints.filter(point => 
      Math.abs(point.wgs84.lng - lng) < searchRadius * 5 && 
      Math.abs(point.wgs84.lat - lat) < searchRadius * 5
    );
    
    if (extendedPoints.length === 0) {
      return 0; // Default elevation if no points found
    }
    
    let nearestDist = Infinity;
    let nearestElev = 0;
    
    extendedPoints.forEach(point => {
      const dist = calculateDistance(
        lng, lat, 
        point.wgs84.lng, point.wgs84.lat
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestElev = point.elevation;
      }
    });
    
    return nearestElev;
  }
  console.log('ln: ',lng)
  console.log('lt: ',lat)
  console.log('nearbyPoints',nearbyPoints)
  console.log(typeof nearbyPoints)
  if (nearbyPoints.length === 1) {
    return nearbyPoints[0].elevation;
  }
  
  let weightSum = 0;
  let valueSum = 0;
  
  nearbyPoints.forEach(point => {
    const distance = calculateDistance(
      lng, lat,
      point.wgs84.lng, point.wgs84.lat
    );
    
    if (distance < 0.0000001) {
      weightSum = 1;
      valueSum = point.elevation;
      return;
    }
    
    const weight = 1 / Math.pow(distance, power);
    weightSum += weight;
    valueSum += weight * point.elevation;
  });
  
  return valueSum / weightSum;
};

const calculateDistance = (lng1, lat1, lng2, lat2) => {
  // Simplified Euclidean distance in degrees
  return Math.sqrt(
    Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2)
  );
};


// src/utils/elevationUtils.js
// import { convertCoordinates } from './projectionUtils';

// export const processElevationData = (data, sourceProjection, lonField = 'x', latField = 'y', elevField = 'z') => {
//   if (!data || data.length === 0) {
//     console.warn('No elevation data to process');
//     return [];
//   }

//   console.log(`Processing ${data.length} elevation points from projection ${sourceProjection}`);
//   console.log('Sample elevation data:', data[0]);

//   return data.map((point, index) => {
//     // Parse coordinates and elevation
//     const x = parseFloat(point[lonField]);
//     const y = parseFloat(point[latField]);
//     const elevation = parseFloat(point[elevField]);

//     if (isNaN(x) || isNaN(y) || isNaN(elevation)) {
//       console.warn(`Invalid elevation data at index ${index}:`, point);
//       return null;
//     }

//     // Convert coordinates to WGS84 if needed
//     let wgs84Coords;
//     if (sourceProjection !== 'EPSG:4326') {
//       wgs84Coords = convertCoordinates([x, y], sourceProjection, 'EPSG:4326');
//     } else {
//       wgs84Coords = [x, y];
//     }

//     return {
//       original: { x, y },
//       wgs84: { lng: wgs84Coords[0], lat: wgs84Coords[1] },
//       elevation
//     };
//   }).filter(point => point !== null);
// };

// // Class implementing a simple 2D k-d tree
// class KDTree {
//   constructor(points, getX, getY) {
//     this.root = null;
//     this.getX = getX || (point => point.x);
//     this.getY = getY || (point => point.y);
    
//     if (points && points.length > 0) {
//       this.root = this.buildTree(points, 0);
//     }
//   }
  
//   buildTree(points, depth) {
//     if (points.length === 0) return null;
    
//     const axis = depth % 2;
//     const compareFn = axis === 0 
//       ? (a, b) => this.getX(a) - this.getX(b)
//       : (a, b) => this.getY(a) - this.getY(b);
    
//     // Sort points by current axis
//     points.sort(compareFn);
    
//     // Select median as pivot
//     const medianIdx = Math.floor(points.length / 2);
//     const medianPoint = points[medianIdx];
    
//     // Create node and build subtrees
//     const node = {
//       point: medianPoint,
//       left: this.buildTree(points.slice(0, medianIdx), depth + 1),
//       right: this.buildTree(points.slice(medianIdx + 1), depth + 1),
//       axis
//     };
    
//     return node;
//   }
  
//   distanceSquared(pointA, pointB) {
//     const dx = this.getX(pointA) - this.getX(pointB);
//     const dy = this.getY(pointA) - this.getY(pointB);
//     return dx * dx + dy * dy;
//   }
  
//   findNearestNeighbor(point, k = 1) {
//     if (!this.root) return [];
    
//     // Use a max heap to store k-nearest points
//     const bestPoints = [];
    
//     // Helper function to insert into heap
//     const insertIntoHeap = (newPoint, distance) => {
//       if (bestPoints.length < k) {
//         // If heap not full, just add
//         bestPoints.push({ point: newPoint, distance });
//         // Heapify up
//         let idx = bestPoints.length - 1;
//         while (idx > 0) {
//           const parentIdx = Math.floor((idx - 1) / 2);
//           if (bestPoints[parentIdx].distance < bestPoints[idx].distance) {
//             // Swap
//             [bestPoints[parentIdx], bestPoints[idx]] = [bestPoints[idx], bestPoints[parentIdx]];
//             idx = parentIdx;
//           } else {
//             break;
//           }
//         }
//       } else if (distance < bestPoints[0].distance) {
//         // Replace root with new point
//         bestPoints[0] = { point: newPoint, distance };
//         // Heapify down
//         let idx = 0;
//         while (true) {
//           const leftIdx = 2 * idx + 1;
//           const rightIdx = 2 * idx + 2;
//           let largestIdx = idx;
          
//           if (leftIdx < bestPoints.length && bestPoints[leftIdx].distance > bestPoints[largestIdx].distance) {
//             largestIdx = leftIdx;
//           }
          
//           if (rightIdx < bestPoints.length && bestPoints[rightIdx].distance > bestPoints[largestIdx].distance) {
//             largestIdx = rightIdx;
//           }
          
//           if (largestIdx === idx) {
//             break;
//           }
          
//           // Swap
//           [bestPoints[idx], bestPoints[largestIdx]] = [bestPoints[largestIdx], bestPoints[idx]];
//           idx = largestIdx;
//         }
//       }
//     };
    
//     // Recursive search function
//     const search = (node, depth) => {
//       if (!node) return;
      
//       const currentDistance = this.distanceSquared(point, node.point);
//       insertIntoHeap(node.point, currentDistance);
      
//       // Determine which subtree to search first
//       const axis = depth % 2;
//       const value = axis === 0 ? this.getX(point) : this.getY(point);
//       const nodeValue = axis === 0 ? this.getX(node.point) : this.getY(node.point);
      
//       const nearerNode = value < nodeValue ? node.left : node.right;
//       const furtherNode = value < nodeValue ? node.right : node.left;
      
//       // Search down the nearer branch
//       search(nearerNode, depth + 1);
      
//       // Check if we need to search the other branch
//       // We do this by checking if the distance to the splitting plane
//       // is less than our current best distance
//       const axisDistance = Math.abs(value - nodeValue);
//       const worstBestDistance = bestPoints.length < k ? Infinity : bestPoints[0].distance;
      
//       if (axisDistance * axisDistance < worstBestDistance) {
//         search(furtherNode, depth + 1);
//       }
//     };
    
//     // Start search
//     search(this.root, 0);
    
//     // Return results sorted by distance (closest first)
//     return bestPoints
//       .sort((a, b) => a.distance - b.distance)
//       .map(item => ({ point: item.point, distance: Math.sqrt(item.distance) }));
//   }
// }

// export const generateElevationProfile = (elevationPoints, lineGeoJson, sampleCount = 500) => {
//   if (!elevationPoints || elevationPoints.length === 0 || !lineGeoJson) {
//     return [];
//   }

//   // Extract line coordinates
//   const lineCoords = lineGeoJson.geometry.coordinates;
//   if (lineCoords.length < 2) {
//     return [];
//   }

//   // Build k-d tree for efficient nearest neighbor search
//   const kdTree = new KDTree(
//     elevationPoints,
//     point => point.wgs84.lng,
//     point => point.wgs84.lat
//   );

//   // Start and end points of the line
//   const startPoint = lineCoords[0]; // [lng, lat]
//   const endPoint = lineCoords[1]; // [lng, lat]

//   // Calculate total line length using Haversine formula for better accuracy
//   const lineLength = calculateHaversineDistance(
//     startPoint[1], startPoint[0], // lat, lng
//     endPoint[1], endPoint[0]  // lat, lng
//   );

//   console.log(`Line length: ${lineLength.toFixed(2)} meters`);

//   // Generate evenly spaced sample points along the line
//   const samplePoints = [];
//   for (let i = 0; i < sampleCount; i++) {
//     const ratio = i / (sampleCount - 1);
//     const lng = startPoint[0] + ratio * (endPoint[0] - startPoint[0]);
//     const lat = startPoint[1] + ratio * (endPoint[1] - startPoint[1]);
//     const distanceAlongLine = ratio * lineLength;
    
//     // Find nearest elevation point using k-d tree (more accurate than interpolation)
//     const nearest = kdTree.findNearestNeighbor({ wgs84: { lng, lat } }, 3);
    
//     // Use inverse distance weighting with the k nearest neighbors for better accuracy
//     let weightSum = 0;
//     let elevationSum = 0;
    
//     if (nearest.length === 0) {
//       // No nearby points found (shouldn't happen with properly structured data)
//       samplePoints.push({
//         lng,
//         lat, 
//         distance: distanceAlongLine,
//         elevation: 0
//       });
//       continue;
//     }
    
//     // If the nearest point is very close, just use its elevation directly
//     if (nearest[0].distance < 0.0000001) {
//       samplePoints.push({
//         lng,
//         lat,
//         distance: distanceAlongLine,
//         elevation: nearest[0].point.elevation
//       });
//       continue;
//     }
    
//     // Otherwise use IDW with the nearest k points
//     for (const neighbor of nearest) {
//       // Weight is inversely proportional to distance squared
//       const weight = 1 / (neighbor.distance * neighbor.distance);
//       weightSum += weight;
//       elevationSum += weight * neighbor.point.elevation;
//     }
    
//     const elevation = elevationSum / weightSum;
    
//     samplePoints.push({
//       lng,
//       lat,
//       distance: distanceAlongLine,
//       elevation
//     });
//   }

//   return samplePoints;
// };

// // Calculate distance using Haversine formula (more accurate for geographic coordinates)
// const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371e3; // Earth radius in meters
//   const φ1 = lat1 * Math.PI / 180;
//   const φ2 = lat2 * Math.PI / 180;
//   const Δφ = (lat2 - lat1) * Math.PI / 180;
//   const Δλ = (lon2 - lon1) * Math.PI / 180;

//   const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//           Math.cos(φ1) * Math.cos(φ2) *
//           Math.sin(Δλ/2) * Math.sin(Δλ/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

//   return R * c; // Distance in meters
// };