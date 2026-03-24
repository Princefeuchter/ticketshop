<template>
  <div v-if="loggedIn">
    <h1 class="text-4xl font-bold text-center mt-10">
      Du bist eingeloggt!
    </h1>
    <p class="text-center mt-4">Du bist eingeloggt und kannst deine Tickets verwalten.</p>
    <div class="flex justify-center mt-6">
      <button @click="clear" class="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const {loggedIn, user, session, fetch, clear, openInPopup} = useUserSession()

definePageMeta({
    title: 'Login',
    description: 'Hier kannst du dich einloggen, um deine Tickets zu verwalten.',
    navOrder: 4,
    type: 'primary',
    icon: 'i-mdi-account'
})
</script>

<style>

</style>