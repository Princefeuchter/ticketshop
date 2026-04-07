<template>
  <h1 class="text-4xl font-bold text-center mt-10">Registrieren</h1>
  <div v-if="isCheckingSession" class="flex flex-col items-center mt-8 gap-3">
    <div class="h-7 w-7 rounded-full border-2 border-gray-300 border-t-green-500 animate-spin"></div>
    <p class="text-sm text-gray-600">Seite wird geladen...</p>
  </div>
  <div v-else class="flex justify-center mt-6">
    <UForm :schema="register" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Vollständiger Name" name="fullname">
        <UInput v-model="state.fullname" type="text" placeholder="Dein vollständiger Name" />
      </UFormField>
      <UFormField label="Email" name="email">
        <UInput v-model="state.email" type="email" placeholder="Deine Email" />
      </UFormField>
      <UFormField label="Geburtsdatum" name="birthdate">
        <UInput v-model="state.birthdate" type="date" placeholder="Dein Geburtsdatum" />
      </UFormField>
      <UFormField label="Passwort" name="password">
        <UInput
          v-model="state.password"
          :type="showPasswords ? 'text' : 'password'"
          placeholder="Dein Passwort"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="ghost"
              square
              :icon="showPasswords ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="showPasswords ? 'Passwort verbergen' : 'Passwort anzeigen'"
              :title="showPasswords ? 'Passwort verbergen' : 'Passwort anzeigen'"
              @click="showPasswords = !showPasswords"
            />
          </template>
        </UInput>
      </UFormField>
      <UFormField label="Passwort bestätigen" name="confirmPassword">
        <UInput
          v-model="state.confirmPassword"
          :type="showPasswords ? 'text' : 'password'"
          placeholder="Passwort bestätigen"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="ghost"
              square
              :icon="showPasswords ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="showPasswords ? 'Passwort verbergen' : 'Passwort anzeigen'"
              :title="showPasswords ? 'Passwort verbergen' : 'Passwort anzeigen'"
              @click="showPasswords = !showPasswords"
            />
          </template>
        </UInput>
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
    path: ['confirmPassword']
  })

  const state = reactive({
    email: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    birthdate: ''
  })
  const showPasswords = ref(false)

  const { loggedIn, fetch } = useUserSession()
  const isCheckingSession = ref(true)

  onMounted(async () => {
    await fetch()
    if (loggedIn.value) {
      await navigateTo('/login')
      return
    }
    isCheckingSession.value = false
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
    icon: 'i-mdi-account-plus'
  })

</script>

<style>

</style>