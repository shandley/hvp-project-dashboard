import React from 'react';
import './Visualization.css';

// This is a placeholder component that will be implemented with network visualizations
function NetworkRelationships({ data, filters }) {
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
  
  // Extract institutions and count projects per institution
  const institutions = {};
  filteredProjects.forEach(project => {
    const institution = project['Institution'];
    if (!institutions[institution]) {
      institutions[institution] = {
        count: 0,
        projects: []
      };
    }
    institutions[institution].count += 1;
    institutions[institution].projects.push(project);
  });
  
  // Extract research focus areas and count projects per focus
  const researchFocus = {};
  filteredProjects.forEach(project => {
    const focus = project['Primary Research Focus'];
    if (!researchFocus[focus]) {
      researchFocus[focus] = {
        count: 0,
        projects: []
      };
    }
    researchFocus[focus].count += 1;
    researchFocus[focus].projects.push(project);
  });
  
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Relationships & Networks</h2>
        <p className="subtitle">Exploring connections between institutions, research focus areas, and cohorts</p>
      </div>
      
      <div className="chart-container">
        <h3>Institution - Research Focus Network</h3>
        <div className="chart-placeholder">
          <p>Network visualization will be implemented here using D3.js force-directed graph</p>
          <p>This will show relationships between {Object.keys(institutions).length} institutions and {Object.keys(researchFocus).length} research focus areas.</p>
        </div>
      </div>
      
      <div className="chart-grid">
        <div className="chart-card">
          <h3>Top Institutions</h3>
          <div className="chart-placeholder">
            <ul>
              {Object.entries(institutions)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .map(([name, data]) => (
                  <li key={name}>
                    <strong>{name}</strong>: {data.count} projects
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Research Focus Areas</h3>
          <div className="chart-placeholder">
            <ul>
              {Object.entries(researchFocus)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([name, data]) => (
                  <li key={name}>
                    <strong>{name}</strong>: {data.count} projects
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      </div>
      
      <div className="chart-container">
        <h3>Body Site - Age Group Relationship</h3>
        <div className="chart-placeholder">
          <p>Heatmap visualization will be implemented here using D3.js</p>
          <p>This will show the sample density across different body sites and age groups.</p>
        </div>
      </div>
      
      <div className="projects-table-container">
        <h3>Projects by Institution</h3>
        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Project ID</th>
                <th>Contact PI</th>
                <th>Research Focus</th>
                <th>Body Site</th>
                <th>Age Group</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects
                .sort((a, b) => a['Institution'].localeCompare(b['Institution']))
                .map(project => (
                  <tr key={project['Project ID']}>
                    <td>{project['Institution']}</td>
                    <td>{project['Project ID']}</td>
                    <td>{project['Contact PI']}</td>
                    <td>{project['Primary Research Focus']}</td>
                    <td>{project['Body Site Category']}</td>
                    <td>{project['Age Group Category']}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default NetworkRelationships;