import React from 'react';
import './Header.css';
import { useTheme } from '../context/ThemeContext';

function Header({ data }) {
  // Get the theme context
  const { theme, toggleTheme } = useTheme();
  
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
      <div className="header-left">
        <div className="header-title">
          <h1>NIH Human Virome Program Dashboard</h1>
        </div>
        <button 
          className={`theme-toggle-button ${theme === 'dark' ? 'dark' : 'light'}`}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zM5.64 5.64a1 1 0 011.42 0l.7.7a1 1 0 01-1.42 1.42l-.7-.7a1 1 0 010-1.42zm12.72 0a1 1 0 010 1.42l-.7.7a1 1 0 11-1.42-1.42l.7-.7a1 1 0 011.42 0zM12 7a5 5 0 100 10 5 5 0 000-10zm-9 5a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm15 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-2.64 5.64a1 1 0 011.42 0l.7.7a1 1 0 01-1.42 1.42l-.7-.7a1 1 0 010-1.42zM5.64 17.36a1 1 0 010 1.42l-.7.7a1 1 0 01-1.42-1.42l.7-.7a1 1 0 011.42 0zM12 19a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" 
                fill="currentColor" 
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" 
                fill="currentColor" 
              />
            </svg>
          )}
        </button>
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