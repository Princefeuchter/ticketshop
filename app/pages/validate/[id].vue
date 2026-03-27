<template>
  <div>
    <h1>Ticket ID: {{ $route.params.id }}</h1>
    
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
  async function fetchTicketValidty() {
    try{
      const fetchResult = await $fetch('/api/valid', {
        method: 'POST',
        body: {
          id: route.params.id
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

</script>

<style>

</style>