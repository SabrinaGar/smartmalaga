// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  runtimeConfig: {
    AZURE_STORAGE_CONNECTION_STRING:
      process.env.AZURE_STORAGE_CONNECTION_STRING,
  },

  modules: [
    "@nuxt/icon",
    "@nuxt/content",
    "@nuxt/ui",
    "@nuxt/fonts",
    "@nuxt/eslint",
  ],
  css: ["leaflet/dist/leaflet.css", "~/assets/css/main.css"],
  ui: {
    themes: {
      default: {
        isDark: false,
      },
    },
    theme: {
      colors: ["primary", "secondary", "success", "info", "warning", "error"],
    },
    primary: "green",
    icons: "heroicons",
    colorMode: false,
  },
});
