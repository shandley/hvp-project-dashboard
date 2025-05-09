import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { loadData } from './utils/dataLoader';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  
  // Force an initial reset of the view to ensure clean rendering
  useEffect(() => {
    // Clear any previous view state that might be causing issues
    setTimeout(() => {
      console.log('App: Forced view reset to ensure clean state');
      setActiveView('overview');
    }, 100);
  }, []);
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
    console.log('App: Changing view to:', view);
    console.log('App: Current time:', new Date().toISOString());
    
    // If view is null, we're in the intermediate state during a view change
    if (view === null) {
      console.log('App: View temporarily set to null for re-rendering');
      setActiveView(null);
      return;
    }
    
    // Log the current state
    console.log('App: Current state before change - activeView:', activeView);
    
    // Add a small delay before setting the view to ensure components unmount/remount properly
    setTimeout(() => {
      console.log('App: Actually setting view to:', view);
      console.log('App: Time when setting view:', new Date().toISOString());
      setActiveView(view);
    }, 10);
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error">Error loading data: {error}</div>;
  }

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;