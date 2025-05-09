import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import './Visualization.css';

/**
 * ProjectTimeline visualization component
 * Shows project timelines, status distribution, and sample collection progress
 */
function ProjectTimeline({ data, filters }) {
  // State for component
  const [hasData, setHasData] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineView, setTimelineView] = useState('samples'); // 'samples' or 'milestones'
  
  // Refs for SVG elements
  const sampleTimelineRef = useRef(null);
  const statusChartRef = useRef(null);
  const milestonesRef = useRef(null);
  
  // Check if data is available
  useEffect(() => {
    if (!data || !data.projects) {
      setHasData(false);
    } else {
      setHasData(true);
    }
  }, [data]);
  
  // Process data with useMemo
  const processedData = useMemo(() => {
    if (!hasData) {
      return {
        filteredProjects: [],
        statusCounts: {},
        sampleTimeline: [],
        milestones: [],
        currentYear: new Date().getFullYear()
      };
    }
    
    // Apply filters to projects
    const filteredProjects = data.projects.filter(project => {
      return (
        (!filters.initiativeType || project['Initiative Type'] === filters.initiativeType) &&
        (!filters.geographicRegion || project['Geographic Region'] === filters.geographicRegion) &&
        (!filters.bodySiteCategory || project['Body Site Category'].includes(filters.bodySiteCategory)) &&
        (!filters.ageGroupCategory || project['Age Group Category'].includes(filters.ageGroupCategory)) &&
        (!filters.status || project['Status'] === filters.status)
      );
    });
    
    // Count projects by status
    const statusCounts = filteredProjects.reduce((counts, project) => {
      const status = project['Status'];
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
    
    // Sample collection timeline data from the implementation plan
    const sampleTimeline = [
      { year: 2024, projected: 5000, cumulative: 5000, percent: 7 },
      { year: 2025, projected: 20000, cumulative: 25000, percent: 35.2 },
      { year: 2026, projected: 25000, cumulative: 50000, percent: 70.4 },
      { year: 2027, projected: 15000, cumulative: 65000, percent: 91.5 },
      { year: 2028, projected: 6000, cumulative: 71000, percent: 100 }
    ];
    
    // Program milestones from additional-hvp-data.md
    const milestones = [
      { date: "April 29, 2022", milestone: "Public Workshop on Human Virome Concept", type: "Planning" },
      { date: "September 8, 2022", milestone: "DPCPSI Council of Councils Presentation", type: "Planning" },
      { date: "August 2023", milestone: "Initial Funding Opportunities Published", type: "Funding" },
      { date: "October 16, 2023", milestone: "Pre-application Webinar", type: "Funding" },
      { date: "January-February 2025", milestone: "Major Center Grants Awarded", type: "Implementation" },
      { date: "Q1 2025", milestone: "HVP Kickoff Meeting (3 months after awards)", type: "Implementation" },
      { date: "Q2-Q3 2025", milestone: "6-Month Setup Phase (protocol standardization)", type: "Implementation" },
      { date: "2025-2026", milestone: "Infrastructure Development", type: "Research" },
      { date: "2026-2027", milestone: "Major Data Generation Phase", type: "Research" },
      { date: "2027-2028", milestone: "Data Analysis and Synthesis", type: "Research" },
      { date: "2028", milestone: "Program Completion (Phase 1)", type: "Completion" }
    ];
    
    return {
      filteredProjects,
      statusCounts,
      sampleTimeline,
      milestones,
      currentYear: new Date().getFullYear()
    };
  }, [data, filters, hasData]);
  
  // Extract variables from processedData
  const { filteredProjects, statusCounts, sampleTimeline, milestones, currentYear } = processedData;
  
  // Create D3 visualizations when component mounts or data changes
  useEffect(() => {
    if (!hasData) return;
    
    // Store refs to avoid ESLint warnings about using .current in cleanup
    const sampleTimelineElement = sampleTimelineRef.current;
    const statusChartElement = statusChartRef.current;
    const milestonesElement = milestonesRef.current;
    
    try {
      setLoading(true);
      
      // Only proceed if we have the container elements
      if (sampleTimelineElement && statusChartElement) {
        // Create the sample timeline visualization
        createSampleTimelineChart();
        
        // Create the status distribution chart
        createStatusChart();
        
        // Create the milestones timeline
        if (milestonesElement) {
          createMilestonesTimeline();
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error creating timeline visualizations:', err);
      setError('Failed to create timeline visualizations. See console for details.');
      setLoading(false);
    }
    
    // Function to get CSS variable value
    const getCSSVariable = (variableName) => {
      return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    };
    
    // Function to create sample timeline chart
    function createSampleTimelineChart() {
      // Clear previous chart
      d3.select(sampleTimelineRef.current).selectAll("*").remove();
      
      // Set dimensions and margins
      const margin = { top: 20, right: 30, bottom: 50, left: 60 };
      const width = sampleTimelineRef.current.clientWidth - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;
      
      // Create SVG
      const svg = d3.select(sampleTimelineRef.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Create scales
      const x = d3.scaleBand()
        .domain(sampleTimeline.map(d => d.year))
        .range([0, width])
        .padding(0.2);
      
      const y1 = d3.scaleLinear()
        .domain([0, d3.max(sampleTimeline, d => d.projected) * 1.2])
        .range([height, 0]);
      
      const y2 = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
      
      // Add axes
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
      
      svg.append("g")
        .call(d3.axisLeft(y1));
      
      svg.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(y2));
      
      // Add bars for projected samples
      svg.selectAll(".bar")
        .data(sampleTimeline)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.year))
        .attr("width", x.bandwidth())
        .attr("y", d => y1(d.projected))
        .attr("height", d => height - y1(d.projected))
        .attr("fill", getCSSVariable('--chart-color-1'));
      
      // Add line for cumulative percentage
      const line = d3.line()
        .x(d => x(d.year) + x.bandwidth() / 2)
        .y(d => y2(d.percent));
      
      svg.append("path")
        .datum(sampleTimeline)
        .attr("fill", "none")
        .attr("stroke", getCSSVariable('--chart-color-2'))
        .attr("stroke-width", 2)
        .attr("d", line);
      
      // Add dots for the line
      svg.selectAll(".dot")
        .data(sampleTimeline)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year) + x.bandwidth() / 2)
        .attr("cy", d => y2(d.percent))
        .attr("r", 5)
        .attr("fill", getCSSVariable('--chart-color-2'));
      
      // Add labels
      svg.selectAll(".percent-label")
        .data(sampleTimeline)
        .enter()
        .append("text")
        .attr("class", "percent-label")
        .attr("x", d => x(d.year) + x.bandwidth() / 2)
        .attr("y", d => y2(d.percent) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(d => d.percent + "%");
      
      // Add axis labels
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Year");
      
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .text("Projected Samples");
      
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", width + margin.right - 5)
        .attr("x", -height / 2)
        .text("Completion (%)");
      
      // Add legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, 0)`);
      
      legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", getCSSVariable('--chart-color-1'));
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .attr("fill", getCSSVariable('--text-primary'))
        .text("Projected Samples")
        .attr("font-size", "10px");
      
      legend.append("circle")
        .attr("cx", 7)
        .attr("cy", 30)
        .attr("r", 5)
        .attr("fill", getCSSVariable('--chart-color-2'));
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", 34)
        .attr("fill", getCSSVariable('--text-primary'))
        .text("Completion %")
        .attr("font-size", "10px");
    }
    
    // Function to create status chart
    function createStatusChart() {
      // Clear previous chart
      d3.select(statusChartRef.current).selectAll("*").remove();
      
      // Prepare data
      const data = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));
      
      // Set dimensions and margins
      const margin = { top: 20, right: 30, bottom: 50, left: 60 };
      const width = statusChartRef.current.clientWidth - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;
      
      // Create SVG
      const svg = d3.select(statusChartRef.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Create scales
      const x = d3.scaleBand()
        .domain(data.map(d => d.status))
        .range([0, width])
        .padding(0.3);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count) * 1.2])
        .range([height, 0]);
      
      // Add axes
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
      
      svg.append("g")
        .call(d3.axisLeft(y).ticks(5));
      
      // Add bars
      svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.status))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count))
        .attr("fill", d => d.status === 'Ongoing' ? getCSSVariable('--success-color') : getCSSVariable('--info-color'));
      
      // Add labels
      svg.selectAll(".count-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "count-label")
        .attr("x", d => x(d.status) + x.bandwidth() / 2)
        .attr("y", d => y(d.count) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.count);
      
      // Add axis labels
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Status");
      
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .text("Number of Projects");
    }
    
    // Function to create milestones timeline
    function createMilestonesTimeline() {
      // Clear previous chart
      d3.select(milestonesRef.current).selectAll("*").remove();
      
      // Set dimensions and margins
      const margin = { top: 20, right: 30, bottom: 20, left: 150 };
      const width = milestonesRef.current.clientWidth - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      
      // Create SVG
      const svg = d3.select(milestonesRef.current)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Prepare milestone dates for time scale
      const parseTime = d3.timeParse("%Y");
      const parseTimeQuarter = (dateStr) => {
        if (dateStr.includes("Q1")) return new Date(parseInt(dateStr.slice(0, 4)), 0, 1);
        if (dateStr.includes("Q2")) return new Date(parseInt(dateStr.slice(0, 4)), 3, 1);
        if (dateStr.includes("Q3")) return new Date(parseInt(dateStr.slice(0, 4)), 6, 1);
        if (dateStr.includes("Q4")) return new Date(parseInt(dateStr.slice(0, 4)), 9, 1);
        return parseTime(dateStr);
      };
      
      // Process dates for milestones
      const processedMilestones = milestones.map(m => {
        let date;
        if (m.date.includes("-")) {
          // Handle date ranges like "2025-2026"
          date = parseTime(m.date.split("-")[0].trim());
        } else if (m.date.includes("Q")) {
          // Handle quarters
          date = parseTimeQuarter(m.date);
        } else {
          // Regular date parsing
          const parts = m.date.split(" ");
          if (parts.length === 2) {
            // Just month and year
            const monthIdx = ["January", "February", "March", "April", "May", "June", 
                             "July", "August", "September", "October", "November", "December"]
                             .findIndex(m => parts[0].includes(m));
            if (monthIdx >= 0) {
              date = new Date(parseInt(parts[1]), monthIdx, 1);
            } else {
              date = parseTime(parts[1]);
            }
          } else {
            date = parseTime(m.date);
          }
        }
        return {
          ...m,
          parsedDate: date || new Date(2022, 0, 1) // Default to 2022 if parsing fails
        };
      });
      
      // Sort by date
      processedMilestones.sort((a, b) => a.parsedDate - b.parsedDate);
      
      // Create scales
      const x = d3.scaleTime()
        .domain([
          d3.min(processedMilestones, d => d.parsedDate),
          d3.max(processedMilestones, d => d.parsedDate)
        ])
        .range([0, width]);
      
      const y = d3.scaleBand()
        .domain(processedMilestones.map(d => d.milestone))
        .range([0, height])
        .padding(0.2);
      
      // Add axes
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%Y")));
      
      svg.append("g")
        .call(d3.axisLeft(y).tickSize(0));
      
      // Add milestone points
      svg.selectAll(".milestone-point")
        .data(processedMilestones)
        .enter()
        .append("circle")
        .attr("class", "milestone-point")
        .attr("cx", d => x(d.parsedDate))
        .attr("cy", d => y(d.milestone) + y.bandwidth() / 2)
        .attr("r", 8)
        .attr("fill", d => {
          switch (d.type) {
            case "Planning": return getCSSVariable('--text-tertiary');
            case "Funding": return getCSSVariable('--warning-color');
            case "Implementation": return getCSSVariable('--info-color');
            case "Research": return getCSSVariable('--primary-color');
            case "Completion": return getCSSVariable('--success-color');
            default: return getCSSVariable('--text-tertiary');
          }
        });
      
      // Add vertical now line
      const now = new Date();
      if (now >= d3.min(processedMilestones, d => d.parsedDate) && 
          now <= d3.max(processedMilestones, d => d.parsedDate)) {
        svg.append("line")
          .attr("x1", x(now))
          .attr("y1", 0)
          .attr("x2", x(now))
          .attr("y2", height)
          .attr("stroke", getCSSVariable('--danger-color'))
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
        
        svg.append("text")
          .attr("x", x(now))
          .attr("y", -5)
          .attr("text-anchor", "middle")
          .attr("fill", getCSSVariable('--danger-color'))
          .text("Now");
      }
      
      // Add legend
      const legendData = [
        { type: "Planning", color: getCSSVariable('--text-tertiary') },
        { type: "Funding", color: getCSSVariable('--warning-color') },
        { type: "Implementation", color: getCSSVariable('--info-color') },
        { type: "Research", color: getCSSVariable('--primary-color') },
        { type: "Completion", color: getCSSVariable('--success-color') }
      ];
      
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 120}, 0)`);
      
      legendData.forEach((item, i) => {
        legend.append("circle")
          .attr("cx", 0)
          .attr("cy", i * 20)
          .attr("r", 6)
          .attr("fill", item.color);
        
        legend.append("text")
          .attr("x", 15)
          .attr("y", i * 20 + 4)
          .text(item.type)
          .attr("font-size", "10px");
      });
    }
    
    // Cleanup function
    return () => {
      if (sampleTimelineElement) {
        d3.select(sampleTimelineElement).selectAll("*").remove();
      }
      if (statusChartElement) {
        d3.select(statusChartElement).selectAll("*").remove();
      }
      if (milestonesElement) {
        d3.select(milestonesElement).selectAll("*").remove();
      }
    };
  }, [hasData, processedData, sampleTimeline, statusCounts, milestones]);
  
  // Timeline view toggle handler
  const handleViewChange = (view) => {
    setTimelineView(view);
  };
  
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Project Timeline</h2>
        <p className="subtitle">Project status and sample collection progress</p>
      </div>
      
      {!hasData ? (
        <div className="error-message">
          <h3>No Data Available</h3>
          <p>Could not load project data. Please check that the data files are correctly placed in the public/data directory.</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Ongoing Projects</h3>
              <div className="stat-value">{statusCounts['Ongoing'] || 0}</div>
              <p>{filteredProjects.length ? Math.round(((statusCounts['Ongoing'] || 0) / filteredProjects.length) * 100) : 0}% of total</p>
            </div>
            
            <div className="stat-card">
              <h3>Completed Projects</h3>
              <div className="stat-value">{statusCounts['Complete'] || 0}</div>
              <p>{filteredProjects.length ? Math.round(((statusCounts['Complete'] || 0) / filteredProjects.length) * 100) : 0}% of total</p>
            </div>
            
            <div className="stat-card">
              <h3>Current Year</h3>
              <div className="stat-value">{currentYear}</div>
              <p>Program timeline: 2024-2028</p>
            </div>
          </div>
          
          <div className="chart-controls">
            <div className="control-group">
              <label>Timeline View: </label>
              <div className="button-group">
                <button 
                  className={timelineView === 'samples' ? 'active' : ''} 
                  onClick={() => handleViewChange('samples')}>
                  Sample Collection
                </button>
                <button 
                  className={timelineView === 'milestones' ? 'active' : ''} 
                  onClick={() => handleViewChange('milestones')}>
                  Program Milestones
                </button>
              </div>
            </div>
          </div>
          
          {timelineView === 'samples' ? (
            <div className="timeline-container">
              <h3>Sample Collection Timeline (2024-2028)</h3>
              {loading ? (
                <div className="loading-message">
                  <p>Loading timeline visualization...</p>
                </div>
              ) : (
                <>
                  <div className="chart-container" ref={sampleTimelineRef}></div>
                  <div className="data-table-mini">
                    <table className="timeline-table">
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Projected New Samples</th>
                          <th>Cumulative Total</th>
                          <th>% Complete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleTimeline.map(item => (
                          <tr key={item.year}>
                            <td>{item.year}</td>
                            <td>{item.projected.toLocaleString()}</td>
                            <td>{item.cumulative.toLocaleString()}</td>
                            <td>{item.percent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="timeline-container">
              <h3>Program Milestones (2022-2028)</h3>
              {loading ? (
                <div className="loading-message">
                  <p>Loading milestones visualization...</p>
                </div>
              ) : (
                <>
                  <div className="chart-container milestone-chart" ref={milestonesRef}></div>
                </>
              )}
            </div>
          )}
          
          <div className="chart-grid">
            <div className="chart-card">
              <h3>Projects by Status</h3>
              {loading ? (
                <div className="loading-message">
                  <p>Loading chart...</p>
                </div>
              ) : (
                <div className="chart-container" ref={statusChartRef}></div>
              )}
            </div>
          </div>
          
          <div className="projects-table-container">
            <h3>Projects by Status</h3>
            <div className="projects-table-wrapper">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Project ID</th>
                    <th>Institution</th>
                    <th>Cohort Name</th>
                    <th>Study Type</th>
                    <th>Samples</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects
                    .sort((a, b) => {
                      // Sort by status first, then by project ID
                      if (a['Status'] !== b['Status']) {
                        return a['Status'] === 'Ongoing' ? -1 : 1;
                      }
                      return a['Project ID'].localeCompare(b['Project ID']);
                    })
                    .map(project => (
                      <tr key={project['Project ID']}>
                        <td>
                          <span className={`status-badge ${project['Status'].toLowerCase()}`}>
                            {project['Status']}
                          </span>
                        </td>
                        <td>{project['Project ID']}</td>
                        <td>{project['Institution']}</td>
                        <td>{project['Cohort Name']}</td>
                        <td>{project['Study Type']}</td>
                        <td>{project['Samples'] === 'Archive' ? 'Archive' : project['Samples']}</td>
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

export default ProjectTimeline;