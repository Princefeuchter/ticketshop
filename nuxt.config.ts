// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig:{
    public: {
      apiBase: '/api'
    }
  },

  modules:['@nuxtjs/color-mode', '@nuxt/ui', 'nuxt-auth-utils', '@nuxtjs/supabase', 'nuxt-qrcode'],
  supabase:{
    redirect: false
  },
  qrcode: {
    options: {
      variant: 'pixelated',
      blackColor: '#000000',
      whiteColor: '#ffffff', 
    },
  },
  css: [
    '~/assets/css/main.css'
  ]
})