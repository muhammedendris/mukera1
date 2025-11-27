import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Prevent automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Don't auto-scroll to top on route change
    // User can scroll manually if needed
  }, [pathname]);

  return null;
};

export default ScrollManager;
