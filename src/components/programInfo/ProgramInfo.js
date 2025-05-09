import React, { useState, useEffect } from 'react';
import './ProgramInfo.css';
import ProgramTimeline from './ProgramTimeline';
import AboutHVP from './AboutHVP';
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
    switch (activeTab) {
      case 'timeline':
        return <ProgramTimeline />;
      case 'about':
        return <AboutHVP />;
      case 'structure':
        return <ProgramStructure />;
      default:
        return <div>Select a tab to view information</div>;
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