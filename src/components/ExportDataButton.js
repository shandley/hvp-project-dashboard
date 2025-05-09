import React, { useState, useRef } from 'react';
import './ExportDataButton.css';

/**
 * ExportDataButton Component
 * 
 * A reusable component for exporting data from visualizations in various formats.
 * Provides CSV, JSON, PNG (for charts), and Print options.
 */
function ExportDataButton({ 
  data, 
  filename = 'hvp-export', 
  visualizationRef = null,
  exportOptions = ['csv', 'json', 'png', 'print'],
  buttonText = 'Export Data'
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  // Close the menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  
  // Export as CSV
  const exportCSV = () => {
    // Determine if data is an array of objects or a more complex structure
    let csvData = [];
    
    if (Array.isArray(data)) {
      // Direct array of objects
      csvData = data;
    } else if (data.projects && Array.isArray(data.projects)) {
      // Projects data structure
      csvData = data.projects;
    } else {
      // Convert other data structures to array of objects
      const entries = Object.entries(data);
      csvData = entries.map(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          return { name: key, ...value };
        }
        return { name: key, value: value };
      });
    }
    
    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that need quoting
          const cellValue = value === null || value === undefined ? '' : String(value);
          return cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')
            ? `"${cellValue.replace(/"/g, '""')}"`
            : cellValue;
        }).join(',')
      )
    ].join('\n');
    
    // Create and trigger download
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  };
  
  // Export as JSON
  const exportJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  };
  
  // Export as PNG (for visualizations)
  const exportPNG = () => {
    if (!visualizationRef || !visualizationRef.current) {
      alert('No visualization element available for PNG export');
      return;
    }
    
    try {
      // Use html2canvas for capturing visualization
      import('html2canvas').then(html2canvas => {
        const element = visualizationRef.current;
        
        html2canvas.default(element, {
          backgroundColor: getComputedStyle(document.documentElement)
            .getPropertyValue('--background-card').trim() || '#ffffff',
          scale: 2, // Better quality
        }).then(canvas => {
          const link = document.createElement('a');
          link.download = `${filename}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
      }).catch(err => {
        console.error('Error loading html2canvas:', err);
        alert('Could not load image export functionality');
      });
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Failed to export image');
    }
  };
  
  // Print visualization
  const printData = () => {
    if (!visualizationRef || !visualizationRef.current) {
      alert('No visualization element available for printing');
      return;
    }
    
    try {
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('Please allow pop-ups to use the print function');
        return;
      }
      
      // Get current theme
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      
      // Clone visualization styles
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            // Skip external stylesheets that may cause CORS issues
            return '';
          }
        })
        .filter(Boolean)
        .join('\n');
        
      // Clone the visualization content
      const content = visualizationRef.current.cloneNode(true);
      
      // Set up the print window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html data-theme="${currentTheme}">
        <head>
          <title>HVP Dashboard Export - ${filename}</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <h1>NIH Human Virome Program Dashboard</h1>
              <p>Exported on ${new Date().toLocaleString()}</p>
            </div>
            <div class="print-content"></div>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.querySelector('.print-content').appendChild(content);
      
      // Add HVP branding
      const logoImg = document.createElement('img');
      logoImg.src = '/HVP_logo_white.png';
      logoImg.alt = 'HVP Logo';
      logoImg.className = 'print-logo';
      printWindow.document.querySelector('.print-header').prepend(logoImg);
      
      // Wait for images to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } catch (error) {
      console.error('Error printing data:', error);
      alert('Failed to print visualization');
    }
  };
  
  // Helper function to download file
  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="export-button-container" ref={menuRef}>
      <button 
        className="export-button"
        onClick={toggleMenu}
        aria-expanded={showMenu}
        aria-haspopup="true"
      >
        <span className="export-icon">↓</span> {buttonText}
      </button>
      
      {showMenu && (
        <div className="export-menu">
          <ul>
            {exportOptions.includes('csv') && (
              <li>
                <button onClick={exportCSV}>
                  Export as CSV
                </button>
              </li>
            )}
            {exportOptions.includes('json') && (
              <li>
                <button onClick={exportJSON}>
                  Export as JSON
                </button>
              </li>
            )}
            {exportOptions.includes('png') && visualizationRef && (
              <li>
                <button onClick={exportPNG}>
                  Export as Image
                </button>
              </li>
            )}
            {exportOptions.includes('print') && visualizationRef && (
              <li>
                <button onClick={printData}>
                  Print Visualization
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ExportDataButton;