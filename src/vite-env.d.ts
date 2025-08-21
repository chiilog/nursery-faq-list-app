/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_ANALYTICS_ENABLED?: string;
  readonly VITE_CLARITY_PROJECT_ID?: string;
  readonly VITE_CLARITY_ALLOWED_PROJECT_IDS?: string;
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  readonly VITE_GA4_ALLOWED_MEASUREMENT_IDS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
