# HVP Publications Tracking Implementation Plan

## Overview
This document outlines the plan for implementing a publication tracking feature into the HVP Project Dashboard. The system will track and display publications related to the Human Virome Project (HVP) grants using the NIH RePORTER API as the primary data source, with potential future integration of PubMed iCite for citation metrics.

## Phase 1: NIH RePORTER Integration

### Data Architecture
1. **Data Structure**
   - Create a publication JSON structure to store:
     - Publication metadata (title, authors, journal, publication date)
     - Grant associations (project number, principal investigator)
     - Link to publication
     - Publication type (research article, review, etc.)
     - Keywords/tags for categorization

2. **Data Storage**
   - Primary: Local JSON file (`/public/data/hvp-publications.json`)
   - Cached API responses for improved performance

### UI Components
1. **Publications Page**
   - Main component (`Publications.js`) added to the Dashboard
   - Navigation integration in Sidebar component
   - Filter panel integration with publication-specific filters

2. **Publication List Component**
   - Sortable/filterable table of publications
   - Search functionality
   - Pagination support
   - Export capabilities

3. **Publication Details Component**
   - Detailed view of a single publication
   - Abstract display
   - Author information
   - Grant connection details
   - Link to full text

4. **Publication Metrics Dashboard**
   - Summary statistics (publications by year, by grant, by institution)
   - Visualizations of publication trends

### API Integration
1. **NIH RePORTER Query Service**
   - Endpoints:
     - `/v2/projects/search` - Find HVP-related grants
     - `/v1/publications/search` - Find publications linked to those grants
   - Implementation details:
     - Create a service layer (`publicationService.js`) for API interactions
     - Build query constructors for the specific HVP grant IDs
     - Implement rate limiting (max 1 request per second)
     - Add error handling and fallback to local data

2. **Data Processing Pipeline**
   - Fetch publications from RePORTER API
   - Transform data to internal format
   - Merge with existing publications data
   - Update local JSON data

### Implementation Steps
1. Create base folder structure and files:
   - `/src/components/publications/`
     - `Publications.js` & `Publications.css` (main container)
     - `PublicationList.js` & `PublicationList.css`
     - `PublicationDetails.js` & `PublicationDetails.css`
     - `PublicationMetrics.js` & `PublicationMetrics.css`
   - `/src/utils/publicationService.js`
   - `/public/data/hvp-publications.json` (initial seed data)

2. Update Dashboard and Sidebar for new navigation option

3. Implement basic publication list view with local data

4. Add NIH RePORTER API integration

5. Implement publication filters and search

6. Add detailed publication view

7. Develop publication metrics visualizations

## Phase 2: iCite Integration (Future Enhancement)

1. **Citation Metrics Enhancement**
   - Augment publications data with citation metrics from iCite
   - Add Relative Citation Ratio (RCR) and other impact metrics

2. **Citation Network Visualization**
   - Show relationship between publications
   - Visualize citation patterns and research influence

3. **Impact Assessment Dashboard**
   - Track publication impact metrics over time
   - Compare HVP publication impact to field benchmarks

## Technical Considerations

### API Rate Limits
- NIH RePORTER: Maximum 1 request per second
- Implementation strategy:
  - Throttle requests appropriately
  - Cache results to minimize API calls
  - Batch updates during off-peak hours

### Error Handling
- Network errors: Fallback to cached/local data
- Incomplete data: Show partial results with notification
- API changes: Version checking and graceful degradation

### Performance Optimization
- Lazy loading of publication details
- Pagination for large result sets
- Data caching strategy for repeated queries

## Mockup References
- Publication list view similar to existing Dashboard tables
- Publication metrics visualizations following project dashboard style
- Integration with existing light/dark theme support

## Testing Plan
1. Unit tests for API service functions
2. Integration tests for data processing pipeline
3. Component tests for UI elements
4. End-to-end tests for full publication search and display workflow