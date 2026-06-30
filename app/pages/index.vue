<template>
  <div class="text-brand-charcoal page-bg-container" :style="{
    backgroundImage: 'url(/hero-bg.jpeg)',
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }">

    <!-- Hero Section -->
    <section class="relative max-w-7xl mx-auto px-6 py-16 lg:py-24 rounded-3xl overflow-hidden">
      <div class="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-on-image" style="color: var(--brand-blue);">
            Laundry Pickup & Delivery
          </h1>
          <p class="text-lg leading-relaxed mb-8 text-on-image font-medium" style="color: var(--brand-blue);">
            EcoFluffa connects you with trusted local laundry providers. Book a pickup, track progress, and receive clean laundry without the hassle.
          </p>

          <div class="flex flex-wrap gap-4">
            <AppButton
              label="Book a Pickup"
              variant="primary"
              type="button"
              @click="goToOrderNew"
            />
            <AppButton
              label="Browse Providers"
              variant="secondary"
              type="button"
              @click="$router.push('/customer/browse')"
            />
          </div>
        </div>

        <div class="glass-card rounded-2xl p-8">
          <div class="font-bold text-2xl mb-6" style="color: var(--brand-blue);">
            What you get with EcoFluffa
          </div>
          <ul class="space-y-4">
            <li v-for="item in heroFeatures" :key="item.title" class="flex gap-3 items-start">
              <span class="text-xl mt-0.5" style="color: var(--brand-blue);">✦</span>
              <div>
                <div class="font-semibold" style="color: var(--brand-blue);">{{ item.title }}</div>
                <div class="text-sm font-medium text-muted">{{ item.desc }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section>
      <div class="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader
          title="How It Works"
          subtitle="Simple steps from pickup to delivery"
        />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">

          <!-- Skewed / parallelogram image -->
          <div class="skewed-image-wrap">
            <img src="/hero-1.jpg" alt="How it works process" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              v-for="step in steps"
              :key="step.number"
              class="glass-card rounded-xl p-8 col-span-2 md:col-span-1"
            >
              <div class="text-4xl mb-4 font-bold" style="color: var(--brand-blue); opacity: 0.2;">{{ step.number }}</div>
              <div class="font-bold text-xl mb-3" style="color: var(--brand-blue);">{{ step.title }}</div>
              <div class="text-muted text-sm leading-relaxed font-medium">{{ step.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Providers Section -->
    <section class="max-w-7xl mx-auto px-6 py-16">
      <SectionHeader title="Featured Providers" subtitle="Popular choices in your area" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProviderCard
          name="Ocean Breeze Laundry"
          location="Riverside District"
          :rating="4.6"
          :services="['Wash & Fold', 'Ironing', 'Dry Cleaning']"
        />
        <ProviderCard
          name="Sunshine Suds Co."
          location="Central Business Area"
          :rating="4.4"
          :services="['Wash & Fold', 'Stain Removal', 'Blanket Cleaning']"
        />
        <ProviderCard
          name="FreshWave Laundry"
          location="North End"
          :rating="4.7"
          :services="['Wash & Fold', 'Delicate Care', 'Curtain Cleaning']"
        />
      </div>
    </section>

    <!-- Why EcoFluffa Section -->
    <section>
      <div class="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader
          title="Why EcoFluffa"
          subtitle="Better laundry, less effort"
        />
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="reason in whyReasons"
              :key="reason.title"
              class="glass-card rounded-xl p-6"
            >
              <div class="font-bold mb-2" style="color: var(--brand-blue);">{{ reason.title }}</div>
              <div class="text-muted text-sm leading-relaxed font-medium">{{ reason.desc }}</div>
            </div>
          </div>

          <!-- Skewed / parallelogram image -->
          <div class="skewed-image-wrap">
            <img src="/hero-bg.jpeg" alt="Why EcoFluffa benefits" />
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
const router = useRouter();

const goToOrderNew = () => {
  router.push("/order/new");
};

const heroFeatures = [
  { title: "Book in minutes", desc: "Quick, hassle-free booking process" },
  { title: "Live tracking", desc: "Real-time status updates" },
  { title: "Multiple providers", desc: "Choose from trusted local businesses" },
];

const steps = [
  { number: "1", title: "Choose service", desc: "Select a laundry provider and the service you need." },
  { number: "2", title: "Confirm pickup", desc: "Share your pickup address, date, and preferred time." },
  { number: "3", title: "Track delivery", desc: "Monitor status updates until your laundry is delivered." },
];

const whyReasons = [
  { title: "Provider variety", desc: "Compare providers based on services and ratings before you book." },
  { title: "Order visibility", desc: "See status updates for washing, readiness, and delivery." },
  { title: "Pickup-first convenience", desc: "Save time with scheduled pickups instead of driving to drop-off points." },
  { title: "Built for everyday cloth", desc: "From daily wash cycles to delicates, providers offer options that fit your needs." },
];

definePageMeta({ layout: "default" });
</script>

<style scoped>
/* Glassmorphism card */
.glass-card {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 4px 24px rgba(15, 76, 129, 0.08);
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 8px 32px rgba(15, 76, 129, 0.14);
  transform: translateY(-2px);
}

[data-theme="dark"] .glass-card {
  background: rgba(15, 76, 129, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .glass-card:hover {
  background: rgba(15, 76, 129, 0.28);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
}

/* Parallelogram / skewed image shape matching the sketch */
.skewed-image-wrap {
  position: relative;
  height: 320px;
  overflow: hidden;
  border-radius: 1rem;

  /* skew the container to create the pillow/parallelogram shape */
  clip-path: polygon(
    8% 0%,    /* top-left: slightly indented */
    100% 0%,  /* top-right: full width */
    92% 100%, /* bottom-right: slightly indented */
    0% 100%   /* bottom-left: full width */
  );

  transition: box-shadow 0.3s ease;
}

.skewed-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.skewed-image-wrap:hover img {
  transform: scale(1.06);
}

.skewed-image-wrap:hover {
  box-shadow: 0 12px 40px rgba(15, 76, 129, 0.18);
}

[data-theme="dark"] .skewed-image-wrap:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}
</style>