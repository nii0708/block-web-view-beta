// // src/App.js
// import React, { useState } from 'react';
// import FileUploader from './components/FileUploader';
// import BlockModelViewer from './components/BlockModelViewer';
// import CrossSection from './components/CrossSection';
// import './App.css';

// function App() {
//   const [blockModelData, setBlockModelData] = useState(null);
//   const [dataProjection, setDataProjection] = useState('EPSG:4326');
//   const [lineGeoJson, setLineGeoJson] = useState(null);

//   const handleBlockModelUpload = (data, projection) => {
//     setBlockModelData(data);
//     setDataProjection(projection);
//   };

//   const handleLineCreated = (lineData) => {
//     setLineGeoJson(lineData);
//   };

//   return (
//     <div className="App p-4 max-w-6xl mx-auto">
//       <header className="mb-6">
//         <h1 className="text-2xl font-bold">Block Model Visualizer</h1>
//         <p className="text-gray-600">Upload block model data to visualize and interact</p>
//       </header>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         <FileUploader 
//           onBlockModelUpload={handleBlockModelUpload} 
//         />
        
//         <div className="p-4 border rounded shadow">
//           <h2 className="text-xl font-bold mb-4">Instructions</h2>
//           <ol className="list-decimal list-inside">
//             <li className="mb-2">Upload a block model CSV file</li>
//             <li className="mb-2">Select the coordinate system of your data</li>
//             <li className="mb-2">View the top-down rendering of the block model</li>
//             <li className="mb-2">Interact with the model to create lines</li>
//             <li>Generate cross-views from intersections</li>
//           </ol>
//         </div>
//       </div>
      
//       <div className="border rounded shadow mb-6">
//         <h2 className="text-xl font-bold p-4 border-b">Block Model Top-Down View</h2>
//         {dataProjection && (
//           <div className="text-sm text-gray-600 p-2 border-b">
//             Data projection: {dataProjection}
//           </div>
//         )}
//         <BlockModelViewer 
//           blockModelData={blockModelData}
//           sourceProjection={dataProjection}
//           onLineCreated={handleLineCreated}
//         />
//       </div>
      
//       <div className="border rounded shadow mb-6">
//         <h2 className="text-xl font-bold p-4 border-b">Cross-Section View</h2>
//         <CrossSection 
//           blockModelData={blockModelData}
//           lineGeoJson={lineGeoJson}
//           sourceProjection={dataProjection}
//         />
//       </div>
//     </div>
//   );
// }

// export default App;

// src/App.js
import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import BlockModelViewer from './components/BlockModelViewer';
import CrossSection from './components/CrossSection';
import { processElevationData } from './utils/elevationUtils';
import './App.css';

function App() {
  const [blockModelData, setBlockModelData] = useState(null);
  const [dataProjection, setDataProjection] = useState('EPSG:4326');
  const [lineGeoJson, setLineGeoJson] = useState(null);
  const [elevationData, setElevationData] = useState(null);

  const handleBlockModelUpload = (data, projection) => {
    setBlockModelData(data);
    setDataProjection(projection);
  };

  const handleElevationDataUpload = (data, projection) => {
    // Process the elevation data to convert coordinates and prepare for visualization
    const processedElevationData = processElevationData(
      data, 
      projection, 
      'lon',   // Longitude/Easting field name
      'lat',   // Latitude/Northing field name
      'z'    // Elevation field name
    );
    
    console.log(`Processed ${processedElevationData.length} elevation points`);
    setElevationData(processedElevationData);
  };
  console.log('elevation ',elevationData)

  const handleLineCreated = (lineData) => {
    setLineGeoJson(lineData);
  };

  return (
    <div className="App p-4 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Block Model Visualizer</h1>
        <p className="text-gray-600">Upload block model and elevation data to visualize and interact</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FileUploader 
          onBlockModelUpload={handleBlockModelUpload}
          onElevationDataUpload={handleElevationDataUpload}
        />
        
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside">
            <li className="mb-2">Upload a block model CSV file</li>
            <li className="mb-2">Optionally upload an elevation CSV file</li>
            <li className="mb-2">Select the coordinate system of your data</li>
            <li className="mb-2">View the top-down rendering of the block model</li>
            <li className="mb-2">Interact with the model to create lines</li>
            <li>Generate cross-sections with terrain elevation</li>
          </ol>
        </div>
      </div>
      
      <div className="border rounded shadow mb-6">
        <h2 className="text-xl font-bold p-4 border-b">Block Model Top-Down View</h2>
        {dataProjection && (
          <div className="text-sm text-gray-600 p-2 border-b">
            Data projection: {dataProjection}
          </div>
        )}
        <BlockModelViewer 
          blockModelData={blockModelData}
          sourceProjection={dataProjection}
          onLineCreated={handleLineCreated}
        />
      </div>
      
      <div className="border rounded shadow mb-6">
        <h2 className="text-xl font-bold p-4 border-b">Cross-Section View</h2>
        <CrossSection 
          blockModelData={blockModelData}
          lineGeoJson={lineGeoJson}
          sourceProjection={dataProjection}
          elevationData={elevationData}
        />
      </div>
    </div>
  );
}

export default App;