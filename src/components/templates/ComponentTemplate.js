import React, { useState, useEffect, useMemo } from 'react';
import './Visualization.css';

/**
 * Template for visualization components with React Hooks best practices
 * - Avoids conditional hooks execution
 * - Handles data validation properly
 * - Implements consistent error handling
 * 
 * @param {Object} data The dashboard data
 * @param {Object} filters The current filter settings
 */
function ComponentTemplate({ data, filters }) {
  // 1. Declare all hooks at the top level (unconditionally)
  const [hasData, setHasData] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Additional state variables for your component
  const [someState, setSomeState] = useState(null);
  
  // 2. Check if data is available
  useEffect(() => {
    if (!data || !data.projects) {
      setHasData(false);
    } else {
      setHasData(true);
    }
  }, [data]);
  
  // Other useEffect hooks as needed
  useEffect(() => {
    // Setup or data fetching logic
    setLoading(true);
    
    try {
      // Your initialization code here
      
      // On success
      setLoading(false);
    } catch (err) {
      console.error('Error in component:', err);
      setError('Failed to initialize component. See console for details.');
      setLoading(false);
    }
    
    // Cleanup function
    return () => {
      // Any cleanup logic
    };
  }, [hasData]); // Add any other dependencies as needed
  
  // 3. Process data with useMemo, handling the null case
  const processedData = useMemo(() => {
    // Return empty/default values if no data
    if (!hasData) {
      return {
        // Default empty structure matching your real data
        filteredProjects: [],
        someCalculatedValues: {},
        someMetrics: []
      };
    }
    
    // Apply filters to projects
    const filteredProjects = data.projects.filter(project => {
      return (
        (!filters.initiativeType || project['Initiative Type'] === filters.initiativeType) &&
        (!filters.geographicRegion || project['Geographic Region'] === filters.geographicRegion) &&
        (!filters.bodySiteCategory || project['Body Site Category'].includes(filters.bodySiteCategory)) &&
        (!filters.ageGroupCategory || project['Age Group Category'].includes(filters.ageGroupCategory)) &&
        (!filters.status || project['Status'] === filters.status)
      );
    });
    
    // Process the filtered data
    // ... your data processing logic ...
    
    return {
      filteredProjects,
      // other processed data
    };
  }, [data, filters, hasData]); // Include all dependencies
  
  // Extract variables from processedData
  const { filteredProjects } = processedData;
  
  // Event handlers
  const handleSomeEvent = () => {
    // Event handling logic
    setSomeState(/* new state */);
  };
  
  // 4. Use conditional rendering in the return
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Component Title</h2>
        <p className="subtitle">Component description</p>
      </div>
      
      {!hasData ? (
        <div className="error-message">
          <h3>No Data Available</h3>
          <p>Could not load project data. Please check that the data files are correctly placed in the public/data directory.</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="loading-message">
          <p>Loading visualization...</p>
        </div>
      ) : (
        <>
          {/* Main component content goes here */}
          <div className="main-content">
            {/* Your visualization elements */}
          </div>
          
          {/* Stats cards, tables, etc. */}
          <div className="stats-grid">
            {/* Stats cards */}
          </div>
        </>
      )}
    </div>
  );
}

export default ComponentTemplate;