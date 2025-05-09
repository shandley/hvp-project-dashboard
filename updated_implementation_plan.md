# NIH Human Virome Program Dashboard - Updated Implementation Plan

## 1. Project Overview

The NIH Human Virome Program (HVP) Dashboard is a web-based visualization platform hosted on GitHub Pages that provides an interactive overview of the HVP's research projects, samples, and key metrics. The dashboard serves as a central resource for program managers, researchers, and stakeholders to monitor project progress, explore data relationships, and identify trends across the program's diverse cohorts.

## 2. Technical Architecture

### 2.1 Platform Selection

- **GitHub Pages**: The dashboard is hosted on GitHub Pages via the repository at https://github.com/shandley/hvp-project-dashboard
- **Frontend Framework**: React.js for component-based UI development
- **Visualization Libraries**:
  - D3.js for custom interactive visualizations
  - Chart.js for standard charts and graphs
  - Leaflet.js for geographic visualizations

### 2.2 Data Architecture

- **Data Storage**: Static CSV and supplementary files in the public/data directory
- **Data Processing**: Real-time transformation and aggregation of the raw data into visualization-ready formats
- **Update Mechanism**: GitHub Actions workflow to automatically rebuild and deploy when data is updated

## 3. Data Sources and Processing

### 3.1 Primary Data Sources

- **HVP_master.csv**: Core dataset containing project details, cohort information, and sample metrics
- **additional-hvp-data.md**: Supplementary information including program governance, scientific impact, and timeline data

### 3.2 Data Processing Principles

- **Real Data Only**: All visualizations must use only real, production data
- **No Mock Data**: No synthetic or mock data will be used under any circumstances
- **Graceful Failures**: Applications should provide clear error messages when data cannot be loaded
- **Data Integrity**: All transformations must preserve the integrity of the original data

### 3.3 Data Processing Implementation

- Data is loaded directly from CSV files in the public/data directory at runtime
- PapaParse is used to parse CSV data with appropriate error handling
- Data processing functions transform and aggregate data for visualization
- If data cannot be loaded, clear error messages are displayed to users

### 3.4 Data Update Process

- Updates to data files are committed directly to the repository
- When pushed to main branch, GitHub Actions workflow automatically rebuilds and redeploys
- Version control provides a history of all data changes

## 4. Dashboard Components and Features

### 4.1 Core Visualizations

1. **Program Overview Dashboard**
   - Key metrics and KPIs at the program level using real data
   - Summary statistics on participants, samples, and project status
   - Timeline of program milestones
   - Real-time filtering based on user selections

2. **Geographic Distribution Map**
   - Interactive map showing project locations using Leaflet.js
   - Regional filtering and drill-down capabilities
   - Color-coding by initiative type or research focus
   - Statistical breakdown by region

3. **Sample Distribution Visualizations**
   - Interactive charts showing distribution by body site category using Chart.js
   - Age group breakdowns across cohorts
   - Study type distribution
   - Connected filters for dynamic data exploration

4. **Project Timeline and Status Tracker**
   - Timeline visualization of project progress using D3.js
   - Status indicators for ongoing vs. completed projects
   - Sample collection progress vs. projections
   - Future projections based on real collection rates

5. **Relationships and Networks**
   - Sankey diagrams showing relationships between institutions, cohorts, and body sites
   - Force-directed network graphs using D3.js
   - Interactive node exploration

### 4.2 Interactive Features

- **Dynamic Filtering**: Allow users to filter data by multiple parameters (initiative type, geographic region, body site, age group, etc.)
- **Search Functionality**: Enable searching for specific projects, institutions, or investigators
- **Data Export**: Provide options to export visualization data in CSV format
- **Responsive Design**: Ensure dashboard functions well on various device sizes

### 4.3 User Interface Elements

- Navigation sidebar with visualization categories
- Filters panel for interactive data exploration
- Information tooltips providing context for metrics and visualizations
- Dashboard header with program branding and high-level metrics

## 5. Implementation Phases and Status

### 5.1 Phase 1: Foundation (COMPLETED)

