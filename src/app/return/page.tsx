'use client';
import { Suspense } from 'react';
import ReturnPage from './ReturnPage';

export default function KitchenPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ReturnPage />
    </Suspense>
  );
}
