import React, { useState, useEffect } from 'react';
import { loadLocalPublications, fetchAllHvpPublications } from '../../utils/publicationService';
import './Publications.css';

/**
 * Publications Component
 * 
 * Main component for displaying HVP-related publications
 * and associated metrics and visualizations.
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
  const [journalFilter, setJournalFilter] = useState('all');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Load publications data
  useEffect(() => {
    const loadPublications = async () => {
      setIsLoading(true);
      try {
        // First try to load from API, fall back to local data if needed
        let publicationsData = [];
        
        try {
          console.log('Fetching publications from NIH RePORTER API...');
          publicationsData = await fetchAllHvpPublications();
        } catch (apiError) {
          console.error('Error fetching from API:', apiError);
          console.log('Falling back to local data...');
          publicationsData = await loadLocalPublications();
        }
        
        if (publicationsData.length === 0) {
          console.log('No publications from API, loading from local data...');
          publicationsData = await loadLocalPublications();
        }
        
        setPublications(publicationsData);
        setFilteredPublications(publicationsData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading publications:', err);
        setError('Failed to load publication data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    loadPublications();
  }, []);
  
  // Apply filters when search term or filters change
  useEffect(() => {
    if (publications.length === 0) return;
    
    const applyFilters = () => {
      let filtered = [...publications];
      
      // Apply search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(pub => 
          pub.title.toLowerCase().includes(term) || 
          pub.abstract.toLowerCase().includes(term) ||
          pub.authors.some(author => author.name.toLowerCase().includes(term)) ||
          pub.journal.toLowerCase().includes(term) ||
          (pub.keywords && pub.keywords.some(keyword => keyword.toLowerCase().includes(term)))
        );
      }
      
      // Apply year filter
      if (yearFilter !== 'all') {
        filtered = filtered.filter(pub => {
          const pubYear = new Date(pub.publicationDate).getFullYear().toString();
          return pubYear === yearFilter;
        });
      }
      
      // Apply journal filter
      if (journalFilter !== 'all') {
        filtered = filtered.filter(pub => pub.journal === journalFilter);
      }
      
      setFilteredPublications(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    };
    
    applyFilters();
  }, [searchTerm, yearFilter, journalFilter, publications]);
  
  // Get publication years for filter
  const getPublicationYears = () => {
    const years = publications.map(pub => new Date(pub.publicationDate).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a); // Sort descending
  };
  
  // Get journals for filter
  const getJournals = () => {
    const journals = publications.map(pub => pub.journal);
    return [...new Set(journals)].sort();
  };
  
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
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPublications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
  
  // Pagination navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Format authors list
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
            Scientific publications related to the Human Virome Project
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
            Scientific publications related to the Human Virome Project
          </p>
        </div>
        <div className="publications-empty">
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
            Scientific publications related to the Human Virome Project
          </p>
        </div>
        <div className="publications-empty">
          <p>No publications found. Please try again later or check your connection.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="publications-container">
      <div className="publications-header">
        <h2>HVP Publications</h2>
        <p className="publications-subtitle">
          Scientific publications related to the Human Virome Project
        </p>
        <div className="publications-actions">
          {/* Actions to be implemented: Export, etc. */}
        </div>
      </div>
      
      {/* Publications Stats */}
      <div className="publication-stats">
        <div className="stat-item">
          <h3 className="stat-title">Total Publications</h3>
          <p className="stat-value">{publications.length}</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-title">Publication Years</h3>
          <p className="stat-value">{getPublicationYears().length}</p>
        </div>
        <div className="stat-item">
          <h3 className="stat-title">Journals</h3>
          <p className="stat-value">{getJournals().length}</p>
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
            placeholder="Search by title, author, keyword..."
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
        
        <div className="filter-group">
          <label htmlFor="journal-filter">Journal</label>
          <select
            id="journal-filter"
            value={journalFilter}
            onChange={(e) => setJournalFilter(e.target.value)}
          >
            <option value="all">All Journals</option>
            {getJournals().map(journal => (
              <option key={journal} value={journal}>{journal}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Results count */}
      <p className="publications-subtitle">
        Showing {filteredPublications.length} of {publications.length} publications
      </p>
      
      {/* Publications Table */}
      <div className="publications-table-container">
        <table className="publications-table">
          <thead>
            <tr>
              <th>Title & Authors</th>
              <th>Journal</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(pub => (
              <tr key={pub.id} onClick={() => handleSelectPublication(pub)}>
                <td>
                  <div className="publication-title">{pub.title}</div>
                  <div className="publication-authors">{formatAuthors(pub.authors)}</div>
                  <div className="grant-pills">
                    {pub.grants && pub.grants.map((grant, index) => (
                      <span key={index} className="grant-pill">{grant.grantId}</span>
                    ))}
                  </div>
                </td>
                <td className="publication-journal">
                  {pub.journal}
                  {pub.volume && pub.issue && (
                    <span>, {pub.volume}({pub.issue})</span>
                  )}
                </td>
                <td className="publication-date">{formatDate(pub.publicationDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt; Prev
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-button ${currentPage === page ? 'active' : ''}`}
              onClick={() => paginate(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next &gt;
          </button>
        </div>
      )}
      
      {/* Publication Detail View */}
      {selectedPublication && (
        <div id="publication-detail" className="publication-detail">
          <h3>{selectedPublication.title}</h3>
          
          <div className="publication-meta">
            <div>
              <label>Journal:</label>
              <span>{selectedPublication.journal}</span>
              {selectedPublication.volume && selectedPublication.issue && (
                <span>, {selectedPublication.volume}({selectedPublication.issue})</span>
              )}
            </div>
            
            <div>
              <label>Published:</label>
              <span>{formatDate(selectedPublication.publicationDate)}</span>
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
          
          {selectedPublication.keywords && selectedPublication.keywords.length > 0 && (
            <div className="keyword-cloud">
              <h4>Keywords</h4>
              <div className="keyword-tags">
                {selectedPublication.keywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="keyword-tag"
                    onClick={() => setSearchTerm(keyword)}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
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
          
          <div className="publication-links">
            {selectedPublication.url && (
              <a href={selectedPublication.url} target="_blank" rel="noopener noreferrer">
                View Publication
              </a>
            )}
            
            {selectedPublication.pmid && (
              <a 
                href={`https://pubmed.ncbi.nlm.nih.gov/${selectedPublication.pmid}/`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on PubMed
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Publications;