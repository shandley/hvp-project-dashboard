import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import './Visualization.css';

/**
 * LiveProjectTimeline visualization component
 * Shows real-time project status, distribution over time with actual data
 */
function LiveProjectTimeline({ data, filters }) {
  // State for component
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineView, setTimelineView] = useState('quarterly'); // 'quarterly' or 'yearly' or 'initiatives'
  
  // Refs for SVG elements
  const quarterlyChartRef = useRef(null);
  const yearlyChartRef = useRef(null);
  const initiativeChartRef = useRef(null);
  const bodySiteChartRef = useRef(null);
  
  // Load timeline data
  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.PUBLIC_URL}/data/project-status-timeline.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load timeline data');
        }
        return response.json();
      })
      .then(data => {
        setTimelineData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading timeline data:', err);
        setError('Failed to load timeline data. Please try again later.');
        setLoading(false);
      });
  }, []);
  
  // Process data with useMemo
  const processedData = useMemo(() => {
    if (!data || !data.projects || !timelineData) {
      return {
        filteredProjects: [],
        statusCounts: {},
        currentYear: new Date().getFullYear(),
        currentQuarter: Math.floor((new Date().getMonth() + 3) / 3)
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
    
    // Count projects by status and initiative type
    const statusCounts = filteredProjects.reduce((counts, project) => {
      const status = project['Status'];
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
    
    const initiativeCounts = filteredProjects.reduce((counts, project) => {
      const initiative = project['Initiative Type'];
      counts[initiative] = (counts[initiative] || 0) + 1;
      return counts;
    }, {});
    
    const bodySiteCounts = filteredProjects.reduce((counts, project) => {
      if (!project['Body Site Category']) return counts;
      
      const bodySites = project['Body Site Category'].split('/').map(site => site.trim());
      bodySites.forEach(site => {
        counts[site] = (counts[site] || 0) + 1;
      });
      return counts;
    }, {});
    
    return {
      filteredProjects,
      statusCounts,
      initiativeCounts,
      bodySiteCounts,
      currentYear: new Date().getFullYear(),
      currentQuarter: Math.floor((new Date().getMonth() + 3) / 3)
    };
  }, [data, filters, timelineData]);
  
  // Extract variables from processedData
  // eslint-disable-next-line no-unused-vars
  const { 
    currentYear, 
    currentQuarter 
  } = processedData;
  
  // Create D3 visualizations when component mounts or data changes
  useEffect(() => {
    if (!timelineData) return;
    
    // Store refs to avoid ESLint warnings about using .current in cleanup
    const quarterlyChartElement = quarterlyChartRef.current;
    const yearlyChartElement = yearlyChartRef.current;
    const initiativeChartElement = initiativeChartRef.current;
    const bodySiteChartElement = bodySiteChartRef.current;
    
    try {
      setLoading(true);
      
      // Only proceed if we have the container elements
      if (quarterlyChartElement && yearlyChartElement && timelineData) {
        // Create the quarterly chart
        createQuarterlyChart();
        
        // Create the yearly chart
        createYearlyChart();
        
        // Create the initiative timeline chart
        if (initiativeChartElement) {
          createInitiativeChart();
        }
        
        // Create body site chart
        if (bodySiteChartElement) {
          createBodySiteChart();
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
    
    // Function to create quarterly project status chart
    function createQuarterlyChart() {
      // Clear previous chart
      d3.select(quarterlyChartElement).selectAll("*").remove();
      
      // Set dimensions and margins
      const margin = { top: 40, right: 80, bottom: 60, left: 50 };
      const width = quarterlyChartElement.clientWidth - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;
      
      // Create SVG
      const svg = d3.select(quarterlyChartElement)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Get quarterly data
      const data = timelineData.projectsByQuarter;
      
      // Define scales
      const x = d3.scaleBand()
        .domain(data.map(d => d.quarter))
        .range([0, width])
        .padding(0.3);
      
      const y1 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.ongoing + d.complete) * 1.2])
        .range([height, 0]);
      
      const y2 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.samplesCollected) * 1.2])
        .range([height, 0]);
      
      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
      
      // Add Y1 axis (projects)
      svg.append("g")
        .call(d3.axisLeft(y1).ticks(5));
      
      // Add Y2 axis (samples)
      svg.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(y2).ticks(5));
      
      // Define colors
      const colors = {
        ongoing: getCSSVariable('--primary-color'),
        complete: getCSSVariable('--success-color'),
        samples: getCSSVariable('--warning-color')
      };
      
      // Add stacked bars
      data.forEach(d => {
        // Ongoing project bars
        svg.append("rect")
          .attr("x", x(d.quarter))
          .attr("y", y1(d.ongoing + d.complete))
          .attr("width", x.bandwidth())
          .attr("height", height - y1(d.ongoing + d.complete))
          .attr("fill", colors.complete);
        
        // Complete project bars
        svg.append("rect")
          .attr("x", x(d.quarter))
          .attr("y", y1(d.ongoing))
          .attr("width", x.bandwidth())
          .attr("height", height - y1(d.ongoing))
          .attr("fill", colors.ongoing);
      });
      
      // Add line for samples collected
      const line = d3.line()
        .x(d => x(d.quarter) + x.bandwidth() / 2)
        .y(d => y2(d.samplesCollected));
      
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colors.samples)
        .attr("stroke-width", 2.5)
        .attr("d", line);
      
      // Add dots for the line
      svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.quarter) + x.bandwidth() / 2)
        .attr("cy", d => y2(d.samplesCollected))
        .attr("r", 5)
        .attr("fill", colors.samples);
      
      // Add the current quarter marker
      const currentQ = `Q${currentQuarter} ${currentYear}`;
      if (data.some(d => d.quarter === currentQ)) {
        svg.append("line")
          .attr("x1", x(currentQ) + x.bandwidth() / 2)
          .attr("y1", 0)
          .attr("x2", x(currentQ) + x.bandwidth() / 2)
          .attr("y2", height)
          .attr("stroke", getCSSVariable('--danger-color'))
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
        
        svg.append("text")
          .attr("x", x(currentQ) + x.bandwidth() / 2)
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .attr("fill", getCSSVariable('--danger-color'))
          .text("Current");
      }
      
      // Add axis titles
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("fill", getCSSVariable('--text-primary'))
        .text("Quarter");
      
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .attr("fill", getCSSVariable('--text-primary'))
        .text("Number of Projects");
      
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", width + margin.right - 15)
        .attr("x", -height / 2)
        .attr("fill", colors.samples)
        .text("Samples Collected");
      
      // Add legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 180}, -30)`);
      
      legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colors.ongoing);
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("Ongoing Projects")
        .attr("font-size", "10px");
      
      legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colors.complete);
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", 32)
        .text("Completed Projects")
        .attr("font-size", "10px");
      
      legend.append("circle")
        .attr("cx", 7)
        .attr("cy", 47)
        .attr("r", 5)
        .attr("fill", colors.samples);
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", 50)
        .text("Samples Collected")
        .attr("font-size", "10px");
    }
    
    // Function to create yearly projected chart
    function createYearlyChart() {
      // Clear previous chart
      d3.select(yearlyChartElement).selectAll("*").remove();
      
      // Set dimensions and margins
      const margin = { top: 40, right: 80, bottom: 60, left: 50 };
      const width = yearlyChartElement.clientWidth - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;
      
      // Create SVG
      const svg = d3.select(yearlyChartElement)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Get yearly data
      const data = timelineData.projectionsByYear;
      
      // Define scales
      const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.3);
      
      const y1 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.ongoing + d.complete) * 1.2])
        .range([height, 0]);
      
      const y2 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.samplesCollected) * 1.2])
        .range([height, 0]);
      
      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
      
      // Add Y1 axis (projects)
      svg.append("g")
        .call(d3.axisLeft(y1).ticks(5));
      
      // Add Y2 axis (samples)
      svg.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(y2).ticks(5));
      
      // Define colors
      const colors = {
        ongoing: getCSSVariable('--primary-color'),
        complete: getCSSVariable('--success-color'),
        samples: getCSSVariable('--warning-color'),
        projected: getCSSVariable('--info-color')
      };
      
      // Add stacked bars
      data.forEach(d => {
        // Complete project bars (bottom of stack)
        svg.append("rect")
          .attr("x", x(d.year))
          .attr("y", y1(d.complete))
          .attr("width", x.bandwidth())
          .attr("height", height - y1(d.complete))
          .attr("fill", colors.complete);
        
        // Ongoing project bars (top of stack)
        svg.append("rect")
          .attr("x", x(d.year))
          .attr("y", y1(d.ongoing + d.complete))
          .attr("width", x.bandwidth())
          .attr("height", y1(d.complete) - y1(d.ongoing + d.complete))
          .attr("fill", colors.ongoing);
      });
      
      // Add line for samples collected
      const line = d3.line()
        .x(d => x(d.year) + x.bandwidth() / 2)
        .y(d => y2(d.samplesCollected));
      
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colors.samples)
        .attr("stroke-width", 2.5)
        .attr("d", line);
      
      // Add dots for the line
      svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year) + x.bandwidth() / 2)
        .attr("cy", d => y2(d.samplesCollected))
        .attr("r", 5)
        .attr("fill", colors.samples);
      
      // Add the current year marker
      if (data.some(d => d.year === currentYear)) {
        svg.append("line")
          .attr("x1", x(currentYear) + x.bandwidth() / 2)
          .attr("y1", 0)
          .attr("x2", x(currentYear) + x.bandwidth() / 2)
          .attr("y2", height)
          .attr("stroke", getCSSVariable('--danger-color'))
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
        
        svg.append("text")
          .attr("x", x(currentYear) + x.bandwidth() / 2)
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .attr("fill", getCSSVariable('--danger-color'))
          .text("Current Year");
      }
      
      // Add axis titles
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("fill", getCSSVariable('--text-primary'))
        .text("Year");
      
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .attr("fill", getCSSVariable('--text-primary'))
        .text("Number of Projects");
      
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", width + margin.right - 15)
        .attr("x", -height / 2)
        .attr("fill", colors.samples)
        .text("Samples Collected");
      
      // Add legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 180}, -30)`);
      
      legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colors.ongoing);
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("Projected Ongoing")
        .attr("font-size", "10px");
      
      legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colors.complete);
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", 32)
        .text("Projected Completed")
        .attr("font-size", "10px");
      
      legend.append("circle")
        .attr("cx", 7)
        .attr("cy", 47)
        .attr("r", 5)
        .attr("fill", colors.samples);
      
      legend.append("text")
        .attr("x", 20)
        .attr("y", 50)
        .text("Projected Samples")
        .attr("font-size", "10px");
    }
    
    // Function to create initiative timeline chart
    function createInitiativeChart() {
      // Clear previous chart
      d3.select(initiativeChartElement).selectAll("*").remove();
      
      // Set dimensions and margins
      const margin = { top: 40, right: 30, bottom: 60, left: 150 };
      const width = initiativeChartElement.clientWidth - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      
      // Create SVG
      const svg = d3.select(initiativeChartElement)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Prepare data
      const initiatives = timelineData.initiativeTimeline;
      
      // Parse dates
      const parseDate = (dateStr) => {
        const [month, year] = dateStr.split(" ");
        const monthIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(month);
        return new Date(parseInt(year), monthIndex);
      };
      
      // Flatten the data for plotting
      const events = [];
      initiatives.forEach(initiative => {
        initiative.events.forEach(event => {
          events.push({
            type: initiative.type,
            date: parseDate(event.date),
            dateString: event.date,
            description: event.description
          });
        });
      });
      
      // Sort events by date
      events.sort((a, b) => a.date - b.date);
      
      // Define scales
      const x = d3.scaleTime()
        .domain([
          d3.min(events, d => d.date),
          d3.max(events, d => d.date)
        ])
        .range([0, width]);
      
      const y = d3.scaleBand()
        .domain(initiatives.map(d => d.type))
        .range([0, height])
        .padding(0.3);
      
      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%b %Y")));
      
      // Add Y axis
      svg.append("g")
        .call(d3.axisLeft(y));
      
      // Define colors
      const colors = {
        "VCC": getCSSVariable('--chart-color-1'),
        "Functional Studies": getCSSVariable('--chart-color-2'),
        "Technology Development": getCSSVariable('--chart-color-3')
      };
      
      // Add event points
      events.forEach(event => {
        // Add points
        svg.append("circle")
          .attr("cx", x(event.date))
          .attr("cy", y(event.type) + y.bandwidth() / 2)
          .attr("r", 6)
          .attr("fill", colors[event.type] || getCSSVariable('--text-tertiary'))
          .on("mouseover", function(e) {
            d3.select(this).attr("r", 8);
            
            tooltip
              .style("opacity", 1)
              .html(`<strong>${event.dateString}</strong><br/>${event.description}`)
              .style("left", (e.pageX + 10) + "px")
              .style("top", (e.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            d3.select(this).attr("r", 6);
            tooltip.style("opacity", 0);
          });
      });
      
      // Add the current date marker
      const now = new Date();
      if (now >= d3.min(events, d => d.date) && now <= d3.max(events, d => d.date)) {
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
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .attr("fill", getCSSVariable('--danger-color'))
          .text("Today");
      }
      
      // Connect events of the same type with lines
      initiatives.forEach(initiative => {
        const initiativeEvents = events.filter(e => e.type === initiative.type);
        initiativeEvents.sort((a, b) => a.date - b.date);
        
        const line = d3.line()
          .x(d => x(d.date))
          .y(d => y(d.type) + y.bandwidth() / 2);
        
        svg.append("path")
          .datum(initiativeEvents)
          .attr("fill", "none")
          .attr("stroke", colors[initiative.type] || getCSSVariable('--text-tertiary'))
          .attr("stroke-width", 2)
          .attr("d", line);
      });
      
      // Add a tooltip div
      const tooltip = d3.select(initiativeChartElement)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "var(--background-card)")
        .style("border", "1px solid var(--border-color)")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("pointer-events", "none")
        .style("z-index", "10");
      
      // Add axis titles
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("fill", getCSSVariable('--text-primary'))
        .text("Timeline");
      
      // Add legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 180}, -30)`);
      
      Object.entries(colors).forEach(([type, color], i) => {
        legend.append("circle")
          .attr("cx", 5)
          .attr("cy", i * 20)
          .attr("r", 5)
          .attr("fill", color);
        
        legend.append("text")
          .attr("x", 15)
          .attr("y", i * 20 + 4)
          .text(type)
          .attr("font-size", "10px");
      });
    }
    
    // Function to create body site chart
    function createBodySiteChart() {
      // Clear previous chart
      d3.select(bodySiteChartElement).selectAll("*").remove();
      
      // Set dimensions and margins
      const margin = { top: 40, right: 30, bottom: 60, left: 50 };
      const width = bodySiteChartElement.clientWidth - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;
      
      // Get data for body sites
      const bodySiteData = timelineData.samplesByBodySite;
      const years = Object.keys(bodySiteData);
      const bodySites = Object.keys(bodySiteData[years[0]]);
      
      // Create SVG
      const svg = d3.select(bodySiteChartElement)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Define scales
      const x = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.3);
      
      const xSubgroup = d3.scaleBand()
        .domain(bodySites)
        .range([0, x.bandwidth()])
        .padding(0.05);
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(years, year => d3.max(bodySites, site => bodySiteData[year][site])) * 1.2])
        .range([height, 0]);
      
      // Color scale
      const color = d3.scaleOrdinal()
        .domain(bodySites)
        .range([
          getCSSVariable('--chart-color-1'),
          getCSSVariable('--chart-color-2'),
          getCSSVariable('--chart-color-3'),
          getCSSVariable('--chart-color-4'),
          getCSSVariable('--chart-color-5'),
          getCSSVariable('--chart-color-6'),
          getCSSVariable('--chart-color-7'),
          getCSSVariable('--chart-color-8')
        ]);
      
      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
      
      // Add Y axis
      svg.append("g")
        .call(d3.axisLeft(y).ticks(5));
      
      // Add bars
      years.forEach(year => {
        bodySites.forEach(site => {
          svg.append("rect")
            .attr("x", x(year) + xSubgroup(site))
            .attr("y", y(bodySiteData[year][site]))
            .attr("width", xSubgroup.bandwidth())
            .attr("height", height - y(bodySiteData[year][site]))
            .attr("fill", color(site));
        });
      });
      
      // Add the current year marker
      if (years.includes(currentYear.toString())) {
        svg.append("line")
          .attr("x1", x(currentYear.toString()) + x.bandwidth() / 2)
          .attr("y1", 0)
          .attr("x2", x(currentYear.toString()) + x.bandwidth() / 2)
          .attr("y2", height)
          .attr("stroke", getCSSVariable('--danger-color'))
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
      }
      
      // Add axis titles
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("fill", getCSSVariable('--text-primary'))
        .text("Year");
      
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .attr("fill", getCSSVariable('--text-primary'))
        .text("Number of Samples");
      
      // Add legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, -30)`);
      
      bodySites.forEach((site, i) => {
        // Split legend into two columns if too many items
        const column = i < 4 ? 0 : 1;
        const row = i < 4 ? i : i - 4;
        
        legend.append("rect")
          .attr("x", column * 80)
          .attr("y", row * 20)
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", color(site));
        
        legend.append("text")
          .attr("x", column * 80 + 15)
          .attr("y", row * 20 + 9)
          .text(site)
          .attr("font-size", "9px");
      });
    }
    
    // Cleanup function
    return () => {
      if (quarterlyChartElement) {
        d3.select(quarterlyChartElement).selectAll("*").remove();
      }
      if (yearlyChartElement) {
        d3.select(yearlyChartElement).selectAll("*").remove();
      }
      if (initiativeChartElement) {
        d3.select(initiativeChartElement).selectAll("*").remove();
      }
      if (bodySiteChartElement) {
        d3.select(bodySiteChartElement).selectAll("*").remove();
      }
    };
  }, [timelineData, currentYear, currentQuarter]);
  
  // Timeline view toggle handler
  const handleViewChange = (view) => {
    setTimelineView(view);
  };
  
  // Get current status from the data
  const getCurrentProjectCounts = () => {
    if (!timelineData) return { ongoing: 0, complete: 0, total: 0 };
    
    const currentYearData = timelineData.projectionsByYear.find(item => item.year === currentYear);
    const quarterData = timelineData.projectsByQuarter[timelineData.projectsByQuarter.length - 1];
    
    return {
      ongoing: currentYearData?.ongoing || quarterData?.ongoing || 0,
      complete: currentYearData?.complete || quarterData?.complete || 0,
      total: (currentYearData?.ongoing || quarterData?.ongoing || 0) + 
             (currentYearData?.complete || quarterData?.complete || 0)
    };
  };
  
  const { ongoing, complete, total } = getCurrentProjectCounts();
  
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Project Timeline</h2>
        <p className="subtitle">Project status and sample collection progress over time</p>
      </div>
      
      {loading ? (
        <div className="loading-message">
          <p>Loading timeline data...</p>
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
              <div className="stat-value">{ongoing}</div>
              <p>{total ? Math.round((ongoing / total) * 100) : 0}% of total</p>
            </div>
            
            <div className="stat-card">
              <h3>Completed Projects</h3>
              <div className="stat-value">{complete}</div>
              <p>{total ? Math.round((complete / total) * 100) : 0}% of total</p>
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
                  className={timelineView === 'quarterly' ? 'active' : ''} 
                  onClick={() => handleViewChange('quarterly')}>
                  Quarterly Progress
                </button>
                <button 
                  className={timelineView === 'yearly' ? 'active' : ''} 
                  onClick={() => handleViewChange('yearly')}>
                  Yearly Projections
                </button>
                <button 
                  className={timelineView === 'initiatives' ? 'active' : ''} 
                  onClick={() => handleViewChange('initiatives')}>
                  Initiative Milestones
                </button>
              </div>
            </div>
          </div>
          
          {timelineView === 'quarterly' && (
            <div className="timeline-container">
              <h3>Project Status by Quarter (2024-2025)</h3>
              <div className="chart-container" ref={quarterlyChartRef}></div>
              <div className="data-table-mini">
                <table className="timeline-table">
                  <thead>
                    <tr>
                      <th>Quarter</th>
                      <th>Ongoing</th>
                      <th>Completed</th>
                      <th>Total</th>
                      <th>Samples Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timelineData.projectsByQuarter.map(item => (
                      <tr key={item.quarter}>
                        <td>{item.quarter}</td>
                        <td>{item.ongoing}</td>
                        <td>{item.complete}</td>
                        <td>{item.ongoing + item.complete}</td>
                        <td>{item.samplesCollected.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {timelineView === 'yearly' && (
            <div className="timeline-container">
              <h3>Yearly Projections (2024-2028)</h3>
              <div className="chart-container" ref={yearlyChartRef}></div>
              <div className="data-table-mini">
                <table className="timeline-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Projected Ongoing</th>
                      <th>Projected Completed</th>
                      <th>Total Projects</th>
                      <th>Projected Samples</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timelineData.projectionsByYear.map(item => (
                      <tr key={item.year}>
                        <td>{item.year}</td>
                        <td>{item.ongoing}</td>
                        <td>{item.complete}</td>
                        <td>{item.ongoing + item.complete}</td>
                        <td>{item.samplesCollected.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {timelineView === 'initiatives' && (
            <div className="timeline-container">
              <h3>Initiative Milestones (2024-2025)</h3>
              <div className="chart-container milestone-chart" ref={initiativeChartRef}></div>
              <div className="initiative-table-container">
                {timelineData.initiativeTimeline.map(initiative => (
                  <div key={initiative.type} className="initiative-section">
                    <h4>{initiative.type}</h4>
                    <table className="timeline-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Milestone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {initiative.events.map((event, index) => (
                          <tr key={`${initiative.type}-${index}`}>
                            <td>{event.date}</td>
                            <td>{event.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="chart-grid">
            <div className="chart-card">
              <h3>Sample Collection by Body Site</h3>
              <div className="chart-container" ref={bodySiteChartRef}></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LiveProjectTimeline;