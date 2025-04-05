
// // src/App.js
// import React, { useState } from 'react';
// import FileUploader from './components/FileUploader';
// import BlockModelViewer from './components/BlockModelViewer';
// import './App.css';

// import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from 'react-leaflet';

// function App() {
//   const [blockModelData, setBlockModelData] = useState(null);
//   const [dataProjection, setDataProjection] = useState('EPSG:4326');

//   const handleBlockModelUpload = (data, projection) => {
//     setBlockModelData(data);
//     setDataProjection(projection);
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
//         />
//       </div>
      
//       {/* Future components will be added here */}
//       {/* <CrossSectionViewer /> */}
//     </div>
//   );
// }

// export default App;

// NEWWWW
// src/App.js
import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import BlockModelViewer from './components/BlockModelViewer';
import './App.css';

function App() {
  const [blockModelData, setBlockModelData] = useState(null);
  const [dataProjection, setDataProjection] = useState('EPSG:4326');

  const handleBlockModelUpload = (data, projection) => {
    setBlockModelData(data);
    setDataProjection(projection);
  };

  console.log("Block : ", )

  return (
    <div className="App p-4 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Block Model Visualizer</h1>
        <p className="text-gray-600">Upload block model data to visualize and interact</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FileUploader 
          onBlockModelUpload={handleBlockModelUpload} 
        />
        
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside">
            <li className="mb-2">Upload a block model CSV file</li>
            <li className="mb-2">Select the coordinate system of your data</li>
            <li className="mb-2">Toggle "Drawing Mode" to start creating a line</li>
            <li className="mb-2">Click two points on the map to define a line</li>
            <li className="mb-2">Click "Create Cross-Section" to generate a vertical profile</li>
            <li className="mb-2">The cross-section view will appear below the map</li>
          </ol>
        </div>
      </div>
      
      <div className="border rounded shadow mb-6">
        <h2 className="text-xl font-bold p-4 border-b">Block Model Visualization</h2>
        {dataProjection && (
          <div className="text-sm text-gray-600 p-2 border-b">
            Data projection: {dataProjection}
          </div>
        )}
        <BlockModelViewer 
          blockModelData={blockModelData}
          sourceProjection={dataProjection} 
        />
      </div>
    </div>
  );
}

export default App;