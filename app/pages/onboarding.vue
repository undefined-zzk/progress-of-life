<template>
  <div class="max-w-2xl mx-auto px-6 py-14 sm:py-20">
    <!-- 进度指示:圆点式 -->
    <div class="flex items-center justify-center gap-2 mb-14">
      <div
        v-for="i in steps.length"
        :key="i"
        class="h-1.5 rounded-full transition-all duration-500"
        :class="i <= currentStep ? 'bg-primary' : 'bg-line'"
        :style="{ width: i <= currentStep ? '24px' : '12px' }"
      ></div>
    </div>

    <!-- 分步内容 -->
    <transition name="step" mode="out-in">
      <div :key="currentStep" class="min-h-85 flex flex-col justify-center">
        <!-- Step 1: 出生日期 -->
        <div v-if="currentStep === 1" class="text-center">
          <p class="text-sm text-sub tracking-[0.3em] mb-6">第一步 · 出生日期</p>
          <h2 class="text-3xl sm:text-4xl font-bold mb-3">你是哪一天来到这个世界的?</h2>
          <p class="text-sub mb-10">这是整个系统最重要的数据。</p>

          <div class="flex items-end justify-center gap-3 sm:gap-4">
            <!-- 年 -->
            <div class="flex-1 max-w-35">
              <label class="block text-xs text-sub mb-2 text-center">年</label>
              <USelect
                v-model="year"
                :items="yearOptions"
                size="xl"
                class="w-full"
                :ui="{ base: 'text-2xl font-semibold text-center tracking-tight', trailingIcon: 'text-sub' }"
                placeholder="----"
              />
            </div>
            <span class="text-3xl text-sub pb-2">/</span>
            <!-- 月 -->
            <div class="w-28">
              <label class="block text-xs text-sub mb-2 text-center">月</label>
              <USelect
                v-model="month"
                :items="monthOptions"
                size="xl"
                class="w-full"
                :ui="{ base: 'text-2xl font-semibold text-center tracking-tight', trailingIcon: 'text-sub' }"
                placeholder="--"
              />
            </div>
            <span class="text-3xl text-sub pb-2">/</span>
            <!-- 日 -->
            <div class="w-28">
              <label class="block text-xs text-sub mb-2 text-center">日</label>
              <USelect
                v-model="day"
                :items="dayOptions"
                size="xl"
                class="w-full"
                :ui="{ base: 'text-2xl font-semibold text-center tracking-tight', trailingIcon: 'text-sub' }"
                placeholder="--"
              />
            </div>
          </div>

          <!-- 未来出生日期提示 -->
          <p v-if="birthDateInvalid" class="mt-6 text-sm font-medium text-red-500">
            出生日期不能晚于今天
          </p>
        </div>

        <!-- Step 2: 出生时间(可选) -->
        <div v-else-if="currentStep === 2" class="text-center">
          <p class="text-sm text-sub tracking-[0.3em] mb-6">可选 · 出生时间</p>
          <h2 class="text-3xl sm:text-4xl font-bold mb-3">还记得出生时间吗?</h2>
          <p class="text-sub mb-10">用于更精确地计算。不记得也没关系。</p>

          <div class="flex items-end justify-center gap-3">
            <div class="w-24">
              <label class="block text-xs text-sub mb-2 text-center">时</label>
              <USelect
                v-model="birthHour"
                :items="hourOptions"
                size="xl"
                class="w-full"
                :ui="{ base: 'text-2xl font-semibold text-center tracking-tight' }"
                placeholder="--"
              />
            </div>
            <span class="text-3xl text-sub pb-2">:</span>
            <div class="w-24">
              <label class="block text-xs text-sub mb-2 text-center">分</label>
              <USelect
                v-model="birthMinute"
                :items="minuteOptions"
                size="xl"
                class="w-full"
                :ui="{ base: 'text-2xl font-semibold text-center tracking-tight' }"
                placeholder="--"
              />
            </div>
          </div>

          <button
            type="button"
            class="mt-8 inline-block text-sm text-sub hover:text-ink underline underline-offset-4"
            @click="skipBirthTime"
          >
            不知道
          </button>
        </div>

        <!-- Step 3: 城市 -->
        <div v-else-if="currentStep === 3" class="text-center">
          <p class="text-sm text-sub tracking-[0.3em] mb-6">第三步 · 所在城市</p>
          <h2 class="text-3xl sm:text-4xl font-bold mb-3">你现在生活在哪里?</h2>
          <p class="text-sub mb-10">用于展示本地时间、季节与城市相关的人生数据。</p>

          <UListbox
            v-model="form.city"
            :items="cities"
            value-key="value"
            size="xl"
            filter
            :filter-fields="['label']"
            virtualize
            class="w-full max-w-sm mx-auto"
            placeholder="选择或搜索你所在的城市"
            :ui="{ root: 'text-xl' }"
          />
        </div>

        <!-- Step 4: 人生状态 -->
        <div v-else-if="currentStep === 4" class="text-center">
          <p class="text-sm text-sub tracking-[0.3em] mb-6">第四步 · 人生状态</p>
          <h2 class="text-3xl sm:text-4xl font-bold mb-10">你现在处于什么状态?</h2>
          <div class="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              v-for="s in lifeStatuses"
              :key="s"
              class="px-5 py-4 rounded-2xl border-2 text-base transition-all duration-200"
              :class="form.lifeStatus === s ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-line hover:border-primary/40'"
              @click="form.lifeStatus = s"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- Step 5: 睡眠时间 -->
        <div v-else-if="currentStep === 5" class="text-center">
          <p class="text-sm text-sub tracking-[0.3em] mb-6">生活习惯</p>
          <h2 class="text-3xl sm:text-4xl font-bold mb-3">你平均每天睡多久?</h2>
          <p class="text-sub mb-12">默认 8 小时,可以拖动调整。</p>
          <div class="display-number text-7xl sm:text-8xl font-bold text-primary leading-none mb-6">
            {{ form.sleepHours }}<span class="text-2xl text-sub"> 小时</span>
          </div>
          <input v-model.number="form.sleepHours" type="range" min="0" max="24" step="0.5" class="w-full max-w-md mx-auto slider" />
        </div>

        <!-- Step 6: 工作/学习时间 -->
        <div v-else-if="currentStep === 6" class="text-center">
          <p class="text-sm text-sub tracking-[0.3em] mb-6">生活习惯</p>
          <h2 class="text-3xl sm:text-4xl font-bold mb-3">每天花多少时间工作或学习?</h2>
          <p class="text-sub mb-12">拖动滑块调整。</p>
          <div class="display-number text-7xl sm:text-8xl font-bold text-primary leading-none mb-6">
            {{ form.workHours }}<span class="text-2xl text-sub"> 小时</span>
          </div>
          <input v-model.number="form.workHours" type="range" min="0" max="24" step="0.5" class="w-full max-w-md mx-auto slider" />
        </div>

        <!-- Step 7: 手机时间 -->
        <div v-else-if="currentStep === 7" class="text-center">
          <p class="text-sm text-sub tracking-[0.3em] mb-6">生活习惯</p>
          <h2 class="text-3xl sm:text-4xl font-bold mb-3">每天大约花多少时间刷手机?</h2>
          <p class="text-sub mb-12">拖动滑块调整。</p>
          <div class="display-number text-7xl sm:text-8xl font-bold text-primary leading-none mb-6">
            {{ form.phoneHours }}<span class="text-2xl text-sub"> 小时</span>
          </div>
          <input v-model.number="form.phoneHours" type="range" min="0" max="24" step="0.5" class="w-full max-w-md mx-auto slider" />
        </div>

        <!-- Step 8: 假设寿命 -->
        <div v-else-if="currentStep === 8" class="text-center">
          <p class="text-sm text-sub tracking-[0.3em] mb-6">最后一步 · 假设寿命</p>
          <h2 class="text-3xl sm:text-4xl font-bold mb-3">假设寿命</h2>
          <p class="text-sub mb-10">以下数据只是基于你设定的目标寿命估算,<br class="hidden sm:block" />并不是对实际寿命的预测。</p>
          <div class="flex flex-wrap justify-center gap-3">
            <button
              v-for="y in lifeOptions"
              :key="y"
              class="px-7 py-4 rounded-2xl border-2 text-lg transition-all duration-200"
              :class="form.lifeExpectancy === y ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-line hover:border-primary/40'"
              @click="selectLifeExpectancy(y)"
            >
              {{ y }} 岁
            </button>
            <!-- 自定义按钮 -->
            <button
              class="px-7 py-4 rounded-2xl border-2 text-lg transition-all duration-200"
              :class="isCustomLife ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-dashed border-line hover:border-primary/40'"
              @click="toggleCustomLife"
            >
              自定义
            </button>
          </div>

          <!-- 自定义输入:岁 + 时 + 分 + 秒 -->
          <transition name="step">
            <div v-if="isCustomLife" class="mt-8 flex flex-col items-center gap-3">
              <div class="flex flex-wrap items-end justify-center gap-3">
                <div class="flex flex-col items-center gap-1.5">
                  <input
                    v-model.number="customYears"
                    type="number"
                    :min="minLife"
                    :max="maxLife"
                    class="w-24 px-4 py-3 rounded-2xl border-2 bg-card text-center text-2xl font-semibold text-ink focus:outline-none focus:ring-2 transition-colors"
                    :class="customError ? 'border-red-500 focus:ring-red-500/20' : 'border-primary focus:ring-primary/30'"
                  />
                  <span class="text-sm text-sub">岁</span>
                </div>
                <span class="text-2xl text-sub pb-8">+</span>
                <div class="flex flex-col items-center gap-1.5">
                  <input
                    v-model.number="customHours"
                    type="number"
                    min="0"
                    max="23"
                    placeholder="0"
                    class="w-20 px-3 py-3 rounded-2xl border-2 bg-card text-center text-xl font-semibold text-ink focus:outline-none focus:ring-2 transition-colors border-line focus:ring-primary/30"
                  />
                  <span class="text-sm text-sub">时</span>
                </div>
                <div class="flex flex-col items-center gap-1.5">
                  <input
                    v-model.number="customMins"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    class="w-20 px-3 py-3 rounded-2xl border-2 bg-card text-center text-xl font-semibold text-ink focus:outline-none focus:ring-2 transition-colors border-line focus:ring-primary/30"
                  />
                  <span class="text-sm text-sub">分</span>
                </div>
                <div class="flex flex-col items-center gap-1.5">
                  <input
                    v-model.number="customSecs"
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    class="w-20 px-3 py-3 rounded-2xl border-2 bg-card text-center text-xl font-semibold text-ink focus:outline-none focus:ring-2 transition-colors border-line focus:ring-primary/30"
                  />
                  <span class="text-sm text-sub">秒</span>
                </div>
              </div>
              <!-- 错误提示 -->
              <p v-if="customError" class="text-sm font-medium text-red-500">{{ customError }}</p>
              <p v-else class="text-sm text-sub">可输入 {{ minLife }} ~ {{ maxLife }} 岁,并可精确到时/分/秒</p>
            </div>
          </transition>
        </div>
      </div>
    </transition>

    <!-- 底部导航 -->
    <div class="mt-16 flex items-center justify-between">
      <button
        v-if="currentStep > 1"
        class="px-6 py-3.5 rounded-full border border-line text-ink hover:bg-card transition-colors"
        @click="prev"
      >
        ← 上一步
      </button>
      <div v-else></div>

      <button
        v-if="currentStep < steps.length"
        class="px-10 py-3.5 rounded-full bg-primary text-white font-medium text-lg hover:bg-primary-deep transition-all hover:scale-[1.02] active:scale-[0.98]"
        :disabled="!canNext"
        :class="{ 'opacity-40 cursor-not-allowed': !canNext }"
        @click="next"
      >
        下一步 →
      </button>
      <button
        v-else
        class="px-10 py-3.5 rounded-full bg-primary text-white font-medium text-lg hover:bg-primary-deep transition-all hover:scale-[1.02] active:scale-[0.98]"
        :disabled="!canNext"
        :class="{ 'opacity-40 cursor-not-allowed': !canNext }"
        @click="finish"
      >
        生成我的人生报告
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// onboarding:分步问答式信息收集,遵循文档"逐步问答、少收集"原则
import type { UserProfile } from '~/types/life'
import { cityList } from '~/data/cities'

