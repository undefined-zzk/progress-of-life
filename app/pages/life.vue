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
        <p class="mt-12 text-lg text-sub">你已经来到这个世界 {{ livedDuration }}</p>
      </div>
    </section>

    <!-- 屏 2:人生进度(左侧滑入) -->
    <section class="fss-panel" data-enter="left">
      <div class="fss-inner w-full max-w-3xl px-6">
        <p class="text-sm text-sub tracking-[0.3em] mb-6">人生进度</p>
        <p class="text-2xl sm:text-3xl font-semibold mb-8">你已经走过</p>
        <p class="display-number text-7xl sm:text-9xl font-bold text-primary leading-none mb-10">{{ formatPercent(stats.progressPercent) }}<span class="text-4xl">%</span></p>
        <ProgressBar :percent="stats.progressPercent" />
      </div>
    </section>

    <!-- 屏 3:实时倒计时(右侧滑入) -->
    <section class="fss-panel" data-enter="right">
      <div class="fss-inner text-center px-6">
        <!-- 生命结束:倒计时归零,提示生命结束并给出语录 -->
        <div v-if="isLifeEnded" class="px-4">
          <p class="text-2xl sm:text-3xl font-semibold text-ink mb-6">生命已到达终点</p>
          <blockquote class="text-lg sm:text-xl text-sub italic leading-relaxed">"{{ endQuote.text }}"</blockquote>
          <p v-if="endQuote.author" class="mt-3 text-sm text-sub/70">—— {{ endQuote.author }}</p>
        </div>

        <template v-else>
          <p v-if="shortText" class="text-xl sm:text-2xl text-sub mb-12">{{ shortText }}</p>
          <p v-else class="text-xl sm:text-2xl text-sub mb-12">如果活到 {{ profile.lifeExpectancy }} 岁,还有大约</p>
          <div class="cd-holder w-full" :style="{ zoom: cdZoom }">
          <div class="flex items-end justify-center gap-3 sm:gap-5">
          <!-- 天:翻页卡片(与首页统一) -->
          <div class="text-center shrink-0">
            <FlipClock :value="stats.countdown.days" size="xl" />
            <span class="block text-sm sm:text-base text-sub mt-2">天</span>
          </div>
          <span class="text-5xl sm:text-7xl text-sub card-colon shrink-0">:</span>
          <!-- 时/分/秒:翻页 -->
          <template v-for="(u, idx) in timeUnits" :key="idx">
            <div class="text-center shrink-0">
              <FlipClock :value="u" size="xl" />
              <span class="block text-sm sm:text-base text-sub mt-2">{{ timeLabels[idx] }}</span>
            </div>
            <span v-if="idx < timeUnits.length - 1" class="text-5xl sm:text-7xl text-sub card-colon shrink-0">:</span>
          </template>
        </div>
        </div>
        </template>
      </div>
    </section>

    <!-- 屏 4:剩余事件(短寿命/生命不足1岁时无意义,不显示) -->
    <section v-if="!shortText" class="fss-panel">
      <div class="fss-inner w-full max-w-4xl px-6">
        <p class="text-sm text-sub tracking-[0.3em] mb-6 text-center">你还可能拥有</p>
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-5">
          <div
            v-for="item in remainingEvents"
            :key="item.key"
            class="card p-5 sm:p-8 text-center overflow-hidden"
          >
            <p class="display-number font-bold text-primary text-[clamp(1.5rem,5vw,3rem)] leading-none">
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
    <section v-if="!shortText" class="fss-panel" data-enter="left">
      <div class="fss-inner w-full max-w-3xl px-6">
        <p class="text-sm text-sub tracking-[0.3em] mb-6">时间都去哪了?</p>
        <p class="text-2xl sm:text-3xl font-semibold mb-8 sm:mb-12">如果保持现在的习惯</p>
        <div class="space-y-5 sm:space-y-7">
          <div v-for="item in timeAllocation" :key="item.label" class="flex items-center gap-3 sm:gap-5">
            <span class="w-14 sm:w-16 text-sm sm:text-base text-sub shrink-0">{{ item.label }}</span>
            <div class="flex-1 h-4 rounded-full bg-line overflow-hidden">
              <div class="h-full rounded-full transition-none" :style="{ width: `${item.width}%`, background: item.color }"></div>
            </div>
            <span class="w-20 sm:w-24 text-right text-sm sm:text-base font-medium shrink-0">{{ item.text }}</span>
          </div>
        </div>
        <p class="mt-12 text-center text-sub text-lg leading-relaxed">
          你未来可能还会睡掉约 <span class="text-primary font-semibold">{{ Math.round(stats.sleepYearsLeft) }}</span> 年,<br class="sm:hidden" />
          花约 <span class="text-primary font-semibold">{{ Math.round(stats.phoneYearsLeft) }}</span> 年在手机上。
        </p>
      </div>
    </section>

    <!-- 屏 6:人生时间线(右侧滑入) -->
    <section v-if="!shortText" class="fss-panel" data-enter="right">
      <div class="fss-inner w-full max-w-3xl px-6">
        <p class="text-sm text-sub tracking-[0.3em] mb-6">人生时间线</p>
        <div class="card p-10">
          <div
            v-for="(item, i) in timeline"
            :key="i"
            class="group relative pl-10 pb-9"
            :class="{ 'pb-0': i === timeline.length - 1 }"
          >
            <div v-if="i < timeline.length - 1" class="absolute left-2.25 top-4.25 bottom-0 w-px bg-line"></div>
            <span
              class="absolute left-0 top-1.25 w-5 h-5 rounded-full border-2"
              :class="{
                'bg-primary border-primary': item.type === 'now' || item.type === 'milestone',
                'bg-card border-line': item.type === 'past' || item.type === 'future',
              }"
            ></span>
            <div class="flex items-center gap-4">
              <span class="display-number text-xl font-semibold shrink-0">{{ item.year }}</span>
              <!-- 双击内容可修改(出生节点除外) -->
              <span
                v-if="editingYear !== item.year"
                :class="[
                  item.type === 'now' ? 'text-primary font-medium text-lg' : 'text-ink text-lg',
                  item.label !== '出生' ? 'cursor-pointer hover:text-primary transition-colors' : '',
                ]"
                :title="item.label !== '出生' ? '点击修改' : ''"
                @dblclick="item.label !== '出生' && startEdit(item)"
                @click="item.label !== '出生' && !isTouch && startEdit(item)"
              >
                {{ item.label }}
              </span>
              <!-- 编辑中的输入框 -->
              <input
                v-else
                v-focus
                v-model="editingText"
                type="text"
                maxlength="30"
                class="flex-1 min-w-0 px-3 py-1 rounded-lg border-2 border-primary bg-card text-base text-ink focus:outline-none"
                @keyup.enter="saveEdit"
                @keyup.esc="cancelEdit"
                @blur="saveEdit"
              />
              <!-- 删除按钮:出生节点外,hover 显示;触屏设备由 CSS 常显 -->
              <button
                v-if="item.label !== '出生'"
                class="timeline-delete ml-auto text-xs text-sub/50 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                :aria-label="`删除 ${item.year} 年节点`"
                @click.stop="removeNode(item)"
              >
                删除
              </button>
            </div>
          </div>
          <!-- 添加自定义时间线节点 -->
          <div class="mt-8 border-t border-line pt-6">
            <p class="text-sm font-medium text-ink mb-4">书写人生的注脚</p>
            <div class="flex flex-col sm:flex-row gap-3">
              <input
                :value="customYear"
                type="number"
                placeholder="年份"
                step="1"
                :min="minYear"
                :max="maxYear"
                class="w-28 px-3 py-2.5 rounded-xl border-2 border-line bg-card text-center text-base font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                @input="onYearInput"
              />
              <input
                v-model="customText"
                type="text"
                placeholder="你想在那年做什么"
                maxlength="30"
                class="flex-1 px-4 py-2.5 rounded-xl border-2 border-line bg-card text-base text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                @keyup.enter="addCustomNode"
              />
              <button
                type="button"
                class="px-5 py-2.5 rounded-xl bg-primary text-white text-base font-medium hover:bg-primary-deep transition-colors"
                @click="addCustomNode"
              >
                添加
              </button>
            </div>
            <p v-if="customNodeError" class="mt-2 text-sm text-red-500">{{ customNodeError }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 屏 7:每日内容 + 行动 -->
    <section v-if="!shortText" class="fss-panel">
      <div class="fss-inner text-center px-6 max-w-2xl">
        <p class="text-sm text-sub tracking-[0.3em] mb-10">今天</p>
        <p class="text-2xl sm:text-3xl leading-relaxed">
          这是你的第 <span class="display-number font-semibold text-primary">{{ stats.daysLived }}</span> 个早晨。<br />
          你可能还会看到约 <span class="display-number font-semibold text-primary">{{ stats.sunsetsLeft }}</span> 次日出,<br />
          今天已经少了一次。
        </p>
        <p v-if="streak > 1" class="mt-8 text-sub">你已经连续回来记录 {{ streak }} 天。</p>
        <div class="mt-14 flex flex-col sm:flex-row gap-5 justify-center">
          <NuxtLink to="/simulator" class="px-10 py-5 rounded-full border border-line text-ink font-medium text-lg hover:bg-card transition-colors">
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

// 人生进度报告 SEO
useSeoMeta({
  title: '我的人生进度报告',
  description: '基于出生日期与假设寿命生成的人生进度报告:已活天数、人生进度、剩余时间与人生时间线。你的数据只在本地,不会上传。',
  ogTitle: '我的人生进度报告',
  ogDescription: '看看我已经走过多少天、多少小时,以及未来还剩下什么。',
  ogImage: OG_IMAGE,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: '我的人生进度报告',
  twitterDescription: '看看我已经走过多少天、多少小时,以及未来还剩下什么。',
  twitterImage: OG_IMAGE,
})
useHead({ link: [{ rel: 'canonical', href: `${SITE_URL}/life` }] })

import { onMounted } from 'vue'
import type { TimelineItem } from '~/types/life'
import { buildTimeline, formatPercent, shortLifeText, livedDurationText, lifespanMs, birthMoment } from '~/utils/life'
import { lifeEndQuotes } from '~/data/quotes'
import type { LifeQuote } from '~/data/quotes'
import { SITE_URL, OG_IMAGE } from '~/utils/seo'

const { profile, stats, init, now, setProfile } = useAppState()

// 短寿命(0岁/不足1年)时返回替代文案,否则 null 沿用"活到 X 岁"默认措辞
const shortText = computed(() => (profile.value ? shortLifeText(profile.value) : null))

// 已活时间的精细文本(年/天/时/分/秒),随 now 秒级刷新;
// 生命结束后(已活超过寿命)停在寿命终点,不再继续累加。
const livedDuration = computed(() => {
  if (!profile.value) return ''
  const capMs = lifespanMs(profile.value)
  return livedDurationText(profile.value, new Date(now.value), capMs)
})

// 生命是否已到终点(精确到时刻:now >= 寿命终点)
const isLifeEnded = computed(() => !!stats.value && stats.value.ended)

// 生命结束时的随机语录
const endQuote = ref<LifeQuote>(lifeEndQuotes[0]!)
watch(isLifeEnded, (ended) => {
  if (ended) {
    endQuote.value = lifeEndQuotes[Math.floor(Math.random() * lifeEndQuotes.length)]!
  }
})
const { streakDays } = useLifeStore()

// 是否触屏设备:用于让时间线节点在触屏上支持单击编辑(桌面端保留双击)
const isTouch = ref(false)

// 倒计时缩放:用 zoom 按视口宽度缩放,JS 驱动必然生效(不依赖 media query / transform)。
// 桌面 >900px 保持原始大小,手机按可用宽度等比缩小。
const cdZoom = ref(1)
const CD_BASE_WIDTH = 988 // 原始倒计时总宽上限(9 卡 + 3 冒号 + 间隙,px)
function updateCdZoom() {
  if (typeof window === 'undefined') return
  const vw = window.innerWidth
  if (vw > 900) {
    cdZoom.value = 1
    return
  }
  const available = vw - 48 // px-6 左右各 24px
  cdZoom.value = Math.min(1, Math.max(0.3, available / CD_BASE_WIDTH))
}

onMounted(() => {
  isTouch.value = window.matchMedia('(hover: none)').matches
  updateCdZoom()
  window.addEventListener('resize', updateCdZoom)
  init()
})

// 短寿命(不足1年)时,屏3之后的屏不显示,导航点也只保留前3个
const navLabels = computed(() =>
  shortText.value ? ['第几天', '人生进度', '倒计时'] : ['第几天', '人生进度', '倒计时', '剩余事件', '时间分配', '时间线', '今天'],
)

const todayLabel = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
})

