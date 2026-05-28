<template>
  <div class="mb-10">
    <h2 class="text-brand-blue text-3xl font-bold mb-3 text-on-image">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="text-brand-blue text-lg font-medium text-on-image">
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