const steps = ['出生日期', '出生时间', '城市', '人生状态', '睡眠', '工作', '手机', '寿命']
const currentStep = ref(1)

const lifeStatuses = ['学生', '初入社会', '工作中', '创业中', '转型期', '休息中', '正在寻找方向', '不确定']

// 城市列表(国内全部主要城市 + 世界著名城市,一级扁平列表)
const cities = cityList

const todayStr = new Date().toISOString().slice(0, 10)
const thisYear = new Date().getFullYear()

// ---- 出生日期:年/月/日选择 ----
const year = ref<number>()
const month = ref<number>()
const day = ref<number>()

const yearOptions = Array.from({ length: 100 }, (_, i) => thisYear - i).map((y) => ({ label: `${y}`, value: y }))

const nowDate = new Date()
const curMonth = nowDate.getMonth() + 1
const curDay = nowDate.getDate()

// 月/日选项动态禁用超过今天的日期(选了今年时,未来月/日不可选)
const monthOptions = computed(() => {
  const isCurYear = year.value === thisYear
  return Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
    label: `${m}`,
    value: m,
    disabled: isCurYear && m > curMonth,
  }))
})

const dayOptions = computed(() => {
  const isCurYearMonth = year.value === thisYear && month.value === curMonth
  return Array.from({ length: 31 }, (_, i) => i + 1).map((d) => ({
    label: `${d}`,
    value: d,
    disabled: isCurYearMonth && d > curDay,
  }))
})

