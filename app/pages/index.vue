<template>
  <div class="lp">

    <!-- ══════════════════════════════════════════════
         HERO
    ══════════════════════════════════════════════ -->
    <section class="hero" ref="heroRef">
      <div class="hero__bg-wave"></div>
      <div class="hero__bg-glow"></div>

      <div class="container hero__layout">
        <div class="hero__copy" :class="{ in: ready }">
          <span class="eyebrow">Smart Laundry · Simple Management</span>
          <h1 class="hero__h1">
            Laundry Pickup<br>
            <em class="hero__em">&amp; Delivery</em>
          </h1>
          <p class="hero__p">
            EcoFluffa connects you with trusted local laundry providers.
            Book a pickup, track progress, and receive clean clothes —
            without the hassle.
          </p>
          <div class="hero__btns">
            <button class="btn-fill" @click="goToOrderNew" id="hero-book">
              Book a Pickup
              <span class="btn-fill__arrow">→</span>
            </button>
            <button class="btn-line" @click="$router.push('/browse')" id="hero-browse">
              Browse Providers
            </button>
          </div>
        </div>

        <!-- Right visual -->
        <div class="hero__right" :class="{ in: ready }">
          <!-- Main image slot -->
          <div class="img-slot img-slot--lg">
            <Icon name="mdi:washing-machine" size="52" />
            <span>Hero Image</span>
          </div>

          <!-- Benefits card -->
          <div class="benefits-card">
            <p class="benefits-card__label">What you get</p>
            <div class="benefit" v-for="b in benefits" :key="b">
              <span class="benefit__dot"></span>
              <span>{{ b }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════
         HOW IT WORKS
    ══════════════════════════════════════════════ -->
    <section class="section section--off" v-observe>
      <div class="container">
        <div class="sec-head">
          <span class="eyebrow eyebrow--dark">Process</span>
          <h2>How It Works</h2>
          <p>Simple steps from pickup to delivery</p>
        </div>

        <div class="steps-row">
          <div
            class="step-item"
            v-for="(s, i) in steps"
            :key="s.title"
            :style="{ '--delay': `${i * 0.12}s` }"
          >
            <!-- image slot per step -->
            <div class="img-slot img-slot--step">
              <Icon :name="s.icon" size="28" />
            </div>
            <div class="step-item__num">0{{ i + 1 }}</div>
            <div class="step-item__title">{{ s.title }}</div>
            <div class="step-item__desc">{{ s.desc }}</div>

            <!-- connector -->
            <div v-if="i < steps.length - 1" class="step-item__arrow">›</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════
         FEATURED PROVIDERS
    ══════════════════════════════════════════════ -->
    <section class="section section--navy" v-observe>
      <div class="container">
        <div class="sec-head sec-head--light">
          <span class="eyebrow eyebrow--light">Providers</span>
          <h2>Featured Providers</h2>
          <p>Popular choices in your area</p>
        </div>

        <div class="providers-grid">
          <div
            class="pcard"
            v-for="(p, i) in providers"
            :key="p.name"
            :style="{ '--delay': `${i * 0.1}s` }"
            @mouseenter="p.hovered = true"
            @mouseleave="p.hovered = false"
          >
            <div class="img-slot img-slot--card" :class="{ 'img-slot--lift': p.hovered }">
              <Icon name="mdi:store" size="26" />
              <span>Provider Photo</span>
            </div>
            <div class="pcard__body">
              <div class="pcard__top">
                <div>
                  <div class="pcard__name">{{ p.name }}</div>
                  <div class="pcard__loc"><Icon name="mdi:map-marker-outline" size="12" />{{ p.location }}</div>
                </div>
                <div class="pcard__stars"><Icon name="mdi:star" size="12" />{{ p.rating }}</div>
              </div>
              <div class="pcard__tags">
                <span v-for="s in p.services" :key="s">{{ s }}</span>
              </div>
              <button class="pcard__cta" @click="$router.push('/browse')">
                View Provider <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════
         WHY ECOFLUFFA
    ══════════════════════════════════════════════ -->
    <section class="section section--white" v-observe>
      <div class="container">
        <div class="sec-head">
          <span class="eyebrow eyebrow--dark">Benefits</span>
          <h2>Why EcoFluffa</h2>
          <p>Better laundry, less effort</p>
        </div>

        <div class="why-grid">
          <div
            class="why-card"
            v-for="(w, i) in why"
            :key="w.title"
            :style="{ '--delay': `${i * 0.1}s` }"
          >
            <div class="why-card__icon">
              <Icon :name="w.icon" size="20" />
            </div>
            <div class="why-card__title">{{ w.title }}</div>
            <div class="why-card__desc">{{ w.desc }}</div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const ready  = ref(false)
onMounted(() => setTimeout(() => (ready.value = true), 80))
const goToOrderNew = () => router.push('/order/new')
definePageMeta({ layout: 'default' })

// ── scroll-reveal directive ──────────────────────────
const vObserve = {
  mounted(el: HTMLElement) {
    el.classList.add('reveal')
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('reveal--in'); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
  }
}

const benefits = [
  'Book in minutes — hassle-free',
  'Live tracking on every order',
  'Multiple trusted providers',
]

const steps = [
  { title: 'Choose Service',  icon: 'mdi:magnify',           desc: 'Select a laundry provider and the service you need.' },
  { title: 'Confirm Pickup',  icon: 'mdi:map-marker-check',  desc: 'Share your pickup address, date, and preferred time.' },
  { title: 'Track Delivery',  icon: 'mdi:truck-delivery',    desc: 'Monitor status updates until your laundry is delivered.' },
]

const providers = reactive([
  { name: 'Ocean Breeze Laundry', location: 'Riverside District',    rating: 4.6, services: ['Wash & Fold', 'Ironing', 'Dry Cleaning'],     hovered: false },
  { name: 'Sunshine Suds Co.',    location: 'Central Business Area', rating: 4.4, services: ['Wash & Fold', 'Stain Removal', 'Blankets'],    hovered: false },
  { name: 'FreshWave Laundry',    location: 'North End',             rating: 4.7, services: ['Wash & Fold', 'Delicate Care', 'Curtains'],    hovered: false },
])

const why = [
  { icon: 'mdi:store-search',    title: 'Provider variety',         desc: 'Compare providers on services and ratings before you book.' },
  { icon: 'mdi:eye-outline',     title: 'Order visibility',         desc: 'See status updates for washing, readiness, and delivery.' },
  { icon: 'mdi:package-variant', title: 'Pickup-first convenience', desc: 'Scheduled pickups save time — no driving to drop-off points.' },
  { icon: 'mdi:star-outline',    title: 'Built for everyday cloth', desc: 'From daily wash to delicates, providers match your needs.' },
]
</script>

<style scoped>
/* ══ Tokens ═══════════════════════════════════════════ */
:root {
  --navy:     #0F4C81;
  --navy-deep:#09325a;
  --sky:      #4a9fd4;
  --sky-light:#e0f0fb;
  --orange:   #FF6B35;
  --white:    #ffffff;
  --off:      #f4f8fd;
  --muted:    #64748b;
  --border:   #dde8f4;
}

/* ══ Base ══════════════════════════════════════════════ */
.lp { font-family: 'Inter', system-ui, sans-serif; background: var(--off); }
.container { max-width: 1120px; margin: 0 auto; padding: 0 1.5rem; }

/* ══ Scroll-reveal ════════════════════════════════════ */
.reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
.reveal--in { opacity: 1; transform: none; }

/* ══ Eyebrow ══════════════════════════════════════════ */
.eyebrow {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  padding: 4px 12px;
  border-radius: 999px;
}
.eyebrow--dark  { background: var(--sky-light); color: var(--navy); }
.eyebrow--light { background: rgba(255,255,255,0.15); color: #fff; }

/* ══ HERO ══════════════════════════════════════════════ */
.hero {
  position: relative;
  background: linear-gradient(130deg, var(--navy-deep) 0%, var(--navy) 42%, var(--sky) 100%);
  padding: 6.5rem 0 3rem;
  overflow: hidden;
}

/* background decorations */
.hero__bg-wave {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 55% at 75% 60%, rgba(74,159,212,0.22) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 10% 80%, rgba(255,255,255,0.06) 0%, transparent 60%);
  pointer-events: none;
}
.hero__bg-glow {
  position: absolute;
  bottom: -2px; left: 0; right: 0; height: 120px;
  background: linear-gradient(to top, var(--off), transparent);
  pointer-events: none;
}

.hero__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  padding-bottom: 4rem;
}

