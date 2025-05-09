import React, { useEffect, useRef, useState } from 'react';
import './Visualization.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function GeographicDistribution({ data, filters }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!data || !data.projects) {
    return (
      <div className="visualization-container">
        <div className="error-message">
          <h3>No Data Available</h3>
          <p>Could not load project data. Please check that the data files are correctly placed in the public/data directory.</p>
        </div>
      </div>
    );
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
  
  // Define region coordinates (approximate centers)
  const regionCoordinates = {
    'West': [37.7749, -122.4194],      // San Francisco coordinates
    'Northeast': [40.7128, -74.0060],  // New York coordinates
    'South': [32.7767, -96.7970],      // Dallas coordinates
    'Midwest': [41.8781, -87.6298],    // Chicago coordinates
    'National': [39.8283, -98.5795],   // Geographic center of the US
    'International': [0, 0],           // Global - will be adjusted with specific locations
    'Space': [0, 0]                    // Special handling for space
  };

  // Initialize map when component mounts or when data/filters change
  useEffect(() => {
    // Clean up previous map instance if it exists
    if (mapRef.current) {
      mapRef.current.remove();
    }

    try {
      setLoading(true);
      
      // Only proceed if we have the container element
      if (!mapContainerRef.current) {
        return;
      }

      // Initialize the map
      const map = L.map(mapContainerRef.current).setView([39.8283, -98.5795], 4);
      
      // Add the tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      // Create custom marker colors based on initiative type
      const getMarkerColor = (initiativeType) => {
        switch (initiativeType) {
          case 'VCC':
            return 'blue';
          case 'Functional Studies':
            return 'green';
          default:
            return 'gray';
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
          'International': [20.7128, 10.0060]  // General international
        },
        'Space': [0, -160]  // Off the map in the Pacific
      };

      // Add markers for each region
      Object.entries(regionSamples).forEach(([region, stats]) => {
        let coordinates;
        
        // Handle special regions
        if (region === 'International' || region === 'Space') {
          if (region === 'International') {
            // Check if any projects mention Antarctica
            const hasAntarctica = filteredProjects.some(project => 
              project['Geographic Region'] === 'International' && 
              project['Cohort Name']?.includes('Antarctica')
            );
            
            if (hasAntarctica) {
              coordinates = specialLocations['International']['Antarctica'];
            } else {
              coordinates = specialLocations['International']['International'];
            }
          } else {
            coordinates = specialLocations['Space'];
          }
        } else {
          coordinates = regionCoordinates[region];
        }

        if (coordinates) {
          // Get all projects for this region
          const regionProjects = filteredProjects.filter(p => p['Geographic Region'] === region);
          
          // Group projects by initiative type for this region
          const initiativeGroups = regionProjects.reduce((groups, project) => {
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
                <h3>${region}: ${initiative}</h3>
                <p><strong>${projects.length}</strong> projects with <strong>${totalSamples.toLocaleString()}</strong> samples</p>
                <ul>
                  ${projects.map(p => `
                    <li>
                      <strong>${p['Project ID']}</strong>: ${p['Cohort Name']} 
                      (${p['Samples']} samples) - ${p['Status']}
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
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [data, filters, filteredProjects]);

  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Geographic Distribution</h2>
        <p className="subtitle">Distribution of projects across geographic regions</p>
      </div>
      
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
      
      <div 
        id="map" 
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
    </div>
  );
}

export default GeographicDistribution;