// 当年份切到今年时,若已选的月/日超出今天,重置为空,避免保留被禁用的值
watch([year, month], () => {
  if (year.value === thisYear && month.value != null && month.value > curMonth) {
    month.value = undefined
    day.value = undefined
    return
  }
  if (year.value === thisYear && month.value === curMonth && day.value != null && day.value > curDay) {
    day.value = undefined
  }
})

// 出生日期不能晚于今天(兜底校验,避免误选未来日期导致负的天数/小时)
const birthDateInvalid = computed(() => {
  if (!year.value || !month.value || !day.value) return false
  const birth = new Date(year.value, month.value - 1, day.value)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return birth.getTime() > today.getTime()
})

// ---- 出生时间:时/分选择 ----
const birthHour = ref<number>()
const birthMinute = ref<number>()

const nowHour = new Date().getHours()
const nowMinute = new Date().getMinutes()
// 出生日期是否为今天(此时出生时分不能超过当前时刻)
const isBirthToday = computed(() => year.value === thisYear && month.value === curMonth && day.value === curDay)

// 时/分选项:出生日期为今天时,禁用超过当前时刻的选项
const hourOptions = computed(() =>
  Array.from({ length: 24 }, (_, i) => i).map((h) => ({
    label: String(h).padStart(2, '0'),
    value: h,
    disabled: isBirthToday.value && h > nowHour,
  })),
)
const minuteOptions = computed(() =>
  Array.from({ length: 60 }, (_, i) => i).map((m) => ({
    label: String(m).padStart(2, '0'),
    value: m,
    disabled: isBirthToday.value && birthHour.value === nowHour && m > nowMinute,
  })),
)

