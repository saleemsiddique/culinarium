// lib/consent-events.ts
export function emitConsentUpdated(analyticsAccepted: boolean) {
  try {
    window.dispatchEvent(
      new CustomEvent("consent:updated", { detail: { analytics: !!analyticsAccepted } })
    );
    // también disparar storage event para otras pestañas (opcional, pero útil)
    try {
      const versionsRaw = localStorage.getItem("consent_versions");
      // re-write to trigger storage on other tabs (same key)
      if (versionsRaw !== null) localStorage.setItem("consent_versions", versionsRaw);
    } catch {}
  } catch {

  }
}
