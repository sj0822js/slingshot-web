"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { IngredientItem } from "@/types/ingredient";
import { allMockIngredients } from "@/data/mockIngredients";

const INGREDIENTS_STORAGE_KEY = "slingshot_ingredients";

interface IngredientContextType {
  ingredients: IngredientItem[];
  addIngredient: (item: IngredientItem) => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (id: string, data: Partial<IngredientItem>) => void;
}

const IngredientContext = createContext<IngredientContextType | undefined>(undefined);

export const IngredientProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<IngredientItem[]>(() => {
    if (typeof window === "undefined") {
      return allMockIngredients;
    }

    try {
      const raw = localStorage.getItem(INGREDIENTS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as IngredientItem[];
      }
    } catch {
      return allMockIngredients;
    }

    return allMockIngredients;
  });

  useEffect(() => {
    localStorage.setItem(INGREDIENTS_STORAGE_KEY, JSON.stringify(ingredients));
  }, [ingredients]);

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
