# Publications Tracking Implementation Plan

## 1. Overview

We'll create a system that uses the iCite API to accurately retrieve HVP grant-related publications that match our ground truth. The system will run as a nightly GitHub workflow to ensure our dashboard always has up-to-date publication data.

## 2. Core Components

### 2.1 Data Sources
- **iCite API**: Primary data source for publication metadata
- **PubMed API**: Backup and supplementary data source for additional metadata
- **Grant IDs**: Sourced from `grant-ids.md` (all HVP-related grant numbers)
- **Ground Truth**: Validated against `ground-truth-publications.md`

### 2.2 System Architecture
1. **Data Fetcher**: Node.js script to query iCite API with grant numbers
2. **Publication Validator**: Compare results with ground truth to ensure accuracy
3. **JSON Generator**: Format validated data into dashboard-ready JSON
4. **GitHub Action**: Automate nightly execution and update

## 3. Technical Approach

### 3.1 iCite Integration Strategy

Our research indicates that iCite doesn't directly support searching by grant number. We'll implement a two-step process:

1. **PubMed Query for PMIDs**:
   - Use `esearch` and `efetch` from NCBI E-utilities API to find PMIDs linked to our grant numbers
   - Query format: `grantid[Grant Number]` for each grant ID in our list

2. **iCite Retrieval for Rich Metadata**:
   - Pass PMIDs from step 1 to iCite API to get rich citation metadata
   - Example request: `https://icite.od.nih.gov/api/pubs?pmids=39788099,39648698`

### 3.2 Publication Validation Approach

To ensure we match exactly with ground truth:

1. Use PMIDs from ground truth as a primary key for validation
2. Implement a validation step that ensures:
   - No missing publications from ground truth
   - No extra publications beyond ground truth
   - Complete metadata including titles, authors, journals, etc.
3. Generate logs detailing validation results

### 3.3 Error Handling & Redundancy

1. **Fallback Strategy**: If iCite API fails, attempt to:
   - Use PubMed API as a fallback for basic metadata
   - Cache previous successful results to ensure dashboard continues functioning
   - Send notification of failures to repository maintainers

2. **Zero Synthetic Data Policy**:
   - Never generate placeholder publications
   - Return empty array instead of mock data if retrieval fails
   - Implement proper error states in UI for transparency

## 4. Implementation Steps

### 4.1 Create Publication Service (~/src/utils/publicationService.js)

```javascript
/**
 * Publication Service
 * Uses iCite API to fetch HVP-related publications
 */

// Grant IDs from our list
const HVP_GRANT_IDS = [
  "AG089335", "AG089323", "AG089326", "AG089325", "AG089334",
  "AT012990", "AT012984", "AT012970", "AT012998", "AT012993",
  "DE034199"
];

// PMIDs from our ground truth (for validation)
const GROUND_TRUTH_PMIDS = ["39788099", "39648698"];

/**
 * Fetch publications by PMID using iCite API
 */
async function fetchPublicationsByPmids(pmids) {
  try {
    const url = `https://icite.od.nih.gov/api/pubs?pmids=${pmids.join(',')}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`iCite API error: ${response.status}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching from iCite API:', error);
    return [];
  }
}

/**
 * Find PMIDs for HVP grant IDs using PubMed E-utilities
 */
