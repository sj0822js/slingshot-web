"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAnalytics } from "@/contexts/AnalyticsContext";

export function usePageTracker() {
  const pathname = usePathname();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname, trackPageView]);
}
