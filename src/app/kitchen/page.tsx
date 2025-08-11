'use client';
import { Suspense } from 'react';
import KitchenContent from './KitchenContent';

export default function KitchenPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <KitchenContent />
    </Suspense>
  );
}
