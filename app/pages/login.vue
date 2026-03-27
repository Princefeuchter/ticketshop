<template>
  <div v-if="loggedIn">
    <h1 class="text-4xl font-bold text-center mt-10">
      Willkommen, {{ user?.login }}!
    </h1>
    <p>
      Eingeloggt seit {{ session?.loggedInAt }}
    </p>
    <p class="text-center mt-4">Du bist eingeloggt und kannst deine Tickets verwalten.</p>

    <div>
      <Qrcode
        :value="user?.login || ''"
        :size="200"
        class="mx-auto mt-6 h-50 w-50"
      />
    </div>

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

const route = useRoute()

const {loggedIn, user, session, fetch, clear, openInPopup} = useUserSession()

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
  console.log(event.data)

  try{
    const fetchResult = await $fetch('/api/login', {
      method: 'POST',
      body: event.data
    })
    console.log(fetchResult)
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
</script>

<style>

</style>