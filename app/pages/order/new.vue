<template>
  <div class="bg-gray-50 text-brand-charcoal py-12">
    <div class="max-w-2xl mx-auto px-6">
      <SectionHeader
        title="Book Your Pickup"
        subtitle="Enter Your Adress, Date, and Service Preferences"
      />

      <form @submit.prevent="submitOrder" class="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <InputField

          label="Pickup Address"
          type="text"
          placeholder="e.g., 12 Green Street, Apt 4"
          v-model="pickupAddress"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Pickup Date" type="date" v-model="pickupDate" />
          <InputField label="Pickup Time" type="time" v-model="pickupTime" />
        </div>

        <div>
          <label class="block text-brand-charcoal mb-3 font-semibold text-sm">
            Service Type
          </label>
          <select
            v-model="serviceType"
            class="w-full border-2 border-gray-300 bg-brand-white text-brand-charcoal px-4 py-3 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20 transition-all duration-200"
          >
            <option value="Wash & Fold">Wash & Fold</option>
            <option value="Ironing">Ironing</option>
            <option value="Dry Cleaning">Dry Cleaning</option>
            <option value="Delicate Care">Delicate Care</option>
          </select>
        </div>

        <div class="flex gap-4 pt-6">
          <AppButton label="Confirm Order" variant="primary" type="submit" />
          <AppButton
            label="Cancel"
            variant="outline"
            type="button"
            @click="$router.push('/')"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlatform } from "~/composables/usePlatform";

const router = useRouter();
const { createOrder } = usePlatform();

const pickupAddress = ref("");
const pickupDate = ref("");
const pickupTime = ref("");
const serviceType = ref("Wash & Fold");

const submitOrder = () => {
  const id = createOrder({
    provider: "Ocean Breeze Laundry",
    customerName: "Lara Cheruiyot",
    customerPhone: "+254 712 345 678",
    providerPhone: "+254 700 111 222",
    pickupDate: pickupDate.value || "2026-05-30",
    pickupTime: pickupTime.value || "10:00",
    pickupAddress: pickupAddress.value || "Nairobi",
    totalEstimate: "KSh 2,500",
    services: [
      {
        title: serviceType.value,
        price: "KSh 2,500",
        description: `Booked via Ecofluffa  ${serviceType.value}.`,
      },
    ],
  });
  router.push(`/customer/order/${id}`);
};

definePageMeta({ layout: "default" });
</script>
