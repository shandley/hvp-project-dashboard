import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { loadData } from './utils/dataLoader';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [filters, setFilters] = useState({
    initiativeType: null,
    geographicRegion: null,
    bodySiteCategory: null,
    ageGroupCategory: null,
    status: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const loadedData = await loadData();
        setData(loadedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateFilters = (newFilters) => {
    setFilters({...filters, ...newFilters});
  };

  const changeView = (view) => {
    setActiveView(view);
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error">Error loading data: {error}</div>;
  }

  return (
    <div className="app">
      <Header data={data} />
      <div className="main-content">
        <Sidebar activeView={activeView} changeView={changeView} />
        <Dashboard 
          data={data} 
          filters={filters} 
          updateFilters={updateFilters}
          activeView={activeView}
        />
      </div>
    </div>
  );
}

export default App;