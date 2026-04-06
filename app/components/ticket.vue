<template>
    <UPricingPlan
        title="Frühlingsfest"
        class="ticket-plan w-96"
        description="Live-Musik, Getränke und Festivalstimmung in Leveste - dein Ticket für einen unvergesslichen Abend."
        :badge="isSoldOut ? 'Ausverkauft' : 'Noch verfuegbar!'"
        price="15€"
        :features="[
            'Eintritt zum kompletten Eventgelände',
            'Biergarten mit Live-Musik',
            'Snacks und Getraenke von lokalen Anbietern',
            'Schneller Einlass per QR-Ticket'
        ]"
        :button="{
            label: 'Dabei sein!',
            to: '/payment'
        }"
    />

</template>

<script setup lang="ts">
const SOLD_OUT_THRESHOLD = 500

const { data } = await useAsyncData('event-status', () => $fetch<{
    id: number
    capacity: number
    ticketsSold: number
    isActive: boolean
}>('/api/event-status'))

const isSoldOut = computed(() => {
    const ticketsSold = Number(data.value?.ticketsSold || 0)
    return ticketsSold >= SOLD_OUT_THRESHOLD
})
</script>

<style scoped>
.ticket-plan :deep(h2),
.ticket-plan :deep(h3) {
    font-size: 1.375rem;
    line-height: 1.75rem;
}
</style>