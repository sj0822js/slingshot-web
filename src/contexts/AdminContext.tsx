"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [appName, setAppNameState] = useState("SLINSHOT : FILL YOUR DAY");
  const [logoUrl, setLogoUrlState] = useState<string | null>(null);
  const [trendDrinks, setTrendDrinksState] = useState<TrendDrink[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("admin_appName");
    if (savedName) setAppNameState(savedName);

    const savedLogo = localStorage.getItem("admin_logoUrl");
    if (savedLogo) setLogoUrlState(savedLogo);

    const savedTrends = localStorage.getItem("admin_trendDrinks");
    if (savedTrends) {
      try {
        setTrendDrinksState(JSON.parse(savedTrends));
      } catch (e) {
        console.error("Failed to parse trend drinks", e);
      }
    }
    
    // Fallback Mock Trends if empty
    if (!savedTrends || JSON.parse(savedTrends).length === 0) {
      setTrendDrinksState([
         { id: "td1", url: "/images/trend_drink_matcha_espresso.png", link: "#" },
         { id: "td2", url: "/images/trend_drink_strawberry_latte.png", link: "#" },
         { id: "td3", url: "/images/trend_drink_blue_ocean_ade.png", link: "#" },
         { id: "td4", url: "/images/trend_drink_caramel_einspanner.png", link: "#" },
      ]);
    }
    
    setIsLoaded(true);
  }, []);

  const setAppName = (name: string) => {
    setAppNameState(name);
    localStorage.setItem("admin_appName", name);
  };

  const setLogoUrl = (url: string | null) => {
    setLogoUrlState(url);
    if (url) localStorage.setItem("admin_logoUrl", url);
    else localStorage.removeItem("admin_logoUrl");
  };

  const setTrendDrinks = (drinks: TrendDrink[]) => {
    setTrendDrinksState(drinks);
    localStorage.setItem("admin_trendDrinks", JSON.stringify(drinks));
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

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
