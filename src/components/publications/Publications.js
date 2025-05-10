import React, { useState, useEffect } from 'react';
import './Publications.css';

/**
 * Publications Component
 * 
 * Displays HVP-related publications with filtering, sorting and detailed view
 */
const Publications = ({ data, filters }) => {
  // State for publications data
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  
  // Load publications data from JSON file
  useEffect(() => {
    const loadPublications = async () => {
      setIsLoading(true);
      
      try {
        // Clear any selected publication when loading new data
        setSelectedPublication(null);
        
        // Fetch publications data from JSON file
        console.log('Fetching publications data from JSON file...');
        const response = await fetch('/data/hvp-publications.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load publications data: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate data structure
        if (!data.publications || !Array.isArray(data.publications)) {
          throw new Error('Invalid publications data format');
        }
        
        console.log(`Successfully loaded ${data.publications.length} publications`);
        setPublications(data.publications);
        setFilteredPublications(data.publications);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading publications:', err);
        setError('Failed to load publication data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    loadPublications();
  }, []); // Only load once on mount
  
  // Apply filters when search term or filters change
  useEffect(() => {
    if (publications.length === 0) return;
    
    const applyFilters = () => {
      let filtered = [...publications];
      
      // Apply search term filter (case insensitive)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(pub => 
          (pub.title && pub.title.toLowerCase().includes(term)) || 
          (pub.abstract && pub.abstract.toLowerCase().includes(term)) ||
          (pub.authors && pub.authors.some(author => author.name.toLowerCase().includes(term))) ||
          (pub.journal && pub.journal.toLowerCase().includes(term))
        );
      }
      
      // Apply year filter
      if (yearFilter !== 'all') {
        filtered = filtered.filter(pub => {
          const pubDate = pub.publicationDate || '';
          return pubDate.includes(yearFilter);
        });
      }
      
      setFilteredPublications(filtered);
    };
    
    applyFilters();
  }, [searchTerm, yearFilter, publications]);
  
  // Handle publication selection
  const handleSelectPublication = (publication) => {
    setSelectedPublication(publication);
    // Scroll to publication detail
    setTimeout(() => {
      const detailElement = document.getElementById('publication-detail');
      if (detailElement) {
        detailElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Get publication years for year filter
  const getPublicationYears = () => {
    const years = publications
      .map(pub => {
        const dateParts = (pub.publicationDate || '').split(' ');
        return dateParts[0]; // First part should be the year in format "YYYY Month Day"
      })
      .filter(year => year && year.length === 4); // Ensure we only get valid years
    
    // Use Set to get unique years and sort them in descending order
    return [...new Set(years)].sort((a, b) => b - a);
  };
  
  // Format authors list with optional limit
  const formatAuthors = (authors, limit = 3) => {
    if (!authors || authors.length === 0) return 'Unknown authors';
    
    if (authors.length <= limit) {
      return authors.map(author => author.name).join(', ');
    }
    
    return authors.slice(0, limit).map(author => author.name).join(', ') + ` and ${authors.length - limit} more`;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="publications-container">
        <div className="publications-header">
          <h2>HVP Publications</h2>
          <p className="publications-subtitle">
            Scientific publications related to the Human Virome Program
          </p>
        </div>
        <div className="publications-loading">
          <p>Loading publications data...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="publications-container">
        <div className="publications-header">
          <h2>HVP Publications</h2>
          <p className="publications-subtitle">
            Scientific publications related to the Human Virome Program
          </p>
        </div>
        <div className="publications-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }
  
  // Render empty state
  if (publications.length === 0) {
    return (
      <div className="publications-container">
        <div className="publications-header">
          <h2>HVP Publications</h2>
          <p className="publications-subtitle">
            Scientific publications related to the Human Virome Program
          </p>
        </div>
        <div className="publications-empty">
          <p>No HVP publications found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="publications-container">
      <div className="publications-header">
        <h2>HVP Publications</h2>
        <p className="publications-subtitle">
          Scientific publications related to the Human Virome Program
        </p>
      </div>
      
      {/* Publications Stats */}
      <div className="publication-stats">
        <div className="stat-item">
          <h3 className="stat-title">Total Publications</h3>
          <p className="stat-value">{publications.length}</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-title">Citations</h3>
          <p className="stat-value">
            {publications.reduce((total, pub) => total + (pub.citationCount || 0), 0)}
          </p>
        </div>
        <div className="stat-item">
          <h3 className="stat-title">Publication Years</h3>
          <p className="stat-value">{getPublicationYears().length}</p>
        </div>
      </div>
      
      {/* Filter Bar */}
      <div className="publications-filter-bar">
        <div className="search-group">
          <label htmlFor="search">Search</label>
          <span className="search-icon">🔍</span>
          <input
            id="search"
            type="text"
            placeholder="Search by title, author, journal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="year-filter">Year</label>
          <select
            id="year-filter"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">All Years</option>
            {getPublicationYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Results count */}
      <p className="publications-subtitle">
        Showing {filteredPublications.length} of {publications.length} publications
      </p>
      
      {/* Publications List */}
      <div className="publications-list">
        {filteredPublications.map(pub => (
          <div 
            key={pub.id} 
            className="publication-card"
            onClick={() => handleSelectPublication(pub)}
          >
            <h3 className="publication-title">{pub.title}</h3>
            <p className="publication-authors">{formatAuthors(pub.authors)}</p>
            <p className="publication-journal">
              {pub.journal}
              <span className="publication-date"> ({pub.publicationDate})</span>
            </p>
            <div className="grant-pills">
              {pub.grants && pub.grants.map((grant, index) => (
                <span key={index} className="grant-pill">{grant.grantId}</span>
              ))}
            </div>
            <div className="publication-metrics">
              <span>{pub.citationCount} citations</span>
              <span>{pub.citationsPerYear.toFixed(1)} citations/year</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Publication Detail View */}
      {selectedPublication && (
        <div id="publication-detail" className="publication-detail">
          <h3>{selectedPublication.title}</h3>
          
          <div className="publication-meta">
            <div>
              <label>Journal:</label>
              <span>{selectedPublication.journal}</span>
            </div>
            
            <div>
              <label>Published:</label>
              <span>{selectedPublication.publicationDate}</span>
            </div>
            
            {selectedPublication.doi && (
              <div>
                <label>DOI:</label>
                <span>{selectedPublication.doi}</span>
              </div>
            )}
          </div>
          
          <div>
            <label>Authors:</label>
            <div>{formatAuthors(selectedPublication.authors, 100)}</div>
          </div>
          
          {selectedPublication.abstract && (
            <div className="publication-abstract">
              <h4>Abstract</h4>
              <p>{selectedPublication.abstract}</p>
            </div>
          )}
          
          {selectedPublication.grants && selectedPublication.grants.length > 0 && (
            <div>
              <h4>Related Grants</h4>
              <ul>
                {selectedPublication.grants.map((grant, index) => (
                  <li key={index}>
                    <strong>{grant.grantId}</strong>: {grant.grantTitle}
                    {grant.principalInvestigator && (
                      <span> (PI: {grant.principalInvestigator})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="publication-metrics-detail">
            <h4>Metrics</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <label>Citations:</label>
                <span>{selectedPublication.citationCount}</span>
              </div>
              <div className="metric-item">
                <label>Citations per year:</label>
                <span>{selectedPublication.citationsPerYear.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <div className="publication-links">
            <a 
              href={`https://pubmed.ncbi.nlm.nih.gov/${selectedPublication.pmid}/`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View on PubMed
            </a>
            
            {selectedPublication.doi && (
              <a 
                href={`https://doi.org/${selectedPublication.doi}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View via DOI
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Publications;