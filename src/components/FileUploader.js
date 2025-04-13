// src/components/FileUploader.js
import React, { useState } from 'react';
import Papa from 'papaparse';

const PROJECTIONS = [
  { code: 'EPSG:4326', name: 'WGS84 (EPSG:4326)' },
  { code: 'EPSG:32652', name: 'UTM Zone 52N (EPSG:32652)' },
  // Add more projections as needed
];

const FileUploader = ({ onBlockModelUpload, onElevationDataUpload, onPitDataUpload }) => {
  const [blockModelFile, setBlockModelFile] = useState(null);
  const [elevationFile, setElevationFile] = useState(null);
  const [pitFile, setPitFile] = useState(null);
  const [projection, setProjection] = useState('EPSG:32652'); // Default to UTM Zone 52 as mentioned
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleBlockModelChange = (e) => {
    setBlockModelFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleElevationFileChange = (e) => {
    setElevationFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handlePitFileChange = (e) => {
    setPitFile(e.target.files[0]);
    setError('');
    setSuccess('');
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
    setSuccess('');

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
        setSuccess('Block model data processed successfully!');
      },
      error: (error) => {
        setIsLoading(false);
        setError(`Error reading block model file: ${error.message}`);
      }
    });
  };

  const processElevationFile = () => {
    if (!elevationFile) {
      setError('Please select an elevation CSV file');
      return;
    }

    setIsLoading(true);
    setSuccess('');

    Papa.parse(elevationFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        setIsLoading(false);
        
        if (results.errors.length > 0) {
          setError(`Error parsing elevation CSV: ${results.errors[0].message}`);
          return;
        }
        
        // Pass the data and projection to the parent component
        onElevationDataUpload(results.data, projection);
        setSuccess('Elevation data processed successfully!');
      },
      error: (error) => {
        setIsLoading(false);
        setError(`Error reading elevation file: ${error.message}`);
      }
    });
  };

  const processPitFile = () => {
    if (!pitFile) {
      setError('Please select a pit data STR file');
      return;
    }

    setIsLoading(true);
    setSuccess('');

    Papa.parse(pitFile, {
      header: false, // STR files don't have headers
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        setIsLoading(false);
        
        if (results.errors.length > 0) {
          setError(`Error parsing pit data STR: ${results.errors[0].message}`);
          return;
        }
        
        // Transform the raw data into the expected format with column names
        // Based on the Python code: 'interior', 'x', 'y', 'z', 'none', 'type'
        const transformedData = results.data.map(row => {
          // Check if we have the expected number of columns (6)
          if (row.length >= 6) {
            return {
              interior: row[0],
              x: row[1],
              y: row[2],
              z: row[3],
              none: row[4],
              type: row[5]
            };
          }
          // If we don't have enough columns, log a warning and skip this row
          console.warn('Skipping row with insufficient columns:', row);
          return null;
        }).filter(item => item !== null); // Remove null entries
        
        // Pass the transformed data and projection to the parent component
        onPitDataUpload(transformedData, projection);
        setSuccess('Pit data processed successfully!');
      },
      error: (error) => {
        setIsLoading(false);
        setError(`Error reading pit file: ${error.message}`);
      }
    });
  };

  const processAllFiles = () => {
    let processedAny = false;
    
    if (blockModelFile) {
      processBlockModelFile();
      processedAny = true;
    }
    
    if (elevationFile) {
      processElevationFile();
      processedAny = true;
    }
    
    if (pitFile) {
      processPitFile();
      processedAny = true;
    }
    
    if (!processedAny) {
      setError('Please select at least one file to process');
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Upload Data Files</h2>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Block Model CSV:</label>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleBlockModelChange}
          className="block w-full text-sm border rounded p-2"
        />
        <p className="text-xs text-gray-600 mt-1">
          CSV with block model data (required for block visualization)
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Elevation Data CSV:</label>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleElevationFileChange}
          className="block w-full text-sm border rounded p-2"
        />
        <p className="text-xs text-gray-600 mt-1">
          CSV with elevation points (x/y/z or lon/lat/elev columns)
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Pit Data STR:</label>
        <input 
          type="file" 
          accept=".str" 
          onChange={handlePitFileChange}
          className="block w-full text-sm border rounded p-2"
        />
        <p className="text-xs text-gray-600 mt-1">
          STR file with pit boundary data (6 columns: interior, x, y, z, none, type)
        </p>
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
        onClick={processAllFiles} 
        disabled={(!blockModelFile && !elevationFile && !pitFile) || isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
      >
        Process Data Files
      </button>
      
      {isLoading && <p className="text-blue-500 mt-2">Processing files...</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </div>
  );
};

export default FileUploader;