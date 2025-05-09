import React from 'react';
import './FilterPanel.css';

function FilterPanel({ data, filters, updateFilters }) {
  if (!data || !data.projects) return null;

  // Extract unique values for filter categories
  const getUniqueValues = (field) => {
    if (!data.projects) return [];
    const values = data.projects.map(project => project[field]);
    return [...new Set(values)].filter(Boolean).sort();
  };

  const initiativeTypes = getUniqueValues('Initiative Type');
  const geographicRegions = getUniqueValues('Geographic Region');
  const bodySiteCategories = getUniqueValues('Body Site Category');
  const ageGroupCategories = getUniqueValues('Age Group Category');
  const statuses = getUniqueValues('Status');

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const newValue = value === 'All' ? null : value;
    updateFilters({ [filterType]: newValue });
  };

  // Reset all filters
  const resetFilters = () => {
    updateFilters({
      initiativeType: null,
      geographicRegion: null,
      bodySiteCategory: null,
      ageGroupCategory: null,
      status: null
    });
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filter Data</h3>
        <button className="reset-btn" onClick={resetFilters}>Reset</button>
      </div>
      
      <div className="filters-container">
        <div className="filter-group">
          <label>Initiative Type</label>
          <select
            value={filters.initiativeType || 'All'}
            onChange={(e) => handleFilterChange('initiativeType', e.target.value)}
          >
            <option value="All">All</option>
            {initiativeTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Geographic Region</label>
          <select
            value={filters.geographicRegion || 'All'}
            onChange={(e) => handleFilterChange('geographicRegion', e.target.value)}
          >
            <option value="All">All</option>
            {geographicRegions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Body Site</label>
          <select
            value={filters.bodySiteCategory || 'All'}
            onChange={(e) => handleFilterChange('bodySiteCategory', e.target.value)}
          >
            <option value="All">All</option>
            {bodySiteCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Age Group</label>
          <select
            value={filters.ageGroupCategory || 'All'}
            onChange={(e) => handleFilterChange('ageGroupCategory', e.target.value)}
          >
            <option value="All">All</option>
            {ageGroupCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status || 'All'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="All">All</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;