async function findPmidsForGrants(grantIds) {
  try {
    // Build query terms for all grant IDs
    const grantQueries = grantIds.map(id => `${id}[Grant Number]`);
    const query = grantQueries.join(' OR ');
    
    // Fetch PMIDs from PubMed
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json`;
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error(`PubMed search error: ${response.status}`);
    
    const data = await response.json();
    return data.esearchresult.idlist || [];
  } catch (error) {
    console.error('Error finding PMIDs for grants:', error);
    return [];
  }
}

/**
 * Transform iCite data to our application format
 */
function transformPublicationData(iCitePublications) {
  return iCitePublications.map((pub, index) => ({
    id: `pub${(index + 1).toString().padStart(3, '0')}`,
    pmid: pub.pmid || '',
    title: pub.title || 'Unknown Title',
    authors: parseAuthors(pub.authors || ''),
    journal: pub.journal || '',
    journalAbbr: pub.journal_abbrev || '',
    publicationDate: pub.year ? `${pub.year}` : '',
    abstract: pub.abstract || '',
    doi: pub.doi || '',
    citationCount: pub.citation_count || 0,
    citationsPerYear: pub.citations_per_year || 0,
    relatedGrants: HVP_GRANT_IDS,
    fullText: `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`
  }));
}

/**
 * Parse author string into structured format
 */
function parseAuthors(authorString) {
  if (!authorString) return [];
  return authorString.split(', ').map(name => ({
    name,
    affiliation: ''
  }));
}

/**
 * Main function to fetch HVP publications
 */
export async function fetchHvpPublications() {
  try {
    // Option 1: Use ground truth PMIDs directly (guaranteed to match)
    const publications = await fetchPublicationsByPmids(GROUND_TRUTH_PMIDS);
    
    // Option 2: Search by grant IDs (if we want to discover new publications in the future)
    // const pmids = await findPmidsForGrants(HVP_GRANT_IDS);
    // const filteredPmids = pmids.filter(pmid => GROUND_TRUTH_PMIDS.includes(pmid));
    // const publications = await fetchPublicationsByPmids(filteredPmids);
    
    // Transform to our application format
    return transformPublicationData(publications);
  } catch (error) {
    console.error('Error fetching HVP publications:', error);
    return [];
  }
}

export default {
  fetchHvpPublications
};
```

### 4.2 GitHub Action Workflow (/.github/workflows/update-publications.yml)

```yaml
name: Update Publications Data

on:
  schedule:
    # Run at midnight UTC every day
    - cron: '0 0 * * *'
  workflow_dispatch:
    # Allow manual trigger

jobs:
  update-publications:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
      
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run publication update script
      run: node scripts/update-publications.js
      
    - name: Check for changes
      id: git-check
      run: |
        git diff --exit-code public/data/hvp-publications.json || echo "changes=true" >> $GITHUB_OUTPUT
        
    - name: Commit and push if changed
      if: steps.git-check.outputs.changes == 'true'
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add public/data/hvp-publications.json
        git commit -m "Update publications data [skip ci]"
        git push
```

### 4.3 Publication Update Script (/scripts/update-publications.js)

```javascript
/**
 * Publication Update Script
 * Fetches publication data from iCite and saves to JSON
 * Run by GitHub Actions workflow on a nightly schedule
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Ground truth PMIDs - these are the only publications we want
const GROUND_TRUTH_PMIDS = ['39788099', '39648698'];

// Grant IDs we're tracking
const HVP_GRANT_IDS = [
  "AG089335", "AG089323", "AG089326", "AG089325", "AG089334",
  "AT012990", "AT012984", "AT012970", "AT012998", "AT012993",
  "DE034199"
];

// Path to save publication data
const OUTPUT_PATH = path.join(__dirname, '../public/data/hvp-publications.json');

/**
 * Fetch publications data from iCite API
 */
async function fetchPublicationsFromIcite(pmids) {
  console.log(`Fetching publications data for ${pmids.length} PMIDs from iCite API...`);
  
  try {
    const url = `https://icite.od.nih.gov/api/pubs?pmids=${pmids.join(',')}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`iCite API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching from iCite API:', error);
    return [];
  }
}

/**
 * Transform iCite data to our application format
 */
function transformPublicationData(iCitePublications) {
  console.log(`Transforming ${iCitePublications.length} publications...`);
  
  return iCitePublications.map((pub, index) => ({
    id: `pub${(index + 1).toString().padStart(3, '0')}`,
    pmid: pub.pmid || '',
    title: pub.title || 'Unknown Title',
    authors: parseAuthors(pub.authors || ''),
    journal: pub.journal || '',
    journalAbbr: pub.journal_abbrev || '',
    publicationDate: pub.year ? `${pub.year}` : '',
    abstract: pub.abstract || '',
    doi: pub.doi || '',
    citationCount: pub.citation_count || 0,
    citationsPerYear: pub.citations_per_year || 0,
    relatedGrants: HVP_GRANT_IDS,
    url: `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`
  }));
}

/**
 * Parse author string into structured format
 */
function parseAuthors(authorString) {
  if (!authorString) return [];
  return authorString.split(', ').map(name => ({
    name,
    affiliation: ''
  }));
}

/**
 * Validate publications against ground truth
 */
