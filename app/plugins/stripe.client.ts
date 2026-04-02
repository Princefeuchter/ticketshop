import { loadStripe, type Stripe } from '@stripe/stripe-js'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const publishableKey = config.public.stripePublishableKey

  if (!publishableKey) {
    console.warn('Stripe publishable key is not configured')
    return {
      provide: {
        stripe: null as Stripe | null,
      },
    }
  }

  const stripe = await loadStripe(publishableKey)

  return {
    provide: {
      stripe,
    },
  }
})