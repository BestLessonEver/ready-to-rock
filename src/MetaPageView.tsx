import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function MetaPageView() {
  const location = useLocation();

  useEffect(() => {
    if (!window.fbq) return;

    // React Router changes URL without a full page reload, so we manually track it
    window.fbq('track', 'PageView');
  }, [location.pathname, location.search]);

  return null;
}
