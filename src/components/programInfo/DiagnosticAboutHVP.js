import React, { useEffect, useState } from 'react';
import VisibilityTracker from './VisibilityTracker';

/**
 * DiagnosticAboutHVP - A minimal component to diagnose rendering issues
 */
function DiagnosticAboutHVP() {
  const [renderTime] = useState(new Date().toISOString());
  console.log('DiagnosticAboutHVP: Component function called at', renderTime);
  
  useEffect(() => {
    console.log('DiagnosticAboutHVP: Component mounted');
    
    // Add timeouts to see if something is causing unmounting
    const timers = [
      setTimeout(() => {
        console.log('DiagnosticAboutHVP: Still mounted after 1 second');
      }, 1000),
      setTimeout(() => {
        console.log('DiagnosticAboutHVP: Still mounted after 3 seconds');
      }, 3000),
      setTimeout(() => {
        console.log('DiagnosticAboutHVP: Still mounted after 5 seconds');
      }, 5000)
    ];
    
    // Check if any CSS transitions or animations are happening
    const checkAnimations = () => {
      const animations = document.getAnimations();
      if (animations.length > 0) {
        console.log('DiagnosticAboutHVP: Found animations:', animations);
      }
    };
    
    const animationTimer = setTimeout(checkAnimations, 500);
    
    // Track window events
    const handleBeforeUnload = () => {
      console.log('DiagnosticAboutHVP: Window beforeunload event fired');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      console.log('DiagnosticAboutHVP: Component unmounting');
      timers.forEach(timer => clearTimeout(timer));
      clearTimeout(animationTimer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  try {
    console.log('DiagnosticAboutHVP: About to render');
    return (
      <VisibilityTracker id="aboutHVP">
        <div style={{ 
          padding: '20px', 
          border: '5px solid red', 
          backgroundColor: 'white',
          color: 'black',
          minHeight: '300px',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 9999
        }}>
          <h2 style={{ color: 'red' }}>DIAGNOSTIC COMPONENT</h2>
          <h3>Diagnostic About HVP Component</h3>
          <p>This is a test to diagnose rendering issues.</p>
          <p>If you can see this text, the component is rendering correctly.</p>
          <p><strong>Render Time:</strong> {renderTime}</p>
          <p><strong>Current Time:</strong> {new Date().toISOString()}</p>
          
          <div style={{ marginTop: '30px', padding: '10px', border: '1px dashed blue' }}>
            <h4>Debug Information</h4>
            <p>Window Inner Size: {window.innerWidth}x{window.innerHeight}</p>
            <p>Document URL: {document.URL}</p>
          </div>
        </div>
      </VisibilityTracker>
    );
  } catch (error) {
    console.error('DiagnosticAboutHVP: Error during render:', error);
    return <div>Error rendering component: {error.message}</div>;
  }
}

export default DiagnosticAboutHVP;