import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './ProgramTimeline.css';

/**
 * ProgramTimeline Component
 * 
 * An interactive timeline visualization of the NIH Human Virome Program milestones
 * from planning through completion.
 */
function ProgramTimeline() {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  
  const timelineRef = useRef(null);
  
  // Milestone type colors
  const typeColors = {
    'Planning': 'var(--chart-color-6)', // Yellow
    'Funding': 'var(--chart-color-2)', // Orange
    'Implementation': 'var(--chart-color-4)', // Teal
    'Research': 'var(--chart-color-1)', // Blue
    'Completion': 'var(--chart-color-5)' // Green
  };
  
  // Load timeline data
  useEffect(() => {
    fetch('/data/hvp-program-timeline.json')
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
  
  // Create or update the timeline visualization
  useEffect(() => {
    if (!timelineData || !timelineRef.current) return;
    
    try {
      createTimelineVisualization();
    } catch (err) {
      console.error('Error creating timeline visualization:', err);
      setError('Failed to create timeline visualization.');
    }
    
    // Cleanup function
    return () => {
      if (timelineRef.current) {
        d3.select(timelineRef.current).selectAll('*').remove();
      }
    };
  }, [timelineData, activeFilter]);
  
  // Function to create the D3 timeline visualization
  const createTimelineVisualization = () => {
    const container = timelineRef.current;
    const { width } = container.getBoundingClientRect();
    const height = 300;
    
    // Clear previous chart
    d3.select(container).selectAll('*').remove();
    
    // Parse dates
    const parseTime = d3.timeParse('%Y-%m-%d');
    const milestones = timelineData.milestones.map(d => ({
      ...d,
      parsedDate: parseTime(d.date)
    }));
    
    // Filter milestones if needed
    const filteredMilestones = activeFilter === 'all' 
      ? milestones 
      : milestones.filter(d => d.type === activeFilter);
    
    if (filteredMilestones.length === 0) {
      // Show a message if no milestones match the filter
      d3.select(container)
        .append('div')
        .attr('class', 'no-data-message')
        .text(`No ${activeFilter} milestones found.`);
      return;
    }
    
    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'timeline-svg');
    
    // Define margins
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain([
        d3.min(filteredMilestones, d => d.parsedDate),
        d3.max(filteredMilestones, d => d.parsedDate)
      ])
      .range([0, innerWidth])
      .nice();
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(width > 500 ? 8 : 4)
      .tickFormat(d3.timeFormat('%b %Y'));
    
    // Create a group for the inner content
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Add axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);
    
    // Add timeline line
    g.append('line')
      .attr('class', 'timeline-line')
      .attr('x1', 0)
      .attr('y1', innerHeight / 2)
      .attr('x2', innerWidth)
      .attr('y2', innerHeight / 2)
      .attr('stroke', 'var(--border-color)')
      .attr('stroke-width', 2);
    
    // Add milestone points
    const points = g.selectAll('.milestone-point')
      .data(filteredMilestones)
      .enter()
      .append('g')
      .attr('class', 'milestone-point')
      .attr('transform', d => `translate(${xScale(d.parsedDate)}, ${innerHeight / 2})`)
      .on('click', (event, d) => {
        setSelectedMilestone(d);
      });
    
    // Add milestone circles
    points.append('circle')
      .attr('r', 8)
      .attr('fill', d => typeColors[d.type] || 'var(--text-tertiary)')
      .attr('stroke', 'var(--background-card)')
      .attr('stroke-width', 2)
      .attr('class', d => d.completed ? 'completed' : 'pending');
    
    // Add labels for each milestone
    const labels = points.append('g');
    
    // Position labels alternating above and below the timeline
    labels.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', (d, i) => (i % 2 === 0 ? -40 : 40))
      .attr('stroke', 'var(--border-light)')
      .attr('stroke-width', 1);
    
    labels.append('text')
      .attr('x', 0)
      .attr('y', (d, i) => (i % 2 === 0 ? -45 : 55))
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .text(d => d.milestone)
      .call(wrap, 100);
    
    // Add current date line if within the timeline range
    const today = new Date();
    if (today >= xScale.domain()[0] && today <= xScale.domain()[1]) {
      g.append('line')
        .attr('class', 'today-line')
        .attr('x1', xScale(today))
        .attr('y1', 0)
        .attr('x2', xScale(today))
        .attr('y2', innerHeight)
        .attr('stroke', 'var(--danger-color)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
      
      g.append('text')
        .attr('x', xScale(today))
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', 'var(--danger-color)')
        .text('Today');
    }
    
    // Helper function to wrap text
    function wrap(text, width) {
      text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const y = text.attr("y");
        const x = text.attr("x");
        const dy = parseFloat(text.attr("dy") || 0);
        let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
    }
  };
  
  // Handle filter change
  const handleFilterChange = (type) => {
    setActiveFilter(type);
    setSelectedMilestone(null);
  };
  
  // Filter options based on available milestone types
  const filterOptions = timelineData 
    ? ['all', ...new Set(timelineData.milestones.map(m => m.type))]
    : ['all'];
  
  if (loading) {
    return (
      <div className="timeline-container loading-message">
        <p>Loading timeline data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="timeline-container error-message">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h3>NIH Human Virome Program Timeline</h3>
        <p className="timeline-subtitle">Key milestones from planning to completion</p>
      </div>
      
      <div className="timeline-filters">
        <div className="filter-group">
          <label>Filter by type: </label>
          <div className="button-group">
            {filterOptions.map(type => (
              <button
                key={type}
                className={`filter-button ${activeFilter === type ? 'active' : ''}`}
                onClick={() => handleFilterChange(type)}
                style={
                  type !== 'all' && activeFilter === type
                    ? { backgroundColor: typeColors[type], color: 'var(--text-inverted)' }
                    : {}
                }
              >
                {type === 'all' ? 'All Milestones' : type}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="timeline-visualization" ref={timelineRef}></div>
      
      {selectedMilestone && (
        <div className="milestone-details">
          <h4>{selectedMilestone.milestone}</h4>
          <p className="milestone-date">
            <span className="milestone-label">Date:</span> {selectedMilestone.displayDate}
          </p>
          <p className="milestone-type">
            <span className="milestone-label">Type:</span> 
            <span 
              className="milestone-type-badge"
              style={{ backgroundColor: typeColors[selectedMilestone.type] }}
            >
              {selectedMilestone.type}
            </span>
          </p>
          <p className="milestone-status">
            <span className="milestone-label">Status:</span> 
            <span className={`milestone-status-badge ${selectedMilestone.completed ? 'completed' : 'pending'}`}>
              {selectedMilestone.completed ? 'Completed' : 'Pending'}
            </span>
          </p>
          <p className="milestone-description">{selectedMilestone.description}</p>
        </div>
      )}
      
      <div className="timeline-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: color }}
              ></span>
              <span className="legend-label">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProgramTimeline;