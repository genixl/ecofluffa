<template>
  <div class="mb-10">
    <h2 class="text-brand-blue text-3xl font-bold mb-3">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="text-gray-600 text-lg">
      {{ subtitle }}
    </p>
    <div class="w-16 h-1 bg-brand-orange rounded-full mt-4"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