/* hero copy fade-up */
.hero__copy {
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.75s cubic-bezier(.22,1,.36,1), transform 0.75s cubic-bezier(.22,1,.36,1);
}
.hero__copy.in { opacity: 1; transform: none; }

.hero__h1 {
  color: #fff;
  font-size: clamp(2.5rem, 4.5vw, 3.6rem);
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: -0.025em;
  margin: 0 0 1.1rem;
}
.hero__em { color: #7dd3fc; font-style: normal; }

.hero__p {
  color: rgba(255,255,255,0.78);
  font-size: 1.02rem;
  line-height: 1.75;
  max-width: 430px;
  margin-bottom: 2rem;
}

.hero__btns { display: flex; gap: 0.9rem; flex-wrap: wrap; }

/* hero right */
.hero__right {
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.75s cubic-bezier(.22,1,.36,1) 0.18s, transform 0.75s cubic-bezier(.22,1,.36,1) 0.18s;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.hero__right.in { opacity: 1; transform: none; }

/* benefits card — glassmorphism */
.benefits-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
}
.benefits-card__label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #7dd3fc;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.8rem;
}
.benefit {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.87rem;
  color: rgba(255,255,255,0.88);
  padding: 5px 0;
}
.benefit + .benefit { border-top: 1px solid rgba(255,255,255,0.08); }
.benefit__dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
}

