export type IngredientCategory = "base" | "liquid" | "temperature" | "subIngredient" | "garnish";

export interface IngredientBaseDef {
  id: string;
  name: string;
  category: IngredientCategory;
  iconType?: string;
  colorHex?: string;
  isAdminCreated?: boolean; // true = added by admin, false/undefined = user-added
}

export interface DrinkBase extends IngredientBaseDef {
  category: "base";
  origin?: string;
  dosingGrams?: number;      // e.g. 18g input
  extractionGrams?: number;  // e.g. 36g output yield
  extractionSeconds?: number;// e.g. 28s extraction time
  extractionTemp?: number;   // e.g. 93°C
}

export interface Liquid extends IngredientBaseDef {
  category: "liquid";
  defaultVolumeMl: number;
}

export interface Temperature extends IngredientBaseDef {
  category: "temperature";
  level: number; // e.g. -2 for Extra Ice, 0 for Room Temp, 3 for Hot
  description: string;
}

// Categorizing sub-ingredients by flavor profiles
export type FlavorCategory = "nutty" | "sour" | "sweet" | "bitter" | "fruity" | "other";

export interface SubIngredient extends IngredientBaseDef {
  category: "subIngredient";
  flavorCategory: FlavorCategory;
}

export interface Garnish extends IngredientBaseDef {
  category: "garnish";
}

// A global union type defining any ingredient we might add to a drink
export type IngredientItem = DrinkBase | Liquid | Temperature | SubIngredient | Garnish;

export interface ActiveRecipe {
  cupSizeMl: number; // e.g. 355, 473, 591
  base: DrinkBase | null;
  baseVolumeMl: number; 
  liquids: { liquid: Liquid; volumeMl: number }[];
  subIngredients: { item: SubIngredient; amountGs: number }[];
  garnishes: { item: Garnish; amountGs: number }[];
  temperature: Temperature | null;
  layerOrder: string[]; // Order of base/liquid/syrup IDs from bottom to top
}
