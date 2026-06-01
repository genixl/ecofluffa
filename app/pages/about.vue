<template>
  <div class="min-h-screen transition-theme" style="background-color: var(--bg-base); color: var(--text-primary);">
    <div class="max-w-5xl mx-auto px-6 py-20">

      <!-- Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
          style="background-color: var(--brand-blue-light); color: var(--brand-blue);">
          <Icon name="mdi:water" size="16" /> Our Story
        </div>
        <h1 class="text-5xl font-bold mb-6" style="color: var(--brand-blue);">About EcoFluffa</h1>
        <p class="text-lg leading-relaxed max-w-2xl mx-auto" style="color: var(--text-muted);">
          We believe clean laundry shouldn't be a hassle. EcoFluffa connects you with trusted local
          providers who handle the work while you focus on what matters most.
        </p>
      </div>

      <!-- Mission -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div
          v-for="item in mission"
          :key="item.title"
          class="rounded-2xl p-8 text-center transition-all duration-200 hover:-translate-y-1"
          style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
        >
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style="background-color: var(--brand-blue-light);">
            <Icon :name="item.icon" size="28" style="color: var(--brand-blue);" />
          </div>
          <div class="font-bold text-lg mb-2" style="color: var(--brand-blue);">{{ item.title }}</div>
          <div class="text-sm leading-relaxed" style="color: var(--text-muted);">{{ item.desc }}</div>
        </div>
      </div>

      <!-- Our Values -->
      <div class="rounded-2xl p-10 mb-16"
        style="background-color: var(--bg-surface); border: 1px solid var(--border-color);">
        <h2 class="text-3xl font-bold mb-8 text-center" style="color: var(--brand-blue);">Our Values</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="val in values" :key="val.title" class="flex gap-4 items-start">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style="background-color: var(--brand-blue-light);">
              <Icon :name="val.icon" size="20" style="color: var(--brand-blue);" />
            </div>
            <div>
              <div class="font-semibold mb-1" style="color: var(--brand-blue);">{{ val.title }}</div>
              <div class="text-sm leading-relaxed" style="color: var(--text-muted);">{{ val.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-4" style="color: var(--brand-blue);">Ready to get started?</h2>
        <p class="mb-8" style="color: var(--text-muted);">Join thousands of satisfied customers today.</p>
        <div class="flex flex-wrap gap-4 justify-center">
          <NuxtLink to="/auth/register"
            class="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
            style="background-color: var(--brand-orange);">
            Get Started Free
          </NuxtLink>
          <NuxtLink to="/contact"
            class="px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-200 hover:opacity-80"
            style="border-color: var(--brand-blue); color: var(--brand-blue);">
            Contact Us
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const mission = [
  {
    icon: 'mdi:leaf',
    title: 'Eco-Friendly',
    desc: 'We partner with providers who use environmentally responsible cleaning processes and detergents.',
  },
  {
    icon: 'mdi:handshake',
    title: 'Trusted Network',
    desc: 'Every provider is vetted and reviewed, so you always get reliable, professional service.',
  },
  {
    icon: 'mdi:clock-fast',
    title: 'Convenient First',
    desc: 'Scheduled pickups and live tracking put you in full control without the trips to the laundromat.',
  },
]

const values = [
  { icon: 'mdi:shield-check', title: 'Reliability', desc: 'We set clear expectations and deliver on them — every single order.' },
  { icon: 'mdi:eye', title: 'Transparency', desc: 'Live status updates so you always know where your laundry is.' },
  { icon: 'mdi:account-group', title: 'Community', desc: 'Supporting local laundry businesses by connecting them with more customers.' },
  { icon: 'mdi:recycle', title: 'Sustainability', desc: 'Encouraging eco-safe products and responsible water use across our network.' },
]

useHead({ title: 'About Us – EcoFluffa' })
definePageMeta({ layout: 'default' })
</script>
