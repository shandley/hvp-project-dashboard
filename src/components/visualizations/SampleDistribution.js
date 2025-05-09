import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './Visualization.css';
import ExportDataButton from '../ExportDataButton';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

// Function to get CSS variables for chart colors
const getChartColors = () => {
  const getCSSVariable = (variableName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  };
  
  // Get chart colors from CSS variables
  return [
    getCSSVariable('--chart-color-1'),
    getCSSVariable('--chart-color-2'),
    getCSSVariable('--chart-color-3'),
    getCSSVariable('--chart-color-4'),
    getCSSVariable('--chart-color-5'),
    getCSSVariable('--chart-color-6'),
    getCSSVariable('--chart-color-7'),
    getCSSVariable('--chart-color-8'),
    getCSSVariable('--primary-color'),
    getCSSVariable('--primary-light'),
    getCSSVariable('--primary-dark'),
    getCSSVariable('--secondary-color'),
    getCSSVariable('--accent-color'),
    getCSSVariable('--info-color'),
    getCSSVariable('--success-color'),
    getCSSVariable('--warning-color')
  ];
};

function SampleDistribution({ data, filters }) {
  // State for chart display options
  const [chartType, setChartType] = useState('pie');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showLegend, setShowLegend] = useState(true);
  const [hasData, setHasData] = useState(true);
  
  // Refs for visualization containers
  const bodySiteChartRef = useRef(null);
  const ageGroupChartRef = useRef(null);
  
  // Check if data is available
  useEffect(() => {
    if (!data || !data.projects) {
      setHasData(false);
    } else {
      setHasData(true);
    }
  }, [data]);
  
  // Process data with useMemo to avoid recalculations
  const processedData = useMemo(() => {
    if (!hasData) {
      return {
        filteredProjects: [],
        bodySiteGroups: {},
        ageGroups: {},
        samplesByBodySite: {},
        samplesByAgeGroup: {},
        sortedBodySites: [],
        sortedAgeGroups: [],
        totalSamples: 0
      };
    }
    // Apply filters to projects
    const filteredProjects = data.projects.filter(project => {
      // Split categories that may contain multiple values separated by '/'
      const bodySites = project['Body Site Category'] ? project['Body Site Category'].split('/').map(site => site.trim()) : [];
      const ageGroups = project['Age Group Category'] ? project['Age Group Category'].split('/').map(age => age.trim()) : [];
      
      return (
        (!filters.initiativeType || project['Initiative Type'] === filters.initiativeType) &&
        (!filters.geographicRegion || project['Geographic Region'] === filters.geographicRegion) &&
        (!filters.bodySiteCategory || bodySites.includes(filters.bodySiteCategory)) &&
        (!filters.ageGroupCategory || ageGroups.includes(filters.ageGroupCategory)) &&
        (!filters.status || project['Status'] === filters.status)
      );
    });
    
    // Group projects by body site category
    const bodySiteGroups = {};
    filteredProjects.forEach(project => {
      if (!project['Body Site Category']) return;
      
      const bodySites = project['Body Site Category'].split('/');
      bodySites.forEach(site => {
        const trimmedSite = site.trim();
        if (!trimmedSite) return; // Skip empty site names
        
        if (!bodySiteGroups[trimmedSite]) {
          bodySiteGroups[trimmedSite] = [];
        }
        bodySiteGroups[trimmedSite].push(project);
      });
    });
    
    // Group projects by age group category
    const ageGroups = {};
    filteredProjects.forEach(project => {
      if (!project['Age Group Category']) return;
      
      const ageCategories = project['Age Group Category'].split('/');
      ageCategories.forEach(age => {
        const trimmedAge = age.trim();
        if (!trimmedAge) return; // Skip empty age categories
        
        if (!ageGroups[trimmedAge]) {
          ageGroups[trimmedAge] = [];
        }
        ageGroups[trimmedAge].push(project);
      });
    });
    
    // Calculate sample counts by body site
    const samplesByBodySite = {};
    Object.entries(bodySiteGroups).forEach(([site, projects]) => {
      samplesByBodySite[site] = projects.reduce((total, project) => {
        const samples = project['Samples'];
        if (samples && samples !== 'Archive') {
          const sampleCount = parseInt(samples);
          if (!isNaN(sampleCount)) {
            return total + sampleCount;
          }
        }
        return total;
      }, 0);
    });
    
    // Sort body sites by count if needed
    const sortedBodySites = Object.entries(samplesByBodySite)
      .sort((a, b) => sortOrder === 'desc' ? b[1] - a[1] : a[1] - b[1]);
    
    // Calculate sample counts by age group
    const samplesByAgeGroup = {};
    Object.entries(ageGroups).forEach(([age, projects]) => {
      samplesByAgeGroup[age] = projects.reduce((total, project) => {
        const samples = project['Samples'];
        if (samples && samples !== 'Archive') {
          const sampleCount = parseInt(samples);
          if (!isNaN(sampleCount)) {
            return total + sampleCount;
          }
        }
        return total;
      }, 0);
    });
    
    // Sort age groups by count if needed
    const sortedAgeGroups = Object.entries(samplesByAgeGroup)
      .sort((a, b) => sortOrder === 'desc' ? b[1] - a[1] : a[1] - b[1]);
      
    // Total samples calculation
    const totalSamples = filteredProjects.reduce((total, project) => {
      const samples = project['Samples'];
      if (samples && samples !== 'Archive') {
        const sampleCount = parseInt(samples);
        if (!isNaN(sampleCount)) {
          return total + sampleCount;
        }
      }
      return total;
    }, 0);
      
    return {
      filteredProjects,
      bodySiteGroups,
      ageGroups,
      samplesByBodySite,
      samplesByAgeGroup,
      sortedBodySites,
      sortedAgeGroups,
      totalSamples
    };
  }, [data, filters, sortOrder, hasData]);
  
  // Extract variables from processedData
  const {
    filteredProjects,
    bodySiteGroups,
    ageGroups,
    sortedBodySites,
    sortedAgeGroups,
    totalSamples
  } = processedData;
  
  // Get theme colors
  const colors = useMemo(() => getChartColors(), []);
  
  // Prepare chart data for body sites
  const bodySiteChartData = {
    labels: sortedBodySites.map(([site]) => site),
    datasets: [
      {
        label: 'Number of Samples',
        data: sortedBodySites.map(([_, count]) => count),
        backgroundColor: sortedBodySites.map((_, index) => colors[index % colors.length]),
        borderColor: sortedBodySites.map((_, index) => colors[index % colors.length]),
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare chart data for age groups
  const ageGroupChartData = {
    labels: sortedAgeGroups.map(([age]) => age),
    datasets: [
      {
        label: 'Number of Samples',
        data: sortedAgeGroups.map(([_, count]) => count),
        backgroundColor: sortedAgeGroups.map((_, index) => colors[index % colors.length]),
        borderColor: sortedAgeGroups.map((_, index) => colors[index % colors.length]),
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = ((value / totalSamples) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} samples (${percentage}%)`;
          }
        }
      },
      title: {
        display: false
      }
    }
  };
  
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw || 0;
            return `${value.toLocaleString()} samples`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Samples'
        }
      },
      x: {
        title: {
          display: true,
          text: chartType === 'bodySite' ? 'Body Site Categories' : 'Age Group Categories'
        }
      }
    }
  };
  
  // Chart display options handlers
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };
  
  const handleSortOrderChange = (order) => {
    setSortOrder(order);
  };
  
  const toggleLegend = () => {
    setShowLegend(!showLegend);
  };
  
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Sample Distribution</h2>
        <p className="subtitle">Distribution of samples by body site and age group</p>
        <div className="visualization-actions">
          <ExportDataButton 
            data={{
              bodySite: {
                labels: sortedBodySites.map(([site]) => site),
                values: sortedBodySites.map(([_, count]) => count),
                percentages: sortedBodySites.map(([_, count]) => ((count / totalSamples) * 100).toFixed(1))
              },
              ageGroup: {
                labels: sortedAgeGroups.map(([age]) => age),
                values: sortedAgeGroups.map(([_, count]) => count),
                percentages: sortedAgeGroups.map(([_, count]) => ((count / totalSamples) * 100).toFixed(1))
              },
              totalSamples
            }} 
            filename="hvp-sample-distribution"
            visualizationRef={chartType === 'bodySite' ? bodySiteChartRef : ageGroupChartRef}
            exportOptions={['csv', 'json', 'png', 'print']}
          />
        </div>
      </div>
      
      {!hasData ? (
        <div className="error-message">
          <h3>No Data Available</h3>
          <p>Could not load project data. Please check that the data files are correctly placed in the public/data directory.</p>
        </div>
      ) : (
        <>
          <div className="chart-controls">
            <div className="control-group">
              <label>Chart Type: </label>
              <div className="button-group">
                <button 
                  className={chartType === 'pie' ? 'active' : ''} 
                  onClick={() => handleChartTypeChange('pie')}>
                  Pie Chart
                </button>
                <button 
                  className={chartType === 'bar' ? 'active' : ''} 
                  onClick={() => handleChartTypeChange('bar')}>
                  Bar Chart
                </button>
              </div>
            </div>
            
            <div className="control-group">
              <label>Sort Order: </label>
              <div className="button-group">
                <button 
                  className={sortOrder === 'desc' ? 'active' : ''} 
                  onClick={() => handleSortOrderChange('desc')}>
                  Descending
                </button>
                <button 
                  className={sortOrder === 'asc' ? 'active' : ''} 
                  onClick={() => handleSortOrderChange('asc')}>
                  Ascending
                </button>
              </div>
            </div>
            
            <div className="control-group">
              <button onClick={toggleLegend}>
                {showLegend ? 'Hide Legend' : 'Show Legend'}
              </button>
            </div>
          </div>
          
          <div className="chart-grid">
            <div className="chart-card">
              <h3>Samples by Body Site</h3>
              <div className="chart-container" ref={bodySiteChartRef}>
                {chartType === 'pie' ? (
                  <Pie data={bodySiteChartData} options={pieChartOptions} />
                ) : (
                  <Bar data={bodySiteChartData} options={barChartOptions} />
                )}
              </div>
              <div className="chart-legend">
                <div className="data-table-mini">
                  <table>
                    <thead>
                      <tr>
                        <th>Body Site</th>
                        <th>Samples</th>
                        <th>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBodySites.map(([site, count], index) => (
                        <tr key={site}>
                          <td>
                            <span className="color-dot" style={{backgroundColor: colors[index % colors.length]}}></span>
                            {site}
                          </td>
                          <td>{count.toLocaleString()}</td>
                          <td>{((count / totalSamples) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Samples by Age Group</h3>
              <div className="chart-container" ref={ageGroupChartRef}>
                {chartType === 'pie' ? (
                  <Pie data={ageGroupChartData} options={pieChartOptions} />
                ) : (
                  <Bar data={ageGroupChartData} options={barChartOptions} />
                )}
              </div>
              <div className="chart-legend">
                <div className="data-table-mini">
                  <table>
                    <thead>
                      <tr>
                        <th>Age Group</th>
                        <th>Samples</th>
                        <th>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAgeGroups.map(([age, count], index) => (
                        <tr key={age}>
                          <td>
                            <span className="color-dot" style={{backgroundColor: colors[index % colors.length]}}></span>
                            {age}
                          </td>
                          <td>{count.toLocaleString()}</td>
                          <td>{((count / totalSamples) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Samples</h3>
              <div className="stat-value">{totalSamples.toLocaleString()}</div>
              <p>From {filteredProjects.length} projects</p>
            </div>
            
            <div className="stat-card">
              <h3>Body Site Categories</h3>
              <div className="stat-value">{Object.keys(bodySiteGroups).length}</div>
              <p>Unique categories represented</p>
            </div>
            
            <div className="stat-card">
              <h3>Age Group Categories</h3>
              <div className="stat-value">{Object.keys(ageGroups).length}</div>
              <p>Unique categories represented</p>
            </div>
          </div>
          
          <div className="projects-table-container">
            <h3>Projects with Highest Sample Counts</h3>
            <div className="projects-table-wrapper">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Project ID</th>
                    <th>Cohort Name</th>
                    <th>Body Site</th>
                    <th>Age Group</th>
                    <th>Samples</th>
                    <th>Participants</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects
                    .filter(project => project['Samples'] !== 'Archive')
                    .sort((a, b) => {
                      const samplesA = parseInt(a['Samples']) || 0;
                      const samplesB = parseInt(b['Samples']) || 0;
                      return samplesB - samplesA;
                    })
                    .slice(0, 10)
                    .map(project => (
                      <tr key={project['Project ID']}>
                        <td>{project['Project ID']}</td>
                        <td>{project['Cohort Name']}</td>
                        <td>{project['Body Site Category']}</td>
                        <td>{project['Age Group Category']}</td>
                        <td>{project['Samples']}</td>
                        <td>{project['Participants'] === 'Unknown' ? 'Unknown' : project['Participants']}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SampleDistribution;