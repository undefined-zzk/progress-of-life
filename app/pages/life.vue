<template>
  <!-- 全屏滚动版本:每个数据模块占一整屏 -->
  <FullScreenScroll v-if="stats && profile" :labels="navLabels">
    <!-- 屏 1:第几天(视觉锚点) -->
    <section class="fss-panel">
      <div class="fss-inner text-center px-6">
        <p class="text-sm text-sub mb-6 tracking-widest">{{ todayLabel }}</p>
        <p class="text-lg text-sub mb-4">今天是你人生的</p>
        <p class="display-number text-[6rem] sm:text-[10rem] md:text-[13rem] font-bold text-primary leading-none tracking-tight">
          {{ stats.daysLived.toLocaleString('en-US') }}
        </p>
        <p class="text-2xl text-sub mt-4">天</p>
        <p class="mt-12 text-lg text-sub">你已经来到这个世界 {{ stats.hoursLived.toLocaleString('en-US') }} 小时</p>
      </div>
    </section>

    <!-- 屏 2:人生进度(左侧滑入) -->
    <section class="fss-panel" data-enter="left">
      <div class="fss-inner w-full max-w-3xl px-6">
        <p class="text-sm text-sub tracking-[0.3em] mb-6">人生进度</p>
        <p class="text-2xl sm:text-3xl font-semibold mb-8">你已经走过</p>
        <p class="display-number text-7xl sm:text-9xl font-bold text-primary leading-none mb-10">{{ formatPercent(stats.progressPercent) }}<span class="text-4xl">%</span></p>
        <ProgressBar :percent="stats.progressPercent" />
        <p class="mt-10 text-sm text-sub leading-relaxed">
          基于你设定的 {{ profile.lifeExpectancy }} 岁假设寿命。<br />
          以下数据均为估算,并非对实际寿命的预测。
        </p>
      </div>
    </section>

    <!-- 屏 3:实时倒计时(右侧滑入) -->
    <section class="fss-panel" data-enter="right">
      <div class="fss-inner text-center px-6">
        <p class="text-sm text-sub tracking-[0.3em] mb-8">实时倒计时</p>
        <p class="text-xl sm:text-2xl text-sub mb-12">如果活到 {{ profile.lifeExpectancy }} 岁,还有大约</p>
        <div class="flex items-start justify-center gap-3 sm:gap-5">
          <template v-for="(u, idx) in countdownUnits" :key="idx">
            <div class="text-center">
              <FlipClock :value="u.value" size="lg" class="text-4xl sm:text-6xl" />
              <span class="block text-sm sm:text-base text-sub mt-3">{{ u.label }}</span>
            </div>
            <span v-if="idx < countdownUnits.length - 1" class="text-3xl sm:text-5xl text-sub pt-3">:</span>
          </template>
        </div>
      </div>
    </section>

    <!-- 屏 4:剩余事件 -->
    <section class="fss-panel">
      <div class="fss-inner w-full max-w-4xl px-6">
        <p class="text-sm text-sub tracking-[0.3em] mb-6 text-center">你还可能拥有</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div
            v-for="item in remainingEvents"
            :key="item.key"
            class="card p-5 sm:p-8 text-center overflow-hidden"
          >
            <p class="display-number font-bold text-primary text-[clamp(1.75rem,6vw,3.75rem)] leading-none">
              <AnimatedNumber :value="item.value" />
            </p>
            <p class="text-sm text-sub mt-3">{{ item.label }}</p>
          </div>
        </div>
        <p v-if="profile.city" class="mt-8 text-center text-sub">
          如果你一直生活在 {{ profile.city }},你可能还会经历约 {{ stats.springFestivalsLeft }} 次春节。
        </p>
      </div>
    </section>

    <!-- 屏 5:时间分配(左侧滑入) -->
    <section class="fss-panel" data-enter="left">
      <div class="fss-inner w-full max-w-3xl px-6">
        <p class="text-sm text-sub tracking-[0.3em] mb-6">时间都去哪了?</p>
        <p class="text-2xl sm:text-3xl font-semibold mb-12">如果保持现在的习惯</p>
        <div class="space-y-7">
          <div v-for="item in timeAllocation" :key="item.label" class="flex items-center gap-5">
            <span class="w-16 text-base text-sub shrink-0">{{ item.label }}</span>
            <div class="flex-1 h-4 rounded-full bg-line overflow-hidden">
              <div class="h-full rounded-full transition-none" :style="{ width: `${item.width}%`, background: item.color }"></div>
            </div>
            <span class="w-24 text-right text-base font-medium shrink-0">{{ item.text }}</span>
          </div>
        </div>
        <p class="mt-12 text-center text-sub text-lg leading-relaxed">
          你未来可能还会睡掉约 <span class="text-primary font-semibold">{{ Math.round(stats.sleepYearsLeft) }}</span> 年,<br class="sm:hidden" />
          花约 <span class="text-primary font-semibold">{{ Math.round(stats.phoneYearsLeft) }}</span> 年在手机上。
        </p>
      </div>
    </section>

    <!-- 屏 6:人生时间线(右侧滑入) -->
    <section class="fss-panel" data-enter="right">
      <div class="fss-inner w-full max-w-3xl px-6">
        <p class="text-sm text-sub tracking-[0.3em] mb-6">人生时间线</p>
        <div class="card p-10">
          <div v-for="(item, i) in timeline" :key="i" class="relative pl-10 pb-9" :class="{ 'pb-0': i === timeline.length - 1 }">
            <div v-if="i < timeline.length - 1" class="absolute left-[9px] top-5 bottom-0 w-px bg-line"></div>
            <span
              class="absolute left-0 top-2.5 w-5 h-5 rounded-full border-2"
              :class="{
                'bg-primary border-primary': item.type === 'now' || item.type === 'milestone',
                'bg-card dark:bg-card-dark border-line': item.type === 'past' || item.type === 'future',
              }"
            ></span>
            <div class="flex items-baseline gap-4">
              <span class="display-number text-xl font-semibold">{{ item.year }}</span>
              <span :class="item.type === 'now' ? 'text-primary font-medium text-lg' : 'text-ink dark:text-ink-dark text-lg'">{{ item.label }}</span>
            </div>
          </div>
          <p class="mt-8 text-xs text-sub">未来时间线只是基于年龄阶段的示意,不代表真实预测。</p>
        </div>
      </div>
    </section>

    <!-- 屏 7:每日内容 + 行动 -->
    <section class="fss-panel">
      <div class="fss-inner text-center px-6 max-w-2xl">
        <p class="text-sm text-sub tracking-[0.3em] mb-10">今天</p>
        <p class="text-2xl sm:text-3xl leading-relaxed">
          这是你的第 <span class="display-number font-semibold text-primary">{{ stats.daysLived }}</span> 个早晨。<br />
          你可能还会看到约 <span class="display-number font-semibold text-primary">{{ stats.sunsetsLeft }}</span> 次日出,<br />
          今天已经少了一次。
        </p>
        <p v-if="streak > 1" class="mt-8 text-sub">你已经连续回来记录 {{ streak }} 天。</p>
        <div class="mt-14 flex flex-col sm:flex-row gap-5 justify-center">
          <NuxtLink to="/simulator" class="px-10 py-5 rounded-full border border-line text-ink dark:text-ink-dark font-medium text-lg hover:bg-card dark:hover:bg-card-dark transition-colors">
            如果改变习惯会怎样 →
          </NuxtLink>
          <NuxtLink to="/share" class="px-10 py-5 rounded-full bg-primary text-white font-medium text-lg hover:bg-primary-deep transition-colors">
            分享我的人生
          </NuxtLink>
        </div>
      </div>
    </section>
  </FullScreenScroll>

  <!-- 未填写资料时引导 -->
  <div v-else class="min-h-screen flex flex-col items-center justify-center px-5 text-center">
    <h1 class="text-4xl font-bold mb-4">还没有你的信息</h1>
    <p class="text-sub mb-10 text-lg">先花一分钟,生成属于你的人生进度报告。</p>
    <NuxtLink to="/onboarding" class="inline-block px-10 py-5 rounded-full bg-primary text-white font-medium text-lg hover:bg-primary-deep transition-colors">
      开始计算
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
// life:全屏滚动的核心页面
definePageMeta({ layout: 'immersive' })

