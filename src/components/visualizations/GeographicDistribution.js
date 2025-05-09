import React, { useEffect, useRef, useState, useMemo } from 'react';
import './Visualization.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function GeographicDistribution({ data, filters }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasData, setHasData] = useState(true);

  // Check if data is available
  useEffect(() => {
    if (!data || !data.projects) {
      setHasData(false);
    } else {
      setHasData(true);
    }
  }, [data]);
  
  // Prepare filtered data
  const filteredData = useMemo(() => {
    // If no data, return empty defaults
    if (!hasData) {
      return {
        filteredProjects: [],
        regionCounts: {},
        regionSamples: {}
      };
    }
    
    // Apply filters to projects
    const filteredProjects = data.projects.filter(project => {
      // Split categories that may contain multiple values separated by '/'
      const bodySites = project['Body Site Category'] ? project['Body Site Category'].split('/').map(site => site.trim()) : [];
      const ageGroups = project['Age Group Category'] ? project['Age Group Category'].split('/').map(age => age.trim()) : [];
      
      return (
        (!filters.initiativeType || project['Initiative Type'] === filters.initiativeType) &&
        (!filters.geographicRegion || project['Geographic Region'] === filters.geographicRegion) &&
        (!filters.bodySiteCategory || bodySites.includes(filters.bodySiteCategory)) &&
        (!filters.ageGroupCategory || ageGroups.includes(filters.ageGroupCategory)) &&
        (!filters.status || project['Status'] === filters.status)
      );
    });
    
    // Count projects by region
    const regionCounts = filteredProjects.reduce((counts, project) => {
      const region = project['Geographic Region'];
      counts[region] = (counts[region] || 0) + 1;
      return counts;
    }, {});

    // Calculate sample counts by region
    const regionSamples = filteredProjects.reduce((counts, project) => {
      const region = project['Geographic Region'];
      const samples = parseInt(project['Samples']) || 0;
      if (!counts[region]) {
        counts[region] = { projects: 0, samples: 0 };
      }
      counts[region].projects += 1;
      counts[region].samples += samples;
      return counts;
    }, {});
    
    return { filteredProjects, regionCounts, regionSamples };
  }, [hasData, data, filters]);
  
  // Extract filtered data
  const { filteredProjects, regionCounts, regionSamples } = filteredData;
  
  // Define institution coordinates based on actual locations
  const institutionCoordinates = useMemo(() => ({
    // NOTE: Leaflet uses [latitude, longitude] format
    'UCLA': [34.0689, -118.4452],
    'UPenn': [39.9522, -75.1932],
    'VUMC': [36.1445, -86.8027],
    'UTHealth/VUMC': [29.7030, -95.4032],
    'Broad/BWH': [42.3371, -71.1070],
    'Stanford': [37.4275, -122.1697],
    'UConn Health': [41.7317, -72.7930],
    'Cornell': [42.4534, -76.4735],
    'NBDC': [47.9127, -97.0730],
    'University of Utah': [40.7649, -111.8421],
    'MSKCC': [40.7645, -73.9565],
    'Washington University': [38.6488, -90.3108], 
    'UCSF': [37.7631, -122.4586]
  }), []);
  
  // Define fallback region coordinates for cases where institution isn't matched
  const regionCoordinates = useMemo(() => ({
    'West': [37.7749, -122.4194],      // San Francisco coordinates
    'Northeast': [40.7128, -74.0060],  // New York coordinates
    'South': [32.7767, -96.7970],      // Dallas coordinates
    'Midwest': [41.8781, -87.6298],    // Chicago coordinates
    'National': [39.8283, -98.5795],   // Geographic center of the US
    'International': [20.0, 0.0],      // General international marker near equator
    'Space': [0.0, -160.0]             // Special handling for space
  }), []);

  // Create map when component mounts or when data/filters change
  useEffect(() => {
    // Don't try to create map if we don't have data
    if (!hasData) return;
    
    // Clean up previous map instance if it exists
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    
    // Delay map creation slightly to ensure DOM is updated
    const timer = setTimeout(() => {
      try {
        setLoading(true);
        
        // Only proceed if we have the container element
        if (!mapContainerRef.current) {
          setLoading(false);
          return;
        }
        
        // Initialize the map with an ID to avoid reuse conflicts
        const mapId = `map-${Date.now()}`;
        mapContainerRef.current.id = mapId;
        const map = L.map(mapContainerRef.current).setView([39.8283, -98.5795], 4);
      
      // Add the tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      // Function to get CSS variable value
      const getCSSVariable = (variableName) => {
        return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
      };

      // Create custom marker colors based on initiative type
      const getMarkerColor = (initiativeType) => {
        switch (initiativeType) {
          case 'VCC':
            return getCSSVariable('--primary-color');
          case 'Functional Studies':
            return getCSSVariable('--success-color');
          default:
            return getCSSVariable('--text-tertiary');
        }
      };

      // Create custom marker size based on sample count
      const getMarkerSize = (sampleCount) => {
        if (sampleCount > 5000) return 40;
        if (sampleCount > 1000) return 30;
        if (sampleCount > 100) return 20;
        return 15;
      };

      // Special handling for International and Space regions
      // For demonstration, we'll place these in specific locations
      const specialLocations = {
        'International': {
          'Antarctica': [-75.2509, 0.0000],  // Antarctica
          'International': [20.0, 0.0]       // General international (near equator)
        },
        'Space': [0.0, -160.0]  // Off the map in the Pacific
      };

      // Group projects by institution
      const institutionProjects = filteredProjects.reduce((acc, project) => {
        const institution = project['Institution'];
        if (!acc[institution]) {
          acc[institution] = [];
        }
        acc[institution].push(project);
        return acc;
      }, {});

      // Add markers for each institution
      Object.entries(institutionProjects).forEach(([institution, projects]) => {
        let coordinates;
        
        // Handle special cases first
        if (projects.some(p => p['Geographic Region'] === 'Space')) {
          coordinates = specialLocations['Space'];
        } else if (projects.some(p => p['Geographic Region'] === 'International' && 
                                   p['Cohort Name']?.includes('Antarctica'))) {
          coordinates = specialLocations['International']['Antarctica'];
        } else if (projects.some(p => p['Geographic Region'] === 'International')) {
          coordinates = specialLocations['International']['International'];
        } else {
          // Try to get coordinates from the institution mapping
          coordinates = institutionCoordinates[institution];
          
          // Fallback to region coordinates if institution not found
          if (!coordinates) {
            // Get the region of the first project for this institution
            const region = projects[0]['Geographic Region'];
            coordinates = regionCoordinates[region];
          }
        }

        if (coordinates) {
          // Group projects by initiative type for this institution
          const initiativeGroups = projects.reduce((groups, project) => {
            const type = project['Initiative Type'];
            if (!groups[type]) {
              groups[type] = [];
            }
            groups[type].push(project);
            return groups;
          }, {});

          // Add a marker for each initiative type in the region
          Object.entries(initiativeGroups).forEach(([initiative, projects]) => {
            const totalSamples = projects.reduce((sum, p) => sum + (parseInt(p['Samples']) || 0), 0);
            
            // Create a circle marker
            const marker = L.circleMarker(coordinates, {
              radius: getMarkerSize(totalSamples) / 2,
              fillColor: getMarkerColor(initiative),
              color: '#000',
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(map);

            // Create popup content with project details
            const popupContent = `
              <div class="map-popup">
                <h3>${institution}: ${initiative}</h3>
                <p><strong>${projects.length}</strong> projects with <strong>${totalSamples.toLocaleString()}</strong> samples</p>
                <ul>
                  ${projects.map(p => `
                    <li>
                      <strong>${p['Project ID']}</strong>: ${p['Cohort Name']} 
                      (${p['Samples'] || 'Unknown'} samples) - ${p['Status']}
                    </li>
                  `).join('')}
                </ul>
              </div>
            `;

            marker.bindPopup(popupContent);
          });
        }
      });

      // Add a legend to the map
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        const initiatives = ['VCC', 'Functional Studies'];
        const colors = ['blue', 'green'];
        
        div.innerHTML = '<h4>Initiative Type</h4>';
        
        for (let i = 0; i < initiatives.length; i++) {
          div.innerHTML += 
            '<div class="legend-item">' + 
            '<span class="legend-color" style="background:' + colors[i] + '"></span> ' +
            initiatives[i] + '</div>';
        }
        
        div.innerHTML += '<h4>Sample Size</h4>';
        div.innerHTML += 
          '<div class="legend-size">' +
          '<span class="legend-circle" style="width: 40px; height: 40px;"></span> ' +
          '> 5,000 samples</div>';
        div.innerHTML += 
          '<div class="legend-size">' +
          '<span class="legend-circle" style="width: 30px; height: 30px;"></span> ' +
          '> 1,000 samples</div>';
        div.innerHTML += 
          '<div class="legend-size">' +
          '<span class="legend-circle" style="width: 20px; height: 20px;"></span> ' +
          '> 100 samples</div>';
        
        return div;
      };
      legend.addTo(map);

      // Save the map instance for cleanup on unmount
      mapRef.current = map;
      setLoading(false);
    } catch (err) {
      console.error('Error creating map:', err);
      setError('Failed to create map visualization. See console for details.');
      setLoading(false);
    }
    }, 100); // Small delay to ensure DOM is updated
    
    // Cleanup on unmount and when dependencies change
    return () => {
      // Clear the timeout
      clearTimeout(timer);
      
      // Remove the map if it exists
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [hasData, filteredProjects, regionSamples, data, filters, regionCoordinates, institutionCoordinates]);

  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Geographic Distribution</h2>
        <p className="subtitle">Distribution of projects across geographic regions</p>
      </div>
      
      {!hasData ? (
        <div className="error-message">
          <h3>No Data Available</h3>
          <p>Could not load project data. Please check that the data files are correctly placed in the public/data directory.</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="error-message">
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          )}
          
          {loading && (
            <div className="loading-message">
              <p>Loading map visualization...</p>
            </div>
          )}
        </>
      )}
      
      {hasData && (
        <>
          <div
            key={`map-container-${JSON.stringify(filters)}`}
            ref={mapContainerRef} 
            className="map-container" 
            style={{ height: '500px', width: '100%' }}
          ></div>
          
          <div className="stats-grid">
            {Object.entries(regionCounts).map(([region, count]) => (
              <div key={region} className="stat-card">
                <h3>{region}</h3>
                <div className="stat-value">{count}</div>
                <p>Projects</p>
                <div className="stat-detail">
                  {regionSamples[region] && (
                    <p>{regionSamples[region].samples.toLocaleString()} samples</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="projects-table-container">
            <h3>Projects by Region</h3>
            <div className="projects-table-wrapper">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Project ID</th>
                    <th>Institution</th>
                    <th>Contact PI</th>
                    <th>Research Focus</th>
                    <th>Samples</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(project => (
                    <tr key={project['Project ID']}>
                      <td>{project['Geographic Region']}</td>
                      <td>{project['Project ID']}</td>
                      <td>{project['Institution']}</td>
                      <td>{project['Contact PI']}</td>
                      <td>{project['Primary Research Focus']}</td>
                      <td>{parseInt(project['Samples']).toLocaleString() || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${project['Status'].toLowerCase()}`}>
                          {project['Status']}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GeographicDistribution;