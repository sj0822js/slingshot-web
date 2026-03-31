"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadAppState, saveAppState } from "@/lib/appStateStore";

export interface PageVisit {
  path: string;
  count: number;
}

export interface DailyVisit {
  date: string;
  count: number;
}

type AnalyticsState = {
  dailyVisits: DailyVisit[];
  pageVisits: PageVisit[];
};

interface AnalyticsContextType {
  trackPageView: (path: string) => void;
  getDailyVisits: () => DailyVisit[];
  getTopPages: () => PageVisit[];
  getTodayCount: () => number;
}

const ANALYTICS_STORAGE_KEY = "analytics_state";
const LEGACY_DAILY_KEY = "analytics_daily";
const LEGACY_PAGE_KEY = "analytics_pages";
const MAX_DAILY_POINTS = 30;

const emptyAnalyticsState = (): AnalyticsState => ({
  dailyVisits: [],
  pageVisits: [],
});

const getTodayKey = () => new Date().toISOString().split("T")[0];

const sortDailyVisits = (visits: DailyVisit[]) => [...visits].sort((a, b) => a.date.localeCompare(b.date));

const sanitizeAnalyticsState = (input?: Partial<AnalyticsState> | null): AnalyticsState => ({
  dailyVisits: sortDailyVisits(
    Array.isArray(input?.dailyVisits)
      ? input.dailyVisits.filter(
          (visit): visit is DailyVisit => Boolean(visit?.date) && typeof visit.count === "number"
        )
      : []
  ).slice(-MAX_DAILY_POINTS),
  pageVisits: Array.isArray(input?.pageVisits)
    ? input.pageVisits.filter(
        (visit): visit is PageVisit => Boolean(visit?.path) && typeof visit.count === "number"
      )
    : [],
});

const readLegacyAnalyticsState = (): AnalyticsState => {
  const dailyRaw = window.localStorage.getItem(LEGACY_DAILY_KEY);
  const pageRaw = window.localStorage.getItem(LEGACY_PAGE_KEY);

  return sanitizeAnalyticsState({
    dailyVisits: dailyRaw ? (JSON.parse(dailyRaw) as DailyVisit[]) : [],
    pageVisits: pageRaw ? (JSON.parse(pageRaw) as PageVisit[]) : [],
  });
};

const syncLegacyStorage = (state: AnalyticsState) => {
  window.localStorage.setItem(LEGACY_DAILY_KEY, JSON.stringify(state.dailyVisits));
  window.localStorage.setItem(LEGACY_PAGE_KEY, JSON.stringify(state.pageVisits));
};

const recordVisit = (state: AnalyticsState, path: string) => {
  const today = getTodayKey();

  const dailyVisits = [...state.dailyVisits];
  const todayIndex = dailyVisits.findIndex((visit) => visit.date === today);
  if (todayIndex >= 0) {
    dailyVisits[todayIndex] = {
      ...dailyVisits[todayIndex],
      count: dailyVisits[todayIndex].count + 1,
    };
  } else {
    dailyVisits.push({ date: today, count: 1 });
  }

  const trimmedDailyVisits = sortDailyVisits(dailyVisits).slice(-MAX_DAILY_POINTS);

  const pageVisits = [...state.pageVisits];
  const pageIndex = pageVisits.findIndex((visit) => visit.path === path);
  if (pageIndex >= 0) {
    pageVisits[pageIndex] = {
      ...pageVisits[pageIndex],
      count: pageVisits[pageIndex].count + 1,
    };
  } else {
    pageVisits.push({ path, count: 1 });
  }

  return {
    dailyVisits: trimmedDailyVisits,
    pageVisits,
  };
};

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [analytics, setAnalytics] = useState<AnalyticsState>(() => {
    if (typeof window === "undefined") {
      return emptyAnalyticsState();
    }

    return readLegacyAnalyticsState();
  });
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let active = true;

    void loadAppState<AnalyticsState>("analytics", ANALYTICS_STORAGE_KEY, emptyAnalyticsState(), {
      legacyReader: readLegacyAnalyticsState,
    })
      .then((envelope) => {
        if (!active) {
          return;
        }

        const nextState = sanitizeAnalyticsState(envelope.data);
        setAnalytics(nextState);
        syncLegacyStorage(nextState);
        hasHydratedRef.current = true;
      })
      .catch(() => {
        hasHydratedRef.current = true;
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    syncLegacyStorage(analytics);
  }, [analytics]);

  const persistAnalytics = useCallback((nextState: AnalyticsState) => {
    syncLegacyStorage(nextState);
    void saveAppState("analytics", ANALYTICS_STORAGE_KEY, nextState);
  }, []);

  const trackPageView = useCallback(
    (path: string) => {
      setAnalytics((current) => {
        const baseState = hasHydratedRef.current
          ? current
          : sanitizeAnalyticsState({
              ...current,
              ...readLegacyAnalyticsState(),
            });
        const nextState = recordVisit(baseState, path);
        persistAnalytics(nextState);
        hasHydratedRef.current = true;
        return nextState;
      });
    },
    [persistAnalytics]
  );

  const getDailyVisits = useCallback((): DailyVisit[] => analytics.dailyVisits, [analytics.dailyVisits]);

  const getTopPages = useCallback((): PageVisit[] => {
    return [...analytics.pageVisits].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [analytics.pageVisits]);

  const getTodayCount = useCallback((): number => {
    const today = getTodayKey();
    return analytics.dailyVisits.find((visit) => visit.date === today)?.count ?? 0;
  }, [analytics.dailyVisits]);

  const value = useMemo(
    () => ({
      trackPageView,
      getDailyVisits,
      getTopPages,
      getTodayCount,
    }),
    [getDailyVisits, getTodayCount, getTopPages, trackPageView]
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return ctx;
}
