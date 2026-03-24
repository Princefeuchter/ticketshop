<script setup lang="ts">
import Ticket from '~/components/ticket.vue';

definePageMeta({
    title: 'Home',
    description: 'Hol dir dein Ticket JETZT!',
    navOrder: 1,
    type: 'primary',
    icon: 'i-mdi-home-variant'
    })
</script>

<template>
    <div>
        <h1 class="text-4xl font-bold text-center mt-10">
            Leveste Feste - Ticketshop
        </h1>
        <h2 class="text-3xl font-bold text-center mt-10 mb-4">Aktuell verfügbare Tickets</h2>
        <Ticket class="mx-auto"/>
    </div>
</template>