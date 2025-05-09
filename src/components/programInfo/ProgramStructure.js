import React, { useState } from 'react';
import './ProgramStructure.css';

/**
 * ProgramStructure Component
 * 
 * Displays the organizational chart of the NIH Human Virome Program's
 * governance structure and collaboration mechanisms.
 * 
 * @returns {JSX.Element} The ProgramStructure component
 */
function ProgramStructure() {
  const [viewMode, setViewMode] = useState('governance'); // 'governance' or 'collaboration'
  
  return (
    <div className="structure-container">
      <div className="structure-header">
        <h3>NIH Human Virome Program Structure</h3>
        <p className="structure-subtitle">Governance structure and collaboration network</p>
      </div>
      
      <div className="view-mode-selector">
        <button
          className={`view-mode-button ${viewMode === 'governance' ? 'active' : ''}`}
          onClick={() => setViewMode('governance')}
        >
          Governance Structure
        </button>
        <button
          className={`view-mode-button ${viewMode === 'collaboration' ? 'active' : ''}`}
          onClick={() => setViewMode('collaboration')}
        >
          Collaboration Network
        </button>
      </div>
      
      {viewMode === 'governance' ? (
        <div className="governance-content">
          <div className="structure-visualization">
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <h4>HVP Governance Structure</h4>
              <p className="structure-description">
                The NIH Human Virome Program operates under a multi-tiered governance structure
                that facilitates coordination across NIH institutes and centers while providing
                scientific oversight and direction.
              </p>
              
              <div className="governance-tiers">
                <div className="governance-tier">
                  <h5 className="tier-title">Program Leadership</h5>
                  <div className="tier-entities">
                    <div className="entity-card">
                      <h6>Steering Committee</h6>
                      <p>Representatives from participating NIH institutes and centers</p>
                    </div>
                    <div className="entity-card">
                      <h6>Executive Committee</h6>
                      <p>Senior leadership providing strategic direction</p>
                    </div>
                  </div>
                </div>
                
                <div className="governance-tier">
                  <h5 className="tier-title">Scientific Guidance</h5>
                  <div className="tier-entities">
                    <div className="entity-card">
                      <h6>Scientific Advisory Board</h6>
                      <p>External experts providing scientific oversight</p>
                    </div>
                    <div className="entity-card">
                      <h6>Working Groups</h6>
                      <p>Focused teams addressing specific program challenges</p>
                    </div>
                  </div>
                </div>
                
                <div className="governance-tier">
                  <h5 className="tier-title">Implementation</h5>
                  <div className="tier-entities">
                    <div className="entity-card">
                      <h6>Research Centers</h6>
                      <p>Institutions conducting virome research and data generation</p>
                    </div>
                    <div className="entity-card">
                      <h6>Data Coordination Center</h6>
                      <p>Central hub for data integration and dissemination</p>
                    </div>
                    <div className="entity-card">
                      <h6>Program Management</h6>
                      <p>Day-to-day administration and coordination</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="collaboration-content">
          <div className="structure-visualization">
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <h4>HVP Collaboration Network</h4>
              <p className="structure-description">
                The Human Virome Program fosters collaboration across diverse stakeholders to
                accelerate discovery and translation of virome research findings.
              </p>
              
              <div className="collaboration-network">
                <div className="network-center">
                  <div className="center-node">HVP</div>
                  
                  <div className="network-connections">
                    <div className="connection-group">
                      <h5 className="connection-title">Research Partners</h5>
                      <div className="connection-entities">
                        <div className="connection-entity">Academic Institutions</div>
                        <div className="connection-entity">Research Consortia</div>
                        <div className="connection-entity">International Collaborators</div>
                      </div>
                    </div>
                    
                    <div className="connection-group">
                      <h5 className="connection-title">Data & Resources</h5>
                      <div className="connection-entities">
                        <div className="connection-entity">Data Repositories</div>
                        <div className="connection-entity">Biobanks & Samples</div>
                        <div className="connection-entity">Technology Platforms</div>
                      </div>
                    </div>
                    
                    <div className="connection-group">
                      <h5 className="connection-title">Knowledge Translation</h5>
                      <div className="connection-entities">
                        <div className="connection-entity">Clinical Applications</div>
                        <div className="connection-entity">Public Health Agencies</div>
                        <div className="connection-entity">Educational Resources</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="structure-info">
        <p className="interaction-hint">
          <strong>Note:</strong> The full interactive visualization with detailed information about each
          entity will be available in a future update.
        </p>
      </div>
    </div>
  );
}

export default ProgramStructure;