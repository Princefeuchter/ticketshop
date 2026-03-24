<template>
  <div v-if="loggedIn">
    <h1 class="text-4xl font-bold text-center mt-10">
      Willkommen, {{ user?.login }}!
    </h1>
    <p>
      Eingeloggt seit {{ session?.loggedInAt }}
    </p>
    <p class="text-center mt-4">Du bist eingeloggt und kannst deine Tickets verwalten.</p>
    <div class="flex justify-center mt-6">
      <button @click="clear" class="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
    </div>
  </div>
  <div v-else class="text-center mt-10">
    <h1 class="text-4xl font-bold">Du bist nicht eingeloggt</h1>
    <p class="mt-4">Bitte logge dich ein, um deine Tickets zu verwalten.</p>
    <div class="flex justify-center mt-6">
      <UForm :schema="login" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField class="" label="Email">
          <UInput v-model="state.email" type="email" placeholder="Deine Email" />
        </UFormField>
        <UFormField class="mt-4" label="Password">
          <UInput v-model="state.password" type="password" placeholder="Dein Passwort" />
        </UFormField>
        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Login</button>

      </UForm>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

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

const state = reactive({
  email: '',
  password: ''
})

type Schema = z.infer<typeof login>

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Login',
    description: 'Login erfolgreich!',
    color: 'success'
  })
  console.log(event.data)
}
</script>

<style>

</style>