<template>
  <FullScreenScroll :labels="navLabels">
    <!-- 第 1 屏:Hero / 已计算过则显示倒计时 -->
    <section class="fss-panel hero-panel">
      <!-- 仅第一个屏的星空背景:随本屏滚动,不覆盖其他屏 -->
      <div class="hero-mesh" aria-hidden="true">
        <ElasticMesh
          image="/starry-sky.webp"
          color1="#E07A5F"
          color2="#B85C45"
          highlight="#F2CC8F"
          :tilt="6"
          :shading="0.6"
          :gridOpacity="0.08"
          :borderRadius="0"
          :resolution="30"
        />
      </div>

      <!-- 已计算过:第一屏显示倒计时 -->
      <div v-if="profile && stats" class="fss-inner relative z-10 text-center px-6">
        <p class="hero-eyebrow text-sm text-sub mb-10 tracking-[0.4em]">MY LIFE · 人生进度</p>
        <p v-if="!hideHeroNumbers" class="hero-extra text-lg text-sub mb-4">今天是你人生的</p>
        <p v-if="!hideHeroNumbers" class="hero-extra display-number text-[clamp(3rem,11vw,8rem)] font-bold text-primary leading-none tracking-tight">
          {{ stats.daysLived.toLocaleString('en-US') }}
        </p>
        <p v-if="!hideHeroNumbers" class="hero-extra text-2xl text-sub mt-4">天</p>

        <!-- 实时倒计时(天 + 翻页时分秒):生命未结束时显示
             用 CSS zoom 整体缩放(.cd-holder :style="{zoom:cdZoom}"),
             zoom 直接缩放真实布局尺寸,不受 perspective/GSAP transform 影响,
             由 JS 按视口宽度精确计算,手机必然缩小到位、桌面保持原始大小 -->
        <div v-if="!isLifeEnded" class="mt-10 cd-holder" :style="{ zoom: cdZoom }">
          <div class="flex items-end justify-center gap-3 sm:gap-5">
            <!-- 天:翻页卡片(与时分秒统一) -->
            <div class="text-center shrink-0">
              <FlipClock :value="stats.countdown.days" size="xl" />
              <span class="block text-sm text-sub mt-2">天</span>
            </div>
            <span class="text-5xl sm:text-7xl text-sub card-colon shrink-0">:</span>
            <!-- 时/分/秒:翻页 -->
            <template v-for="(u, idx) in timeUnits" :key="idx">
              <div class="text-center shrink-0">
                <FlipClock :value="u" size="xl" />
                <span class="block text-sm text-sub mt-2">{{ timeLabels[idx] }}</span>
              </div>
              <span v-if="idx < timeUnits.length - 1" class="text-5xl sm:text-7xl text-sub card-colon shrink-0">:</span>
            </template>
          </div>
        </div>
        <p v-if="shortText && !isLifeEnded" class="hero-extra mt-10 text-sm hero-note">{{ shortText }}</p>
        <p v-else-if="!isLifeEnded" class="hero-extra mt-10 text-sm hero-note">如果活到 {{ profile.lifeExpectancy }} 岁,还有大约这些时间</p>

        <!-- 生命结束提示 -->
        <div v-if="isLifeEnded" class="mt-10 px-4">
          <p class="text-2xl sm:text-3xl font-semibold text-[#fdf7f1] mb-6">生命已到达终点</p>
          <blockquote class="text-lg sm:text-xl text-[#f6ede4]/90 italic leading-relaxed">"{{ endQuote.text }}"</blockquote>
          <p v-if="endQuote.author" class="mt-3 text-sm text-[#f6ede4]/70">—— {{ endQuote.author }}</p>
        </div>

        <div v-if="!hideHeroNumbers" class="hero-extra mt-10 flex flex-col sm:flex-row items-center justify-center gap-5 hero-cta">
          <NuxtLink
            to="/life"
            class="inline-flex items-center justify-center px-12 py-5 rounded-full bg-primary text-white font-medium text-xl hover:bg-primary-deep transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            查看我的进度 →
          </NuxtLink>
        </div>
      </div>

      <!-- 未计算:显示引导 hero -->
      <div v-else class="fss-inner relative z-10 text-center px-6">
        <p class="hero-eyebrow text-sm text-sub mb-10 tracking-[0.4em]">MY LIFE · 人生进度</p>
        <h1 class="text-5xl sm:text-8xl md:text-9xl font-bold tracking-tight leading-[1.05] hero-title">
          今天,是你人生的<br />
          <span class="text-primary">第几天?</span>
        </h1>
        <p class="mt-10 text-xl sm:text-2xl text-sub leading-relaxed hero-sub">
          看看你已经走过了多少,<br class="sm:hidden" />
          以及未来还剩下什么。
        </p>
        <div class="mt-16 flex flex-col sm:flex-row items-center justify-center gap-5 hero-cta">
          <NuxtLink
            to="/onboarding"
            class="group inline-flex items-center justify-center gap-3 px-12 py-5 rounded-full bg-primary text-white font-medium text-xl hover:bg-primary-deep transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            开始计算
            <span class="transition-transform group-hover:translate-x-1.5">→</span>
          </NuxtLink>
        </div>
      </div>

      <!-- 底部滚动提示:进入全屏展示时隐藏 -->
      <div class="hero-scroll-hint absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-sub">
        <span class="text-xs tracking-widest">SCROLL</span>
        <span class="scroll-line block w-px h-8 bg-line overflow-hidden">
          <span class="block w-full h-1/2 bg-primary animate-scroll"></span>
        </span>
      </div>
    </section>

    <!-- 第 2 屏:核心句(左侧滑入) -->
    <section class="fss-panel" data-enter="left">
      <div class="fss-inner text-center px-6 max-w-3xl">
        <p class="text-sm text-sub tracking-[0.3em] mb-12">核心理念</p>
        <p class="text-3xl sm:text-5xl md:text-6xl font-semibold leading-snug">
          我们不知道人生还有多久,<br />
          但我们可以知道<br />
          <span class="text-primary">今天是第几天。</span>
        </p>
      </div>
    </section>

    <!-- 第 3 屏:特性(右侧滑入) -->
    <section class="fss-panel" data-enter="right">
      <div class="fss-inner w-full max-w-5xl px-5 sm:px-6">
        <p class="text-sm text-sub tracking-[0.3em] mb-8 sm:mb-12 text-center">你会看到什么</p>
        <div class="grid md:grid-cols-3 gap-5 sm:gap-6">
          <div class="card p-7 sm:p-10 feature-card">
            <p class="display-number text-4xl font-bold text-primary mb-4">01</p>
            <h3 class="text-lg sm:text-xl font-semibold mb-3">走过的路</h3>
            <p class="text-sub leading-relaxed">基于你的出生日期,计算已经度过的每一天、每一小时。</p>
          </div>
          <div class="card p-7 sm:p-10 feature-card">
            <p class="display-number text-4xl font-bold text-primary mb-4">02</p>
            <h3 class="text-lg sm:text-xl font-semibold mb-3">剩下的时间</h3>
            <p class="text-sub leading-relaxed">基于假设寿命,估算剩余时间与可能经历的事件。</p>
          </div>
          <div class="card p-7 sm:p-10 feature-card">
            <p class="display-number text-4xl font-bold text-primary mb-4">03</p>
            <h3 class="text-lg sm:text-xl font-semibold mb-3">改变的可能</h3>
            <p class="text-sub leading-relaxed">模拟改变习惯后,你可能会为自己多出多少时间。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 第 4 屏:隐私 -->
    <section class="fss-panel">
      <div class="fss-inner text-center px-6 max-w-2xl">
        <p class="text-sm text-sub tracking-[0.3em] mb-8 sm:mb-12">隐私承诺</p>
        <h2 class="text-3xl sm:text-5xl font-bold mb-6 sm:mb-8">你的数据<br />只属于你</h2>
        <p class="text-base sm:text-lg text-sub leading-relaxed mb-8 sm:mb-12">
          出生日期、生活习惯等所有信息,<br />
          只在你的浏览器本地计算与保存,<br />
          不会上传到任何服务器。
        </p>
        <NuxtLink
          to="/onboarding"
          class="inline-flex items-center justify-center px-12 py-5 rounded-full bg-primary text-white font-medium text-xl hover:bg-primary-deep transition-all hover:scale-[1.03] active:scale-[0.98]"
        >
          开始计算 →
        </NuxtLink>
      </div>
    </section>
  </FullScreenScroll>
