/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Absolute base URL of the API in production (e.g. https://api.onrender.com).
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
