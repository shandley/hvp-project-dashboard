/**
 * Utility functions for data export
 */

/**
 * Convert an array of publications to CSV format
 * 
 * @param {Array} publications - Array of publication objects
 * @returns {string} CSV formatted data
 */
export const publicationsToCSV = (publications) => {
  if (!publications || publications.length === 0) {
    return '';
  }
  
  // Define columns for the CSV
  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'pmid', header: 'PMID' },
    { key: 'doi', header: 'DOI' },
    { key: 'authors', header: 'Authors', formatter: (authors) => authors ? authors.map(a => a.name).join('; ') : '' },
    { key: 'journal', header: 'Journal' },
    { key: 'publicationDate', header: 'Publication Date' },
    { key: 'url', header: 'URL' },
    { key: 'grants', header: 'Grants', formatter: (grants) => grants ? grants.map(g => g.grantId).join('; ') : '' },
    { key: 'abstract', header: 'Abstract' }
  ];
  
  // Create CSV header row
  const headerRow = columns.map(col => `"${col.header}"`).join(',');
  
  // Create data rows
  const dataRows = publications.map(pub => {
    return columns.map(col => {
      const value = pub[col.key];
      
      // Format the value if a formatter is provided
      let formattedValue = col.formatter ? col.formatter(value) : value;
      
      // Convert to string and escape special characters
      const stringValue = String(formattedValue || '');
      
      // Wrap in quotes and escape any quotes inside
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Trigger a file download with the given data
 * 
 * @param {string} data - The data to download
 * @param {string} filename - The name of the file
 * @param {string} mimeType - The MIME type of the file
 */
export const downloadFile = (data, filename, mimeType = 'text/csv') => {
  // Create a blob with the data
  const blob = new Blob([data], { type: mimeType });
  
  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append to the document, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the URL object
  window.URL.revokeObjectURL(url);
};

/**
 * Export publications data to a CSV file
 * 
 * @param {Array} publications - Array of publication objects
 * @param {string} filename - Optional filename (defaults to hvp-publications.csv)
 */
export const exportPublicationsToCSV = (publications, filename = 'hvp-publications.csv') => {
  // Convert to CSV
  const csv = publicationsToCSV(publications);
  
  // Trigger download
  downloadFile(csv, filename);
};

export default {
  publicationsToCSV,
  downloadFile,
  exportPublicationsToCSV
};