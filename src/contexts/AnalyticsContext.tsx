"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface PageVisit {
  path: string;
  count: number;
}

interface DailyVisit {
  date: string; // YYYY-MM-DD
  count: number;
}

interface AnalyticsContextType {
  trackPageView: (path: string) => void;
  getDailyVisits: () => DailyVisit[];
  getTopPages: () => PageVisit[];
  getTodayCount: () => number;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [, forceUpdate] = useState(0);

  const trackPageView = useCallback((path: string) => {
    const today = new Date().toISOString().split("T")[0];
    
    // Daily visits
    const dailyKey = "analytics_daily";
    const raw = localStorage.getItem(dailyKey);
    const daily: DailyVisit[] = raw ? JSON.parse(raw) : [];
    const todayIdx = daily.findIndex((d) => d.date === today);
    if (todayIdx >= 0) {
      daily[todayIdx].count += 1;
    } else {
      // Keep only last 30 days
      if (daily.length >= 30) daily.shift();
      daily.push({ date: today, count: 1 });
    }
    localStorage.setItem(dailyKey, JSON.stringify(daily));

    // Page visits
    const pageKey = "analytics_pages";
    const pageRaw = localStorage.getItem(pageKey);
    const pages: PageVisit[] = pageRaw ? JSON.parse(pageRaw) : [];
    const pageIdx = pages.findIndex((p) => p.path === path);
    if (pageIdx >= 0) {
      pages[pageIdx].count += 1;
    } else {
      pages.push({ path, count: 1 });
    }
    localStorage.setItem(pageKey, JSON.stringify(pages));

    forceUpdate((n) => n + 1);
  }, []);

  const getDailyVisits = useCallback((): DailyVisit[] => {
    const raw = localStorage.getItem("analytics_daily");
    return raw ? JSON.parse(raw) : [];
  }, []);

  const getTopPages = useCallback((): PageVisit[] => {
    const raw = localStorage.getItem("analytics_pages");
    if (!raw) return [];
    const pages: PageVisit[] = JSON.parse(raw);
    return pages.sort((a, b) => b.count - a.count).slice(0, 5);
  }, []);

  const getTodayCount = useCallback((): number => {
    const today = new Date().toISOString().split("T")[0];
    const visits = getDailyVisits();
    return visits.find((d) => d.date === today)?.count ?? 0;
  }, [getDailyVisits]);

  return (
    <AnalyticsContext.Provider value={{ trackPageView, getDailyVisits, getTopPages, getTodayCount }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("useAnalytics must be used within AnalyticsProvider");
  return ctx;
}
