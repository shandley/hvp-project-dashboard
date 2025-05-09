import React from 'react';
import './Visualization.css';

// This is a placeholder component that will be implemented with chart visualizations
function SampleDistribution({ data, filters }) {
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
  
  // Group projects by body site category
  const bodySiteGroups = {};
  filteredProjects.forEach(project => {
    const bodySites = project['Body Site Category'].split('/');
    bodySites.forEach(site => {
      if (!bodySiteGroups[site]) {
        bodySiteGroups[site] = [];
      }
      bodySiteGroups[site].push(project);
    });
  });
  
  // Group projects by age group category
  const ageGroups = {};
  filteredProjects.forEach(project => {
    const ageCategories = project['Age Group Category'].split('/');
    ageCategories.forEach(age => {
      if (!ageGroups[age]) {
        ageGroups[age] = [];
      }
      ageGroups[age].push(project);
    });
  });
  
  // Calculate sample counts by body site
  const samplesByBodySite = {};
  Object.entries(bodySiteGroups).forEach(([site, projects]) => {
    samplesByBodySite[site] = projects.reduce((total, project) => {
      const samples = parseInt(project['Samples']) || 0;
      return total + samples;
    }, 0);
  });
  
  // Calculate sample counts by age group
  const samplesByAgeGroup = {};
  Object.entries(ageGroups).forEach(([age, projects]) => {
    samplesByAgeGroup[age] = projects.reduce((total, project) => {
      const samples = parseInt(project['Samples']) || 0;
      return total + samples;
    }, 0);
  });
  
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Sample Distribution</h2>
        <p className="subtitle">Distribution of samples by body site and age group</p>
      </div>
      
      <div className="chart-grid">
        <div className="chart-card">
          <h3>Samples by Body Site</h3>
          <div className="chart-placeholder">
            <p>Chart visualization will be implemented here using Chart.js/D3.js</p>
            <ul>
              {Object.entries(samplesByBodySite).map(([site, count]) => (
                <li key={site}><strong>{site}</strong>: {count.toLocaleString()} samples</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Samples by Age Group</h3>
          <div className="chart-placeholder">
            <p>Chart visualization will be implemented here using Chart.js/D3.js</p>
            <ul>
              {Object.entries(samplesByAgeGroup).map(([age, count]) => (
                <li key={age}><strong>{age}</strong>: {count.toLocaleString()} samples</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Samples</h3>
          <div className="stat-value">
            {filteredProjects.reduce((total, project) => {
              const samples = parseInt(project['Samples']) || 0;
              return total + samples;
            }, 0).toLocaleString()}
          </div>
          <p>From {filteredProjects.length} projects</p>
        </div>
        
        <div className="stat-card">
          <h3>Body Site Categories</h3>
          <div className="stat-value">{Object.keys(bodySiteGroups).length}</div>
          <p>Unique categories represented</p>
        </div>
        
        <div className="stat-card">
          <h3>Age Group Categories</h3>
          <div className="stat-value">{Object.keys(ageGroups).length}</div>
          <p>Unique categories represented</p>
        </div>
      </div>
      
      <div className="projects-table-container">
        <h3>Projects with Highest Sample Counts</h3>
        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Cohort Name</th>
                <th>Body Site</th>
                <th>Age Group</th>
                <th>Samples</th>
                <th>Participants</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects
                .sort((a, b) => {
                  const samplesA = parseInt(a['Samples']) || 0;
                  const samplesB = parseInt(b['Samples']) || 0;
                  return samplesB - samplesA;
                })
                .slice(0, 10)
                .map(project => (
                  <tr key={project['Project ID']}>
                    <td>{project['Project ID']}</td>
                    <td>{project['Cohort Name']}</td>
                    <td>{project['Body Site Category']}</td>
                    <td>{project['Age Group Category']}</td>
                    <td>{project['Samples']}</td>
                    <td>{project['Participants']}</td>
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

export default SampleDistribution;