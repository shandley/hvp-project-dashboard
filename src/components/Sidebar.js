import React from 'react';
import './Sidebar.css';

function Sidebar({ activeView, changeView }) {
  const menuItems = [
    { id: 'overview', label: 'Program Overview', icon: '📊' },
    { id: 'geographic', label: 'Geographic Distribution', icon: '🗺️' },
    { id: 'samples', label: 'Sample Distribution', icon: '🧫' },
    { id: 'timeline', label: 'Project Timeline', icon: '📅', disabled: true },
    { id: 'networks', label: 'Relationships & Networks', icon: '🔄' },
    { id: 'disease-virome', label: 'Disease-Virome Associations', icon: '🧬' },
    { id: 'publications', label: 'HVP Publications', icon: '📚' },
    { id: 'program-info', label: 'About HVP Program', icon: 'ℹ️' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Dashboard</h3>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li 
              key={item.id}
              className={`${activeView === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                
                // Don't do anything if the item is disabled
                if (item.disabled) {
                  console.log('Sidebar: Ignoring click on disabled item', item.id);
                  return;
                }
                
                console.log('Sidebar: Clicked on', item.id, 'at', new Date().toISOString());
                
                if (['program-info', 'publications'].includes(item.id)) {
                  // For program-info and publications, use a direct navigation approach
                  console.log(`Sidebar: Direct navigation to ${item.id}`);
                  changeView(item.id);
                } else {
                  // For other views, use the two-step process
                  console.log('Sidebar: Using two-step process for', item.id);
                  // First set the view to null to force a re-render
                  changeView(null);
                  // Then set it to the actual view after a small delay
                  setTimeout(() => changeView(item.id), 50);
                }
              }}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
              {item.disabled && <span className="coming-soon-badge">Coming Soon</span>}
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>Data Last Updated: May 2024</p>
      </div>
    </div>
  );
}

export default Sidebar;