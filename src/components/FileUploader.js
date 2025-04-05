// src/components/FileUploader.js
import React, { useState } from 'react';
import Papa from 'papaparse';

const PROJECTIONS = [
  { code: 'EPSG:4326', name: 'WGS84 (EPSG:4326)' },
  { code: 'EPSG:32652', name: 'UTM Zone 52N (EPSG:32652)' },
  // Add more projections as needed
];

const FileUploader = ({ onBlockModelUpload }) => {
  const [blockModelFile, setBlockModelFile] = useState(null);
  const [projection, setProjection] = useState('EPSG:32652'); // Default to UTM Zone 52 as mentioned
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBlockModelChange = (e) => {
    setBlockModelFile(e.target.files[0]);
    setError('');
  };

  const handleProjectionChange = (e) => {
    setProjection(e.target.value);
  };

  const processBlockModelFile = () => {
    if (!blockModelFile) {
      setError('Please select a block model CSV file');
      return;
    }

    setIsLoading(true);

    Papa.parse(blockModelFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        setIsLoading(false);
        
        if (results.errors.length > 0) {
          setError(`Error parsing block model CSV: ${results.errors[0].message}`);
          return;
        }
        
        // Skip the first 3 rows as in the Python code (skiprows=[1,2,3])
        // Note: Papa.parse with header:true already skips the first row (header)
        // So we need to skip 2 more rows (rows at index 0 and 1)
        const dataWithoutHeaders = results.data.slice(2);
        
        // Pass both the data and the projection
        onBlockModelUpload(dataWithoutHeaders, projection);
      },
      error: (error) => {
        setIsLoading(false);
        setError(`Error reading block model file: ${error.message}`);
      }
    });
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Upload Block Model CSV</h2>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Block Model CSV:</label>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleBlockModelChange}
          className="block w-full text-sm border rounded p-2"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Coordinate System:</label>
        <select 
          value={projection}
          onChange={handleProjectionChange}
          className="block w-full text-sm border rounded p-2"
        >
          {PROJECTIONS.map(proj => (
            <option key={proj.code} value={proj.code}>
              {proj.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-600 mt-1">
          Select the coordinate system of your CSV data
        </p>
      </div>
      
      <button 
        onClick={processBlockModelFile} 
        disabled={!blockModelFile || isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
      >
        Process Block Model
      </button>
      
      {isLoading && <p className="text-blue-500 mt-2">Processing file...</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default FileUploader;