// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: [
    "@nuxt/icon",
    "@nuxt/content",
    "@nuxt/ui",
    "@nuxt/fonts",
    "@nuxt/eslint"
  ],
  css: ["bootstrap/dist/css/bootstrap.min.css",
        "leaflet/dist/leaflet.css"
  ]
});