const streak = computed(() => (profile.value ? streakDays(profile.value) : 0))

const timeline = computed<TimelineItem[]>(() => (profile.value ? buildTimeline(profile.value) : []))

// ---- 自定义时间线节点 ----
const customYear = ref<number>()
const customText = ref('')
const customNodeError = ref('')

// 年份输入实时修正:过滤小数/符号,并实时纠正超过最大值的输入。
// 注意:不做下限(minYear)的实时 clamp,否则输入中间值(如把 2003 删改成 1999 时的 "20")会被
// 立即纠正回最小值,导致无法编辑。下限在添加时(addCustomNode)统一校验。
function onYearInput(e: Event) {
  const input = e.target as HTMLInputElement
  const cleaned = input.value.replace(/[^0-9]/g, '')
  let val = cleaned === '' ? undefined : parseInt(cleaned, 10)
  if (val !== undefined) {
    // 仅实时纠正超过最大值
    if (val > maxYear.value) val = maxYear.value
    const corrected = String(val)
    if (input.value !== corrected) {
      input.value = corrected
    }
  } else if (input.value !== '') {
    input.value = ''
  }
  customYear.value = val
}

// 时间线年份下限:出生年份 + 1(必须晚于出生)
const minYear = computed(() => {
  if (!profile.value) return 0
  return birthMoment(profile.value.birthDate, profile.value.birthTime).getFullYear() + 1
})
// 时间线年份上限:人生结束(寿命终点)的年份
const maxYear = computed(() => {
  if (!profile.value) return 9999
  const birth = birthMoment(profile.value.birthDate, profile.value.birthTime)
  const end = new Date(birth.getTime() + lifespanMs(profile.value))
  return end.getFullYear()
})

