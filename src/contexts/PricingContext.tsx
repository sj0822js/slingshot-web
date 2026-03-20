"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { loadAppState, saveAppState } from "@/lib/appStateStore";

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

const loadPricingSettings = (): PricingSettings => {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(raw) as unknown;
    const latest =
      parsed &&
      typeof parsed === "object" &&
      "data" in parsed &&
      (parsed as { data?: Partial<PricingSettings> }).data
        ? (parsed as { data: Partial<PricingSettings> }).data
        : (parsed as Partial<PricingSettings>);
    return {
      ...DEFAULT_SETTINGS,
      ...latest,
      cupSizeFees: {
        ...DEFAULT_SETTINGS.cupSizeFees,
        ...(latest.cupSizeFees ?? {}),
      },
      ingredientPrices: latest.ingredientPrices ?? [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PricingSettings>(loadPricingSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    loadAppState("pricing", STORAGE_KEY, DEFAULT_SETTINGS, {
      legacyReader: loadPricingSettings,
    }).then((envelope) => {
      if (!active) {
        return;
      }

      setSettings({
        ...DEFAULT_SETTINGS,
        ...envelope.data,
        cupSizeFees: {
          ...DEFAULT_SETTINGS.cupSizeFees,
          ...(envelope.data.cupSizeFees ?? {}),
        },
        ingredientPrices: envelope.data.ingredientPrices ?? [],
      });
      setIsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    void saveAppState("pricing", STORAGE_KEY, settings);
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
