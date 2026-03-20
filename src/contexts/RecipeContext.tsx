"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ActiveRecipe } from "@/types/ingredient";

export interface SavedRecipe extends ActiveRecipe {
  id: string;
  name: string;
  createdAt: string; // ISO Date String
  isOfficial?: boolean;
}

interface RecipeContextType {
  savedRecipes: SavedRecipe[];
  saveRecipe: (name: string, recipe: ActiveRecipe, isOfficial?: boolean, existingId?: string) => string;
  deleteRecipe: (id: string) => void;
}

const STORAGE_KEY = "slinshot_saved_recipes";

const normalizeRecipe = (recipe: SavedRecipe): SavedRecipe => ({
  ...recipe,
  layerOrder: recipe.layerOrder ?? [],
  garnishOrder: recipe.garnishOrder ?? [],
});

const loadSavedRecipes = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return (JSON.parse(raw) as SavedRecipe[]).map(normalizeRecipe);
    }
  } catch (e) {
    console.error("Failed to load saved recipes", e);
  }

  return [];
};

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(loadSavedRecipes);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecipes.map(normalizeRecipe)));
    } catch (e) {
      console.error("Failed to save recipes to localStorage", e);
    }
  }, [savedRecipes]);

  const saveRecipe = (name: string, recipe: ActiveRecipe, isOfficial: boolean = false, existingId?: string) => {
    const recordId = existingId ?? `recipe_${Date.now()}`;
    const existingRecipe = existingId ? savedRecipes.find((savedRecipe) => savedRecipe.id === existingId) : null;

    const newRecord: SavedRecipe = {
      ...recipe,
      layerOrder: recipe.layerOrder ?? [],
      garnishOrder: recipe.garnishOrder ?? [],
      id: recordId,
      name: name || "My Custom Drink",
      createdAt: existingRecipe?.createdAt ?? new Date().toISOString(),
      isOfficial,
    };

    setSavedRecipes((prev) => {
      if (existingId) {
        return [newRecord, ...prev.filter((recipeItem) => recipeItem.id !== existingId)];
      }
      return [newRecord, ...prev];
    });

    return recordId;
  };

  const deleteRecipe = (id: string) => {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <RecipeContext.Provider value={{ savedRecipes, saveRecipe, deleteRecipe }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used within a RecipeProvider");
  }
  return context;
};
