import React, { useEffect } from 'react';

/**
 * DiagnosticAboutHVP - A minimal component to diagnose rendering issues
 */
function DiagnosticAboutHVP() {
  console.log('DiagnosticAboutHVP: Component function called');
  
  useEffect(() => {
    console.log('DiagnosticAboutHVP: Component mounted');
    
    // Add a timeout to see if something is causing unmounting
    const timer = setTimeout(() => {
      console.log('DiagnosticAboutHVP: Still mounted after 1 second');
    }, 1000);
    
    return () => {
      console.log('DiagnosticAboutHVP: Component unmounting');
      clearTimeout(timer);
    };
  }, []);

  try {
    console.log('DiagnosticAboutHVP: About to render');
    return (
      <div style={{ 
        padding: '20px', 
        border: '1px solid red', 
        backgroundColor: 'white',
        color: 'black',
        minHeight: '200px',
        width: '100%'
      }}>
        <h3>Diagnostic About HVP Component</h3>
        <p>This is a test to diagnose rendering issues.</p>
        <p>If you can see this text, the component is rendering correctly.</p>
        <p>Time: {new Date().toISOString()}</p>
      </div>
    );
  } catch (error) {
    console.error('DiagnosticAboutHVP: Error during render:', error);
    return <div>Error rendering component: {error.message}</div>;
  }
}

export default DiagnosticAboutHVP;