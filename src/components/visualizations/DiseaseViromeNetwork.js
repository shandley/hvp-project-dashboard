import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import './Visualization.css';
import './DiseaseViromeNetwork.css';
import ExportDataButton from '../ExportDataButton';

/**
 * DiseaseViromeNetwork Component
 * 
 * A force-directed graph visualization showing relationships between diseases 
 * and their associated virome changes and biomarkers.
 */
function DiseaseViromeNetwork() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [, setZoomLevel] = useState(1);
  const [networkMode, setNetworkMode] = useState('full'); // 'full', 'simple', 'biomarkers'
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  
  const networkRef = useRef(null);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  
  // Load network data
  useEffect(() => {
    console.log('DiseaseViromeNetwork: Loading data...');
    console.log('URL path:', `${process.env.PUBLIC_URL}/data/disease-virome-network.json`);
    
    fetch(`${process.env.PUBLIC_URL}/data/disease-virome-network.json`)
      .then(response => {
        console.log('DiseaseViromeNetwork: Response received', response.status);
        if (!response.ok) {
          throw new Error(`Failed to load disease-virome network data: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('DiseaseViromeNetwork: Data loaded successfully', data);
        setNetworkData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading disease-virome network data:', err);
        setError(`Failed to load network data: ${err.message}`);
        setLoading(false);
      });
  }, []);
  
  // Process data for visualization
  const processNetworkData = useCallback((data, mode) => {
    if (!data) return { nodes: [], links: [] };
    
    const nodes = [];
    const links = [];
    const diseaseNodes = new Map();
    const viromeChangeNodes = new Map();
    const biomarkerNodes = new Map();
    
    // Process each disease-virome association
    data.diseaseViromeAssociations.forEach((association, index) => {
      // Add disease node if it doesn't exist yet
      if (!diseaseNodes.has(association.disease)) {
        const diseaseNode = {
          id: `disease-${index}`,
          name: association.disease,
          type: 'disease',
          category: association.category,
          color: data.diseaseCategories[association.category]?.color || '#999',
          references: association.references,
          index: nodes.length
        };
        nodes.push(diseaseNode);
        diseaseNodes.set(association.disease, diseaseNode);
      }
      
      // Add virome change node
      const viromeChangeId = `virome-${index}`;
      const viromeChangeNode = {
        id: viromeChangeId,
        name: association.viromeChanges,
        type: 'virome_change',
        index: nodes.length
      };
      nodes.push(viromeChangeNode);
      viromeChangeNodes.set(viromeChangeId, viromeChangeNode);
      
      // Add link between disease and virome change
      links.push({
        source: diseaseNodes.get(association.disease).id,
        target: viromeChangeId,
        type: 'association'
      });
      
      // Add biomarker node and link if displaying full or biomarker network
      if (mode !== 'simple' && association.biomarkers) {
        const biomarkerId = `biomarker-${index}`;
        const biomarkerNode = {
          id: biomarkerId,
          name: association.biomarkers,
          type: 'biomarker',
          index: nodes.length
        };
        nodes.push(biomarkerNode);
        biomarkerNodes.set(biomarkerId, biomarkerNode);
        
        // Link biomarker to both disease and virome change
        links.push({
          source: biomarkerId,
          target: diseaseNodes.get(association.disease).id,
          type: 'indicates'
        });
        
        if (mode === 'full') {
          links.push({
            source: biomarkerId,
            target: viromeChangeId,
            type: 'indicates'
          });
        }
      }
    });
    
    return { nodes, links };
  }, []);
  
  // Create the force-directed graph visualization
  const createNetworkVisualization = useCallback(() => {
    if (!networkData || !networkRef.current) return;
    
    // Get container dimensions
    const container = networkRef.current;
    const { width } = container.getBoundingClientRect();
    const height = 600;
    
    // Process data based on display mode
    const { nodes, links } = processNetworkData(networkData, networkMode);
    
    if (nodes.length === 0) {
      d3.select(container).html('<div class="error-message">No network data available</div>');
      return;
    }
    
    // Clear previous visualization
    d3.select(container).selectAll('*').remove();
    
    // Set up SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'network-svg');
    
    svgRef.current = svg.node();
    
    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        setZoomLevel(event.transform.k);
        networkGroup.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Create container for all network elements with initial zoom transform
    const networkGroup = svg.append('g')
      .attr('class', 'network-group');
    
    // Apply search highlighting if needed
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const matchingNodeIds = nodes
        .filter(node => node.name.toLowerCase().includes(lowerQuery))
        .map(node => node.id);
      
      setHighlightedNodes(matchingNodeIds);
    } else {
      setHighlightedNodes([]);
    }
    
    // Define link strength and distance based on network mode
    const linkStrength = networkMode === 'simple' ? 0.2 : 0.1;
    const linkDistance = networkMode === 'simple' ? 150 : 180;
    
    // Set initial positions for nodes to avoid initial jumpy behavior
    nodes.forEach((node, i) => {
      if (!node.x || !node.y) {
        const angle = (i / nodes.length) * 2 * Math.PI;
        const radius = Math.min(width, height) * 0.3;
        node.x = width / 2 + radius * Math.cos(angle);
        node.y = height / 2 + radius * Math.sin(angle);
      }
      // Pre-compute fx and fy for fixed nodes (maintained during simulation)
      if (node.fixed) {
        node.fx = node.x;
        node.fy = node.y;
      }
    });
    
    // Create force simulation with reduced forces and increased alpha decay
    const simulation = d3.forceSimulation(nodes)
      .alphaDecay(0.028) // Increased decay for quicker settling
      .alphaMin(0.001)   // Lower minimum threshold
      .velocityDecay(0.4) // Increased velocity decay to reduce jitter
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .strength(linkStrength)
        .distance(linkDistance))
      .force('charge', d3.forceManyBody()
        .strength(-200)
        .distanceMax(300)) // Limit the distance of charge effect
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30).strength(0.8)); // Stronger collision prevention
    
    simulationRef.current = simulation;
    
    // Create links
    const link = networkGroup.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', d => `link ${d.type}`)
      .attr('stroke', d => d.type === 'indicates' ? 'var(--chart-color-5)' : 'var(--chart-color-2)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => d.type === 'indicates' ? '5,5' : null);
    
    // Create node groups
    const node = networkGroup.append('g')
      .attr('class', 'nodes')
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', d => `node ${d.type} ${highlightedNodes.includes(d.id) ? 'highlighted' : ''}`)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        setSelectedNode(d === selectedNode ? null : d);
        event.stopPropagation();
      });
    
    // Add circles to nodes
    node.append('circle')
      .attr('r', d => d.type === 'disease' ? 12 : 8)
      .attr('fill', d => {
        if (d.type === 'disease') return d.color;
        if (d.type === 'virome_change') return 'var(--chart-color-1)';
        return 'var(--chart-color-5)';
      })
      .attr('stroke', 'var(--background-card)')
      .attr('stroke-width', 1.5);
    
    // Add icons based on node type
    node.append('text')
      .attr('class', 'node-icon')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-family', 'sans-serif')
      .attr('font-size', d => d.type === 'disease' ? '10px' : '8px')
      .attr('fill', 'var(--text-inverted)')
      .text(d => {
        if (d.type === 'disease') return 'D';
        if (d.type === 'virome_change') return 'V';
        return 'B';
      });
    
    // Add labels to nodes
    node.append('text')
      .attr('class', 'node-label')
      .attr('x', d => d.type === 'disease' ? 15 : 10)
      .attr('y', 5)
      .attr('text-anchor', 'start')
      .text(d => truncateText(d.name, 25))
      .attr('opacity', d => highlightedNodes.length > 0 ? 
        (highlightedNodes.includes(d.id) ? 1 : 0.3) : 1);
    
    // Create a separate tooltip element that's always available
    const tooltip = d3.select(container)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
    
    // Add mouse events for tooltips and highlighting with debouncing
    node.on('mouseover', function(event, d) {
      // Show tooltip
      tooltip
        .style('left', `${event.pageX - container.getBoundingClientRect().left + 15}px`)
        .style('top', `${event.pageY - container.getBoundingClientRect().top}px`)
        .html(`<strong>${d.name}</strong><br/>${d.type.replace('_', ' ')}`)
        .transition()
        .duration(200)
        .style('opacity', 1);
      
      // Highlight connected nodes
      highlightConnections(d, true);
    })
    .on('mousemove', function(event) {
      // Update tooltip position
      tooltip
        .style('left', `${event.pageX - container.getBoundingClientRect().left + 15}px`)
        .style('top', `${event.pageY - container.getBoundingClientRect().top}px`);
    })
    .on('mouseout', function(event, d) {
      // Hide tooltip
      tooltip.transition()
        .duration(200)
        .style('opacity', 0);
      
      // Remove highlight
      highlightConnections(d, false);
    });
    
    // Update node and link positions on each tick
    simulation.on('tick', () => {
      // Keep nodes within the bounds
      nodes.forEach(d => {
        d.x = Math.max(20, Math.min(width - 20, d.x));
        d.y = Math.max(20, Math.min(height - 20, d.y));
      });
      
      // Update link positions
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      // Update node positions
      node
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
    
    // Dragging functions with improved behavior
    function dragstarted(event, d) {
      // Stop the simulation during drag for more responsive interaction
      simulation.alphaTarget(0).stop();
      
      d.fx = d.x;
      d.fy = d.y;
      
      // Apply "dragging" class to indicate active dragging state
      d3.select(this).classed("dragging", true);
    }
    
    function dragged(event, d) {
      // For better dragging experience, update position directly
      d.fx = Math.max(20, Math.min(width - 20, event.x));
      d.fy = Math.max(20, Math.min(height - 20, event.y));
      
      // Move the node immediately during drag without simulation
      d3.select(this).attr("transform", `translate(${d.fx}, ${d.fy})`);
      
      // Update connected links during drag for immediate feedback
      link
        .filter(l => l.source === d || l.target === d)
        .attr('x1', l => l.source === d ? d.fx : l.source.x)
        .attr('y1', l => l.source === d ? d.fy : l.source.y)
        .attr('x2', l => l.target === d ? d.fx : l.target.x)
        .attr('y2', l => l.target === d ? d.fy : l.target.y);
    }
    
    function dragended(event, d) {
      // Remove dragging class
      d3.select(this).classed("dragging", false);
      
      // When drag ends, keep node position fixed for networks with many nodes
      if (nodes.length > 20) {
        // Keep position fixed
        d.fixed = true;
      } else {
        // For smaller networks, release nodes to allow settling
        d.fx = null;
        d.fy = null;
        d.fixed = false;
      }
      
      // Restart the simulation with reduced alpha
      simulation.alphaTarget(0.05).restart();
      
      // Then decrease alpha to 0 after a short time to let nodes settle
      setTimeout(() => {
        simulation.alphaTarget(0);
      }, 300);
    }
    
    // Function to highlight connected nodes and links
    function highlightConnections(node, highlight) {
      const connected = new Set();
      connected.add(node.id);
      
      // Find directly connected nodes
      links.forEach(link => {
        if (link.source.id === node.id) {
          connected.add(link.target.id);
        } else if (link.target.id === node.id) {
          connected.add(link.source.id);
        }
      });
      
      // Highlight/unhighlight nodes with transition for smoother effect
      d3.selectAll('.node')
        .transition()
        .duration(200)
        .style('opacity', highlight ? d => connected.has(d.id) ? 1 : 0.3 : 1)
        .select('circle')
        .style('stroke-width', d => highlight && connected.has(d.id) ? 2.5 : 1.5);
      
      // Highlight/unhighlight links
      d3.selectAll('line')
        .transition()
        .duration(200)
        .style('opacity', highlight ? d => 
          connected.has(d.source.id) && connected.has(d.target.id) ? 1 : 0.1 : 0.6);
    }
    
    // Update labels visibility on initial render
    d3.selectAll('.node-label')
      .style('display', 'block');
    
    // Run simulation with higher alpha for initial positioning
    simulation
      .alpha(1)
      .restart();
    
    // After initial positioning has settled, reduce forces for stability
    setTimeout(() => {
      simulation.alpha(0.1).restart();
    }, 1500);
    
    // Initial zoom reset to fit network in view
    resetZoom();
  }, [networkData, networkMode, searchQuery, highlightedNodes, processNetworkData, selectedNode]);
  
  // Handle window resize
  useEffect(() => {
    function handleResize() {
      createNetworkVisualization();
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Clean up simulation
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [createNetworkVisualization]);
  
  // Create/update visualization when data or display options change
  useEffect(() => {
    if (!loading && networkData) {
      createNetworkVisualization();
    }
  }, [loading, networkData, networkMode, searchQuery, createNetworkVisualization]);
  
  // Truncate text to a specific length
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  
  // Handle zoom control
  const handleZoom = (direction) => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const currentZoom = d3.zoomTransform(svg.node());
    
    const newScale = direction === 'in' 
      ? currentZoom.k * 1.3 
      : currentZoom.k / 1.3;
      
    const newZoom = d3.zoomIdentity
      .translate(currentZoom.x, currentZoom.y)
      .scale(newScale);
    
    svg.transition().duration(300).call(d3.zoom().transform, newZoom);
    setZoomLevel(newScale);
  };
  
  // Reset zoom to fit network in view
  const resetZoom = () => {
    if (!svgRef.current || !networkRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width, height } = networkRef.current.getBoundingClientRect();
    
    svg.transition().duration(750).call(
      d3.zoom().transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8)
    );
    
    setZoomLevel(0.8);
  };
  
  // Handle network mode change
  const handleNetworkModeChange = (mode) => {
    setNetworkMode(mode);
    setSelectedNode(null);
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Export data formatted for CSV/JSON
  const getExportData = () => {
    if (!networkData) return [];
    
    // Format data for export
    return networkData.diseaseViromeAssociations.map(association => ({
      Disease: association.disease,
      Category: association.category,
      ViromeChanges: association.viromeChanges,
      Biomarkers: association.biomarkers,
      References: association.references
    }));
  };
  
  if (loading) {
    return (
      <div className="visualization-container loading-message">
        <p>Loading disease-virome network data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="visualization-container error-message">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h2>Disease-Virome Network</h2>
        <p className="subtitle">Relationships between diseases and virome changes</p>
        <div className="visualization-actions">
          <ExportDataButton
            data={getExportData()}
            filename="disease-virome-network"
            visualizationRef={networkRef}
            exportOptions={['csv', 'json', 'png', 'print']}
          />
        </div>
      </div>
      
      <div className="network-controls">
        <div className="control-group">
          <label>Display Mode: </label>
          <div className="button-group">
            <button 
              className={networkMode === 'full' ? 'active' : ''} 
              onClick={() => handleNetworkModeChange('full')}
              title="Show diseases, virome changes, and biomarkers with all connections"
            >
              Full Network
            </button>
            <button 
              className={networkMode === 'simple' ? 'active' : ''} 
              onClick={() => handleNetworkModeChange('simple')}
              title="Show simplified network with only disease-virome connections"
            >
              Simple Network
            </button>
            <button 
              className={networkMode === 'biomarkers' ? 'active' : ''} 
              onClick={() => handleNetworkModeChange('biomarkers')}
              title="Focus on biomarker relationships"
            >
              Biomarkers
            </button>
          </div>
        </div>
        
        <div className="control-group">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button 
                className="clear-search" 
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="zoom-controls">
          <button onClick={() => handleZoom('in')} title="Zoom in">+</button>
          <button onClick={resetZoom} title="Reset zoom">⟲</button>
          <button onClick={() => handleZoom('out')} title="Zoom out">-</button>
        </div>
      </div>
      
      <div className="network-container">
        <div className="network-visualization" ref={networkRef}></div>
        
        {selectedNode && (
          <div className="network-details">
            <h3>{selectedNode.name}</h3>
            <p className="node-type">
              <span className="node-type-label">Type:</span>
              <span className="node-type-value">
                {selectedNode.type.replace('_', ' ')}
              </span>
            </p>
            
            {selectedNode.type === 'disease' && (
              <>
                <p className="node-category">
                  <span className="node-category-label">Category:</span>
                  <span 
                    className="node-category-value"
                    style={{ backgroundColor: selectedNode.color }}
                  >
                    {selectedNode.category}
                  </span>
                </p>
                <p className="node-references">
                  <span className="node-references-label">References:</span>
                  <span className="node-references-value">{selectedNode.references}</span>
                </p>
              </>
            )}
            
            <p className="node-connections">
              <strong>Connected to:</strong>
            </p>
            <ul className="connection-list">
              {networkData.diseaseViromeAssociations
                .filter(assoc => {
                  if (selectedNode.type === 'disease') {
                    return assoc.disease === selectedNode.name;
                  }
                  if (selectedNode.type === 'virome_change') {
                    return assoc.viromeChanges === selectedNode.name;
                  }
                  if (selectedNode.type === 'biomarker') {
                    return assoc.biomarkers === selectedNode.name;
                  }
                  return false;
                })
                .map((assoc, index) => (
                  <li key={index}>
                    {selectedNode.type === 'disease' && (
                      <>
                        <span className="connection-type virome_change">Virome Change:</span>
                        <span className="connection-name">{assoc.viromeChanges}</span>
                        
                        {assoc.biomarkers && networkMode !== 'simple' && (
                          <>
                            <br/>
                            <span className="connection-type biomarker">Biomarker:</span>
                            <span className="connection-name">{assoc.biomarkers}</span>
                          </>
                        )}
                      </>
                    )}
                    
                    {selectedNode.type === 'virome_change' && (
                      <>
                        <span className="connection-type disease">Disease:</span>
                        <span className="connection-name">{assoc.disease}</span>
                        
                        {assoc.biomarkers && networkMode === 'full' && (
                          <>
                            <br/>
                            <span className="connection-type biomarker">Biomarker:</span>
                            <span className="connection-name">{assoc.biomarkers}</span>
                          </>
                        )}
                      </>
                    )}
                    
                    {selectedNode.type === 'biomarker' && (
                      <>
                        <span className="connection-type disease">Disease:</span>
                        <span className="connection-name">{assoc.disease}</span>
                        
                        {networkMode === 'full' && (
                          <>
                            <br/>
                            <span className="connection-type virome_change">Virome Change:</span>
                            <span className="connection-name">{assoc.viromeChanges}</span>
                          </>
                        )}
                      </>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="network-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: 'var(--chart-color-2)'}}></span>
            <span className="legend-line"></span>
            <span className="legend-label">Disease — Virome Change</span>
          </div>
          <div className="legend-item">
            <span className="legend-color dashed" style={{backgroundColor: 'var(--chart-color-5)'}}></span>
            <span className="legend-line dashed"></span>
            <span className="legend-label">Biomarker Relationship</span>
          </div>
        </div>
        
        <div className="legend-items node-types">
          <div className="legend-item">
            <span className="legend-node disease-node">D</span>
            <span className="legend-label">Disease</span>
          </div>
          <div className="legend-item">
            <span className="legend-node virome-node">V</span>
            <span className="legend-label">Virome Change</span>
          </div>
          <div className="legend-item">
            <span className="legend-node biomarker-node">B</span>
            <span className="legend-label">Biomarker</span>
          </div>
        </div>
        
        <div className="disease-categories">
          <h5>Disease Categories</h5>
          <div className="category-items">
            {networkData && Object.entries(networkData.diseaseCategories).map(([category, info]) => (
              <div className="category-item" key={category}>
                <span className="category-color" style={{backgroundColor: info.color}}></span>
                <span className="category-label">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiseaseViromeNetwork;