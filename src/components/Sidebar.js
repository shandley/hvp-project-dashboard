import React from 'react';
import './Sidebar.css';

function Sidebar({ activeView, changeView }) {
  const menuItems = [
    { id: 'overview', label: 'Program Overview', icon: '📊' },
    { id: 'geographic', label: 'Geographic Distribution', icon: '🗺️' },
    { id: 'samples', label: 'Sample Distribution', icon: '🧫' },
    { id: 'timeline', label: 'Project Timeline', icon: '📅' },
    { id: 'networks', label: 'Relationships & Networks', icon: '🔄' },
    { id: 'disease-virome', label: 'Disease-Virome Network', icon: '🧬' },
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
              className={activeView === item.id ? 'active' : ''}
              onClick={() => changeView(item.id)}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
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