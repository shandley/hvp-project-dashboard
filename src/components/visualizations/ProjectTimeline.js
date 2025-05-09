import React from 'react';
import './Visualization.css';

// This is a placeholder component that will be implemented with timeline visualizations
function ProjectTimeline({ data, filters }) {
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
  
  // Count projects by status
  const statusCounts = filteredProjects.reduce((counts, project) => {
    const status = project['Status'];
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  
  // Sample collection timeline data (mock data - this would be replaced with actual data from supplementary files)
  const sampleTimeline = [
    { year: 2024, projected: 5000, cumulative: 5000, percent: 7 },
    { year: 2025, projected: 20000, cumulative: 25000, percent: 35.2 },
    { year: 2026, projected: 25000, cumulative: 50000, percent: 70.4 },
    { year: 2027, projected: 15000, cumulative: 65000, percent: 91.5 },
    { year: 2028, projected: 6000, cumulative: 71000, percent: 100 }
  ];
  
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Project Timeline</h2>
        <p className="subtitle">Project status and sample collection progress</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Ongoing Projects</h3>
          <div className="stat-value">{statusCounts['Ongoing'] || 0}</div>
          <p>{Math.round(((statusCounts['Ongoing'] || 0) / filteredProjects.length) * 100)}% of total</p>
        </div>
        
        <div className="stat-card">
          <h3>Completed Projects</h3>
          <div className="stat-value">{statusCounts['Complete'] || 0}</div>
          <p>{Math.round(((statusCounts['Complete'] || 0) / filteredProjects.length) * 100)}% of total</p>
        </div>
        
        <div className="stat-card">
          <h3>Current Year</h3>
          <div className="stat-value">2024</div>
          <p>Year 1 of program</p>
        </div>
      </div>
      
      <div className="chart-container">
        <h3>Sample Collection Timeline</h3>
        <div className="chart-placeholder">
          <p>Timeline visualization will be implemented here using D3.js</p>
          <table className="timeline-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Projected New Samples</th>
                <th>Cumulative Total</th>
                <th>% Complete</th>
              </tr>
            </thead>
            <tbody>
              {sampleTimeline.map(item => (
                <tr key={item.year}>
                  <td>{item.year}</td>
                  <td>{item.projected.toLocaleString()}</td>
                  <td>{item.cumulative.toLocaleString()}</td>
                  <td>{item.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="chart-grid">
        <div className="chart-card">
          <h3>Projects by Status</h3>
          <div className="chart-placeholder">
            <p>Chart visualization will be implemented here using Chart.js/D3.js</p>
            <ul>
              {Object.entries(statusCounts).map(([status, count]) => (
                <li key={status}><strong>{status}</strong>: {count} projects</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Program Milestones</h3>
          <div className="chart-placeholder">
            <p>Timeline visualization will be implemented here using D3.js</p>
            <ul>
              <li><strong>2025 Q1</strong>: HVP Kickoff Meeting</li>
              <li><strong>2025 Q2-Q3</strong>: 6-Month Setup Phase</li>
              <li><strong>2025-2026</strong>: Infrastructure Development</li>
              <li><strong>2026-2027</strong>: Major Data Generation</li>
              <li><strong>2027-2028</strong>: Data Analysis and Synthesis</li>
              <li><strong>2028</strong>: Program Completion (Phase 1)</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="projects-table-container">
        <h3>Projects by Status</h3>
        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Project ID</th>
                <th>Institution</th>
                <th>Cohort Name</th>
                <th>Study Type</th>
                <th>Samples</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects
                .sort((a, b) => {
                  // Sort by status first, then by project ID
                  if (a['Status'] !== b['Status']) {
                    return a['Status'] === 'Ongoing' ? -1 : 1;
                  }
                  return a['Project ID'].localeCompare(b['Project ID']);
                })
                .map(project => (
                  <tr key={project['Project ID']}>
                    <td>
                      <span className={`status-badge ${project['Status'].toLowerCase()}`}>
                        {project['Status']}
                      </span>
                    </td>
                    <td>{project['Project ID']}</td>
                    <td>{project['Institution']}</td>
                    <td>{project['Cohort Name']}</td>
                    <td>{project['Study Type']}</td>
                    <td>{project['Samples']}</td>
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

export default ProjectTimeline;