import React from 'react';
import './Visualization.css';

// This is a placeholder component that will be implemented with a map visualization
function GeographicDistribution({ data, filters }) {
  if (!data || !data.projects) {
    return <div className="visualization-container">No data available</div>;
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
  
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Geographic Distribution</h2>
        <p className="subtitle">Distribution of projects across geographic regions</p>
      </div>
      
      <div className="map-placeholder">
        <p>Map visualization will be implemented here using Leaflet.js</p>
        <p>This will show the distribution of {filteredProjects.length} projects across different regions.</p>
      </div>
      
      <div className="stats-grid">
        {Object.entries(regionCounts).map(([region, count]) => (
          <div key={region} className="stat-card">
            <h3>{region}</h3>
            <div className="stat-value">{count}</div>
            <p>Projects</p>
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