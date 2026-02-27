// src/lib/gtag.ts — Google Analytics 4 helper

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Pageview
export function pageview(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

// Generic event
export function event(action: string, params?: Record<string, unknown>) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', action, params);
}

// Eventos clave de negocio
export function trackRecipeGenerated() {
  event('recipe_generated');
}

export function trackSubscriptionStarted(planName: string, price: number) {
  event('subscription_started', { plan_name: planName, value: price, currency: 'EUR' });
}

export function trackPAYGPurchased(price: number) {
  event('payg_purchased', { value: price, currency: 'EUR' });
}
