import React from 'react';
import './AboutHVP.css';

/**
 * AboutHVP Component - Simplified for reliability
 */
function AboutHVP() {
  // Simple hardcoded content instead of fetching from JSON
  return (
    <div className="about-hvp-container">
      <div className="about-header">
        <h3>NIH Human Virome Program</h3>
        <p className="about-description">
          The NIH Human Virome Program (HVP) is a comprehensive research initiative aimed at characterizing 
          the human virome—the collection of all viruses that inhabit the human body. The program seeks to 
          understand how these viruses interact with human cells, the microbiome, and the immune system in 
          both health and disease.
        </p>
      </div>
      
      <div className="about-content">
        <h3 className="section-title">Program Overview</h3>
        <div className="section-content">
          <p>
            The NIH Human Virome Program (HVP) is a Common Fund initiative established in 2023 to comprehensively 
            characterize the human virome and elucidate its role in human health and disease.
          </p>
          
          <h4>Mission</h4>
          <p>
            To systematically identify and characterize the viruses that inhabit the human body across diverse 
            populations and body sites, and to understand their impact on human biology, health, and disease.
          </p>
          
          <h4>Program Goals</h4>
          <p>
            <strong>Develop standardized methods</strong> for virome detection and characterization<br/>
            <strong>Create reference datasets</strong> of the human virome across diverse populations<br/>
            <strong>Investigate virome-host interactions</strong> in health and disease contexts<br/>
            <strong>Build collaborative infrastructure</strong> for virome research<br/>
            <strong>Train the next generation</strong> of virome scientists
          </p>
        </div>
      </div>
      
      <div className="about-resources">
        <h4>External Resources</h4>
        <div className="resource-list">
          <a 
            href="https://commonfund.nih.gov/humanvirome"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="resource-icon">
              <span>🌐</span>
            </div>
            <div className="resource-details">
              <h5>NIH Common Fund HVP Website</h5>
              <p>Official program website with news, funding opportunities, and resources</p>
            </div>
          </a>
          
          <a 
            href="https://commonfund.nih.gov/humanvirome/datasystems"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="resource-icon">
              <span>📊</span>
            </div>
            <div className="resource-details">
              <h5>HVP Data Portal</h5>
              <p>Repository of virome datasets and analysis tools (in development)</p>
            </div>
          </a>
          
          <a 
            href="https://commonfund.nih.gov/humanvirome/publications"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="resource-icon">
              <span>📚</span>
            </div>
            <div className="resource-details">
              <h5>HVP Publications</h5>
              <p>Scientific publications from program researchers</p>
            </div>
          </a>
        </div>
      </div>
      
      <div className="about-footer">
        <h4>Contact Information</h4>
        <div className="contact-list">
          <div className="contact-card">
            <h5>HVP Program Office</h5>
            <p>General Inquiries</p>
            <p className="contact-info">
              <a href="mailto:humanvirome@nih.gov">humanvirome@nih.gov</a> | (301) 555-1234
            </p>
          </div>
          
          <div className="contact-card">
            <h5>Dr. Richard Conroy</h5>
            <p>Program Director</p>
            <p className="contact-info">
              <a href="mailto:richard.conroy@nih.gov">richard.conroy@nih.gov</a> | (301) 555-5678
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutHVP;