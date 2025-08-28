import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ingredient_history';
const MAX_HISTORY = 20;

const COMMON_INGREDIENTS: string[] = [
  'Pollo', 'Carne', 'Pescado', 'Huevos', 'Leche', 'Queso',
  'Arroz', 'Pasta', 'Pan', 'Patatas', 'Cebolla', 'Ajo',
  'Tomate', 'Pimiento', 'Zanahoria', 'Aceite de oliva'
];

interface UseIngredientHistoryReturn {
  ingredientHistory: string[];
 /* addToHistory: (ingredient: string) => void;*/
  getSuggestions: (query: string, currentIngredients?: string[]) => string[];
}

export const useIngredientHistory = (): UseIngredientHistoryReturn => {
  const [ingredientHistory, setIngredientHistory] = useState<string[]>(COMMON_INGREDIENTS);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setIngredientHistory(parsed);
        }
      } catch (error) {
        console.warn('Error al cargar historial:', error);
      }
    }
  }, []);

  /*const addToHistory = (ingredient: string): void => {
    if (!ingredient || typeof ingredient !== 'string') return;
    
    const normalizedIngredient = ingredient.trim().toLowerCase();
    
    setIngredientHistory(prev => {
      const filtered = prev.filter(item => 
        item.toLowerCase() !== normalizedIngredient
      );
      
      const newHistory = [ingredient.trim(), ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      
      return newHistory;
    });
  };*/

  const getSuggestions = (query: string, currentIngredients: string[] = []): string[] => {
    if (!query || query.length < 2) return [];
    
    const normalizedQuery = query.toLowerCase();
    const normalizedCurrent = currentIngredients.map(ing => ing.toLowerCase());
    
    return ingredientHistory
      .filter(ingredient => 
        ingredient.toLowerCase().includes(normalizedQuery) &&
        !normalizedCurrent.includes(ingredient.toLowerCase())
      )
      .slice(0, 8);
  };

  return { ingredientHistory, /*addToHistory,*/ getSuggestions };
};