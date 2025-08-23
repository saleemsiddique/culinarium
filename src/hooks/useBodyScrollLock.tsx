import { useEffect } from "react";

export const useBodyScrollLock = (isActive: boolean) => {
  useEffect(() => {
    if (isActive) {
      // Guardar el overflow actual
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden"; // Bloquear scroll
      return () => {
        document.body.style.overflow = originalStyle; // Restaurar al cerrar
      };
    }
  }, [isActive]);
};
