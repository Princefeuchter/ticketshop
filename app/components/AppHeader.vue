<template>
  <div>
    <UHeader>
      <template #title>
        <span class="text-xl font-bold">Leveste Feste</span>
      </template>

      <UNavigationMenu :items="items" />
    </UHeader>
  </div>
</template>

<script lang="ts" setup>
  import type { NavigationMenuItem } from '@nuxt/ui'

  const route = useRoute()

  const items = computed<NavigationMenuItem[]>(() => [
    {
      title: 'Home',
      icon: 'i-mdi-home-variant',
      to: '/',
      active: route.path === '/'
    },
    {
      title: 'Tickets',
      icon: 'i-mdi-ticket',
      to: '/tickets',
      active: route.path === '/tickets'
    },
    {
      title: 'Kontakt',
      icon: 'i-mdi-email',
      to: '/contact',
      active: route.path === '/contact'
    }
  ])
</script>

<style>

</style>