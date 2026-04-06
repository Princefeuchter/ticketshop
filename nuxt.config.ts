// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    stripeSecretKey: process.env.NUXT_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '',
    checkoutReturnOrigin: process.env.NUXT_CHECKOUT_RETURN_ORIGIN || process.env.CHECKOUT_RETURN_ORIGIN || '',
    stripeAllowedPriceIds: (process.env.NUXT_STRIPE_ALLOWED_PRICE_IDS || process.env.STRIPE_ALLOWED_PRICE_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
    stripeDefaultPriceId: process.env.NUXT_STRIPE_DEFAULT_PRICE_ID || process.env.STRIPE_DEFAULT_PRICE_ID || '',
    stripeDefaultEventId: Number(process.env.NUXT_STRIPE_DEFAULT_EVENT_ID || process.env.STRIPE_DEFAULT_EVENT_ID || 1),
    stripeDefaultOrderItemId: Number(process.env.NUXT_STRIPE_DEFAULT_ORDER_ITEM_ID || process.env.STRIPE_DEFAULT_ORDER_ITEM_ID || 1),
    public: {
      apiBase: '/api',
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51THj5VRqojlaKtAcaH3JBXZGQYehhXkqRCJBzaRF1j0wmRbkFGo8SJPj3QtYgyO8pe1wSRwbGbDRSRNZUyR8c5Nf00FQj8OB0l'
    },
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
      maxAge: 60 * 60 * 2,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      }
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        'zod',
        '@stripe/stripe-js',
      ]
    }
  },
  devServer: {
    host: '0.0.0.0',
    port: 80
  },
  modules: ['@nuxtjs/color-mode', '@nuxt/ui', 'nuxt-auth-utils', '@nuxtjs/supabase', 'nuxt-qrcode'],
  supabase: {
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
  ],
})