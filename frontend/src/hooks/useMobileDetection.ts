import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the user is on a mobile device
 * @returns {boolean} True if on mobile device, false otherwise
 */
export const useMobileDetection = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check for touch capability and screen width
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      // Also check user agent for mobile devices
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUserAgent = mobileRegex.test(navigator.userAgent);
      
      setIsMobile(hasTouchScreen && (isSmallScreen || isMobileUserAgent));
    };

    checkIsMobile();
    
    // Listen for window resize to update mobile state
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};