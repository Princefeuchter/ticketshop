<template>
  <UApp :toaster="{ position: 'top-center' }">
    <NuxtRouteAnnouncer />
    <UMain>
      <NuxtLayout>  
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