import type { TimelineItem } from '~/types/life'
import { buildTimeline, formatPercent } from '~/utils/life'

const { profile, stats } = useAppState()
const { streakDays } = useLifeStore()

const navLabels = ['第几天', '人生进度', '倒计时', '剩余事件', '时间分配', '时间线', '今天']

const todayLabel = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
})

const streak = computed(() => (profile.value ? streakDays(profile.value) : 0))

const timeline = computed<TimelineItem[]>(() => (profile.value ? buildTimeline(profile.value) : []))

// 实时倒计时单位
const countdownUnits = computed(() => {
  if (!stats.value) return []
  const c = stats.value.countdown
  return [
    { value: c.days.toLocaleString('en-US'), label: '天' },
    { value: pad(c.hours), label: '时' },
    { value: pad(c.minutes), label: '分' },
    { value: pad(c.seconds), label: '秒' },
  ]
})

// 剩余事件(周末/夏天/生日/日落)
const remainingEvents = computed(() => {
  if (!stats.value) return []
  const s = stats.value
  return [
    { key: 'weekends', label: '个周末', value: s.weekendsLeft },
    { key: 'summers', label: '个夏天', value: s.summersLeft },
    { key: 'birthdays', label: '次生日', value: s.birthdaysLeft },
    { key: 'sunsets', label: '次日落', value: s.sunsetsLeft },
  ]
})

// 时间分配条
const timeAllocation = computed(() => {
  if (!stats.value || !profile.value) return []
  const p = profile.value
  const total = 24
  const rows = [
    { label: '睡眠', hours: p.sleepHours, color: '#E07A5F' },
    { label: '工作', hours: p.workHours, color: '#F2CC8F' },
    { label: '手机', hours: p.phoneHours, color: '#C9C0B6' },
    { label: '自由', hours: stats.value.freeHoursPerDay, color: '#B85C45' },
  ]
  return rows.map((r) => ({
    ...r,
    width: (r.hours / total) * 100,
    text: `${r.hours} 小时`,
  }))
})

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
</script>
