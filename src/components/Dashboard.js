import React from 'react';
import './Dashboard.css';
import FilterPanel from './FilterPanel';
import Overview from './visualizations/Overview';
import GeographicDistribution from './visualizations/GeographicDistribution';
import SampleDistribution from './visualizations/SampleDistribution';
import ProjectTimeline from './visualizations/ProjectTimeline';
import NetworkRelationships from './visualizations/NetworkRelationships';
import ProgramInfo from './programInfo/ProgramInfo';

function Dashboard({ data, filters, updateFilters, activeView }) {
  // Render the appropriate visualization based on the active view
  const renderContent = () => {
    if (!data && activeView !== 'program-info') return <div>No data available</div>;

    switch (activeView) {
      case 'overview':
        return <Overview data={data} filters={filters} />;
      case 'geographic':
        return <GeographicDistribution data={data} filters={filters} />;
      case 'samples':
        return <SampleDistribution data={data} filters={filters} />;
      case 'timeline':
        return <ProjectTimeline data={data} filters={filters} />;
      case 'networks':
        return <NetworkRelationships data={data} filters={filters} />;
      case 'program-info':
        return <ProgramInfo />;
      default:
        return <Overview data={data} filters={filters} />;
    }
  };

  return (
    <div className="dashboard">
      {activeView !== 'program-info' && (
        <FilterPanel 
          data={data} 
          filters={filters} 
          updateFilters={updateFilters} 
        />
      )}
      <div className={`dashboard-content ${activeView === 'program-info' ? 'full-width' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;