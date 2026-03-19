"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IngredientItem } from "@/types/ingredient";
import { allMockIngredients } from "@/data/mockIngredients";

const CUSTOM_INGREDIENTS_KEY = "slinshot_custom_ingredients";

interface IngredientContextType {
  ingredients: IngredientItem[];
  addIngredient: (item: IngredientItem) => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (id: string, data: Partial<IngredientItem>) => void;
}

const IngredientContext = createContext<IngredientContextType | undefined>(undefined);

export const IngredientProvider = ({ children }: { children: ReactNode }) => {
  // Start with mock ingredients, then layer in persisted custom ones
  const [ingredients, setIngredients] = useState<IngredientItem[]>(allMockIngredients);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load custom ingredients from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_INGREDIENTS_KEY);
      if (raw) {
        const custom: IngredientItem[] = JSON.parse(raw);
        // Merge: mock first, then custom (avoid duplicates)
        setIngredients([...allMockIngredients, ...custom]);
      }
    } catch { /* ignore */ }
    setIsLoaded(true);
  }, []);

  // Persist only custom (non-mock) ingredients
  useEffect(() => {
    if (!isLoaded) return;
    const mockIds = new Set(allMockIngredients.map((i) => i.id));
    const custom = ingredients.filter((i) => !mockIds.has(i.id));
    localStorage.setItem(CUSTOM_INGREDIENTS_KEY, JSON.stringify(custom));
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
