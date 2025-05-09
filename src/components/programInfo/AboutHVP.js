import React from 'react';
import './AboutHVP.css';

/**
 * AboutHVP Component
 * 
 * Provides information about the NIH Human Virome Program's background,
 * objectives, and resources.
 */
function AboutHVP() {
  return (
    <div className="about-hvp-container">
      <section className="about-section main-section">
        <h3 className="section-title">NIH Human Virome Program</h3>
        <p className="section-description">
          The NIH Human Virome Program (HVP) is a comprehensive research initiative aimed at characterizing 
          the human virome—the collection of all viruses that inhabit the human body. The program seeks to 
          understand how these viruses interact with human cells, the microbiome, and the immune system in 
          both health and disease.
        </p>
      </section>

      <section className="about-section">
        <h3 className="section-title">Program Overview</h3>
        <div className="section-content">
          <p>
            The NIH Human Virome Program (HVP) is a Common Fund initiative established in 2023 to comprehensively 
            characterize the human virome and elucidate its role in human health and disease.
          </p>
          
          <h4 className="subsection-title">Mission</h4>
          <p>
            To systematically identify and characterize the viruses that inhabit the human body across diverse 
            populations and body sites, and to understand their impact on human biology, health, and disease.
          </p>
          
          <h4 className="subsection-title">Program Goals</h4>
          <ul className="goals-list">
            <li><span className="goal-marker">●</span> <strong>Develop standardized methods</strong> for virome detection and characterization</li>
            <li><span className="goal-marker">●</span> <strong>Create reference datasets</strong> of the human virome across diverse populations</li>
            <li><span className="goal-marker">●</span> <strong>Investigate virome-host interactions</strong> in health and disease contexts</li>
            <li><span className="goal-marker">●</span> <strong>Build collaborative infrastructure</strong> for virome research</li>
            <li><span className="goal-marker">●</span> <strong>Train the next generation</strong> of virome scientists</li>
          </ul>
        </div>
      </section>
      
      <section className="about-section">
        <h3 className="section-title">Research Approach</h3>
        <div className="section-content">
          <p>
            The HVP employs cutting-edge technologies and methodologies to comprehensively characterize the human virome:
          </p>
          
          <div className="approach-cards">
            <div className="approach-card">
              <div className="approach-icon">🧬</div>
              <h4 className="approach-title">Advanced Sequencing</h4>
              <p className="approach-description">
                Utilizing next-generation sequencing and novel enrichment techniques to identify both known and novel viruses.
              </p>
            </div>
            
            <div className="approach-card">
              <div className="approach-icon">🔬</div>
              <h4 className="approach-title">Multi-Omics Integration</h4>
              <p className="approach-description">
                Combining viral genomics with host transcriptomics, proteomics, and metabolomics to understand virus-host interactions.
              </p>
            </div>
            
            <div className="approach-card">
              <div className="approach-icon">🌐</div>
              <h4 className="approach-title">Population Diversity</h4>
              <p className="approach-description">
                Sampling diverse human populations across different geographic regions, ages, and health conditions.
              </p>
            </div>
            
            <div className="approach-card">
              <div className="approach-icon">💻</div>
              <h4 className="approach-title">Computational Analysis</h4>
              <p className="approach-description">
                Developing and applying advanced bioinformatics tools to analyze complex virome datasets.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="about-section">
        <h3 className="section-title">External Resources</h3>
        <div className="resource-grid">
          <a 
            href="https://commonfund.nih.gov/humanvirome"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="resource-icon">🌐</div>
            <div className="resource-content">
              <h4 className="resource-title">NIH Common Fund HVP Website</h4>
              <p className="resource-description">Official program website with news, funding opportunities, and resources</p>
            </div>
          </a>
          
          <a 
            href="https://commonfund.nih.gov/humanvirome/datasystems"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="resource-icon">📊</div>
            <div className="resource-content">
              <h4 className="resource-title">HVP Data Portal</h4>
              <p className="resource-description">Repository of virome datasets and analysis tools (in development)</p>
            </div>
          </a>
          
          <a 
            href="https://commonfund.nih.gov/humanvirome/publications"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <div className="resource-icon">📚</div>
            <div className="resource-content">
              <h4 className="resource-title">HVP Publications</h4>
              <p className="resource-description">Scientific publications from program researchers</p>
            </div>
          </a>
        </div>
      </section>
      
      <section className="about-section">
        <h3 className="section-title">Contact Information</h3>
        <div className="contact-grid">
          <div className="contact-card">
            <h4 className="contact-title">HVP Program Office</h4>
            <p className="contact-role">General Inquiries</p>
            <p className="contact-details">
              <a href="mailto:humanvirome@nih.gov">humanvirome@nih.gov</a> | (301) 555-1234
            </p>
          </div>
          
          <div className="contact-card">
            <h4 className="contact-title">Dr. Richard Conroy</h4>
            <p className="contact-role">Program Director</p>
            <p className="contact-details">
              <a href="mailto:richard.conroy@nih.gov">richard.conroy@nih.gov</a> | (301) 555-5678
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutHVP;