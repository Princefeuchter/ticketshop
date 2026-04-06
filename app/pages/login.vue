<template>
  <div v-if="loggedIn">
    <h1 class="text-4xl font-bold text-center mt-10">
      Willkommen, {{ user?.login }}!
    </h1>
    <p>
      Eingeloggt seit {{ session?.loggedInAt }}
    </p>
    <p class="text-center mt-4">Du bist eingeloggt und kannst deine Tickets verwalten.</p>

    <template v-if="tickets.length">
      <div v-for="ticket in tickets" :key="ticket.ticket_code" class="border p-4 rounded mt-4">
        <Qrcode
          :value="ticket.ticket_code ? getTicketValidationUrl(ticket.ticket_code) : 'Kein QR-Code verfügbar'"
          size="200"
          level="H"
          class=" h-50 w-50 mx-auto mt-6"
        />
      </div>
    </template>
    <p v-else-if="!isLoadingTickets" class="text-center mt-4">Du hast aktuell keine Tickets.</p>

    <div class="flex justify-center mt-6">
      <button @click="clear" class="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
    </div>
  </div>
  <div v-else class="text-center mt-10">
    <h1 class="text-4xl font-bold">Du bist nicht eingeloggt</h1>
    <div class="flex justify-center mt-6">
      <UPageCard class="space-y-4" @submit="onSubmit">
        <UAuthForm 
          :schema="login"
          :fields="fields"
          title="Anmelden"
          description="Bitte logge dich ein, um deine Tickets zu verwalten."          
          @submit="onSubmit"
          />
        <div class="mt-6 text-center">
          <p>Noch keinen Account? <NuxtLink to="/register" class="text-blue-500 hover:underline">Registrieren</NuxtLink></p>
      </div>
      </UPageCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import * as z from 'zod'

const {loggedIn, user, session, fetch, clear} = useUserSession()
const requestUrl = useRequestURL()
const tickets = ref<Ticket[]>([])
const isLoadingTickets = ref(false)


definePageMeta({
    title: 'Login',
    description: 'Hier kannst du dich einloggen, um deine Tickets zu verwalten.',
    navOrder: 4,
    type: 'primary',
    icon: 'i-mdi-account'
})

const login = z.object({
  email: z.email(),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein')
})

type Schema = z.infer<typeof login>

const toast = useToast()

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Deine Email',
  required: true
  }, {
  name: 'password',
  type: 'password',
  label: 'Password',
  placeholder: 'Dein Passwort',
  required: true
}]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try{
    await $fetch('/api/login', {
      method: 'POST',
      body: event.data
    })
    toast.add({
      title: 'Login',
      description: 'Login erfolgreich!',
      color: 'success'
    })

    await fetch()
    await navigateTo('/')
  } catch (error) {
    console.error('Login failed:', error)
    toast.add({
      title: 'Login fehlgeschlagen',
      description: 'Bitte überprüfe deine Anmeldedaten und versuche es erneut.',
      color: 'error'
    })
  }
}

async function loadTicketsForLoggedInUser() {
  if (!loggedIn.value) {
    tickets.value = []
    return
  }

  isLoadingTickets.value = true
  tickets.value = await getUserTickets()
  isLoadingTickets.value = false
}

watch([() => loggedIn.value, () => user.value?.id], async () => {
  await loadTicketsForLoggedInUser()
}, { immediate: true })

function getTicketValidationUrl(ticketCode: string) {
  const baseOrigin = import.meta.client ? window.location.origin : requestUrl.origin
  return new URL(`/validate/${encodeURIComponent(ticketCode)}`, baseOrigin).toString()
}

async function getUserTickets(): Promise<Ticket[]> {
  try {
    await fetch()
    if(!user.value?.id) {
      return []
    }
    const tickets = await $fetch<Ticket[]>('/api/userTicket', {
      method: 'POST',
      body: {
        userId: user.value.id
      }
    })
    return tickets || []
  } catch (error) {
    console.error('Failed to fetch user tickets:', error)
    return []
  }
}
</script>

<style>

</style>