// https://nuxt.com/docs/api/configuration/nuxt-config
const githubPagesBase = process.env.NUXT_APP_BASE_URL || "/";
const isSpaBuild = process.env.NUXT_SPA === "true";

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/fonts"],
  fonts: {
    families: [
      { name: "Oswald", provider: "google", weights: [400, 700] },
      { name: "Barlow Condensed", provider: "google" },
    ],
  },
  // SPA only for static GitHub Pages builds; keep SSR in dev (ssr:false breaks nuxt dev)
  ssr: !isSpaBuild,
  imports: {
    autoImport: true,
  },
  css: ["~/assets/css/main.css", "@fortawesome/fontawesome-svg-core/styles.css"],
  build: {
    transpile: ["@fortawesome/vue-fontawesome"],
  },
  app: {
    baseURL: githubPagesBase,
    head: {
      title: "Darts Game - 501",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Play 501 darts game with friends" },
      ],
    },
  },
});
