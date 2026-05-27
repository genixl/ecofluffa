<template>
  <div>
    <div class="flex items-end justify-between gap-6 mb-6">
      <SectionHeader
        title="Your Services"
        subtitle="Manage what you offer"
      />
      <AppButton
        label="Add Service"
        variant="primary"
        type="button"
        @click="openAddServiceCard"
      />
    </div>

    <div
      v-if="showServiceForm"
      class="bg-brand-white border border-brand-gray rounded-xl p-6 mb-6 shadow-md"
    >
      <div class="text-brand-blue font-bold text-xl mb-1">
        {{ editingServiceIndex === null ? "Add New Service" : "Edit Service" }}
      </div>
      <div class="text-brand-charcoal text-sm mb-6">
        Enter the details of the service you want to offer.
      </div>

      <InputField
        label="Service Name"
        type="text"
        placeholder="e.g. Wash & Fold"
        v-model="form.title"
      />
      <InputField
        label="Price"
        type="text"
        placeholder="e.g. KSh 195 / kg"
        v-model="form.price"
      />

      <div class="mb-6">
        <label class="block text-brand-charcoal mb-3 font-semibold text-sm">
          Description
        </label>
        <textarea
          v-model="form.description"
          rows="4"
          placeholder="Describe what this service includes"
          class="w-full border-2 border-gray-300 bg-brand-white text-brand-charcoal px-4 py-3 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue focus:ring-opacity-20 transition-all duration-200"
        />
      </div>

      <div class="flex flex-wrap gap-3">
        <AppButton
          :label="editingServiceIndex === null ? 'Save Service' : 'Update Service'"
          variant="primary"
          type="button"
          @click="saveService"
        />
        <AppButton
          label="Cancel"
          variant="outline"
          type="button"
          @click="closeServiceForm"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="(srv, idx) in services"
        :key="srv.title"
        class="border border-brand-gray bg-brand-white p-5"
      >
        <div class="text-brand-blue font-bold text-lg">
          {{ srv.title }}
        </div>
        <div class="text-brand-charcoal text-sm mt-2 font-semibold">
          {{ srv.price }}
        </div>
        <div class="text-brand-charcoal text-sm mt-2">
          {{ srv.description }}
        </div>

        <div class="flex flex-wrap gap-3 mt-4">
          <AppButton
            label="Edit"
            variant="outline"
            type="button"
            @click="openEditServiceCard(idx)"
          />
          <AppButton
            label="Remove"
            variant="outline"
            type="button"
            @click="removeService(idx)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Service = {
  title: string;
  price: string;
  description: string;
};

const services = ref<Service[]>([
  { title: "Wash & Fold", price: "KSh 195 / kg", description: "Daily laundry cleaning with folding." },
  { title: "Ironing", price: "KSh 104 / item", description: "Pressing for shirts, pants, and uniforms." },
  { title: "Delicate Care", price: "KSh 1,170 / basket", description: "Low-tumble cleaning for delicates." },
]);

const showServiceForm = ref(false);
const editingServiceIndex = ref<number | null>(null);

const emptyForm = (): Service => ({
  title: "",
  price: "",
  description: "",
});

const form = ref<Service>(emptyForm());

const openAddServiceCard = () => {
  editingServiceIndex.value = null;
  form.value = emptyForm();
  showServiceForm.value = true;
};

const openEditServiceCard = (idx: number) => {
  const srv = services.value[idx];
  if (!srv) return;
  editingServiceIndex.value = idx;
  form.value = { ...srv };
  showServiceForm.value = true;
};

const closeServiceForm = () => {
  showServiceForm.value = false;
  editingServiceIndex.value = null;
  form.value = emptyForm();
};

const saveService = () => {
  if (!form.value.title.trim() || !form.value.price.trim() || !form.value.description.trim()) {
    return;
  }

  if (editingServiceIndex.value === null) {
    services.value.unshift({ ...form.value });
    closeServiceForm();
    return;
  }

  const idx = editingServiceIndex.value;
  if (services.value[idx]) {
    services.value[idx] = { ...form.value };
  }
  closeServiceForm();
};

const removeService = (idx: number) => {
  services.value = services.value.filter((_, i) => i !== idx);
};

definePageMeta({ layout: "dashboard" });
</script>