function addCustomNode() {
  if (!profile.value) return
  const yearRaw = customYear.value
  if (yearRaw === undefined || yearRaw === null || Number.isNaN(yearRaw) || !yearRaw) {
    customNodeError.value = '请输入年份'
    return
  }
  if (!Number.isInteger(yearRaw)) {
    customNodeError.value = '年份必须是整数'
    return
  }
  const year = yearRaw
  const text = customText.value.trim()
  if (year < minYear.value) {
    customNodeError.value = `年份必须大于出生年份 ${minYear.value - 1} 年`
    return
  }
  if (year > maxYear.value) {
    customNodeError.value = `年份不能超过 ${maxYear.value} 年(人生结束年份)`
    return
  }
  if (text.length > 30) {
    customNodeError.value = '内容不能超过 30 字'
    return
  }
  const items = [...(profile.value.customTimeline ?? [])]
  const idx = items.findIndex((i) => i.year === year)
  if (idx >= 0) {
    // 同一年份:覆盖之前的内容
    items[idx] = { year, text }
  } else {
    items.push({ year, text })
  }
  setProfile({ ...profile.value, customTimeline: items })
  customYear.value = undefined
  customText.value = ''
  customNodeError.value = ''
}

// 删除节点:自定义节点直接移除;预估/现在节点记录年份,下次生成时跳过(出生除外)
function removeNode(item: TimelineItem) {
  if (!profile.value) return
  if (item.custom) {
    const items = (profile.value.customTimeline ?? []).filter((i) => i.year !== item.year)
    setProfile({ ...profile.value, customTimeline: items })
  } else {
    const del = [...new Set([...(profile.value.timelineDeleted ?? []), item.year])]
    setProfile({ ...profile.value, timelineDeleted: del })
  }
}

