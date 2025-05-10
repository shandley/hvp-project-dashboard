import React, { useEffect, useRef } from 'react';
import './PublicationTimeline.css';

/**
 * Publication Timeline Component
 * 
 * A simple timeline visualization showing publications by year.
 * Designed to work with few publications now and scale as more are added.
 */
const PublicationTimeline = ({ publications }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!publications || publications.length === 0 || !canvasRef.current) {
      return;
    }
    
    const drawTimeline = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get years range
      const years = publications.map(pub => {
        const pubDate = pub.publicationDate || '';
        const year = parseInt(pubDate.split(' ')[0], 10);
        return isNaN(year) ? null : year;
      }).filter(year => year !== null);
      
      if (years.length === 0) {
        // Draw message if no valid years
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('Timeline will appear as publications are added', canvas.width / 2, canvas.height / 2);
        return;
      }
      
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      
      // Force at least a 5-year span to make the timeline look meaningful
      const startYear = Math.min(minYear, maxYear - 4);
      const endYear = Math.max(maxYear, minYear + 4);
      const yearSpan = endYear - startYear + 1;
      
      // Dimensions
      const margin = 40;
      const lineY = canvas.height / 2;
      const lineWidth = canvas.width - 2 * margin;
      const yearWidth = lineWidth / (yearSpan - 1);
      const dotRadius = 8;
      
      // Draw timeline line
      ctx.beginPath();
      ctx.moveTo(margin, lineY);
      ctx.lineTo(canvas.width - margin, lineY);
      ctx.strokeStyle = '#aaa';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw year labels for each year in range
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      
      for (let i = 0; i < yearSpan; i++) {
        const year = startYear + i;
        const x = margin + i * yearWidth;
        
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(x, lineY - 5);
        ctx.lineTo(x, lineY + 5);
        ctx.strokeStyle = '#aaa';
        ctx.stroke();
        
        // Draw year label
        ctx.fillText(year.toString(), x, lineY + 25);
      }
      
      // Draw publication dots
      publications.forEach(pub => {
        const pubDate = pub.publicationDate || '';
        const year = parseInt(pubDate.split(' ')[0], 10);
        
        if (isNaN(year)) {
          return;
        }
        
        const yearIndex = year - startYear;
        const x = margin + yearIndex * yearWidth;
        
        // Draw circle for publication
        ctx.beginPath();
        ctx.arc(x, lineY, dotRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw count bubble if multiple publications in same year
        const pubsInYear = publications.filter(p => {
          const pYear = parseInt((p.publicationDate || '').split(' ')[0], 10);
          return pYear === year;
        });
        
        if (pubsInYear.length > 1) {
          ctx.font = 'bold 12px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pubsInYear.length.toString(), x, lineY);
        }
      });
    };
    
    // Draw initially
    drawTimeline();
    
    // Handle resize
    const handleResize = () => {
      // Adjust canvas to parent container size
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        drawTimeline();
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [publications]);
  
  // Display publication count by hover
  const handleMouseMove = (e) => {
    // For future enhancement: detect and highlight dots under cursor
  };
  
  return (
    <div className="publication-timeline">
      <h3>Publication Timeline</h3>
      <div className="timeline-container">
        <canvas 
          ref={canvasRef} 
          height={120}
          onMouseMove={handleMouseMove}
        ></canvas>
      </div>
      <div className="timeline-legend">
        <div className="legend-item">
          <span className="legend-dot"></span>
          <span>Publication</span>
        </div>
      </div>
    </div>
  );
};

export default PublicationTimeline;