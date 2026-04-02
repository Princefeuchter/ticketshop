<template>
  <div>
    <h1>Ticket ID: {{ $route.params.id }}</h1>
    <div v-if="pending">Ticket wird geprueft...</div>
    <div v-else-if="error">Ticket konnte nicht geprueft werden.</div>
    <div v-else-if="isValid">Ticket ist gueltig.</div>
    <div v-else>Ticket ist ungueltig.</div>
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

</script>

<style>

</style>