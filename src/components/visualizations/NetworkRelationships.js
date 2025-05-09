import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import './Visualization.css';

/**
 * Network Relationships Visualization Component
 * 
 * Displays interconnections between institutions, research focus areas, and cohorts
 * using D3.js force-directed graph visualizations.
 */
function NetworkRelationships({ data, filters }) {
  // 1. Declare all hooks at the top level
  const [hasData, setHasData] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relationshipType, setRelationshipType] = useState('institution-research');
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Refs for D3.js visualizations
  const networkChartRef = useRef(null);
  
  // 2. Check if data is available
  useEffect(() => {
    if (!data || !data.projects) {
      setHasData(false);
      setLoading(false);
    } else {
      setHasData(true);
      setLoading(false);
    }
  }, [data]);
  
  // 3. Process data with useMemo
  const processedData = useMemo(() => {
    if (!hasData) {
      return { 
        institutions: {},
        researchFocus: {},
        bodySites: {},
        cohorts: {},
        relationships: {},
        filteredProjects: []
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
    
    // Extract institutions
    const institutions = {};
    filteredProjects.forEach(project => {
      const institution = project['Institution'];
      if (!institutions[institution]) {
        institutions[institution] = {
          count: 0,
          projects: [],
          type: 'institution'
        };
      }
      institutions[institution].count += 1;
      institutions[institution].projects.push(project);
    });
    
    // Extract research focus areas
    const researchFocus = {};
    filteredProjects.forEach(project => {
      const focus = project['Primary Research Focus'];
      if (!researchFocus[focus]) {
        researchFocus[focus] = {
          count: 0,
          projects: [],
          type: 'research'
        };
      }
      researchFocus[focus].count += 1;
      researchFocus[focus].projects.push(project);
    });
    
    // Extract body sites
    const bodySites = {};
    filteredProjects.forEach(project => {
      const bodySiteList = project['Body Site Category'].split('/');
      bodySiteList.forEach(site => {
        const trimmedSite = site.trim();
        if (!bodySites[trimmedSite]) {
          bodySites[trimmedSite] = {
            count: 0,
            projects: [],
            type: 'bodysite'
          };
        }
        bodySites[trimmedSite].count += 1;
        bodySites[trimmedSite].projects.push(project);
      });
    });
    
    // Extract cohorts
    const cohorts = {};
    filteredProjects.forEach(project => {
      const cohort = project['Cohort Name'];
      if (!cohorts[cohort]) {
        cohorts[cohort] = {
          count: 0,
          projects: [],
          institution: project['Institution'],
          type: 'cohort'
        };
      }
      cohorts[cohort].count += 1;
      cohorts[cohort].projects.push(project);
    });
    
    return {
      institutions,
      researchFocus,
      bodySites,
      cohorts,
      filteredProjects
    };
  }, [data, filters, hasData]);
  
  // 4. Create network graph data structure based on selected relationship type
  const networkData = useMemo(() => {
    if (!hasData) return { nodes: [], links: [] };
    
    let nodes = [];
    let links = [];
    
    if (relationshipType === 'institution-research') {
      // Nodes: Institutions and Research Focus Areas
      nodes = [
        ...Object.entries(processedData.institutions).map(([name, data]) => ({
          id: `inst-${name}`,
          name,
          value: data.count,
          type: 'institution',
          projects: data.projects
        })),
        ...Object.entries(processedData.researchFocus).map(([name, data]) => ({
          id: `research-${name}`,
          name,
          value: data.count,
          type: 'research',
          projects: data.projects
        }))
      ];
      
      // Links: Connect institutions to research focus areas
      processedData.filteredProjects.forEach(project => {
        const institution = project['Institution'];
        const research = project['Primary Research Focus'];
        
        // Check if already added to avoid duplicates
        const existingLink = links.find(link => 
          (link.source === `inst-${institution}` && link.target === `research-${research}`) ||
          (link.source === `research-${research}` && link.target === `inst-${institution}`)
        );
        
        if (!existingLink) {
          links.push({
            source: `inst-${institution}`,
            target: `research-${research}`,
            value: 1,
            projects: [project]
          });
        } else {
          existingLink.value += 1;
          existingLink.projects.push(project);
        }
      });
    } else if (relationshipType === 'institution-bodysite') {
      // Nodes: Institutions and Body Sites
      nodes = [
        ...Object.entries(processedData.institutions).map(([name, data]) => ({
          id: `inst-${name}`,
          name,
          value: data.count,
          type: 'institution',
          projects: data.projects
        })),
        ...Object.entries(processedData.bodySites).map(([name, data]) => ({
          id: `bodysite-${name}`,
          name,
          value: data.count,
          type: 'bodysite',
          projects: data.projects
        }))
      ];
      
      // Links: Connect institutions to body sites
      processedData.filteredProjects.forEach(project => {
        const institution = project['Institution'];
        const bodySites = project['Body Site Category'].split('/');
        
        bodySites.forEach(site => {
          const trimmedSite = site.trim();
          
          // Check if already added to avoid duplicates
          const existingLink = links.find(link => 
            (link.source === `inst-${institution}` && link.target === `bodysite-${trimmedSite}`) ||
            (link.source === `bodysite-${trimmedSite}` && link.target === `inst-${institution}`)
          );
          
          if (!existingLink) {
            links.push({
              source: `inst-${institution}`,
              target: `bodysite-${trimmedSite}`,
              value: 1,
              projects: [project]
            });
          } else {
            existingLink.value += 1;
            existingLink.projects.push(project);
          }
        });
      });
    } else if (relationshipType === 'cohort-research') {
      // Nodes: Cohorts and Research Focus Areas
      nodes = [
        ...Object.entries(processedData.cohorts).map(([name, data]) => ({
          id: `cohort-${name}`,
          name,
          value: data.count,
          type: 'cohort',
          institution: data.institution,
          projects: data.projects
        })),
        ...Object.entries(processedData.researchFocus).map(([name, data]) => ({
          id: `research-${name}`,
          name,
          value: data.count,
          type: 'research',
          projects: data.projects
        }))
      ];
      
      // Links: Connect cohorts to research focus areas
      processedData.filteredProjects.forEach(project => {
        const cohort = project['Cohort Name'];
        const research = project['Primary Research Focus'];
        
        // Check if already added to avoid duplicates
        const existingLink = links.find(link => 
          (link.source === `cohort-${cohort}` && link.target === `research-${research}`) ||
          (link.source === `research-${research}` && link.target === `cohort-${cohort}`)
        );
        
        if (!existingLink) {
          links.push({
            source: `cohort-${cohort}`,
            target: `research-${research}`,
            value: 1,
            projects: [project]
          });
        } else {
          existingLink.value += 1;
          existingLink.projects.push(project);
        }
      });
    }
    
    return { nodes, links };
  }, [hasData, processedData, relationshipType]);
  
  // 5. Create or update the force-directed graph visualization
  useEffect(() => {
    if (!hasData || !networkChartRef.current) return;
    
    const { nodes, links } = networkData;
    
    // Clear previous chart
    d3.select(networkChartRef.current).selectAll("*").remove();
    
    // Define dimensions
    const width = networkChartRef.current.clientWidth;
    const height = 400;
    
    // Create SVG
    const svg = d3.select(networkChartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");
    
    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "network-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "10px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
      .style("z-index", "10");
    
    // Node colors by type
    const colorScale = d3.scaleOrdinal()
      .domain(['institution', 'research', 'bodysite', 'cohort'])
      .range(['#4e79a7', '#f28e2c', '#e15759', '#76b7b2']);
    
    // Create a force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => Math.sqrt(d.value) * 2 + 10));
    
    // Create links
    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));
    
    // Create nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => Math.sqrt(d.value) * 2 + 5)
      .attr("fill", d => colorScale(d.type))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(drag(simulation))
      .on("mouseover", function(event, d) {
        // Show tooltip on mouseover
        tooltip
          .style("visibility", "visible")
          .html(`
            <div>
              <strong>${d.name}</strong>
              <p>${d.type === 'institution' ? 'Institution' : 
                  d.type === 'research' ? 'Research Focus' : 
                  d.type === 'bodysite' ? 'Body Site' : 'Cohort'}</p>
              <p>Projects: ${d.projects.length}</p>
              ${d.institution ? `<p>Institution: ${d.institution}</p>` : ''}
            </div>
          `);
          
        // Highlight connected nodes
        link
          .attr("stroke-opacity", o => (o.source.id === d.id || o.target.id === d.id ? 1 : 0.2))
          .attr("stroke", o => (o.source.id === d.id || o.target.id === d.id ? "#999" : "#ddd"));
          
        node
          .attr("opacity", o => (isConnected(d, o) ? 1 : 0.2));
          
        d3.select(this)
          .attr("stroke", "#000")
          .attr("stroke-width", 2)
          .raise();
      })
      .on("mousemove", function(event) {
        // Position the tooltip near the mouse
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        // Hide tooltip and reset highlighting
        tooltip.style("visibility", "hidden");
        
        link
          .attr("stroke-opacity", 0.6)
          .attr("stroke", "#999");
          
        node
          .attr("opacity", 1)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);
      })
      .on("click", function(event, d) {
        setSelectedNode(prev => prev === d ? null : d);
      });
    
    // Add node labels
    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("dy", 15)
      .text(d => {
        // Keep labels concise to prevent too much text in the visualization
        return truncateText(d.name, 15);
      })
      .style("pointer-events", "none")
      .style("opacity", 0.8);
    
    // Update node, link, and label positions on each simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node
        .attr("cx", d => d.x = Math.max(10, Math.min(width - 10, d.x)))
        .attr("cy", d => d.y = Math.max(10, Math.min(height - 10, d.y)));
      
      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });
    
    // Function to implement drag behavior
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
    // Helper function to check if two nodes are connected by a link
    function isConnected(a, b) {
      if (a.id === b.id) return true;
      return links.some(link => 
        (link.source.id === a.id && link.target.id === b.id) || 
        (link.source.id === b.id && link.target.id === a.id)
      );
    }
    
    // Create legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(20, 20)`);
    
    const legendData = [
      { type: 'institution', label: 'Institution' },
      { type: 'research', label: 'Research Focus' },
      { type: relationshipType.includes('bodysite') ? 'bodysite' : 'cohort', 
        label: relationshipType.includes('bodysite') ? 'Body Site' : 'Cohort' }
    ];
    
    legendData.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendItem.append("circle")
        .attr("r", 6)
        .attr("fill", colorScale(item.type));
      
      legendItem.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .text(item.label)
        .style("font-size", "12px");
    });
    
    // Cleanup function
    return () => {
      tooltip.remove();
      simulation.stop();
    };
  }, [networkData, hasData, relationshipType]);
  
  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  
  // Handle relationship type change
  const handleRelationshipTypeChange = (type) => {
    setRelationshipType(type);
    setSelectedNode(null);
  };
  
  // If no data is available
  if (!hasData) {
    return <div className="visualization-container">No data available</div>;
  }
  
  // If loading
  if (loading) {
    return <div className="visualization-container loading-message">Loading network visualization...</div>;
  }
  
  // If error
  if (error) {
    return <div className="visualization-container error-message">{error}</div>;
  }
  
  // Extract various metrics for visualization
  const institutionsCount = Object.keys(processedData.institutions).length;
  const researchFocusCount = Object.keys(processedData.researchFocus).length;
  const bodySitesCount = Object.keys(processedData.bodySites).length;
  const cohortsCount = Object.keys(processedData.cohorts).length;
  
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Relationships & Networks</h2>
        <p className="subtitle">Exploring connections between institutions, research focus areas, and cohorts</p>
      </div>
      
      {/* Network Type Controls */}
      <div className="chart-controls">
        <div className="control-group">
          <label>Network Type:</label>
          <div className="button-group">
            <button 
              className={relationshipType === 'institution-research' ? 'active' : ''}
              onClick={() => handleRelationshipTypeChange('institution-research')}
            >
              Institution - Research Focus
            </button>
            <button 
              className={relationshipType === 'institution-bodysite' ? 'active' : ''}
              onClick={() => handleRelationshipTypeChange('institution-bodysite')}
            >
              Institution - Body Site
            </button>
            <button 
              className={relationshipType === 'cohort-research' ? 'active' : ''}
              onClick={() => handleRelationshipTypeChange('cohort-research')}
            >
              Cohort - Research Focus
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Network Visualization */}
      <div className="chart-container network-chart">
        <h3>
          {relationshipType === 'institution-research' 
            ? 'Institution - Research Focus Network' 
            : relationshipType === 'institution-bodysite' 
              ? 'Institution - Body Site Network'
              : 'Cohort - Research Focus Network'
          }
        </h3>
        <div 
          ref={networkChartRef} 
          className="chart-area"
          style={{ height: '400px', width: '100%' }}
        ></div>
        <div className="chart-info">
          <p>
            This network graph shows relationships between 
            {relationshipType === 'institution-research' 
              ? ` ${institutionsCount} institutions and ${researchFocusCount} research focus areas.` 
              : relationshipType === 'institution-bodysite' 
                ? ` ${institutionsCount} institutions and ${bodySitesCount} body sites.`
                : ` ${cohortsCount} cohorts and ${researchFocusCount} research focus areas.`
            }
          </p>
          <p className="usage-tip">
            <strong>Tip:</strong> Hover over nodes for details. Drag nodes to rearrange the network.
          </p>
        </div>
      </div>
      
      {/* Selected Node Details */}
      {selectedNode && (
        <div className="chart-container selected-node-details">
          <h3>Details: {selectedNode.name}</h3>
          <div className="selected-node-content">
            <div className="node-info">
              <p><strong>Type:</strong> {
                selectedNode.type === 'institution' ? 'Institution' : 
                selectedNode.type === 'research' ? 'Research Focus' : 
                selectedNode.type === 'bodysite' ? 'Body Site' : 'Cohort'
              }</p>
              <p><strong>Projects:</strong> {selectedNode.projects.length}</p>
              {selectedNode.institution && (
                <p><strong>Institution:</strong> {selectedNode.institution}</p>
              )}
            </div>
            <div className="projects-table-wrapper">
              <h4>Related Projects</h4>
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Project ID</th>
                    <th>Contact PI</th>
                    <th>Body Site</th>
                    <th>Participants</th>
                    <th>Samples</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedNode.projects.map(project => (
                    <tr key={project['Project ID']}>
                      <td>{project['Project ID']}</td>
                      <td>{project['Contact PI']}</td>
                      <td>{project['Body Site Category']}</td>
                      <td>{project['Participants']}</td>
                      <td>{project['Samples']}</td>
                      <td>
                        <span className={`status-badge ${project['Status'].toLowerCase()}`}>
                          {project['Status']}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Grid for Metrics */}
      <div className="chart-grid">
        <div className="chart-card">
          <h3>Top Institutions</h3>
          <div className="chart-content">
            <ul>
              {Object.entries(processedData.institutions)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .map(([name, data]) => (
                  <li key={name}>
                    <strong>{name}</strong>: {data.count} projects
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Research Focus Areas</h3>
          <div className="chart-content">
            <ul>
              {Object.entries(processedData.researchFocus)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([name, data]) => (
                  <li key={name}>
                    <strong>{name}</strong>: {data.count} projects
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      </div>
      
      {/* Projects Table */}
      <div className="projects-table-container">
        <h3>Projects by Institution</h3>
        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Project ID</th>
                <th>Contact PI</th>
                <th>Research Focus</th>
                <th>Body Site</th>
                <th>Age Group</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {processedData.filteredProjects
                .sort((a, b) => a['Institution'].localeCompare(b['Institution']))
                .map(project => (
                  <tr key={project['Project ID']}>
                    <td>{project['Institution']}</td>
                    <td>{project['Project ID']}</td>
                    <td>{project['Contact PI']}</td>
                    <td>{project['Primary Research Focus']}</td>
                    <td>{project['Body Site Category']}</td>
                    <td>{project['Age Group Category']}</td>
                    <td>
                      <span className={`status-badge ${project['Status'].toLowerCase()}`}>
                        {project['Status']}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default NetworkRelationships;