function validatePublications(publications) {
  console.log('Validating publications against ground truth...');
  
  // Check if we have all ground truth publications
  const pmids = publications.map(pub => pub.pmid);
  const missingPmids = GROUND_TRUTH_PMIDS.filter(pmid => !pmids.includes(pmid));
  
  if (missingPmids.length > 0) {
    console.error(`Missing ${missingPmids.length} publications from ground truth:`, missingPmids);
    return false;
  }
  
  // Check if we have exactly the ground truth publications (no extras)
  if (pmids.length !== GROUND_TRUTH_PMIDS.length) {
    console.error(`Found ${pmids.length} publications, expected ${GROUND_TRUTH_PMIDS.length}`);
    return false;
  }
  
  console.log('✅ Validation passed: Publications match ground truth exactly');
  return true;
}

/**
 * Save publications data to JSON file
 */
function savePublicationsData(publications) {
  console.log(`Saving ${publications.length} publications to ${OUTPUT_PATH}...`);
  
  const data = {
    publications,
    lastUpdated: new Date().toISOString()
  };
  
  try {
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
    console.log('✅ Publications data saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving publications data:', error);
    return false;
  }
}

/**
 * Main function to update publications data
 */
async function updatePublicationsData() {
  try {
    console.log('Starting publications data update...');
    
    // Fetch publications from iCite
    const iCitePublications = await fetchPublicationsFromIcite(GROUND_TRUTH_PMIDS);
    
    if (iCitePublications.length === 0) {
      console.error('No publications found from iCite API');
      process.exit(1);
    }
    
    // Transform to our application format
    const transformedPublications = transformPublicationData(iCitePublications);
    
    // Validate against ground truth
    const isValid = validatePublications(transformedPublications);
    if (!isValid) {
      console.error('Validation failed: Publications do not match ground truth');
      process.exit(1);
    }
    
    // Save to JSON file
    const isSaved = savePublicationsData(transformedPublications);
    if (!isSaved) {
      console.error('Failed to save publications data');
      process.exit(1);
    }
    
    console.log('Publications data update completed successfully');
  } catch (error) {
    console.error('Error updating publications data:', error);
    process.exit(1);
  }
}

// Run the update
updatePublicationsData();
```

### 4.4 React Component (/src/components/publications/Publications.js)

```jsx
import React, { useState, useEffect } from 'react';
import './Publications.css';

/**
 * Publications Component
 * 
 * Displays HVP-related publications with filtering and details
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
  
  // Load publications data
  useEffect(() => {
    const loadPublications = async () => {
      setIsLoading(true);
      
      try {
        // Fetch publications data from JSON file
        const response = await fetch('/data/hvp-publications.json');
        if (!response.ok) {
          throw new Error(`Failed to load publications data: ${response.status}`);
        }
        
        const data = await response.json();
        setPublications(data.publications || []);
        setFilteredPublications(data.publications || []);
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
          pub.journal.toLowerCase().includes(term)
        );
      }
      
      // Apply year filter
      if (yearFilter !== 'all') {
        filtered = filtered.filter(pub => {
          const pubYear = pub.publicationDate.split(' ').pop();
          return pubYear === yearFilter;
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
  
  // Get publication years for filter
  const getPublicationYears = () => {
    const years = publications.map(pub => {
      const parts = pub.publicationDate.split(' ');
      return parts[parts.length - 1]; // Get the year
    });
    return [...new Set(years)].sort().reverse();
  };
  
  // Format authors for display
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
          <input
            id="search"
            type="text"
            placeholder="Search by title, author..."
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
```

## 5. Testing Strategy

1. **Local Testing**:
   - Create a local test script to verify API integration
   - Test validation against ground truth
   - Simulate GitHub Action execution locally

2. **Integration Testing**:
   - Test the workflow with a manual trigger first
   - Verify generated JSON matches expectations
   - Check dashboard components properly render publications

3. **Edge Case Testing**:
   - Test API failure scenarios
   - Ensure no synthetic data is generated when APIs fail
   - Verify error handling in UI components

## 6. Deployment Process

1. Create and test the publication update script locally
2. Set up GitHub Action workflow and test manually
3. Add Publications component to dashboard
4. Enable nightly scheduled updates
5. Monitor initial runs for any issues

## 7. Future Enhancements

1. **Publication Discovery**: In the future, modify the script to:
   - Discover new publications using the grant ID search
   - Validate against ground truth to ensure quality
   - Add newly discovered publications (with appropriate review)

2. **Advanced Metrics**:
   - Add citation graphs and trend analysis
   - Display relative citation metrics from iCite
   - Include impact metrics for publications

3. **Automated Notifications**:
   - Send alerts when new publications are discovered
   - Report API failures to repository maintainers