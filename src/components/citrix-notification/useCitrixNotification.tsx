import { useEffect, useState, useRef } from 'react';
import { useLocation, matchPath } from 'react-router-dom';

export const useCitrixNotification = (allowedRoutes: string[] = []) => {
  // Determine initial state based on the current path when the hook first runs
  const initialPathname = useLocation().pathname;
  const isInitiallyAllowed =
    allowedRoutes.length === 0 ||
    allowedRoutes.some((route) => !!matchPath(route, initialPathname));
  const [isOpen, setIsOpen] = useState(isInitiallyAllowed);

  const pathname = useLocation().pathname;
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    // Only run the logic if the path has actually changed
    if (pathname !== previousPathnameRef.current) {
      const showOnAll = allowedRoutes.length === 0;
      const isNowAllowed = showOnAll || allowedRoutes.some((route) => !!matchPath(route, pathname));

      // Reset to visible only when navigating TO an allowed route
      // Or hide when navigating TO a non-allowed route
      setIsOpen(isNowAllowed);

      // Update the ref to the current path for the next check
      previousPathnameRef.current = pathname;
    }
  }, [pathname, allowedRoutes]); // Depend on pathname and allowedRoutes

  return { isOpen, setIsOpen };
};
