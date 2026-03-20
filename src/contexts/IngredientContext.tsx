"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { IngredientItem } from "@/types/ingredient";
import { allMockIngredients } from "@/data/mockIngredients";
import { loadAppState, saveAppState } from "@/lib/appStateStore";

const INGREDIENTS_STORAGE_KEY = "slingshot_ingredients";
const LEGACY_CUSTOM_INGREDIENTS_KEY = "slinshot_custom_ingredients";

const mergeIngredients = (storedIngredients: IngredientItem[]) => {
  const storedById = new Map(storedIngredients.map((item) => [item.id, item]));
  const merged = allMockIngredients.map((item) => storedById.get(item.id) ?? item);
  const customOnly = storedIngredients.filter((item) => !allMockIngredients.some((mock) => mock.id === item.id));
  return [...merged, ...customOnly];
};

const loadIngredients = () => {
  if (typeof window === "undefined") {
    return allMockIngredients;
  }

  try {
    const fullSnapshot = localStorage.getItem(INGREDIENTS_STORAGE_KEY);
    if (fullSnapshot) {
      return mergeIngredients(JSON.parse(fullSnapshot) as IngredientItem[]);
    }

    const legacyCustom = localStorage.getItem(LEGACY_CUSTOM_INGREDIENTS_KEY);
    if (legacyCustom) {
      return mergeIngredients(JSON.parse(legacyCustom) as IngredientItem[]);
    }
  } catch {
    return allMockIngredients;
  }

  return allMockIngredients;
};

interface IngredientContextType {
  ingredients: IngredientItem[];
  addIngredient: (item: IngredientItem) => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (id: string, data: Partial<IngredientItem>) => void;
}

const IngredientContext = createContext<IngredientContextType | undefined>(undefined);

export const IngredientProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<IngredientItem[]>(loadIngredients);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    loadAppState("ingredients", INGREDIENTS_STORAGE_KEY, allMockIngredients, {
      legacyReader: loadIngredients,
    }).then((envelope) => {
      if (!active) {
        return;
      }

      setIngredients(mergeIngredients(envelope.data));
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

    localStorage.setItem(INGREDIENTS_STORAGE_KEY, JSON.stringify(ingredients));

    const mockIds = new Set(allMockIngredients.map((item) => item.id));
    const customOnly = ingredients.filter((item) => !mockIds.has(item.id));
    localStorage.setItem(LEGACY_CUSTOM_INGREDIENTS_KEY, JSON.stringify(customOnly));
    void saveAppState("ingredients", INGREDIENTS_STORAGE_KEY, ingredients);
  }, [ingredients, isLoaded]);

  const addIngredient = (item: IngredientItem) => {
    setIngredients((prev) => [...prev, item]);
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const updateIngredient = (id: string, data: Partial<IngredientItem>) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } as IngredientItem : item))
    );
  };

  return (
    <IngredientContext.Provider value={{ ingredients, addIngredient, removeIngredient, updateIngredient }}>
      {children}
    </IngredientContext.Provider>
  );
};

export const useIngredients = () => {
  const context = useContext(IngredientContext);
  if (!context) {
    throw new Error("useIngredients must be used within an IngredientProvider");
  }
  return context;
};
