export interface MacroPercents {
  protein: number;
  carbs: number;
  fats: number;
}

export interface MacroState {
  mode: "basic" | "pro";
  basicGoal: string | null;
  calories: number;
  percents: MacroPercents;
}

export type Difficulty = "Principiante" | "Intermedio" | "Chef";

export interface RecipeFormData {
  ingredients: string[];
  mealTime: string | null;
  diners: number;
  dietaryRestrictions: string[];
  excludedIngredients: string[];
  cuisineStyle: string | null;
  availableTime: string;
  macronutrients: MacroState;
  utensils: string[];
  difficulty: Difficulty;
}

export type FormStatus = "idle" | "loading" | "success" | "error";

export interface FormErrors {
  ingredients: boolean;
  mealTime: boolean;
}

export interface UtensilItem {
  key: string;
  labelKey: string;
  icon: string;
}
