/**
 * Data loading utility for the HVP dashboard
 * 
 * This module handles loading and processing the CSV and supplementary data
 * for use in the dashboard visualizations.
 */
import Papa from 'papaparse';

/**
 * Load all dashboard data from static files
 * @returns {Promise<Object>} The processed dashboard data
 */
export const loadData = async () => {
  try {
    // Load the CSV file
    const response = await fetch(`${process.env.PUBLIC_URL}/data/HVP_master.csv`);
    if (!response.ok) {
      throw new Error(`Failed to load CSV data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const { data: projects } = Papa.parse(csvText, { header: true });
    
    // Process the data
    return processProjectData(projects);
  } catch (error) {
    console.error('Error loading data:', error);
    // Fallback to mock data if an error occurs
    return getMockData();
  }
};

/**
 * Process raw project data to prepare for visualization
 * @param {Array} projects The raw project data from CSV
 * @returns {Object} Processed data with calculated metrics
 */
export const processProjectData = (projects) => {
  // Filter out any empty rows
  const validProjects = projects.filter(project => project['Project ID']);
  
  // Calculate metrics for visualizations
  const metrics = calculateMetrics(validProjects);
  
  return {
    projects: validProjects,
    metrics
  };
};

/**
 * Calculate aggregated metrics from project data
 * @param {Array} projects The project data
 * @returns {Object} Calculated metrics
 */
const calculateMetrics = (projects) => {
  // Body site distribution
  const bodySiteData = {};
  const ageGroupData = {};
  const regionData = {};
  const statusData = {};
  const studyTypeData = {};
  
  projects.forEach(project => {
    // Process body site categories (can be multiple per project)
    const bodySites = project['Body Site Category'].split('/');
    bodySites.forEach(site => {
      const trimmedSite = site.trim();
      if (!bodySiteData[trimmedSite]) {
        bodySiteData[trimmedSite] = { count: 0, samples: 0, cohorts: 0 };
      }
      bodySiteData[trimmedSite].count += 1;
      bodySiteData[trimmedSite].cohorts += 1;
      
      const samples = parseInt(project['Samples']) || 0;
      if (!isNaN(samples)) {
        bodySiteData[trimmedSite].samples += samples;
      }
    });
    
    // Process age group categories
    const ageGroups = project['Age Group Category'].split('/');
    ageGroups.forEach(age => {
      const trimmedAge = age.trim();
      if (!ageGroupData[trimmedAge]) {
        ageGroupData[trimmedAge] = { count: 0, samples: 0, cohorts: 0 };
      }
      ageGroupData[trimmedAge].count += 1;
      ageGroupData[trimmedAge].cohorts += 1;
      
      const samples = parseInt(project['Samples']) || 0;
      if (!isNaN(samples)) {
        ageGroupData[trimmedAge].samples += samples;
      }
    });
    
    // Process geographic regions
    const region = project['Geographic Region'];
    if (!regionData[region]) {
      regionData[region] = { count: 0, samples: 0 };
    }
    regionData[region].count += 1;
    
    const samples = parseInt(project['Samples']) || 0;
    if (!isNaN(samples)) {
      regionData[region].samples += samples;
    }
    
    // Process status
    const status = project['Status'];
    if (!statusData[status]) {
      statusData[status] = { count: 0, projects: [] };
    }
    statusData[status].count += 1;
    statusData[status].projects.push(project['Project ID']);
    
    // Process study type
    const studyType = project['Study Type'];
    if (!studyTypeData[studyType]) {
      studyTypeData[studyType] = { count: 0, samples: 0 };
    }
    studyTypeData[studyType].count += 1;
    studyTypeData[studyType].samples += (parseInt(project['Samples']) || 0);
  });
  
  // Calculate total samples and percentages
  const totalSamples = projects.reduce((sum, project) => {
    return sum + (parseInt(project['Samples']) || 0);
  }, 0);
  
  // Add percentages to metrics
  Object.values(bodySiteData).forEach(site => {
    site.percentage = ((site.samples / totalSamples) * 100).toFixed(1);
  });
  
  Object.values(ageGroupData).forEach(age => {
    age.percentage = ((age.cohorts / projects.length) * 100).toFixed(1);
  });
  
  // Sample collection timeline (using static data from the implementation plan)
  const timeline = [
    { year: 2024, projectedSamples: 5000, cumulativeTotal: 5000, percentComplete: 7.0 },
    { year: 2025, projectedSamples: 20000, cumulativeTotal: 25000, percentComplete: 35.2 },
    { year: 2026, projectedSamples: 25000, cumulativeTotal: 50000, percentComplete: 70.4 },
    { year: 2027, projectedSamples: 15000, cumulativeTotal: 65000, percentComplete: 91.5 },
    { year: 2028, projectedSamples: 6000, cumulativeTotal: 71000, percentComplete: 100.0 }
  ];
  
  return {
    bodySite: bodySiteData,
    ageGroup: ageGroupData,
    region: regionData,
    status: statusData,
    studyType: studyTypeData,
    timeline
  };
};

/**
 * Generate mock data for development and fallback purposes
 * @returns {Object} Mock dashboard data
 */
const getMockData = () => {
  return {
    // Sample projects data based on the CSV structure - this is only used if CSV loading fails
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
      }
    ],
    
    // Basic metrics (would be calculated properly from real data)
    metrics: {
      bodySite: {
        'Brain': { count: 1, samples: 99, percentage: 3.1, cohorts: 1 },
        'Gut/Blood': { count: 1, samples: 3068, percentage: 96.9, cohorts: 1 }
      },
      ageGroup: {
        'Adults': { count: 1, percentage: 50.0, cohorts: 1 },
        'Infants/Children': { count: 1, percentage: 50.0, cohorts: 1 }
      },
      status: {
        'Ongoing': { count: 1, projects: ['UCLA-OGB-1'] },
        'Complete': { count: 1, projects: ['PENN-ORG-1'] }
      },
      region: {
        'West': { count: 1, samples: 99 },
        'Northeast': { count: 1, samples: 3068 }
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