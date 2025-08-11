'use client';
import { Suspense } from 'react';
import RecipesContent from './RecipesContent';

export default function KitchenPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RecipesContent />
    </Suspense>
  );
}