/* ══ BUTTONS ═══════════════════════════════════════════ */
.btn-fill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--orange);
  color: #fff;
  font-weight: 700;
  font-size: 0.92rem;
  padding: 13px 26px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 4px 18px rgba(255,107,53,0.38);
}
.btn-fill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0);
  transition: background 0.2s;
}
.btn-fill:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,107,53,0.48); }
.btn-fill:hover::before { background: rgba(255,255,255,0.08); }
.btn-fill__arrow { transition: transform 0.2s; }
.btn-fill:hover .btn-fill__arrow { transform: translateX(4px); }

.btn-line {
  display: inline-flex;
  align-items: center;
  background: transparent;
  color: #fff;
  font-weight: 600;
  font-size: 0.92rem;
  padding: 13px 26px;
  border: 1.5px solid rgba(255,255,255,0.38);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, transform 0.18s;
}
.btn-line:hover {
  border-color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.09);
  transform: translateY(-2px);
}

/* ══ IMAGE SLOTS ════════════════════════════════════════ */
.img-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px dashed #93c5fd;
  border-radius: 14px;
  color: #1e40af;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.img-slot svg { opacity: 0.45; }
.img-slot:hover { transform: scale(1.015); }

.img-slot--lg   { height: 300px; width: 100%; border-radius: 18px; }
.img-slot--step { height: 140px; width: 100%; margin-bottom: 1rem; border-radius: 12px; }
.img-slot--card { height: 160px; border-radius: 14px 14px 0 0; border-bottom: none; transition: transform 0.3s ease; }
.img-slot--lift { transform: scale(1.03); }

/* ══ SECTION SHELL ══════════════════════════════════════ */
.section { padding: 5.5rem 0; }
.section--off   { background: var(--off); }
.section--white { background: #fff; }
.section--navy  {
  background: linear-gradient(150deg, var(--navy-deep) 0%, var(--navy) 60%, #1a6bb5 100%);
  position: relative;
  overflow: hidden;
}
.section--navy::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 50% 60% at 80% 40%, rgba(74,159,212,0.18) 0%, transparent 65%),
    radial-gradient(ellipse 30% 40% at 5%  70%, rgba(255,255,255,0.05) 0%, transparent 55%);
  pointer-events: none;
}

