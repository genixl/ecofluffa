import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', '@nuxtjs/supabase'],
  css: ["~/assets/css/main.css"],
  
  runtimeConfig: {
    public: {
      // These will be overridden by NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_KEY env vars
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    }
  },

  vite: {
    plugins: [tailwindcss()]
  },

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    redirect: false,
  },
})
