"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ActiveRecipe } from "@/types/ingredient";
import { loadAppState, saveAppState } from "@/lib/appStateStore";

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
  notes: recipe.notes ?? "",
});

const loadSavedRecipes = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SavedRecipe[] | { data?: SavedRecipe[] };
      const latest = Array.isArray(parsed) ? parsed : parsed.data ?? [];
      return latest.map(normalizeRecipe);
    }
  } catch (e) {
    console.error("Failed to load saved recipes", e);
  }

  return [];
};

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(loadSavedRecipes);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const syncRecipes = async () => {
      const envelope = await loadAppState("recipes", STORAGE_KEY, [] as SavedRecipe[], {
        legacyReader: loadSavedRecipes,
      });

      if (!active) {
        return;
      }

      setSavedRecipes(envelope.data.map(normalizeRecipe));
      setIsLoaded(true);
    };

    void syncRecipes();

    const handleWindowFocus = () => {
      if (!active) {
        return;
      }

      void syncRecipes();
    };

    const handleVisibilityChange = () => {
      if (!active || document.visibilityState !== "visible") {
        return;
      }

      void syncRecipes();
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    void saveAppState("recipes", STORAGE_KEY, savedRecipes.map(normalizeRecipe));
  }, [savedRecipes, isLoaded]);

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
