<template>
  <div class="payment-page">
    <div v-if="paymentState === 'processing'" class="payment-notice payment-notice--info">
      Zahlung wird bestaetigt. Bitte kurz warten...
    </div>

    <div v-if="paymentState === 'success'" class="payment-notice payment-notice--success">
      Zahlung erfolgreich. Dein Ticket wurde erstellt.
      <NuxtLink to="/list" class="payment-link">Zu meinen Tickets</NuxtLink>
    </div>

    <div v-if="paymentState === 'error'" class="payment-notice payment-notice--error">
      {{ paymentErrorMessage }}
      <NuxtLink to="/payment" class="payment-link">Erneut versuchen</NuxtLink>
    </div>

    <div v-show="paymentState === 'idle'" id="checkout"></div>
  </div>
</template>

<script lang="ts" setup>
  import type { StripeEmbeddedCheckout } from '@stripe/stripe-js'

  definePageMeta({
    title: 'Zahlung',
    description: 'Hier kannst du deine Zahlung verwalten.',
    navOrder: 5,
    type: 'primary',
    icon: 'i-mdi-credit-card',
    middleware: ['auth']
  })

  const { $stripe } = useNuxtApp()
  const route = useRoute()
  const router = useRouter()
  const paymentState = ref<'idle' | 'processing' | 'success' | 'error'>('idle')
  const paymentErrorMessage = ref('')
  let embeddedCheckout: StripeEmbeddedCheckout | null = null
  let successRedirectTimer: ReturnType<typeof setTimeout> | null = null

  const createCheckoutSession = async (): Promise<string> => {
    const { clientSecret } = await $fetch<{ clientSecret: string }>('/api/checkout-session', {
      method: 'POST',
    })

    return clientSecret
  }

  onMounted(async () => {
    const sessionId = route.query.session_id

    if (typeof sessionId === 'string' && sessionId.length > 0) {
      paymentState.value = 'processing'

      try {
        await $fetch('/api/checkout-success', {
          method: 'POST',
          body: { sessionId },
        })

        paymentState.value = 'success'
        successRedirectTimer = setTimeout(() => {
          router.push('/list')
        }, 2500)
      } catch (error) {
        paymentState.value = 'error'
        const fetchError = error as { data?: { message?: string; details?: string } }
        const details = fetchError.data?.details || fetchError.data?.message || ''
        paymentErrorMessage.value = details
          ? `Zahlung konnte nicht bestaetigt werden: ${details}`
          : 'Zahlung konnte nicht bestaetigt werden. Bitte kontaktiere den Support oder versuche es erneut.'
        console.error('Failed to finalize successful payment', error)
      }

      return
    }

    if (!$stripe) {
      paymentState.value = 'error'
      paymentErrorMessage.value = 'Stripe konnte nicht geladen werden. Bitte Seite neu laden.'
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
      paymentState.value = 'error'
      const fetchError = error as { data?: { message?: string; details?: string }; message?: string }
      const details = fetchError.data?.details || fetchError.data?.message || fetchError.message || ''
      paymentErrorMessage.value = details
        ? `Checkout konnte nicht gestartet werden: ${details}`
        : 'Checkout konnte nicht gestartet werden. Bitte versuche es spaeter erneut.'
      console.error('Failed to initialize Stripe checkout', error)
    }
  })

  onBeforeUnmount(() => {
    if (successRedirectTimer) {
      clearTimeout(successRedirectTimer)
      successRedirectTimer = null
    }

    embeddedCheckout?.destroy()
  })

</script>

<style>
.payment-page {
  display: grid;
  gap: 1rem;
}

.payment-notice {
  border-radius: 10px;
  padding: 0.9rem 1rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.payment-notice--info {
  border: 1px solid #60a5fa;
  background: #eff6ff;
  color: #1e3a8a;
}

.payment-notice--success {
  border: 1px solid #34d399;
  background: #ecfdf5;
  color: #065f46;
}

.payment-notice--error {
  border: 1px solid #f87171;
  background: #fef2f2;
  color: #991b1b;
}

.payment-link {
  margin-left: 0.75rem;
  font-weight: 600;
  text-decoration: underline;
}

</style>