</template>

<script setup lang="ts">
// 首页:全屏滚动沉浸式 hero
import { lifeEndQuotes } from '~/data/quotes'
import type { LifeQuote } from '~/data/quotes'
import { SITE_URL, OG_IMAGE } from '~/utils/seo'
definePageMeta({ layout: 'immersive' })

// 首页 SEO
useSeoMeta({
  title: '今天是你人生的第几天',
  description: '输入出生日期,看看你已经走过了多少天、多少小时,以及基于假设寿命还剩下多少时间。你的数据只在浏览器本地,不会上传到任何服务器。',
  ogTitle: '今天是你人生的第几天',
  ogDescription: '看看你已经走过了多少天,以及未来还剩下什么。你的数据只在本地,不会上传。',
  ogImage: OG_IMAGE,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: '今天是你人生的第几天',
  twitterDescription: '看看你已经走过了多少天,以及未来还剩下什么。',
  twitterImage: OG_IMAGE,
})
useHead({ link: [{ rel: 'canonical', href: `${SITE_URL}/` }] })

const { profile, stats, init } = useAppState()

// 倒计时缩放:用 zoom 按视口宽度缩放(不依赖 media query / transform,必然生效)。
// 原始倒计时总宽上限约 988px(9 张卡 + 3 冒号 + 间隙);可用宽 = 视口 - 左右内边距。
const cdZoom = ref(1)
const CD_BASE_WIDTH = 988
function updateCdZoom() {
  if (typeof window === 'undefined') return
  const vw = window.innerWidth
  if (vw > 900) {
    cdZoom.value = 1 // 桌面保持原始大小
    return
  }
  const available = vw - 48 // px-6 左右各 24px
  cdZoom.value = Math.min(1, Math.max(0.3, available / CD_BASE_WIDTH))
}

