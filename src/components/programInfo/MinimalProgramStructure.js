import React from 'react';
import './ProgramStructure.css';

/**
 * MinimalProgramStructure Component
 * 
 * A simplified structure component that doesn't cause errors
 */
function MinimalProgramStructure() {
  return (
    <div className="structure-container">
      <div className="structure-header">
        <h3>NIH Human Virome Program Structure</h3>
        <p className="structure-subtitle">Governance structure and collaboration network</p>
      </div>
      
      <div className="structure-visualization" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '300px',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--border-radius-sm)',
        padding: '20px',
        margin: '20px 0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h4>Program Structure</h4>
          <p>Simplified structure view for diagnostic purposes.</p>
          <p>The full interactive organization chart will be implemented in a future update.</p>
        </div>
      </div>
    </div>
  );
}

export default MinimalProgramStructure;