.sec-head { text-align: center; margin-bottom: 3rem; }
.sec-head h2 {
  font-size: clamp(1.85rem, 3.2vw, 2.6rem);
  font-weight: 900;
  color: var(--navy);
  letter-spacing: -0.025em;
  margin: 0 0 0.4rem;
}
.sec-head p { font-size: 0.97rem; color: var(--muted); }
.sec-head--light h2 { color: #fff; }
.sec-head--light p  { color: rgba(255,255,255,0.65); }

/* ══ HOW IT WORKS ══════════════════════════════════════ */
.steps-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  position: relative;
}
.step-item {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 1.5rem 1.4rem;
  text-align: center;
  position: relative;
  transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease, border-color 0.2s;
  animation: none;
}
/* staggered reveal via delay var */
.reveal--in .step-item {
  animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) var(--delay, 0s) both;
}
.step-item:hover {
  transform: translateY(-7px);
  box-shadow: 0 18px 48px rgba(15,76,129,0.13);
  border-color: #93c5fd;
}
.step-item__num {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  opacity: 0.45;
}
.step-item__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 0.45rem;
}
.step-item__desc {
  font-size: 0.83rem;
  color: var(--muted);
  line-height: 1.65;
}
.step-item__arrow {
  position: absolute;
  top: calc(160px / 2 + 1.5rem - 12px); /* vertically center on image */
  right: -1.1rem;
  font-size: 1.4rem;
  color: #93c5fd;
  z-index: 2;
  font-weight: 900;
}

/* ══ PROVIDERS ══════════════════════════════════════════ */
.providers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}
.pcard {
  background: rgba(255,255,255,0.97);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease;
}
.reveal--in .pcard {
  animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) var(--delay, 0s) both;
}
.pcard:hover {
  transform: translateY(-8px);
  box-shadow: 0 22px 56px rgba(0,0,0,0.18);
}
.pcard__body { padding: 1.1rem 1.2rem; }
.pcard__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.pcard__name {
  font-size: 0.93rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 3px;
}
.pcard__loc {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.73rem;
  color: #9CA3AF;
}
.pcard__stars {
  display: flex;
  align-items: center;
  gap: 3px;
  background: #fefce8;
  color: #92400e;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 999px;
  flex-shrink: 0;
}
.pcard__tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 0.9rem; }
.pcard__tags span {
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.67rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
}
.pcard__cta {
  width: 100%;
  padding: 9px;
  border: 1.5px solid var(--navy);
  border-radius: 9px;
  background: transparent;
  color: var(--navy);
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.pcard__cta span { transition: transform 0.2s; }
.pcard__cta:hover {
  background: var(--navy);
  color: #fff;
}
.pcard__cta:hover span { transform: translateX(4px); }

/* ══ WHY ════════════════════════════════════════════════ */
.why-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}
.why-card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.6rem;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--off);
  transition: transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s ease, border-color 0.2s;
}
.reveal--in .why-card {
  animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) var(--delay, 0s) both;
}
.why-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 36px rgba(15,76,129,0.09);
  border-color: #93c5fd;
}
.why-card__icon {
  flex-shrink: 0;
  width: 44px; height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--navy);
  transition: transform 0.2s;
}
.why-card:hover .why-card__icon { transform: scale(1.1) rotate(-4deg); }
.why-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 0.3rem;
}
.why-card__desc {
  font-size: 0.83rem;
  color: var(--muted);
  line-height: 1.65;
}

/* ══ Keyframes ══════════════════════════════════════════ */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: none; }
}

/* ══ Responsive ═════════════════════════════════════════ */
@media (max-width: 880px) {
  .hero__layout     { grid-template-columns: 1fr; text-align: center; }
  .hero__p          { margin: 0 auto 2rem; }
  .hero__btns       { justify-content: center; }
  .steps-row        { grid-template-columns: 1fr; }
  .step-item__arrow { display: none; }
  .providers-grid   { grid-template-columns: 1fr; }
  .why-grid         { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .hero { padding: 5rem 0 2rem; }
}
</style>