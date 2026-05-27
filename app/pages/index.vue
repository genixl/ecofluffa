<template>
  <div class="bg-gray-50 text-brand-charcoal">
    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-6 py-16 lg:py-24">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-brand-blue text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Laundry Pickup & Delivery
          </h1>
          <p class="text-gray-600 text-lg leading-relaxed mb-8">
            EcoFluffa connects you with trusted local laundry providers. Book a pickup, track progress, and receive clean laundry without the hassle.
          </p>

          <div class="flex justify-center gap-4">
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
              @click="$router.push('/browse')"
            />
          </div>
        </div>

        <div class="bg-gradient-to-br from-brand-blue to-brand-blue bg-opacity-5 rounded-2xl p-8 border border-brand-blue border-opacity-10">
  <div class="text-white font-bold text-2xl mb-6">   <!-- was text-brand-blue -->
    What you get with EcoFluffa
  </div>
  <ul class="space-y-4">
    <li class="flex gap-3 items-start">
      <span class="text-2xl text-white">•</span>
      <div>
        <div class="font-semibold text-white">Book in minutes</div>               <!-- was text-brand-charcoal -->
        <div class="text-sm text-blue-100">Quick, hassle-free booking process</div>  <!-- was text-gray-600 -->
      </div>
    </li>
    <li class="flex gap-3 items-start">
      <span class="text-2xl text-white">•</span>
      <div>
        <div class="font-semibold text-white">Live tracking</div>
        <div class="text-sm text-blue-100">Real-time status updates</div>
      </div>
    </li>
    <li class="flex gap-3 items-start">
      <span class="text-2xl text-white">•</span>
      <div>
        <div class="font-semibold text-white">Multiple providers</div>
        <div class="text-sm text-blue-100">Choose from trusted local businesses</div>
      </div>
    </li>
  </ul>
</div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="bg-white border-y border-gray-200">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader
          title="How It Works"
          subtitle="Simple steps from pickup to delivery"
        />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">1</div>
            <div class="text-brand-blue font-bold text-xl mb-3">Choose service</div>
            <div class="text-gray-600 text-sm leading-relaxed">
              Select a laundry provider and the service you need.
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">2</div>
            <div class="text-brand-blue font-bold text-xl mb-3">Confirm pickup</div>
            <div class="text-gray-600 text-sm leading-relaxed">
              Share your pickup address, date, and preferred time.
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">3</div>
            <div class="text-brand-blue font-bold text-xl mb-3">Track delivery</div>
            <div class="text-gray-600 text-sm leading-relaxed">
              Monitor status updates until your laundry is delivered.
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

    <!-- Why Section -->
    <section class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader
          title="Why EcoFluffa"
          subtitle="Better laundry, less effort"
        />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="text-2xl mb-3">○</div>
            <div class="text-brand-blue font-bold mb-2">Provider variety</div>
            <div class="text-gray-600 text-sm leading-relaxed">
              Compare providers based on services and ratings before you book.
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="text-2xl mb-3">◆</div>
            <div class="text-brand-blue font-bold mb-2">Order visibility</div>
            <div class="text-gray-600 text-sm leading-relaxed">
              See status updates for washing, readiness, and delivery.
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="text-2xl mb-3"><Icon name="mdi:package-variant" size="28" style="color: var(--brand-blue);" /></div>
            <div class="text-brand-blue font-bold mb-2">Pickup-first convenience</div>
            <div class="text-gray-600 text-sm leading-relaxed">
              Save time with scheduled pickups instead of driving to drop-off points.
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="text-2xl mb-3"><Icon name="mdi:star" size="28" style="color: var(--brand-blue);" /></div>
            <div class="text-brand-blue font-bold mb-2">Built for everyday cloth</div>
            <div class="text-gray-600 text-sm leading-relaxed">
              From daily wash cycles to delicates, providers offer options that fit your needs.
            </div>
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

definePageMeta({ layout: "default" });
</script>