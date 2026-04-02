<template>
  <div class="mx-auto mt-10 max-w-xl px-4">
    <h1 class="text-3xl font-bold">Admin Bereich</h1>
    <p class="mt-2 text-sm text-gray-600">
      Vorhandene Benutzer koennen hier per Email-Adresse zu Admins hochgestuft werden.
    </p>

    <UCard class="mt-6">
      <UForm :schema="promoteSchema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Email des vorhandenen Benutzers" name="email">
          <UInput
            v-model="state.email"
            type="email"
            placeholder="name@example.com"
          />
        </UFormField>

        <div class="flex items-center gap-3">
          <UButton type="submit" :loading="isSubmitting">
            Als Admin setzen
          </UButton>
          <span v-if="resultMessage" class="text-sm text-gray-700">{{ resultMessage }}</span>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const isSubmitting = ref(false)
const resultMessage = ref('')

const promoteSchema = z.object({
  email: z.email('Bitte eine gueltige Email eingeben')
})

type PromoteSchema = z.infer<typeof promoteSchema>

const state = reactive<PromoteSchema>({
  email: ''
})

async function onSubmit(event: FormSubmitEvent<PromoteSchema>) {
  isSubmitting.value = true
  resultMessage.value = ''

  try {
    const response = await $fetch<{ success: boolean; alreadyAdmin: boolean; email: string }>('/api/admin/promote', {
      method: 'POST',
      body: {
        email: event.data.email
      }
    })

    if (response.alreadyAdmin) {
      resultMessage.value = `${response.email} ist bereits Admin.`
      toast.add({
        title: 'Keine Aenderung',
        description: resultMessage.value,
        color: 'warning'
      })
      return
    }

    resultMessage.value = `${response.email} wurde als Admin gesetzt.`
    toast.add({
      title: 'Erfolg',
      description: resultMessage.value,
      color: 'success'
    })

    state.email = ''
  }
  catch (error: any) {
    const message = error?.data?.message || error?.statusMessage || 'Rolle konnte nicht aktualisiert werden.'
    resultMessage.value = message
    toast.add({
      title: 'Fehler',
      description: message,
      color: 'error'
    })
  }
  finally {
    isSubmitting.value = false
  }
}

  definePageMeta({
    title: 'Admin',
    description: 'Admin Bereich',
    navOrder: 4,
    type: 'primary',
    icon: 'i-mdi-shield-account',
    middleware: ['auth', 'is-admin']
  })

</script>

<style>

</style>