// 双击修改节点:正在编辑的年份与内容
const editingYear = ref<number | null>(null)
const editingText = ref('')

// 自定义指令:元素挂载(进入编辑)时自动聚焦
const vFocus = {
  mounted: (el: HTMLElement) => el.focus(),
}

function startEdit(item: TimelineItem) {
  editingYear.value = item.year
  editingText.value = item.label
}

// 保存修改:统一转为自定义节点(覆盖预估节点)
function saveEdit() {
  if (editingYear.value == null || !profile.value) return
  const text = editingText.value.trim()
  if (text.length > 30) {
    // 超出上限:截断保存,避免超长文字破坏布局
    editingText.value = text.slice(0, 30)
    return
  }
  const year = editingYear.value
  const items = [...(profile.value.customTimeline ?? [])]
  const idx = items.findIndex((i) => i.year === year)
  if (idx >= 0) {
    items[idx] = { year, text }
  } else {
    items.push({ year, text })
  }
  setProfile({ ...profile.value, customTimeline: items })
  editingYear.value = null
}

function cancelEdit() {
  editingYear.value = null
}

// 时分秒(两位数,用于翻页)
const timeUnits = computed(() => {
  if (!stats.value) return []
  const c = stats.value.countdown
  return [pad(c.hours), pad(c.minutes), pad(c.seconds)]
})

const timeLabels = ['时', '分', '秒']

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

<style scoped>
/* 与首页统一:冒号垂直居中(xl 卡片 8.5rem 高,标签 mt-2+text-sm≈1.75rem,
   桌面冒号 sm:text-7xl 半高2.25rem,手机 text-5xl 半高1.5rem)。 */
.card-colon {
  position: relative;
  margin-bottom: 4.5rem;
}
@media (min-width: 640px) {
  .card-colon {
    margin-bottom: 3.75rem;
  }
}

/* 倒计时占位容器:原始高度,zoom 会自动按比例缩放占位空间,无需高度补偿。 */
.cd-holder {
  height: 10.8rem;
  overflow: visible;
}

/* 触屏设备:删除按钮始终可见(无 hover 状态) */
@media (hover: none) {
  .timeline-delete {
    opacity: 1 !important;
  }
}
</style>
