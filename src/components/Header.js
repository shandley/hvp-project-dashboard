import React from 'react';
import './Header.css';

function Header({ data }) {
  // Calculate key metrics if data is available
  const getMetrics = () => {
    if (!data || !data.projects) return {};
    
    const totalProjects = data.projects.length;
    const totalParticipants = data.projects.reduce((sum, project) => {
      const participants = parseInt(project.Participants) || 0;
      return isNaN(participants) ? sum : sum + participants;
    }, 0);
    const totalSamples = data.projects.reduce((sum, project) => {
      const samples = parseInt(project.Samples) || 0;
      return isNaN(samples) ? sum : sum + samples;
    }, 0);
    const ongoingProjects = data.projects.filter(p => p.Status === 'Ongoing').length;
    
    return {
      totalProjects,
      totalParticipants,
      totalSamples,
      ongoingProjects
    };
  };

  const metrics = getMetrics();

  return (
    <header className="header">
      <div className="header-title">
        <h1>NIH Human Virome Program Dashboard</h1>
      </div>
      {data && (
        <div className="header-metrics">
          <div className="metric">
            <span className="metric-value">{metrics.totalProjects}</span>
            <span className="metric-label">Projects</span>
          </div>
          <div className="metric">
            <span className="metric-value">{metrics.totalParticipants.toLocaleString()}</span>
            <span className="metric-label">Participants</span>
          </div>
          <div className="metric">
            <span className="metric-value">{metrics.totalSamples.toLocaleString()}</span>
            <span className="metric-label">Samples</span>
          </div>
          <div className="metric">
            <span className="metric-value">{metrics.ongoingProjects}</span>
            <span className="metric-label">Ongoing Projects</span>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;