<template>
  <FullScreenScroll :labels="navLabels">
    <!-- 第 1 屏:Hero / 已计算过则显示倒计时 -->
    <section class="fss-panel">
      <!-- 已计算过:第一屏显示倒计时 -->
      <div v-if="profile && stats" class="fss-inner text-center px-6">
        <p class="hero-eyebrow text-sm text-sub mb-8 tracking-[0.4em]">MY LIFE · 人生进度</p>
        <p class="text-lg text-sub mb-3">今天是你人生的</p>
        <p class="display-number text-[clamp(3rem,11vw,8rem)] font-bold text-primary leading-none tracking-tight">
          {{ stats.daysLived.toLocaleString('en-US') }}
        </p>
        <p class="text-2xl text-sub mt-3">天</p>

        <!-- 实时倒计时(天 + 翻页时分秒) -->
        <div class="mt-8 flex items-end justify-center gap-3 sm:gap-5">
          <!-- 天:翻页卡片(与时分秒统一) -->
          <div class="text-center">
            <FlipClock :value="stats.countdown.days" size="xl" />
            <span class="block text-sm text-sub mt-2">天</span>
          </div>
          <span class="text-5xl sm:text-7xl text-sub card-colon">:</span>
          <!-- 时/分/秒:翻页 -->
          <template v-for="(u, idx) in timeUnits" :key="idx">
            <div class="text-center">
              <FlipClock :value="u" size="xl" />
              <span class="block text-sm text-sub mt-2">{{ timeLabels[idx] }}</span>
            </div>
            <span v-if="idx < timeUnits.length - 1" class="text-5xl sm:text-7xl text-sub card-colon">:</span>
          </template>
        </div>
        <p class="mt-8 text-sm text-sub">如果活到 {{ profile.lifeExpectancy }} 岁,还有大约这些时间</p>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5 hero-cta">
          <NuxtLink
            to="/life"
            class="inline-flex items-center justify-center px-12 py-5 rounded-full bg-primary text-white font-medium text-xl hover:bg-primary-deep transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            查看我的进度 →
          </NuxtLink>
        </div>
      </div>

      <!-- 未计算:显示引导 hero -->
      <div v-else class="fss-inner text-center px-6">
        <p class="hero-eyebrow text-sm text-sub mb-10 tracking-[0.4em]">MY LIFE · 人生进度</p>
        <h1 class="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tight leading-[1.05] hero-title">
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

      <!-- 底部滚动提示 -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-sub">
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
      <div class="fss-inner w-full max-w-5xl px-6">
        <p class="text-sm text-sub tracking-[0.3em] mb-12 text-center">你会看到什么</p>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="card p-10 feature-card">
            <p class="display-number text-4xl font-bold text-primary mb-4">01</p>
            <h3 class="text-xl font-semibold mb-3">走过的路</h3>
            <p class="text-sub leading-relaxed">基于你的出生日期,计算已经度过的每一天、每一小时。</p>
          </div>
          <div class="card p-10 feature-card">
            <p class="display-number text-4xl font-bold text-primary mb-4">02</p>
            <h3 class="text-xl font-semibold mb-3">剩下的时间</h3>
            <p class="text-sub leading-relaxed">基于假设寿命,估算剩余时间与可能经历的事件。</p>
          </div>
          <div class="card p-10 feature-card">
            <p class="display-number text-4xl font-bold text-primary mb-4">03</p>
            <h3 class="text-xl font-semibold mb-3">改变的可能</h3>
            <p class="text-sub leading-relaxed">模拟改变习惯后,你可能会为自己多出多少时间。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 第 4 屏:隐私 -->
    <section class="fss-panel">
      <div class="fss-inner text-center px-6 max-w-2xl">
        <p class="text-sm text-sub tracking-[0.3em] mb-12">隐私承诺</p>
        <h2 class="text-4xl sm:text-5xl font-bold mb-8">你的数据<br />只属于你</h2>
        <p class="text-lg text-sub leading-relaxed mb-12">
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
definePageMeta({ layout: 'immersive' })

const { profile, stats, init } = useAppState()

// 兜底:进入首页时若资料未加载,重新从 LocalStorage 读取
onMounted(() => {
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

/* 让"天/时/分/秒"之间的":"垂直居中对齐到翻页卡片中心(xl 尺寸)
   容器为 items-end(卡片+标签底部对齐),":" 需上抬到卡片中心:
   xl 卡片半高(4.25rem) + 标签区(mt-2 0.5rem + text-sm 行高约1.25rem) - ":" 字体半高 */
.card-colon {
  position: relative;
  margin-bottom: 4.75rem;
}

@media (min-width: 640px) {
  .card-colon {
    margin-bottom: 5rem;
  }
}
</style>