// 出生日期/时间变化时,若已选时分超出当前时刻,重置为空,避免保留被禁用的值
watch([year, month, day, birthHour], () => {
  if (isBirthToday.value) {
    if (birthHour.value != null && birthHour.value > nowHour) {
      birthHour.value = undefined
      birthMinute.value = undefined
      return
    }
    if (birthHour.value === nowHour && birthMinute.value != null && birthMinute.value > nowMinute) {
      birthMinute.value = undefined
    }
  }
})

// 点击「不知道」:清空出生时间并直接跳到下一步
function skipBirthTime() {
  birthHour.value = undefined
  birthMinute.value = undefined
  form.birthTime = null
  currentStep.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ---- 表单 ----
const form = reactive<Omit<UserProfile, 'createdAt' | 'lastSeenAt' | 'seenDays'>>({
  birthDate: '',
  birthTime: null,
  city: '',
  lifeStatus: null,
  sleepHours: 8,
  workHours: 8,
  phoneHours: 3,
  exerciseHours: 3,
  lifeExpectancy: 80,
  lifeExpectancyMs: 80 * 365 * 24 * 60 * 60 * 1000,
})

// ---- 假设寿命 ----
const lifeOptions = [70, 75, 80, 85, 90]
const isCustomLife = ref(false)

// 自定义寿命:岁 + 时 + 分 + 秒,支持 0 岁(出生即死亡,只活几秒/几分钟)
const customYears = ref<number>()
const customHours = ref<number>()
const customMins = ref<number>()
const customSecs = ref<number>()

// 最小预估寿命:最低可填 0 岁
const minLife = 0
// 最大寿命:允许超过 120 岁的极端高龄
const maxLife = 150

const YEAR_MS = 365 * 24 * 60 * 60 * 1000

// 组合自定义寿命毫秒(岁/时/分/秒)
function customLifeMs(): number {
  const years = Math.round(customYears.value ?? 0)
  const hours = Math.round(customHours.value ?? 0)
  const mins = Math.round(customMins.value ?? 0)
  const secs = Math.round(customSecs.value ?? 0)
  return years * YEAR_MS + hours * 3600 * 1000 + mins * 60 * 1000 + secs * 1000
}

// 自定义输入是否完整(岁至少填了,其余字段可选,未填按 0)
const customLifeComplete = computed(() => customYears.value !== undefined && customYears.value !== null)

function selectLifeExpectancy(y: number) {
  isCustomLife.value = false
  customError.value = ''
  form.lifeExpectancy = y
  form.lifeExpectancyMs = y * YEAR_MS
}

function toggleCustomLife() {
  isCustomLife.value = !isCustomLife.value
  if (isCustomLife.value) {
    // 初始化自定义值:若当前值不在预设里,用当前值;否则用默认 88 岁
    customYears.value = lifeOptions.includes(form.lifeExpectancy) ? 88 : form.lifeExpectancy
    customHours.value = 0
    customMins.value = 0
    customSecs.value = 0
    customError.value = ''
  } else {
    customError.value = ''
  }
}

// 自定义输入的校验错误信息
const customError = ref('')

// 实时校验自定义寿命输入
watch([customYears, customHours, customMins, customSecs], () => {
  if (!isCustomLife.value) return
  const years = Math.round(customYears.value ?? 0)
  if (customYears.value === undefined || customYears.value === null || Number.isNaN(customYears.value)) {
    customError.value = '请输入岁数'
    return
  }
  if (years < minLife) {
    customError.value = `年龄不能小于 ${minLife} 岁`
    return
  }
  if (years > maxLife) {
    customError.value = `年龄不能大于 ${maxLife} 岁`
    return
  }
  const hours = Math.round(customHours.value ?? 0)
  const mins = Math.round(customMins.value ?? 0)
  const secs = Math.round(customSecs.value ?? 0)
  if (hours < 0 || hours > 23) {
    customError.value = '时需在 0~23 之间'
    return
  }
  if (mins < 0 || mins > 59) {
    customError.value = '分需在 0~59 之间'
    return
  }
  if (secs < 0 || secs > 59) {
    customError.value = '秒需在 0~59 之间'
    return
  }
  customError.value = ''
  form.lifeExpectancy = years
  form.lifeExpectancyMs = customLifeMs()
})

// 除第二步(出生时间,可选)外,其它步骤均需必填/必选,否则无法进入下一步。
const canNext = computed(() => {
  switch (currentStep.value) {
    case 1: // 出生日期:年/月/日必选,且不能晚于今天
      return !!(year.value && month.value && day.value) && !birthDateInvalid.value
    case 2: // 出生时间:可选
      return true
    case 3: // 城市必选
      return !!form.city
    case 4: // 人生状态必选
      return !!form.lifeStatus
    case 5: // 睡眠:滑块始终有默认值
    case 6: // 工作/学习:滑块始终有默认值
    case 7: // 手机:滑块始终有默认值
      return true
    case 8: // 假设寿命
      if (isCustomLife.value) {
        // 自定义模式:需输入岁数且通过校验
        return customError.value === '' && customLifeComplete.value
      }
      // 预设模式:必须选择了某个预设寿命
      return form.lifeExpectancy != null
    default:
      return true
  }
})

function next() {
  if (!canNext.value) return
  // 离开第一步时,组装出生日期字符串
  if (currentStep.value === 1) {
    form.birthDate = `${year.value}-${String(month.value).padStart(2, '0')}-${String(day.value).padStart(2, '0')}`
  }
  // 离开第二步时,组装出生时间字符串
  if (currentStep.value === 2 && birthHour.value !== undefined && birthMinute.value !== undefined) {
    form.birthTime = `${String(birthHour.value).padStart(2, '0')}:${String(birthMinute.value).padStart(2, '0')}`
  } else if (currentStep.value === 2) {
    form.birthTime = null
  }
  currentStep.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function prev() {
  currentStep.value--
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const { setProfile } = useAppState()
const { createDefaultProfile } = useLifeStore()

function finish() {
  // 防御性校验:若自定义寿命存在校验错误,阻止生成
  if (isCustomLife.value && (customError.value || !customLifeComplete.value)) {
    return
  }
  const base = createDefaultProfile(form.birthDate)
  const profile: UserProfile = {
    ...base,
    birthTime: form.birthTime,
    city: form.city,
    lifeStatus: form.lifeStatus,
    sleepHours: form.sleepHours,
    workHours: form.workHours,
    phoneHours: form.phoneHours,
    exerciseHours: form.exerciseHours,
    lifeExpectancy: form.lifeExpectancy,
    lifeExpectancyMs: form.lifeExpectancyMs,
  }
  setProfile(profile)
  navigateTo('/life')
}
</script>

<style scoped>
.step-enter-active,
.step-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.step-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 自定义滑块样式,贴合暖色主题 */
.slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-line);
  outline: none;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.4);
  transition: transform 0.15s ease;
}
.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}
.slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(224, 122, 95, 0.4);
}
</style>
