<template>
  <h1 class="text-4xl font-bold text-center mt-10">Registrieren</h1>
  <div class="flex justify-center mt-6">
    <UForm :schema="register" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Vollständiger Name">
        <UInput v-model="state.fullname" type="text" placeholder="Dein vollständiger Name" />
      </UFormField>
      <UFormField label="Email">
        <UInput v-model="state.email" type="email" placeholder="Deine Email" />
      </UFormField>
      <UFormField label="Geburtsdatum">
        <UInput v-model="state.birthdate" type="date" placeholder="Dein Geburtsdatum" />
      </UFormField>
      <UFormField label="Passwort">
        <UInput v-model="state.password" type="password" placeholder="Dein Passwort" />
      </UFormField>
      <UFormField label="Passwort bestätigen">
        <UInput v-model="state.confirmPassword" type="password" placeholder="Passwort bestätigen" />
      </UFormField>
      <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded">Registrieren</button>

    </UForm>
  </div>
</template>

<script lang="ts" setup>
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const register = z.object({
    email: z.email(),
    password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
    confirmPassword: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
    fullname: z.string().min(2, 'Vollständiger Name muss mindestens 2 Zeichen lang sein'),
    birthdate: z.string().refine((date) => {
      const parsedDate = Date.parse(date)
      return !isNaN(parsedDate) && parsedDate < Date.now()
    }, 'Ungültiges Geburtsdatum')
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter müssen übereinstimmen',
  })

  const state = reactive({
    email: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    birthdate: ''
  })

  async function onSubmit(event: FormSubmitEvent<z.infer<typeof register>>) {
    console.log(event.data)

    try {
      await $fetch('/api/register', {
        method: 'POST',
        body: event.data
      })

      const toast = useToast()
      toast.add({
        title: 'Erfolg',
        description: 'Dein Konto wurde erfolgreich erstellt. Du kannst dich jetzt einloggen.',
      })

      await navigateTo('/login')
    } catch (error) {
      const toast = useToast()
      toast.add({
        title: 'Fehler',
        description: 'Beim Erstellen des Kontos ist ein Fehler aufgetreten.',
      })
    }
  }

  definePageMeta({
    title: 'Registrieren',
    description: 'Erstellen Sie ein neues Konto, um Tickets zu kaufen.',
    navOrder: 3,
    type: 'primary',
    icon: 'i-mdi-account-plus',
    middleware: [
      defineNuxtRouteMiddleware(async () => {
        const {loggedIn, fetch} = useUserSession()
        await fetch()
        if(loggedIn.value) {
          return navigateTo('/login')
        }
      })
    ]
  })

</script>

<style>

</style>