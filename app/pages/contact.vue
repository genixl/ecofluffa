<template>
  <div class="min-h-screen transition-theme" style="background-color: var(--bg-base); color: var(--text-primary);">
    <div class="max-w-5xl mx-auto px-6 py-20">

      <!-- Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
          style="background-color: var(--brand-blue-light); color: var(--brand-blue);">
          <Icon name="mdi:headset" size="16" /> Support
        </div>
        <h1 class="text-5xl font-bold mb-6" style="color: var(--brand-blue);">Contact Support</h1>
        <p class="text-lg leading-relaxed max-w-2xl mx-auto" style="color: var(--text-muted);">
          Got a question, issue, or feedback? Our support team is ready to help you get the most out of EcoFluffa.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

        <!-- Contact channels -->
        <div class="flex flex-col gap-4">
          <div
            v-for="channel in channels"
            :key="channel.label"
            class="rounded-2xl p-6 flex gap-4 items-start transition-all duration-200 hover:-translate-y-0.5"
            style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style="background-color: var(--brand-blue-light);">
              <Icon :name="channel.icon" size="22" style="color: var(--brand-blue);" />
            </div>
            <div>
              <div class="font-bold mb-0.5" style="color: var(--brand-blue);">{{ channel.label }}</div>
              <div class="text-sm mb-1" style="color: var(--text-muted);">{{ channel.detail }}</div>
              <div class="text-xs font-medium" style="color: var(--text-muted);">{{ channel.hours }}</div>
            </div>
          </div>
        </div>

        <!-- Contact form -->
        <div class="lg:col-span-2 rounded-2xl p-8"
          style="background-color: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
          <h2 class="text-2xl font-bold mb-6" style="color: var(--brand-blue);">Send us a message</h2>

          <form class="space-y-5" @submit.prevent="submit">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Full Name" type="text" placeholder="John Doe" v-model="name" />
              <InputField label="Email" type="email" placeholder="you@example.com" v-model="email" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">Subject</label>
              <select
                v-model="subject"
                class="w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 outline-none focus:ring-2"
                style="background-color: var(--bg-subtle); border-color: var(--border-color); color: var(--text-primary); focus-ring-color: var(--brand-blue);"
              >
                <option value="">Select a topic…</option>
                <option v-for="opt in subjects" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2" style="color: var(--text-primary);">Message</label>
              <textarea
                v-model="message"
                rows="5"
                placeholder="Describe your issue or question in detail…"
                class="w-full px-4 py-3 rounded-xl text-sm border transition-all duration-200 outline-none resize-none"
                style="background-color: var(--bg-subtle); border-color: var(--border-color); color: var(--text-primary);"
              />
            </div>

            <div v-if="submitted" class="rounded-xl px-5 py-4 flex items-center gap-3"
              style="background-color: var(--brand-blue-light);">
              <Icon name="mdi:check-circle" size="20" style="color: var(--brand-blue);" />
              <span class="text-sm font-semibold" style="color: var(--brand-blue);">
                Message sent! We'll get back to you within 24 hours.
              </span>
            </div>

            <div v-if="formError" class="text-red-500 text-sm font-medium">{{ formError }}</div>

            <AppButton
              :label="submitted ? 'Message Sent ✓' : 'Send Message'"
              variant="primary"
              type="submit"
              :disabled="submitted"
            />
          </form>
        </div>
      </div>

      <!-- FAQ strip -->
      <div class="rounded-2xl p-8" style="background-color: var(--bg-surface); border: 1px solid var(--border-color);">
        <h2 class="text-xl font-bold mb-6" style="color: var(--brand-blue);">Frequently Asked Questions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="faq in faqs" :key="faq.q" class="flex gap-3">
            <Icon name="mdi:help-circle" size="20" class="shrink-0 mt-0.5" style="color: var(--brand-blue);" />
            <div>
              <div class="font-semibold text-sm mb-1" style="color: var(--text-primary);">{{ faq.q }}</div>
              <div class="text-sm leading-relaxed" style="color: var(--text-muted);">{{ faq.a }}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useContactSubmissions } from '~/composables/useContactSubmissions'

const { submitContactForm } = useContactSubmissions()

const name = ref('')
const email = ref('')
const subject = ref('')
const message = ref('')
const submitted = ref(false)
const formError = ref('')

const subjects = [
  'Order Issue',
  'Billing & Payments',
  'Provider Complaint',
  'Account Access',
  'General Inquiry',
  'Other',
]

const channels = [
  {
    icon: 'mdi:email-outline',
    label: 'Email Support',
    detail: 'support@ecofluffa.com',
    hours: 'Response within 24 hours',
  },
  {
    icon: 'mdi:phone-outline',
    label: 'Phone Support',
    detail: '+254 (800) ECO-FLUF',
    hours: 'Mon–Fri, 8 am – 6 pm',
  },
  {
    icon: 'mdi:chat-outline',
    label: 'Live Chat',
    detail: 'Available in the app',
    hours: 'Mon–Sun, 9 am – 9 pm',
  },
]

const faqs = [
  { q: 'How do I track my order?', a: 'Log in and go to My Orders. Each order has a live status timeline you can follow.' },
  { q: 'Can I cancel my order?', a: 'Yes — open the order and tap Cancel before the provider has picked it up.' },
  { q: 'How long does pickup take?', a: 'Providers typically confirm and arrange pickup within 2–4 hours of booking.' },
  { q: 'What if my clothes are damaged?', a: 'File a claim through Support within 48 hours of delivery and we\'ll investigate.' },
]

const submit = () => {
  formError.value = ''
  if (!name.value || !email.value || !subject.value || !message.value) {
    formError.value = 'Please fill in all fields before submitting.'
    return
  }
  submitContactForm(name.value, email.value, subject.value, message.value)
  submitted.value = true
}

useHead({ title: 'Contact Support – EcoFluffa' })
definePageMeta({ layout: 'default' })
</script>
