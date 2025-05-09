import React from 'react';
import './AboutHVPNew.css';

/**
 * AboutHVPNew Component
 * 
 * A clean, reliable implementation of the About HVP page with minimal dependencies
 * and no external data loading.
 */
function AboutHVPNew() {
  return (
    <div className="about-hvp-new">
      <section className="about-section main-section">
        <h2>NIH Human Virome Program</h2>
        <p className="lead-text">
          The NIH Human Virome Program (HVP) is a comprehensive research initiative aimed at characterizing 
          the human virome—the collection of all viruses that inhabit the human body. The program seeks to 
          understand how these viruses interact with human cells, the microbiome, and the immune system in 
          both health and disease.
        </p>
      </section>

      <section className="about-section">
        <h3>Program Overview</h3>
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
        <ul className="goals-list">
          <li><strong>Develop standardized methods</strong> for virome detection and characterization</li>
          <li><strong>Create reference datasets</strong> of the human virome across diverse populations</li>
          <li><strong>Investigate virome-host interactions</strong> in health and disease contexts</li>
          <li><strong>Build collaborative infrastructure</strong> for virome research</li>
          <li><strong>Train the next generation</strong> of virome scientists</li>
        </ul>
      </section>
      
      <section className="about-section">
        <h3>External Resources</h3>
        <div className="resources-grid">
          <a 
            href="https://commonfund.nih.gov/humanvirome"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-item"
          >
            <div className="resource-content">
              <h4>NIH Common Fund HVP Website</h4>
              <p>Official program website with news, funding opportunities, and resources</p>
            </div>
          </a>
          
          <a 
            href="https://commonfund.nih.gov/humanvirome/datasystems"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-item"
          >
            <div className="resource-content">
              <h4>HVP Data Portal</h4>
              <p>Repository of virome datasets and analysis tools (in development)</p>
            </div>
          </a>
          
          <a 
            href="https://commonfund.nih.gov/humanvirome/publications"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-item"
          >
            <div className="resource-content">
              <h4>HVP Publications</h4>
              <p>Scientific publications from program researchers</p>
            </div>
          </a>
        </div>
      </section>
      
      <section className="about-section">
        <h3>Contact Information</h3>
        <div className="contacts-grid">
          <div className="contact-item">
            <h4>HVP Program Office</h4>
            <p>General Inquiries</p>
            <p className="contact-details">
              <a href="mailto:humanvirome@nih.gov">humanvirome@nih.gov</a> | (301) 555-1234
            </p>
          </div>
          
          <div className="contact-item">
            <h4>Dr. Richard Conroy</h4>
            <p>Program Director</p>
            <p className="contact-details">
              <a href="mailto:richard.conroy@nih.gov">richard.conroy@nih.gov</a> | (301) 555-5678
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutHVPNew;