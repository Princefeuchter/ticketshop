<template>
    <UPricingPlan 
    title="Frühlingsfest" 
    class="w-96"
    description="Irgend so ein Frühlingsfest"
    badge="Noch verfügbar!"
    price="15€"
    :features="[
        'Zugang zur Veranstaltung',
        'Saufen',
        'Kein Plan'
    ]"
    :button="{
        label: 'Dabei sein!',
        to: '/payment'
        
    }"/>

</template>