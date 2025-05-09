import React, { useState, useEffect } from 'react';
import './AboutHVP.css';

/**
 * AboutHVP Component
 * 
 * Displays comprehensive information about the NIH Human Virome Program,
 * including its goals, scientific impact, and ethical considerations.
 */
function AboutHVP() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  
  // Load about data
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/data/hvp-about-new.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load HVP information');
        }
        return response.json();
      })
      .then(data => {
        setAboutData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading HVP information:', err);
        setError('Failed to load HVP information. Please try again later.');
        setLoading(false);
      });
  }, []);
  
  // Handle section change
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };
  
  if (loading) {
    return (
      <div className="about-hvp-container loading-message">
        <p>Loading HVP information...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="about-hvp-container error-message">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!aboutData) {
    return (
      <div className="about-hvp-container error-message">
        <h3>No Data Available</h3>
        <p>Could not load HVP information.</p>
      </div>
    );
  }
  
  // Get the active section content
  const activeContent = aboutData.sections.find(section => section.id === activeSection);
  
  // Convert markdown-like content (## headings and **bold text**) to HTML
  const formatContent = (content) => {
    if (!content) return '';
    
    // Replace markdown headings with HTML
    let formattedContent = content.replace(/##\s+(.+)$/gm, '<h4>$1</h4>');
    
    // Replace markdown bold with HTML
    formattedContent = formattedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Replace newlines with <br> tags or paragraphs
    formattedContent = formattedContent.replace(/\n\n/g, '</p><p>');
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return `<p>${formattedContent}</p>`;
  };
  
  return (
    <div className="about-hvp-container">
      <div className="about-header">
        <h3>{aboutData.title}</h3>
        <p className="about-description">{aboutData.description}</p>
      </div>
      
      <div className="about-nav">
        {aboutData.sections.map(section => (
          <button
            key={section.id}
            className={`about-nav-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => handleSectionChange(section.id)}
          >
            {section.title}
          </button>
        ))}
      </div>
      
      <div className="about-content">
        <h3 className="section-title">{activeContent.title}</h3>
        <div 
          className="section-content"
          dangerouslySetInnerHTML={{ __html: formatContent(activeContent.content) }}
        ></div>
      </div>
      
      {activeSection === 'overview' && (
        <div className="about-resources">
          <h4>External Resources</h4>
          <div className="resource-list">
            {aboutData.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-card"
              >
                <div className="resource-icon">
                  {resource.type === 'data' && <span>📊</span>}
                  {resource.type === 'methods' && <span>🧪</span>}
                  {resource.type === 'publications' && <span>📚</span>}
                </div>
                <div className="resource-details">
                  <h5>{resource.name}</h5>
                  <p>{resource.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
      
      <div className="about-footer">
        <h4>Contact Information</h4>
        <div className="contact-list">
          {aboutData.contacts.map((contact, index) => (
            <div key={index} className="contact-card">
              <h5>{contact.name}</h5>
              <p>{contact.role}</p>
              <p className="contact-info">
                <a href={`mailto:${contact.email}`}>{contact.email}</a> | {contact.phone}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AboutHVP;