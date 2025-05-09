import React, { useEffect, useRef } from 'react';

/**
 * A component that tracks visibility changes using the Intersection Observer API
 */
const VisibilityTracker = ({ id, children }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    console.log(`VisibilityTracker(${id}): Component mounted and ref attached`);
    
    // Create an intersection observer to track visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          console.log(`VisibilityTracker(${id}): Visibility changed:`, {
            isIntersecting: entry.isIntersecting,
            time: new Date().toISOString(),
            ratio: entry.intersectionRatio,
            entry
          });
        });
      },
      {
        root: null, // viewport
        threshold: [0, 0.1, 0.5, 1.0] // trigger at these thresholds
      }
    );
    
    // Start observing
    observer.observe(currentRef);
    
    // Cleanup on unmount
    return () => {
      console.log(`VisibilityTracker(${id}): Component unmounting`);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [id]);
  
  return (
    <div ref={ref} style={{ width: '100%', position: 'relative' }}>
      {children}
    </div>
  );
};

export default VisibilityTracker;