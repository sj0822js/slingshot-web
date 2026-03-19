"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Per-ingredient price in KRW
// For liquids/bases: per ml, for sub-ingredients/garnishes: per gram
export interface IngredientPrice {
  ingredientId: string;
  pricePerUnit: number; // won per ml or per g
}

interface PricingSettings {
  baseFee: number;          // 기본 제조비 (e.g. 2000)
  takeoutFee: number;       // 매장 이용 추가금액 (e.g. 1000)
  cupSizeFees: Record<number, number>; // ml → extra fee (e.g. 591ml → 500)
  ingredientPrices: IngredientPrice[];
}

interface PricingContextType {
  settings: PricingSettings;
  updateSettings: (updates: Partial<PricingSettings>) => void;
  setIngredientPrice: (id: string, price: number) => void;
  getIngredientPrice: (id: string) => number;
}

const DEFAULT_SETTINGS: PricingSettings = {
  baseFee: 2000,
  takeoutFee: 1000,
  cupSizeFees: {
    355: 0,
    473: 500,
    591: 1000,
  },
  ingredientPrices: [],
};

const STORAGE_KEY = "slinshot_pricing_settings";

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PricingSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, isLoaded]);

  const updateSettings = (updates: Partial<PricingSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const setIngredientPrice = (id: string, price: number) => {
    setSettings((prev) => {
      const updated = prev.ingredientPrices.filter((p) => p.ingredientId !== id);
      if (price > 0) updated.push({ ingredientId: id, pricePerUnit: price });
      return { ...prev, ingredientPrices: updated };
    });
  };

  const getIngredientPrice = (id: string): number => {
    return settings.ingredientPrices.find((p) => p.ingredientId === id)?.pricePerUnit ?? 0;
  };

  return (
    <PricingContext.Provider value={{ settings, updateSettings, setIngredientPrice, getIngredientPrice }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error("usePricing must be used within PricingProvider");
  return ctx;
}
