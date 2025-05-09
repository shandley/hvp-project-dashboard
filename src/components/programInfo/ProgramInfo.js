import React, { useState, useEffect } from 'react';
import './ProgramInfo.css';
import ProgramTimeline from './ProgramTimeline';
import AboutHVPNew from './AboutHVPNew';
import ProgramStructure from './ProgramStructure';

/**
 * ProgramInfo Component
 * 
 * A container component that displays additional information about the NIH Human Virome Program
 * beyond what's available in the visualization dashboard.
 */
function ProgramInfo() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [loading, setLoading] = useState(true);
  
  // Tabs for the program information
  const tabs = [
    { id: 'timeline', label: 'Program Timeline' },
    { id: 'about', label: 'About HVP' },
    { id: 'structure', label: 'Program Structure' }
  ];
  
  // Simulate loading to allow child components to fetch their data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Render the active tab content
  const renderTabContent = () => {
    console.log('ProgramInfo: Rendering tab content for', activeTab);
    
    try {
      switch (activeTab) {
        case 'timeline':
          console.log('ProgramInfo: Rendering ProgramTimeline component');
          return <ProgramTimeline />;
        case 'about':
          console.log('ProgramInfo: Rendering AboutHVPNew component');
          return <AboutHVPNew />;
        case 'structure':
          console.log('ProgramInfo: Rendering ProgramStructure component');
          return <ProgramStructure />;
        default:
          console.log('ProgramInfo: No matching tab, showing default content');
          return <div>Select a tab to view information</div>;
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return (
        <div className="error-message">
          <h3>Error</h3>
          <p>An error occurred while rendering this content: {error.message}</p>
        </div>
      );
    }
  };
  
  
  return (
    <div className="program-info-container">
      <div className="program-info-header">
        <h2>NIH Human Virome Program Information</h2>
        <p className="subtitle">Additional context and information about the NIH Human Virome Program</p>
      </div>
      
      <div className="program-info-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="program-info-content">
        {loading ? (
          <div className="loading-message">
            <p>Loading program information...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
}

export default ProgramInfo;