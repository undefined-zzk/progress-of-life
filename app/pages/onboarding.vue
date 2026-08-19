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
      <div :key="currentStep" class="min-h-[340px] flex flex-col justify-center">
        <!-- Step 1: 出生日期 -->
        <div v-if="currentStep === 1" class="text-center">
          <p class="text-sm text-sub tracking-[0.3em] mb-6">第一步 · 出生日期</p>
          <h2 class="text-3xl sm:text-4xl font-bold mb-3">你是哪一天来到这个世界的?</h2>
          <p class="text-sub mb-10">这是整个系统最重要的数据。</p>

          <div class="flex items-end justify-center gap-3 sm:gap-4">
            <!-- 年 -->
            <div class="flex-1 max-w-[140px]">
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
            <div class="w-20">
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
            <div class="w-20">
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
            class="mt-8 inline-block text-sm text-sub hover:text-ink dark:hover:text-ink-dark underline underline-offset-4"
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
          <input v-model.number="form.sleepHours" type="range" min="4" max="12" step="0.5" class="w-full max-w-md mx-auto slider" />
        </div>

        <!-- Step 6: 工作/学习时间 -->
        <div v-else-if="currentStep === 6" class="text-center">
          <p class="text-sm text-sub tracking-[0.3em] mb-6">生活习惯</p>
          <h2 class="text-3xl sm:text-4xl font-bold mb-3">每天花多少时间工作或学习?</h2>
          <p class="text-sub mb-12">拖动滑块调整。</p>
          <div class="display-number text-7xl sm:text-8xl font-bold text-primary leading-none mb-6">
            {{ form.workHours }}<span class="text-2xl text-sub"> 小时</span>
          </div>
          <input v-model.number="form.workHours" type="range" min="0" max="16" step="0.5" class="w-full max-w-md mx-auto slider" />
        </div>

        <!-- Step 7: 手机时间 -->
        <div v-else-if="currentStep === 7" class="text-center">
          <p class="text-sm text-sub tracking-[0.3em] mb-6">生活习惯</p>
          <h2 class="text-3xl sm:text-4xl font-bold mb-3">每天大约花多少时间刷手机?</h2>
          <p class="text-sub mb-12">拖动滑块调整。</p>
          <div class="display-number text-7xl sm:text-8xl font-bold text-primary leading-none mb-6">
            {{ form.phoneHours }}<span class="text-2xl text-sub"> 小时</span>
          </div>
          <input v-model.number="form.phoneHours" type="range" min="0" max="12" step="0.5" class="w-full max-w-md mx-auto slider" />
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

          <!-- 自定义输入 -->
          <transition name="step">
            <div v-if="isCustomLife" class="mt-8 flex flex-col items-center gap-2">
              <div class="flex items-center justify-center gap-3">
                <input
                  v-model.number="customLife"
                  type="number"
                  :min="minLife"
                  :max="maxLife"
                  class="w-28 px-4 py-3 rounded-2xl border-2 bg-card dark:bg-card-dark text-center text-2xl font-semibold text-ink dark:text-ink-dark focus:outline-none focus:ring-2 transition-colors"
                  :class="customError ? 'border-red-500 focus:ring-red-500/20' : 'border-primary focus:ring-primary/30'"
                />
                <span class="text-2xl text-sub">岁</span>
              </div>
              <!-- 错误提示 -->
              <p v-if="customError" class="text-sm font-medium text-red-500">{{ customError }}</p>
              <p v-else class="text-sm text-sub">可输入 {{ minLife }} ~ {{ maxLife }} 岁之间</p>
            </div>
          </transition>
        </div>
      </div>
    </transition>

    <!-- 底部导航 -->
    <div class="mt-16 flex items-center justify-between">
      <button
        v-if="currentStep > 1"
        class="px-6 py-3.5 rounded-full border border-line text-ink dark:text-ink-dark hover:bg-card dark:hover:bg-card-dark transition-colors"
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
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({ label: `${m}`, value: m }))
const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1).map((d) => ({ label: `${d}`, value: d }))

// ---- 出生时间:时/分选择 ----
const birthHour = ref<number>()
const birthMinute = ref<number>()
const hourOptions = Array.from({ length: 24 }, (_, i) => i).map((h) => ({ label: String(h).padStart(2, '0'), value: h }))
const minuteOptions = Array.from({ length: 60 }, (_, i) => i).map((m) => ({ label: String(m).padStart(2, '0'), value: m }))

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
})

// ---- 假设寿命 ----
const lifeOptions = [70, 75, 80, 85, 90]
const isCustomLife = ref(false)
const customLife = ref<number>()

// 根据出生日期计算当前年龄,限制假设寿命范围
const currentAge = computed(() => {
  if (!year.value || !month.value || !day.value) return null
  const birth = new Date(year.value, month.value - 1, day.value)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
})

// 最小寿命:当前年龄 + 1(至少比现在活得久)
const minLife = computed(() => Math.max(60, (currentAge.value ?? 0) + 1))
// 最大寿命:120 岁
const maxLife = 120

function selectLifeExpectancy(y: number) {
  isCustomLife.value = false
  customLife.value = undefined
  customError.value = ''
  form.lifeExpectancy = y
}

function toggleCustomLife() {
  isCustomLife.value = !isCustomLife.value
  if (isCustomLife.value) {
    // 初始化自定义值:若当前值不在预设里,用当前值;否则用默认 88
    customLife.value = lifeOptions.includes(form.lifeExpectancy) ? 88 : form.lifeExpectancy
  } else {
    customError.value = ''
  }
}

// 自定义输入的校验错误信息
const customError = ref('')

// 实时校验自定义输入
watch(customLife, (v) => {
  if (!isCustomLife.value) return
  if (v === undefined || v === null || Number.isNaN(v)) {
    customError.value = '请输入年龄'
    return
  }
  const val = Math.round(v)
  if (val < minLife.value) {
    customError.value = `年龄不能小于 ${minLife.value} 岁(你目前约 ${currentAge.value} 岁)`
  } else if (val > maxLife) {
    customError.value = `年龄不能大于 ${maxLife} 岁`
  } else {
    customError.value = ''
    form.lifeExpectancy = val
  }
})

// 第一步(出生日期)必填
const canNext = computed(() => {
  if (currentStep.value === 1) return !!(year.value && month.value && day.value)
  // 第 8 步:自定义模式下校验输入是否合法
  if (currentStep.value === 8 && isCustomLife.value) {
    return customError.value === '' && customLife.value !== undefined && customLife.value !== null
  }
  return true
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
