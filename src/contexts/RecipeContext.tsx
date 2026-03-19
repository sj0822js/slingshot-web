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
  saveRecipe: (name: string, recipe: ActiveRecipe, isOfficial?: boolean) => void;
  deleteRecipe: (id: string) => void;
}

const STORAGE_KEY = "slinshot_saved_recipes";

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSavedRecipes(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Failed to load saved recipes", e);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever savedRecipes changes (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecipes));
    } catch (e) {
      console.error("Failed to save recipes to localStorage", e);
    }
  }, [savedRecipes, isLoaded]);

  const saveRecipe = (name: string, recipe: ActiveRecipe, isOfficial: boolean = false) => {
    const newRecord: SavedRecipe = {
      ...recipe,
      id: `recipe_${Date.now()}`,
      name: name || "My Custom Drink",
      createdAt: new Date().toISOString(),
      isOfficial,
    };
    // Unshift to put newest recipes at the front
    setSavedRecipes((prev) => [newRecord, ...prev]);
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
