/**
 * Data Processing Script for HVP Dashboard
 * 
 * This script processes the raw CSV and supplementary data files
 * and generates the processed JSON data needed for the dashboard visualizations.
 */

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Paths to data files
const CSV_FILE = path.join(__dirname, '../HVP_master.csv');
const SUPPLEMENTARY_FILE = path.join(__dirname, '../additional-hvp-data.md');
const OUTPUT_FILE = path.join(__dirname, '../public/data/dashboard-data.json');

/**
 * Main function to process the data
 */
async function processData() {
  try {
    // Read and parse the CSV file
    const csvData = fs.readFileSync(CSV_FILE, 'utf8');
    const { data: projects } = Papa.parse(csvData, { header: true });
    
    // Process the projects data
    const processedData = {
      projects,
      metrics: calculateMetrics(projects)
    };
    
    // Add supplementary data if available
    try {
      const supplementaryData = fs.readFileSync(SUPPLEMENTARY_FILE, 'utf8');
      processedData.supplementary = parseSupplementaryData(supplementaryData);
    } catch (err) {
      console.warn('Supplementary data file not found or could not be parsed');
    }
    
    // Write the processed data to JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedData, null, 2));
    console.log(`Data processed successfully and saved to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('Error processing data:', err);
    process.exit(1);
  }
}

/**
 * Calculate aggregated metrics from project data
 * @param {Array} projects The project data
 * @returns {Object} Calculated metrics
 */
function calculateMetrics(projects) {
  // Body site distribution
  const bodySite = countBySplitField(projects, 'Body Site Category');
  
  // Age group distribution
  const ageGroup = countBySplitField(projects, 'Age Group Category');
  
  // Study type distribution
  const studyType = countByField(projects, 'Study Type');
  
  // Status distribution
  const status = countByField(projects, 'Status');
  
  // Geographic distribution
  const region = countByField(projects, 'Geographic Region');
  
  // Initiative type distribution
  const initiativeType = countByField(projects, 'Initiative Type');
  
  // Sample collection timeline (mock data - would be derived from real data in production)
  const timeline = [
    { year: 2024, projectedSamples: 5000, cumulativeTotal: 5000, percentComplete: 7.0 },
    { year: 2025, projectedSamples: 20000, cumulativeTotal: 25000, percentComplete: 35.2 },
    { year: 2026, projectedSamples: 25000, cumulativeTotal: 50000, percentComplete: 70.4 },
    { year: 2027, projectedSamples: 15000, cumulativeTotal: 65000, percentComplete: 91.5 },
    { year: 2028, projectedSamples: 6000, cumulativeTotal: 71000, percentComplete: 100.0 }
  ];
  
  return {
    bodySite,
    ageGroup,
    studyType,
    status,
    region,
    initiativeType,
    timeline
  };
}

/**
 * Count projects by a field that may contain multiple values separated by '/'
 * @param {Array} projects The projects data
 * @param {string} field The field to count by
 * @returns {Object} Counts by category
 */
function countBySplitField(projects, field) {
  const counts = {};
  
  projects.forEach(project => {
    const values = project[field].split('/');
    values.forEach(value => {
      if (!counts[value]) {
        counts[value] = {
          count: 0,
          projects: []
        };
      }
      counts[value].count += 1;
      counts[value].projects.push(project['Project ID']);
    });
  });
  
  return counts;
}

/**
 * Count projects by a simple field
 * @param {Array} projects The projects data
 * @param {string} field The field to count by
 * @returns {Object} Counts by category
 */
function countByField(projects, field) {
  const counts = {};
  
  projects.forEach(project => {
    const value = project[field];
    if (!counts[value]) {
      counts[value] = {
        count: 0,
        projects: []
      };
    }
    counts[value].count += 1;
    counts[value].projects.push(project['Project ID']);
  });
  
  return counts;
}

/**
 * Parse supplementary data from markdown
 * @param {string} markdownText The markdown text
 * @returns {Object} Parsed supplementary data
 */
function parseSupplementaryData(markdownText) {
  // In a full implementation, this would parse the markdown into structured data
  // For now, we'll return a simplified placeholder
  return {
    governance: {
      steeringCommittee: {
        description: 'Main governing body for all HVP initiatives',
        meetings: 'Monthly videoconferences, Annual in-person meetings'
      },
      executiveCommittee: {
        description: 'Manages the Steering Committee',
        formation: 'Formed at first Steering Committee meeting'
      },
      codcc: {
        description: 'Coordination hub for administrative activities and data management',
        established: '2023-2024'
      }
    },
    timeline: [
      { date: 'January-February 2025', milestone: 'Major Center Grants Awarded', type: 'Implementation' },
      { date: 'Q1 2025', milestone: 'HVP Kickoff Meeting (3 months after awards)', type: 'Implementation' },
      { date: 'Q2-Q3 2025', milestone: '6-Month Setup Phase (protocol standardization)', type: 'Implementation' },
      { date: '2025-2026', milestone: 'Infrastructure Development', type: 'Research' },
      { date: '2026-2027', milestone: 'Major Data Generation Phase', type: 'Research' },
      { date: '2027-2028', milestone: 'Data Analysis and Synthesis', type: 'Research' },
      { date: '2028', milestone: 'Program Completion (Phase 1)', type: 'Completion' }
    ]
  };
}

// Run the data processing
processData();