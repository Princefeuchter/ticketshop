<template>
  <div>
    
  </div>
</template>

<script lang="ts" setup>

  definePageMeta({
    title: 'Admin',
    description: 'Admin Bereich',
    navOrder: 4,
    type: 'primary',
    icon: 'i-mdi-shield-account',
    middleware: ['auth']
  })

</script>

<style>

</style>