import React from 'react';
import './Visualization.css';

function Overview({ data, filters }) {
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
  
  // Calculate summary stats for filtered projects
  const calculateStats = () => {
    const stats = {
      totalProjects: filteredProjects.length,
      byInitiative: {},
      byStatus: {},
      byRegion: {},
      totalParticipants: 0,
      totalSamples: 0
    };
    
    filteredProjects.forEach(project => {
      // Initiative Type counts
      const initiative = project['Initiative Type'];
      stats.byInitiative[initiative] = (stats.byInitiative[initiative] || 0) + 1;
      
      // Status counts
      const status = project['Status'];
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // Geographic Region counts
      const region = project['Geographic Region'];
      stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;
      
      // Totals - handle special cases in the data
      const participants = project['Participants'];
      if (participants && participants !== 'Unknown') {
        const participantCount = parseInt(participants);
        if (!isNaN(participantCount)) {
          stats.totalParticipants += participantCount;
        }
      }
      
      const samples = project['Samples'];
      if (samples && samples !== 'Archive') {
        const sampleCount = parseInt(samples);
        if (!isNaN(sampleCount)) {
          stats.totalSamples += sampleCount;
        }
      }
    });
    
    return stats;
  };
  
  const stats = calculateStats();
  
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Program Overview</h2>
        <p className="subtitle">Summary statistics for the selected filters</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Projects</h3>
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-breakdown">
            <h4>By Initiative</h4>
            <ul>
              {Object.entries(stats.byInitiative).map(([initiative, count]) => (
                <li key={initiative}>
                  {initiative}: <strong>{count}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Participants</h3>
          <div className="stat-value">{stats.totalParticipants.toLocaleString()}</div>
          <div className="stat-breakdown">
            <h4>By Status</h4>
            <ul>
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <li key={status}>
                  {status}: <strong>{count} projects</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Samples</h3>
          <div className="stat-value">{stats.totalSamples.toLocaleString()}</div>
          <div className="stat-breakdown">
            <h4>By Region</h4>
            <ul>
              {Object.entries(stats.byRegion).map(([region, count]) => (
                <li key={region}>
                  {region}: <strong>{count} projects</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="projects-table-container">
        <h3>Filtered Projects</h3>
        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Initiative</th>
                <th>Institution</th>
                <th>Contact PI</th>
                <th>Cohort</th>
                <th>Participants</th>
                <th>Samples</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project['Project ID']}>
                  <td>{project['Project ID']}</td>
                  <td>{project['Initiative Type']}</td>
                  <td>{project['Institution']}</td>
                  <td>{project['Contact PI']}</td>
                  <td>{project['Cohort Name']}</td>
                  <td>{project['Participants'] === 'Unknown' ? 'Unknown' : project['Participants']}</td>
                  <td>{project['Samples'] === 'Archive' ? 'Archive' : project['Samples']}</td>
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

export default Overview;