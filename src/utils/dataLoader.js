/**
 * Data loading utility for the HVP dashboard
 * 
 * This module handles loading and processing the CSV and supplementary data
 * for use in the dashboard visualizations.
 */

// In a production app, we would use PapaParse to load the CSV data
// For now, we'll use a simplified approach with mock data loading

/**
 * Load all dashboard data from static files
 * @returns {Promise<Object>} The processed dashboard data
 */
export const loadData = async () => {
  try {
    // In a real implementation, we would load the CSV data using Papa Parse
    // const response = await fetch('/data/HVP_master.csv');
    // const csvText = await response.text();
    // const { data } = Papa.parse(csvText, { header: true });
    
    // For now, we'll fetch the processed JSON data (which would be created by a data processing script)
    const response = await fetch(`${process.env.PUBLIC_URL}/data/dashboard-data.json`);
    
    if (!response.ok) {
      // If the processed data isn't available yet, we'll use mock data for initial development
      console.warn('Using mock data for development');
      return getMockData();
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    // Fallback to mock data if an error occurs
    return getMockData();
  }
};

/**
 * Generate mock data for development purposes
 * @returns {Object} Mock dashboard data
 */
const getMockData = () => {
  return {
    // Sample projects data based on the CSV structure
    projects: [
      {
        'Project ID': 'UCLA-OGB-1',
        'Initiative Type': 'VCC',
        'Grant Number': 'AG089335-01',
        'Contact PI': 'Yvonne Kapila',
        'Institution': 'UCLA',
        'Cohort Name': 'UCLA Autopsy Bank',
        'Participants': '33',
        'Samples': '99',
        'Age Group Category': 'Adults',
        'Body Site Category': 'Brain',
        'Study Type': 'Cross-sectional; case-control',
        'Storage': '-80C',
        'Status': 'Ongoing',
        'Primary Research Focus': 'Oral-Gut-Brain virome',
        'Geographic Region': 'West'
      },
      {
        'Project ID': 'UCLA-OGB-2',
        'Initiative Type': 'VCC',
        'Grant Number': 'AG089335-01',
        'Contact PI': 'Yvonne Kapila',
        'Institution': 'UCLA',
        'Cohort Name': 'NIH Brain Endowment Bank',
        'Participants': '16',
        'Samples': '32',
        'Age Group Category': 'Adults',
        'Body Site Category': 'Brain',
        'Study Type': 'Cross-sectional',
        'Storage': '-80C',
        'Status': 'Complete',
        'Primary Research Focus': 'Oral-Gut-Brain virome',
        'Geographic Region': 'National'
      },
      {
        'Project ID': 'PENN-ORG-1',
        'Initiative Type': 'VCC',
        'Grant Number': 'AG089323-01',
        'Contact PI': 'Ron Collman',
        'Institution': 'UPenn',
        'Cohort Name': 'IGRAMS Repository',
        'Participants': '236',
        'Samples': '3068',
        'Age Group Category': 'Infants/Children',
        'Body Site Category': 'Gut/Blood',
        'Study Type': 'Longitudinal',
        'Storage': '-80C',
        'Status': 'Complete',
        'Primary Research Focus': 'Oro-Respiratory-Gut virome',
        'Geographic Region': 'Northeast'
      },
      {
        'Project ID': 'STAN-VAST-4',
        'Initiative Type': 'VCC',
        'Grant Number': 'AG089334-01',
        'Contact PI': 'Michael Snyder',
        'Institution': 'Stanford',
        'Cohort Name': 'Antarctica',
        'Participants': '4',
        'Samples': '442',
        'Age Group Category': 'Adults',
        'Body Site Category': 'Multiple',
        'Study Type': 'Longitudinal/case-control',
        'Storage': '-80C',
        'Status': 'Complete',
        'Primary Research Focus': 'Viromes across environments',
        'Geographic Region': 'International'
      },
      {
        'Project ID': 'UTAH-AB-1',
        'Initiative Type': 'Functional Studies',
        'Grant Number': 'AT012990-01',
        'Contact PI': 'Zac Stephens',
        'Institution': 'University of Utah',
        'Cohort Name': 'EoE Diet and Microbiome',
        'Participants': 'Unknown',
        'Samples': '125',
        'Age Group Category': 'Multiple',
        'Body Site Category': 'Blood/Gut',
        'Study Type': 'Longitudinal/cross-sectional',
        'Storage': '-80C',
        'Status': 'Ongoing',
        'Primary Research Focus': 'Antibody targeting of virome',
        'Geographic Region': 'West'
      }
    ],
    
    // Sample aggregated metrics (would be calculated from the full dataset)
    metrics: {
      bodySite: {
        'Multiple Sites': { count: 36388, percentage: 51.3, cohorts: 28 },
        'Blood/Serum/Plasma': { count: 12768, percentage: 18.0, cohorts: 22 },
        'Gut/Stool': { count: 10346, percentage: 14.6, cohorts: 8 },
        'Oral/Dental': { count: 7356, percentage: 10.4, cohorts: 8 },
        'Respiratory': { count: 3580, percentage: 5.0, cohorts: 4 },
        'Brain': { count: 131, percentage: 0.2, cohorts: 2 },
        'Skin': { count: 2520, percentage: 3.6, cohorts: 2 },
        'Other': { count: 3000, percentage: 4.2, cohorts: 2 }
      },
      ageGroup: {
        'Adults Only': { count: 343756, percentage: 88.9, cohorts: 27 },
        'Children Only': { count: 28152, percentage: 7.3, cohorts: 4 },
        'Infants Only': { count: 236, percentage: 0.1, cohorts: 1 },
        'Multiple Age Groups': { count: 14661, percentage: 3.8, cohorts: 21 }
      },
      studyType: {
        'Longitudinal': { count: 31, percentage: 47.7, samples: 34755 },
        'Cross-sectional': { count: 14, percentage: 21.5, samples: 13756 },
        'Longitudinal & Cross-sectional': { count: 14, percentage: 21.5, samples: 18832 },
        'Case-control': { count: 10, percentage: 15.4, samples: 14769 },
        'Interventional': { count: 7, percentage: 10.8, samples: 4076 }
      },
      status: {
        'Ongoing': { count: 39, percentage: 60.0 },
        'Complete': { count: 26, percentage: 40.0 }
      },
      region: {
        'West': { count: 25, percentage: 38.5, samples: 28575 },
        'Northeast': { count: 16, percentage: 24.6, samples: 13196 },
        'National': { count: 6, percentage: 9.2, samples: 'Large archives' },
        'South': { count: 3, percentage: 4.6, samples: 3450 },
        'Midwest': { count: 7, percentage: 10.8, samples: 7636 },
        'International': { count: 3, percentage: 4.6, samples: 474 },
        'Space': { count: 1, percentage: 1.5, samples: 0 }
      },
      timeline: [
        { year: 2024, projectedSamples: 5000, cumulativeTotal: 5000, percentComplete: 7.0 },
        { year: 2025, projectedSamples: 20000, cumulativeTotal: 25000, percentComplete: 35.2 },
        { year: 2026, projectedSamples: 25000, cumulativeTotal: 50000, percentComplete: 70.4 },
        { year: 2027, projectedSamples: 15000, cumulativeTotal: 65000, percentComplete: 91.5 },
        { year: 2028, projectedSamples: 6000, cumulativeTotal: 71000, percentComplete: 100.0 }
      ]
    }
  };
};

/**
 * Process raw project data to prepare for visualization
 * @param {Array} projects The raw project data from CSV
 * @returns {Object} Processed data with calculated metrics
 */
export const processProjectData = (projects) => {
  // This would process the raw CSV data to calculate metrics and prepare for visualization
  // In a real implementation, this would be more complex
  return {
    projects,
    metrics: calculateMetrics(projects)
  };
};

/**
 * Calculate aggregated metrics from project data
 * @param {Array} projects The project data
 * @returns {Object} Calculated metrics
 */
const calculateMetrics = (projects) => {
  // This would calculate the metrics shown in the implementation plan
  // For now, we'll return empty placeholders
  return {
    bodySite: {},
    ageGroup: {},
    studyType: {},
    status: {},
    region: {},
    timeline: []
  };
};