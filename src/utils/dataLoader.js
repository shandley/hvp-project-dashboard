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
    // No fallback to mock data - we only use real data
    throw new Error(`Could not load HVP data: ${error.message}. Please check that data files are correctly placed in the public/data directory.`);
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

// Mock data generation function has been removed to ensure only real data is used