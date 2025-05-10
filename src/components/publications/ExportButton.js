import React, { useState } from 'react';
import { exportPublicationsToCSV } from '../../utils/exportUtils';
import './ExportButton.css';

/**
 * Export Button Component
 * 
 * Provides functionality to export publication data in various formats
 */
const ExportButton = ({ publications, filteredPublications }) => {
  const [showOptions, setShowOptions] = useState(false);
  
  // Handle export of all publications
  const handleExportAll = () => {
    exportPublicationsToCSV(publications, 'hvp-publications-all.csv');
    setShowOptions(false);
  };
  
  // Handle export of filtered publications
  const handleExportFiltered = () => {
    exportPublicationsToCSV(filteredPublications, 'hvp-publications-filtered.csv');
    setShowOptions(false);
  };
  
  // Toggle options menu
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  
  return (
    <div className="export-button-container">
      <button 
        className="export-button"
        onClick={toggleOptions}
        aria-haspopup="true"
        aria-expanded={showOptions}
      >
        <span className="export-icon">📥</span> Export
      </button>
      
      {showOptions && (
        <div className="export-options">
          <button 
            className="export-option" 
            onClick={handleExportAll}
          >
            Export All Publications
          </button>
          
          <button 
            className="export-option" 
            onClick={handleExportFiltered}
            disabled={filteredPublications.length === 0}
          >
            Export Filtered Publications
            {filteredPublications.length > 0 && (
              <span className="count-badge">{filteredPublications.length}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;