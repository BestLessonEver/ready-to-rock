import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function MetaPageView() {
  const location = useLocation();

  useEffect(() => {
    // Track PageView on SPA navigation
    window.fbq?.("track", "PageView");
  }, [location.pathname, location.search]);

  return null;
}
