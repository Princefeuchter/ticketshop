<template>
  <div>
    <UHeader>
      <template #title>
        <span class="text-xl font-bold">Leveste Feste</span>
      </template>

      <UNavigationMenu
        class="hidden lg:flex"
        :items="items"
        label-key="title"
        orientation="horizontal"
        :ui="{
          list: 'justify-center w-full',
          item: 'text-center',
          link: 'justify-center text-center',
          linkLabel: 'text-center'
        }"
      />

      <template #body>
        <div class="w-full md:hidden">
          <UNavigationMenu
            :items="items"
            label-key="title"
            orientation="vertical"
            class="w-full"
            :ui="{
              root: 'w-full',
              list: 'w-full',
              item: 'text-center',
              link: 'justify-center text-center',
              linkLabel: 'w-full text-center'
            }"
          />
        </div>
      </template>
    </UHeader>
  </div>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { loggedIn, user } = useUserSession()

const items = computed<NavigationMenuItem[]>(() => {
  const nav: NavigationMenuItem[] = [
    {
      label: 'Home',
      title: 'Home',
      icon: 'i-mdi-home-variant',
      to: '/',
      active: route.path === '/'
    },
    {
      label: loggedIn.value ? 'Profile' : 'Login',
      title: loggedIn.value ? 'Profile' : 'Login',
      icon: 'i-mdi-account',
      to: '/login',
      active: route.path === '/login'
    }
  ]

  if (loggedIn.value && user.value?.role === 'admin') {
    nav.push({
      label: 'Admin',
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