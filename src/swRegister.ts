/// <reference types="vite/client" />

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const isProd = Boolean(import.meta.env?.PROD);

  if (isProd) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.update();
          console.log("ServiceWorker registered successfully:", registration.scope);
        })
        .catch((error) => {
          console.error("ServiceWorker registration failed:", error);
        });
    });
  } else {
    // In Dev Mode: Unregister existing service workers to always test freshest code
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
  }
}
