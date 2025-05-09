import React from 'react';
import './Dashboard.css';
import FilterPanel from './FilterPanel';
import Overview from './visualizations/Overview';
import GeographicDistribution from './visualizations/GeographicDistribution';
import SampleDistribution from './visualizations/SampleDistribution';
import LiveProjectTimeline from './visualizations/LiveProjectTimeline';
import NetworkRelationships from './visualizations/NetworkRelationships';
import DiseaseViromeTable from './visualizations/DiseaseViromeTable';
import ProgramInfo from './programInfo/ProgramInfo';
import Publications from './publications/Publications';

function Dashboard({ data, filters, updateFilters, activeView }) {
  // Render the appropriate visualization based on the active view
  const renderContent = () => {
    console.log('Dashboard renderContent called, activeView:', activeView);
    
    // If view is null or undefined, show a loading message
    if (activeView === null || activeView === undefined) {
      console.log('Dashboard: activeView is null or undefined, showing loading state');
      return <div className="loading-transition">Changing view...</div>;
    }
    
    if (!data && !['program-info', 'disease-virome', 'publications'].includes(activeView)) {
      console.log('No data available for view:', activeView);
      return <div>No data available</div>;
    }

    switch (activeView) {
      case 'overview':
        console.log('Rendering Overview component');
        return <Overview data={data} filters={filters} />;
      case 'geographic':
        console.log('Rendering GeographicDistribution component');
        return <GeographicDistribution data={data} filters={filters} />;
      case 'samples':
        console.log('Rendering SampleDistribution component');
        return <SampleDistribution data={data} filters={filters} />;
      case 'timeline':
        console.log('Rendering LiveProjectTimeline component');
        return <LiveProjectTimeline data={data} filters={filters} />;
      case 'networks':
        console.log('Rendering NetworkRelationships component');
        return <NetworkRelationships data={data} filters={filters} />;
      case 'disease-virome':
        console.log('Rendering DiseaseViromeTable component');
        return <DiseaseViromeTable />;
      case 'publications':
        console.log('Rendering Publications component');
        return <Publications data={data} filters={filters} />;
      case 'program-info': {
        console.log('Rendering ProgramInfo component');
        console.log('Dashboard time:', new Date().toISOString());
        
        try {
          const programInfoComponent = <ProgramInfo />;
          return programInfoComponent;
        } catch (error) {
          console.error('Error rendering ProgramInfo in Dashboard:', error);
          return <div>Error rendering ProgramInfo: {error.message}</div>;
        }
      }
      default:
        console.log('Default: Rendering Overview component');
        return <Overview data={data} filters={filters} />;
    }
  };

  return (
    <div className="dashboard">
      {console.log('Dashboard rendering, activeView:', activeView)}
      {!['program-info', 'disease-virome', 'publications'].includes(activeView) && (
        <FilterPanel 
          data={data} 
          filters={filters} 
          updateFilters={updateFilters} 
        />
      )}
      <div 
        className={`dashboard-content ${['program-info', 'disease-virome', 'publications'].includes(activeView) ? 'full-width' : ''}`}
        style={{ width: '100%' }}
      >
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;