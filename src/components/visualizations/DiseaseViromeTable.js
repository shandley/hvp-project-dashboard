import React, { useState, useEffect, useRef } from 'react';
import './DiseaseViromeTable.css';
import ExportDataButton from '../ExportDataButton';

/**
 * DiseaseViromeTable Component
 * 
 * A tabular representation of disease-virome relationships and associated biomarkers.
 * Simpler and more information-dense than a network visualization for this dataset.
 */
function DiseaseViromeTable() {
  const [tableData, setTableData] = useState(null);
  const [referencesData, setReferencesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'disease', direction: 'ascending' });
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  const tableRef = useRef(null);
  
  // Load data
  useEffect(() => {
    // Load both data sources in parallel
    Promise.all([
      fetch(`${process.env.PUBLIC_URL}/data/disease-virome-network.json`).then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load disease-virome data: ${res.status}`);
        }
        return res.json();
      }),
      fetch(`${process.env.PUBLIC_URL}/data/hvp-disease-associations.json`).then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load reference data: ${res.status}`);
        }
        return res.json();
      })
    ])
    .then(([networkData, associationsData]) => {
      setTableData(networkData);
      setReferencesData(associationsData);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error loading data:', err);
      setError(`Failed to load data: ${err.message}`);
      setLoading(false);
    });
  }, []);
  
  // Find reference URLs for a given disease and reference text
  const findReferenceUrls = (diseaseName, referencesText) => {
    if (!referencesData || !referencesText) return [];
    
    // Find the disease in the references data
    const diseaseEntry = referencesData.associations.find(
      assoc => assoc.disease.toLowerCase() === diseaseName.toLowerCase()
    );
    
    if (!diseaseEntry || !diseaseEntry.references) return [];
    
    // Extract author names and years from the reference text
    const refMatches = referencesText.split(',').map(ref => ref.trim());
    
    // Map each reference to its URL if found
    return refMatches.map(refText => {
      // Extract author and year from the reference text (e.g., "Clooney et al. (2019)")
      const match = refText.match(/([A-Za-z]+(?:\s+et\s+al\.)?)\s*\((\d{4})\)/);
      if (!match) return { text: refText, url: null };
      
      const [, author, year] = match;
      const authorLastName = author.split(' ')[0]; // Get last name
      
      // Find matching reference in the disease entry
      const reference = diseaseEntry.references.find(ref => {
        const refAuthorLastName = ref.authors.split(' ')[0];
        return refAuthorLastName.toLowerCase() === authorLastName.toLowerCase() && 
               ref.year.toString() === year;
      });
      
      return {
        text: refText,
        url: reference?.url || null
      };
    });
  };
  
  // Render references with links when available
  const renderReferences = (diseaseName, referencesText) => {
    const referenceLinks = findReferenceUrls(diseaseName, referencesText);
    
    if (referenceLinks.length === 0) return referencesText;
    
    return (
      <>
        {referenceLinks.map((ref, index) => (
          <React.Fragment key={index}>
            {index > 0 && ', '}
            {ref.url ? (
              <a 
                href={ref.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="reference-link"
              >
                {ref.text}
              </a>
            ) : (
              ref.text
            )}
          </React.Fragment>
        ))}
      </>
    );
  };
  
  // Filter and sort data
  const getProcessedData = () => {
    if (!tableData) return [];
    
    return tableData.diseaseViromeAssociations
      // Apply category filter
      .filter(row => 
        filterCategory === 'all' || row.category === filterCategory
      )
      // Apply search filter across all fields
      .filter(row => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          row.disease.toLowerCase().includes(query) ||
          row.viromeChanges.toLowerCase().includes(query) ||
          (row.biomarkers && row.biomarkers.toLowerCase().includes(query)) ||
          row.category.toLowerCase().includes(query) ||
          row.references.toLowerCase().includes(query)
        );
      })
      // Apply sorting
      .sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;
        
        const compareResult = aValue.localeCompare(bValue);
        
        return sortConfig.direction === 'ascending' 
          ? compareResult 
          : -compareResult;
      });
  };
  
  // Handle sorting when column header is clicked
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Get the sort direction indicator for a column
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };
  
  // Toggle row expansion for mobile view
  const toggleRowExpansion = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };
  
  // Format data for export
  const getExportData = () => {
    if (!tableData) return [];
    
    return tableData.diseaseViromeAssociations.map(row => ({
      Disease: row.disease,
      Category: row.category,
      'Virome Changes': row.viromeChanges,
      Biomarkers: row.biomarkers || 'N/A',
      References: row.references
    }));
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setFilterCategory('all');
    setSearchQuery('');
    setSortConfig({ key: 'disease', direction: 'ascending' });
  };
  
  if (loading) {
    return (
      <div className="visualization-container loading-message">
        <p>Loading disease-virome association data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="visualization-container error-message">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  const processedData = getProcessedData();
  const categories = ['all', ...Object.keys(tableData.diseaseCategories)].sort();
  
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Disease-Virome Associations</h2>
        <p className="subtitle">Relationships between diseases, virome changes, and biomarkers</p>
        <div className="visualization-actions">
          <ExportDataButton
            data={getExportData()}
            filename="disease-virome-associations"
            visualizationRef={tableRef}
            exportOptions={['csv', 'json', 'png', 'print']}
          />
        </div>
      </div>
      
      <div className="disease-virome-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="category-filter">
          <label htmlFor="category-select">Disease Category:</label>
          <select 
            id="category-select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
        
        {(searchQuery || filterCategory !== 'all') && (
          <button 
            className="reset-filters"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        )}
      </div>
      
      <div className="table-container" ref={tableRef}>
        {processedData.length === 0 ? (
          <div className="no-results">
            <p>No matching associations found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <table className="disease-virome-table">
              <thead>
                <tr>
                  <th 
                    onClick={() => requestSort('disease')}
                    className={sortConfig.key === 'disease' ? 'sorted' : ''}
                  >
                    Disease {getSortDirectionIndicator('disease')}
                  </th>
                  <th 
                    onClick={() => requestSort('category')}
                    className={sortConfig.key === 'category' ? 'sorted' : ''}
                  >
                    Category {getSortDirectionIndicator('category')}
                  </th>
                  <th 
                    onClick={() => requestSort('viromeChanges')}
                    className={sortConfig.key === 'viromeChanges' ? 'sorted' : ''}
                  >
                    Virome Changes {getSortDirectionIndicator('viromeChanges')}
                  </th>
                  <th 
                    onClick={() => requestSort('biomarkers')}
                    className={sortConfig.key === 'biomarkers' ? 'sorted' : ''}
                  >
                    Biomarkers {getSortDirectionIndicator('biomarkers')}
                  </th>
                  <th>References</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((row, index) => {
                  const isExpanded = expandedRows.has(index);
                  const categoryColor = tableData.diseaseCategories[row.category]?.color;
                  
                  return (
                    <React.Fragment key={index}>
                      <tr 
                        className={isExpanded ? 'expanded' : ''}
                        onClick={() => toggleRowExpansion(index)}
                      >
                        <td className="disease-cell">
                          <div className="disease-name">{row.disease}</div>
                        </td>
                        <td className="category-cell">
                          <span 
                            className="category-badge"
                            style={{ backgroundColor: categoryColor }}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td className="virome-cell">{row.viromeChanges}</td>
                        <td className="biomarker-cell">{row.biomarkers || 'N/A'}</td>
                        <td className="reference-cell">
                          {renderReferences(row.disease, row.references)}
                        </td>
                      </tr>
                      <tr className={`mobile-row ${isExpanded ? 'visible' : ''}`}>
                        <td colSpan="5">
                          <div className="mobile-content">
                            <div className="mobile-field">
                              <strong>Category:</strong>
                              <span 
                                className="category-badge"
                                style={{ backgroundColor: categoryColor }}
                              >
                                {row.category}
                              </span>
                            </div>
                            <div className="mobile-field">
                              <strong>Virome Changes:</strong> {row.viromeChanges}
                            </div>
                            <div className="mobile-field">
                              <strong>Biomarkers:</strong> {row.biomarkers || 'N/A'}
                            </div>
                            <div className="mobile-field">
                              <strong>References:</strong> 
                              {renderReferences(row.disease, row.references)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            
            <div className="table-info">
              <p>Showing {processedData.length} of {tableData.diseaseViromeAssociations.length} disease-virome associations</p>
            </div>
          </>
        )}
      </div>
      
      <div className="category-legend">
        <h3>Disease Categories</h3>
        <div className="category-list">
          {Object.entries(tableData.diseaseCategories).map(([category, info]) => (
            <div 
              key={category} 
              className="category-item"
              onClick={() => setFilterCategory(category === filterCategory ? 'all' : category)}
            >
              <span
                className="category-color"
                style={{ backgroundColor: info.color }}
              ></span>
              <span className="category-name">{category}</span>
              <span className="category-description">{info.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DiseaseViromeTable;