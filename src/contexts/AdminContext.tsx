"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadAppState, saveAppState } from "@/lib/appStateStore";

interface TrendDrink {
  id: string;
  url: string; // Base64 or absolute path
  link: string; // Href target
}

interface AdminContextType {
  appName: string;
  setAppName: (name: string) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  trendDrinks: TrendDrink[];
  setTrendDrinks: (drinks: TrendDrink[]) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);
const ADMIN_STORAGE_KEY = "slingshot_admin_state";

const DEFAULT_TREND_DRINKS: TrendDrink[] = [
  { id: "td1", url: "/images/trend_drink_matcha_espresso.png", link: "#" },
  { id: "td2", url: "/images/trend_drink_strawberry_latte.png", link: "#" },
  { id: "td3", url: "/images/trend_drink_blue_ocean_ade.png", link: "#" },
  { id: "td4", url: "/images/trend_drink_caramel_einspanner.png", link: "#" },
];

const loadAdminState = () => {
  if (typeof window === "undefined") {
    return {
      appName: "SLINSHOT : FILL YOUR DAY",
      logoUrl: null as string | null,
      trendDrinks: DEFAULT_TREND_DRINKS,
    };
  }

  try {
    const latestSnapshot = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (latestSnapshot) {
      const parsed = JSON.parse(latestSnapshot) as {
        data?: { appName: string; logoUrl: string | null; trendDrinks: TrendDrink[] };
      };

      if (parsed.data) {
        return parsed.data;
      }
    }

    const savedName = localStorage.getItem("admin_appName") || "SLINSHOT : FILL YOUR DAY";
    const savedLogo = localStorage.getItem("admin_logoUrl");
    const savedTrends = localStorage.getItem("admin_trendDrinks");
    const parsedTrends = savedTrends ? (JSON.parse(savedTrends) as TrendDrink[]) : [];
    return {
      appName: savedName,
      logoUrl: savedLogo,
      trendDrinks: parsedTrends.length > 0 ? parsedTrends : DEFAULT_TREND_DRINKS,
    };
  } catch {
    const savedName = localStorage.getItem("admin_appName") || "SLINSHOT : FILL YOUR DAY";
    const savedLogo = localStorage.getItem("admin_logoUrl");
    return {
      appName: savedName,
      logoUrl: savedLogo,
      trendDrinks: DEFAULT_TREND_DRINKS,
    };
  }
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const initialState = useMemo(() => loadAdminState(), []);
  const [appName, setAppNameState] = useState(initialState.appName);
  const [logoUrl, setLogoUrlState] = useState<string | null>(initialState.logoUrl);
  const [trendDrinks, setTrendDrinksState] = useState<TrendDrink[]>(initialState.trendDrinks);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const syncAdminState = async () => {
      const envelope = await loadAppState(
        "admin",
        ADMIN_STORAGE_KEY,
        initialState
      );

      if (!active) {
        return;
      }

      setAppNameState(envelope.data.appName);
      setLogoUrlState(envelope.data.logoUrl);
      setTrendDrinksState(envelope.data.trendDrinks);
      setIsLoaded(true);
    };

    void syncAdminState();

    const handleWindowFocus = () => {
      if (!active) {
        return;
      }

      void syncAdminState();
    };

    const handleVisibilityChange = () => {
      if (!active || document.visibilityState !== "visible") {
        return;
      }

      void syncAdminState();
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [initialState]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    void saveAppState("admin", ADMIN_STORAGE_KEY, {
      appName,
      logoUrl,
      trendDrinks,
    });
  }, [appName, logoUrl, trendDrinks, isLoaded]);

  const setAppName = (name: string) => {
    setAppNameState(name);
  };

  const setLogoUrl = (url: string | null) => {
    setLogoUrlState(url);
  };

  const setTrendDrinks = (drinks: TrendDrink[]) => {
    setTrendDrinksState(drinks);
  };

  return (
    <AdminContext.Provider
      value={{
        appName,
        setAppName,
        logoUrl,
        setLogoUrl,
        trendDrinks,
        setTrendDrinks,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
