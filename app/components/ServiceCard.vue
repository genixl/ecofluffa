<template>
  <div class="bg-brand-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
    <h3 class="text-brand-blue font-bold text-lg mb-2">
      {{ title }}
    </h3>
    <div class="text-brand-orange font-bold text-2xl mb-3">
      {{ price }}
    </div>
    <p class="text-brand-charcoal text-sm leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  price: string;
  description: string;
}>();
</script>