// 兜底:进入首页时若资料未加载,重新从 LocalStorage 读取
onMounted(() => {
  updateCdZoom()
  window.addEventListener('resize', updateCdZoom)
  if (!profile.value) {
    init()
  }
})

const navLabels = ['开始', '核心理念', '你会看到什么', '隐私承诺']

// 时分秒(两位数,用于翻页)
const timeUnits = computed(() => {
  if (!stats.value) return []
  const c = stats.value.countdown
  return [pad(c.hours), pad(c.minutes), pad(c.seconds)]
})

const timeLabels = ['时', '分', '秒']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

// 短寿命(0岁/不足1年)时返回替代文案,否则 null 沿用"活到 X 岁"默认措辞
const shortText = computed(() => (profile.value ? shortLifeText(profile.value) : null))

// 生命是否已到终点(精确到时刻:now >= 寿命终点)
const isLifeEnded = computed(() => !!stats.value && stats.value.ended)

// 是否隐藏主数字区(生命结束或短寿命时):此时只展示"生命结束/寿命只有 X"提示
const hideHeroNumbers = computed(() => isLifeEnded.value || !!shortText.value)

// 生命结束时的随机语录
const endQuote = ref<LifeQuote>(lifeEndQuotes[0]!)
watch(isLifeEnded, (ended) => {
  if (ended) {
    endQuote.value = lifeEndQuotes[Math.floor(Math.random() * lifeEndQuotes.length)]!
  }
})
</script>

<style scoped>
@keyframes scrollHint {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}
.animate-scroll {
  animation: scrollHint 1.8s ease-in-out infinite;
}

/* 冒号垂直居中(xl 卡片 8.5rem 高,标签 mt-2+text-sm≈1.75rem,
   桌面冒号 sm:text-7xl 半高2.25rem):4.25 + 1.75 - 2.25 = 3.75rem
   手机冒号 text-5xl 半高1.5rem:4.25 + 1.75 - 1.5 = 4.5rem */
.card-colon {
  position: relative;
  margin-bottom: 4.5rem;
}
@media (min-width: 640px) {
  .card-colon {
    margin-bottom: 3.75rem;
  }
}

/* 倒计时占位容器:原始高度(卡片8.5 + 标签 + 余量),zoom 会自动按比例缩放占位空间,
   故无需额外高度补偿。 */
.cd-holder {
  height: 10.8rem;
  overflow: visible;
}

/* ===== 第一屏:深色星空背景上的文字配色 =====
   星空为暖陶土暗色,默认浅色主题的文字(深棕黑/浅灰棕)在深色背景上对比不足。
   这里将第一屏(hero)的文字统一改为浅暖白 + 亮陶土橙,并加柔和投影增强可读性。 */
.hero-panel .fss-inner {
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.45);
}

.hero-panel .text-sub {
  color: #f6ede4;
  opacity: 0.92;
}

.hero-panel .text-primary,
.hero-panel .hero-title .text-primary {
  color: #f2b28f;
}

.hero-panel .hero-title {
  color: #fdf7f1;
}

.hero-panel .card-colon {
  color: #f6ede4;
}

/* 已计算布局的说明文字:在深色星空上提亮为不透明近白,保证清晰可读 */
.hero-panel .hero-note {
  color: #fdf7f1;
  opacity: 1;
}

/* 底部滚动提示:适配深色背景 */
.hero-panel .scroll-line {
  background-color: rgba(255, 255, 255, 0.3);
}
.hero-panel .scroll-line > span {
  background-color: #f2b28f;
}

/* 进入全屏展示(第1屏 .fss-panel 全屏)时,隐藏底部滚动提示 */
.fss-panel:fullscreen .hero-scroll-hint {
  display: none;
}
.fss-panel:-webkit-full-screen .hero-scroll-hint {
  display: none;
}

/* 进入全屏时,隐藏已计算布局中的次要元素(说明文字/按钮/天数标题),
   仅保留 eyebrow 与实时倒计时,全屏展示更聚焦、干净。 */
.fss-panel:fullscreen .hero-extra {
  display: none;
}
.fss-panel:-webkit-full-screen .hero-extra {
  display: none;
}
</style>