- ✓ Set up GitHub repository structure
- ✓ Create basic page layout and navigation
- ✓ Implement core data loading and state management
- ✓ Implement basic data filtering

### 5.2 Phase 2: Core Visualizations (IN PROGRESS)

- ✓ Overview component with summary statistics and project table
- ◯ Implement Geographic Distribution visualization with Leaflet.js
- ◯ Implement Sample Distribution visualization with Chart.js
- ◯ Implement Project Timeline visualization with D3.js
- ◯ Implement Relationships visualization with D3.js

### 5.3 Phase 3: Advanced Features (PLANNED)

- ◯ Enhance interactivity with cross-filtering between visualizations
- ◯ Add data export options
- ◯ Optimize for mobile devices
- ◯ Add additional supplementary data displays

### 5.4 Phase 4: Polish and Launch (PLANNED)

- ◯ Comprehensive testing across browsers and devices
- ◯ Performance optimization
- ◯ Documentation development
- ◯ Final review and launch

## 6. Technical Requirements

### 6.1 Development Environment

- Node.js for local development
- npm for package management
- React.js for component-based UI
- GitHub Actions for CI/CD

### 6.2 Dependencies

- React.js (core framework)
- D3.js (data visualization)
- Chart.js (standard charts)
- Leaflet.js (maps)
- PapaParse (CSV parsing)
- Markdown-it (for rendering additional documentation)

### 6.3 Deployment

- GitHub Actions workflow for CI/CD pipeline
- Automated build and deployment to GitHub Pages
- Public data directory for CSV and supplementary files

## 7. Data Handling Guidelines

### 7.1 Best Practices

- **No Mock Data**: All visualizations must use only real data
- **Error Transparency**: Display clear error messages when data cannot be loaded
- **Data Quality**: Implement validation checks to ensure data integrity
- **User Feedback**: Provide loading indicators during data processing

### 7.2 Error Handling Strategy

1. **Clear Error Messages**: When data cannot be loaded, display specific, actionable error messages
2. **Fallback Content**: Provide useful information even when visualizations cannot be rendered
3. **Logging**: Log detailed error information to the console for debugging
4. **Graceful UI**: Ensure the application remains usable even when some data fails to load

### 7.3 Long-term Sustainability

- Comprehensive documentation for future maintainers
- Modular code structure to facilitate future enhancements
- Clear data processing patterns for consistency

## 8. Key Performance Indicators

### 8.1 Dashboard KPIs

The dashboard will visualize the following program KPIs:

- Total participants enrolled vs. target
- Samples collected vs. projected
- Geographic diversity index
- Age diversity coverage
- Body site coverage completeness
- Data sharing metrics

### 8.2 Dashboard Performance Metrics

The following metrics will be tracked for the dashboard itself:

- Page load time (<3 seconds target)
- Visualization render time (<1 second target)
- Filter response time (<0.5 seconds target)
- Cross-browser compatibility (support for Chrome, Firefox, Safari, Edge)
- Mobile usability score

## 9. Next Implementation Steps

1. Complete the Geographic Distribution visualization:
   - Implement Leaflet.js map with region markers
   - Color-code markers by initiative type
   - Add tooltips for project details on hover

2. Implement the Sample Distribution visualization:
   - Create interactive Chart.js graphs for body site distribution
   - Add age group distribution charts
   - Implement dynamic filtering

3. Create the Project Timeline visualization:
   - Develop D3.js timeline component
   - Add interactive elements for exploring project durations
   - Implement filtering by date ranges

4. Implement the Network Relationships visualization:
   - Create D3.js force-directed graph
   - Show connections between institutions, cohorts, and research foci
   - Add interactive node selection

5. Enhance error handling and user feedback:
   - Implement loading indicators
   - Add clear error states for visualization components
   - Provide helpful messages when data can't be displayed

## 10. Conclusion

This updated implementation plan outlines our approach to completing the NIH Human Virome Program Dashboard with a strict commitment to using only real data. By following this phased implementation strategy, we will create an informative, interactive tool that provides valuable insights into the program's activities and impacts while maintaining data integrity and transparency.