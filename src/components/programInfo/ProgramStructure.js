import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import './ProgramStructure.css';

/**
 * ProgramStructure Component
 * 
 * Displays the organizational chart of the NIH Human Virome Program's
 * governance structure and collaboration mechanisms.
 */
function ProgramStructure() {
  const [structureData, setStructureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('governance'); // 'governance' or 'collaboration'
  const [selectedEntity, setSelectedEntity] = useState(null);
  
  const chartRef = useRef(null);
  
  // Function to create governance organizational chart
  const createGovernanceChart = useCallback(() => {
    const container = chartRef.current;
    d3.select(container).selectAll('*').remove();
    
    if (!structureData || !structureData.governance.length) {
      return;
    }
    
    const { width } = container.getBoundingClientRect();
    const height = 400;
    
    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'governance-svg');
    
    // Process data into hierarchy
    const rootNodes = structureData.governance.filter(d => d.level === 1);
    const childNodes = structureData.governance.filter(d => d.level > 1);
    
    if (rootNodes.length === 0) return;
    
    // Size and positions
    const boxWidth = 180;
    const boxHeight = 80;
    const rootY = 50;
    const childY = 200;
    const rootX = width / 2;
    
    // Draw root node
    const rootNode = svg.selectAll('.root-node')
      .data(rootNodes)
      .enter()
      .append('g')
      .attr('class', 'org-node root-node')
      .attr('transform', `translate(${rootX - boxWidth / 2}, ${rootY})`)
      .on('click', (event, d) => {
        setSelectedEntity(d);
      });
    
    rootNode.append('rect')
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', 'var(--primary-color)')
      .attr('stroke', 'var(--primary-dark)')
      .attr('stroke-width', 2);
    
    rootNode.append('text')
      .attr('x', boxWidth / 2)
      .attr('y', boxHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'var(--text-inverted)')
      .attr('font-weight', 'bold')
      .text(d => d.name)
      .call(wrap, boxWidth - 20);
    
    // Determine the spacing for child nodes
    const childCount = childNodes.length;
    const totalChildWidth = childCount * boxWidth;
    const spacing = Math.min(40, (width - totalChildWidth) / (childCount + 1));
    const childTotalWidth = totalChildWidth + (spacing * (childCount - 1));
    const childStartX = (width - childTotalWidth) / 2;
    
    // Draw child nodes
    const childNode = svg.selectAll('.child-node')
      .data(childNodes)
      .enter()
      .append('g')
      .attr('class', 'org-node child-node')
      .attr('transform', (d, i) => {
        const x = childStartX + i * (boxWidth + spacing);
        return `translate(${x}, ${childY})`;
      })
      .on('click', (event, d) => {
        setSelectedEntity(d);
      });
    
    childNode.append('rect')
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', 'var(--background-card)')
      .attr('stroke', 'var(--primary-light)')
      .attr('stroke-width', 2);
    
    childNode.append('text')
      .attr('x', boxWidth / 2)
      .attr('y', boxHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'var(--text-primary)')
      .text(d => d.name)
      .call(wrap, boxWidth - 20);
    
    // Draw connecting lines
    childNodes.forEach((child, i) => {
      const parent = structureData.governance.find(d => d.id === child.parent);
      if (parent) {
        const startX = rootX;
        const startY = rootY + boxHeight;
        const endX = childStartX + (boxWidth / 2) + i * (boxWidth + spacing);
        const endY = childY;
        
        svg.append('path')
          .attr('d', `
            M ${startX},${startY}
            L ${startX},${(startY + endY) / 2}
            L ${endX},${(startY + endY) / 2}
            L ${endX},${endY}
          `)
          .attr('fill', 'none')
          .attr('stroke', 'var(--border-color)')
          .attr('stroke-width', 2);
      }
    });
    
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
        
        while ((word = words.pop())) {
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
  }, [structureData, setSelectedEntity, chartRef]);
  
  // Function to create collaboration mechanisms chart
  const createCollaborationChart = useCallback(() => {
    const container = chartRef.current;
    d3.select(container).selectAll('*').remove();
    
    if (!structureData || !structureData.collaboration.length) {
      return;
    }
    
    const { width } = container.getBoundingClientRect();
    const height = 400;
    
    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'collaboration-svg');
    
    // Size and positions
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusMain = 80;
    const radiusOuter = 180;
    
    // Draw center circle
    const center = svg.append('g')
      .attr('class', 'center-node')
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .on('click', () => {
        setSelectedEntity({
          name: "NIH Human Virome Program",
          description: "A comprehensive research initiative to characterize the human virome",
          id: "hvp-center"
        });
      });
    
    center.append('circle')
      .attr('r', radiusMain)
      .attr('fill', 'var(--primary-color)')
      .attr('stroke', 'var(--primary-dark)')
      .attr('stroke-width', 2);
    
    center.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'var(--text-inverted)')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .text("NIH Human Virome Program");
    
    // Draw outer nodes
    const collabItems = structureData.collaboration;
    const angleStep = (2 * Math.PI) / collabItems.length;
    
    const node = svg.selectAll('.collab-node')
      .data(collabItems)
      .enter()
      .append('g')
      .attr('class', 'collab-node')
      .attr('transform', (d, i) => {
        const angle = i * angleStep;
        const x = centerX + radiusOuter * Math.cos(angle - Math.PI / 2);
        const y = centerY + radiusOuter * Math.sin(angle - Math.PI / 2);
        return `translate(${x}, ${y})`;
      })
      .on('click', (event, d) => {
        setSelectedEntity(d);
      });
    
    node.append('circle')
      .attr('r', 50)
      .attr('fill', 'var(--background-card)')
      .attr('stroke', 'var(--primary-light)')
      .attr('stroke-width', 2);
    
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'var(--text-primary)')
      .attr('font-size', '12px')
      .text(d => d.name)
      .call(wrap, 80);
    
    // Draw connecting lines
    collabItems.forEach((item, i) => {
      const angle = i * angleStep;
      const outerX = centerX + radiusOuter * Math.cos(angle - Math.PI / 2);
      const outerY = centerY + radiusOuter * Math.sin(angle - Math.PI / 2);
      const innerX = centerX + radiusMain * Math.cos(angle - Math.PI / 2);
      const innerY = centerY + radiusMain * Math.sin(angle - Math.PI / 2);
      
      svg.append('line')
        .attr('x1', innerX)
        .attr('y1', innerY)
        .attr('x2', outerX)
        .attr('y2', outerY)
        .attr('stroke', 'var(--border-color)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    });
    
    // Helper function to wrap text
    function wrap(text, width) {
      text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const y = 0;
        const x = 0;
        const dy = -1;
        let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", `${dy}em`);
        
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", `${++lineNumber * lineHeight}em`).text(word);
          }
        }
      });
    }
  }, [structureData, setSelectedEntity, chartRef]);
  
  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedEntity(null);
  };
  
  if (loading) {
    return (
      <div className="structure-container loading-message">
        <p>Loading program structure data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="structure-container error-message">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="structure-container">
      <div className="structure-header">
        <h3>NIH Human Virome Program Structure</h3>
        <p className="structure-subtitle">Governance structure and collaboration mechanisms</p>
      </div>
      
      <div className="view-mode-selector">
        <button 
          className={`view-mode-button ${viewMode === 'governance' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('governance')}
        >
          Governance Structure
        </button>
        <button 
          className={`view-mode-button ${viewMode === 'collaboration' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('collaboration')}
        >
          Collaboration Mechanisms
        </button>
      </div>
      
      <div className="structure-visualization" ref={chartRef}></div>
      
      {selectedEntity && (
        <div className="entity-details">
          <h4>{selectedEntity.name}</h4>
          <p className="entity-description">{selectedEntity.description}</p>
          
          {selectedEntity.meeting && (
            <p className="entity-meeting">
              <span className="entity-label">Meetings:</span> {selectedEntity.meeting}
            </p>
          )}
          
          {selectedEntity.members && (
            <p className="entity-members">
              <span className="entity-label">Members:</span> {selectedEntity.members}
            </p>
          )}
          
          {selectedEntity.implementation && (
            <p className="entity-implementation">
              <span className="entity-label">Implementation:</span> {selectedEntity.implementation}
            </p>
          )}
        </div>
      )}
      
      <div className="structure-info">
        <p className="interaction-hint">
          <strong>Tip:</strong> Click on elements in the diagram to view more details.
        </p>
      </div>
    </div>
  );
}

export default ProgramStructure;