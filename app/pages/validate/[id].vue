<template>
  <div class="validate-page" :class="`state-${validationState}`">
    <section class="validate-card">
      <p class="eyebrow">Ticket Validation</p>
      <h1 class="title">Einlasskontrolle</h1>

      <div class="ticket-id-wrap">
        <span class="ticket-id-label">Ticket ID</span>
        <code class="ticket-id">{{ route.params.id }}</code>
      </div>

      <div class="status-panel">
        <p class="status-kicker">Status</p>
        <h2 class="status-title">{{ statusTitle }}</h2>
        <p class="status-message">{{ statusMessage }}</p>
      </div>

      <NuxtLink to="/admin" class="back-link">Zurueck zum Adminbereich</NuxtLink>
    </section>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()

definePageMeta({
    title: 'Ticket Validierung',
    description: 'Hier kannst du deine Tickets validieren.',
    navOrder: 6,
    type: 'primary',
    icon: 'i-mdi-ticket-confirmation',
    middleware: ['is-admin']
  })

const { data, pending, error } = await useAsyncData('ticket-validation', () =>
  $fetch('/api/valid', {
    method: 'POST',
    body: {
      id: String(route.params.id)
    }
  })
)

const isValid = computed(() => data.value?.valid === true)
const validationState = computed<'pending' | 'error' | 'valid' | 'invalid'>(() => {
  if (pending.value) {
    return 'pending'
  }

  if (error.value) {
    return 'error'
  }

  return isValid.value ? 'valid' : 'invalid'
})

const statusTitle = computed(() => {
  if (validationState.value === 'pending') {
    return 'Ticket wird geprueft...'
  }

  if (validationState.value === 'error') {
    return 'Validierung fehlgeschlagen'
  }

  if (validationState.value === 'valid') {
    return 'Ticket ist gueltig'
  }

  return 'Ticket ist ungueltig'
})

const statusMessage = computed(() => {
  if (validationState.value === 'pending') {
    return 'Bitte kurz warten, die Ticketdaten werden geladen.'
  }

  if (validationState.value === 'error') {
    return 'Die Pruefung konnte nicht abgeschlossen werden. Bitte Seite neu laden.'
  }

  if (validationState.value === 'valid') {
    return 'Einlass kann erteilt werden. Das Ticket wurde erfolgreich verifiziert.'
  }

  return 'Dieses Ticket ist nicht valide. Bitte Ticketdaten erneut kontrollieren.'
})

</script>

<style>
.validate-page {
  --accent: #2563eb;
  --accent-soft: #dbeafe;
  --accent-ink: #1e3a8a;
  min-height: calc(100vh - 6rem);
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background:
    radial-gradient(60rem 30rem at 10% 0%, #e0f2fe 0%, transparent 60%),
    radial-gradient(50rem 30rem at 100% 100%, #e2e8f0 0%, transparent 65%),
    linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%);
}

.validate-page.state-valid {
  --accent: #059669;
  --accent-soft: #d1fae5;
  --accent-ink: #065f46;
}

.validate-page.state-invalid,
.validate-page.state-error {
  --accent: #dc2626;
  --accent-soft: #fee2e2;
  --accent-ink: #7f1d1d;
}

.validate-page.state-pending {
  --accent: #d97706;
  --accent-soft: #fef3c7;
  --accent-ink: #78350f;
}

.validate-card {
  width: min(100%, 42rem);
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(6px);
  padding: 1.5rem;
  font-family: 'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif;
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
}

.title {
  margin: 0.25rem 0 1rem;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  line-height: 1.1;
  color: #0f172a;
}

.ticket-id-wrap {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 1.2rem;
}

.ticket-id-label {
  font-size: 0.82rem;
  color: #64748b;
}

.ticket-id {
  padding: 0.45rem 0.65rem;
  border-radius: 10px;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  font-size: 0.92rem;
  color: #0f172a;
  word-break: break-word;
}

.status-panel {
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--accent) 35%, white);
  background: linear-gradient(160deg, var(--accent-soft) 0%, #ffffff 95%);
  padding: 1rem;
}

.status-kicker {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent-ink);
}

.status-title {
  margin: 0.35rem 0 0.4rem;
  font-size: clamp(1.3rem, 3.5vw, 1.7rem);
  color: #111827;
}

.status-message {
  margin: 0;
  color: #374151;
  line-height: 1.5;
}

.back-link {
  margin-top: 1rem;
  display: inline-block;
  color: var(--accent-ink);
  text-decoration: underline;
  text-underline-offset: 3px;
  font-weight: 600;
}

</style>