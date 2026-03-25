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

  const {loggedIn, user, session, fetch, clear, openInPopup} = useUserSession()

  const items = computed<NavigationMenuItem[]>(() => { const nav: NavigationMenuItem[] = [
    {
      title: 'Home',
      icon: 'i-mdi-home-variant',
      to: '/',
      active: route.path === '/'
    },
    {
      title: 'Tickets',
      icon: 'i-mdi-ticket',
      to: '/list',
      active: route.path === '/list'
    },
    {
      title: 'Kontakt',
      icon: 'i-mdi-email',
      to: '/contact',
      active: route.path === '/contact'
    },
    {
      title: 'login',
      icon: 'i-mdi-account',
      to: '/login',
      active: route.path === '/login'
    }
  ]

  if(loggedIn && user?.value?.role === 'admin') {
    nav.push({
      title: 'Admin',
      icon: 'i-mdi-shield-account',
      to: '/admin',
      active: route.path === '/admin'
    })
  }
  return nav
  })
</script>

<style>

</style>