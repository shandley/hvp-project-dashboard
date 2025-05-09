import React from 'react';
import './ProgramTimeline.css';

/**
 * MinimalProgramTimeline Component
 * 
 * A simplified timeline component that doesn't cause errors
 */
function MinimalProgramTimeline() {
  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h3>NIH Human Virome Program Timeline</h3>
        <p className="timeline-subtitle">Key milestones from planning to completion</p>
      </div>
      
      <div className="timeline-visualization" style={{ 
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
          <h4>Program Timeline</h4>
          <p>Simplified timeline view for diagnostic purposes.</p>
          <p>The full interactive timeline will be implemented in a future update.</p>
        </div>
      </div>
    </div>
  );
}

export default MinimalProgramTimeline;