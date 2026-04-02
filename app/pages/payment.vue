<template>
  <div id="checkout">
    
  </div>
</template>

<script lang="ts" setup>
  import type { StripeEmbeddedCheckout } from '@stripe/stripe-js'

  definePageMeta({
    title: 'Zahlung',
    description: 'Hier kannst du deine Zahlung verwalten.',
    navOrder: 5,
    type: 'primary',
    icon: 'i-mdi-credit-card'
  })

  const { $stripe } = useNuxtApp()
  let embeddedCheckout: StripeEmbeddedCheckout | null = null

  const createCheckoutSession = async (): Promise<string> => {
    const { clientSecret } = await $fetch<{ clientSecret: string }>('/api/checkout-session', {
      method: 'POST',
    })

    return clientSecret
  }

  onMounted(async () => {
    if (!$stripe) {
      console.error('Stripe failed to load')
      return
    }

    try {
      const checkout = await $stripe.createEmbeddedCheckoutPage({
        fetchClientSecret: createCheckoutSession,
      })

      checkout.mount('#checkout')
      embeddedCheckout = checkout
    } catch (error) {
      console.error('Failed to initialize Stripe checkout', error)
    }
  })

  onBeforeUnmount(() => {
    embeddedCheckout?.destroy()
  })

</script>

<style>

</style>