<template>
  <div
    class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
    :class="{ 'ring-2 ring-brand-blue border-brand-blue': highlighted }"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-brand-blue font-bold text-lg">{{ provider.name }}</div>
        <div class="text-gray-500 text-sm mt-0.5">{{ provider.location }}</div>
      </div>
      <div class="bg-brand-orange text-white text-sm font-bold px-2.5 py-1.5 rounded-lg shrink-0">
        {{ provider.rating }}
      </div>
    </div>

    <div class="text-xs text-gray-500 mt-2">
      {{ provider.reviewCount }} reviews · Pickup: {{ provider.pickupFee }}
    </div>

    <div class="mt-4 pt-4 border-t border-gray-100">
      <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {{ serviceTitle }}
      </div>
      <div class="flex items-end justify-between gap-4">
        <div>
          <div class="text-brand-orange font-bold text-2xl">
            KSh {{ offer.price }}
          </div>
          <div class="text-gray-500 text-xs">{{ offer.unit }}</div>
        </div>
        <div class="text-right text-xs text-gray-500">
          <div class="font-medium text-brand-charcoal">{{ offer.turnaround }}</div>
          <div>turnaround</div>
        </div>
      </div>
    </div>

    <NuxtLink
      :to="bookHref"
      class="mt-4 block text-center bg-brand-orange text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-opacity-90 transition-all"
    >
      Book with {{ shortName }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { LaundryProviderListing, ProviderOffer } from "~/data/customerProviders";

const props = defineProps<{
  provider: LaundryProviderListing;
  offer: ProviderOffer;
  serviceTitle: string;
  highlighted?: boolean;
}>();

const shortName = computed(() => props.provider.name.split(" ")[0] ?? props.provider.name);

const bookHref = computed(() => `/order/new?provider=${props.provider.id}&service=${props.offer.serviceId}`);
</script>
