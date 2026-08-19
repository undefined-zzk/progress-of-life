<template>
  <div class="max-w-2xl mx-auto px-5 py-16">
    <!-- 进度指示 -->
    <div class="flex items-center gap-2 mb-12">
      <div
        v-for="i in steps.length"
        :key="i"
        class="h-1 flex-1 rounded-full transition-colors duration-300"
        :class="i <= currentStep ? 'bg-primary' : 'bg-line'"
      ></div>
    </div>

    <!-- 分步内容 -->
    <transition name="step" mode="out-in">
      <div :key="currentStep" class="min-h-[320px] flex flex-col justify-center">
        <!-- Step 1: 出生日期 -->
        <div v-if="currentStep === 1">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">你是哪一天来到这个世界的?</h2>
          <p class="text-sub mb-8">这是整个系统最重要的数据。</p>
          <UInputDate
            v-model="birthDateModel"
            :max-value="todayZoned"
            granularity="day"
            size="xl"
            class="w-full sm:w-auto"
            :ui="{ base: 'text-xl' }"
            placeholder="2000 / 08 / 19"
          />
        </div>

        <!-- Step 2: 出生时间(可选) -->
        <div v-else-if="currentStep === 2">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">还记得出生时间吗?</h2>
          <p class="text-sub mb-8">可选,用于更精确地计算。不记得也没关系。</p>
          <UInputTime
            v-model="form.birthTime"
            size="xl"
            class="w-full sm:w-auto"
            placeholder="08:32"
          />
          <button
            class="mt-4 block text-sm text-sub hover:text-ink dark:hover:text-ink-dark underline"
            @click="form.birthTime = null"
          >
            不知道
          </button>
        </div>

        <!-- Step 3: 城市 -->
        <div v-else-if="currentStep === 3">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">你现在生活在哪里?</h2>
          <p class="text-sub mb-8">用于展示本地时间、季节与城市相关的人生数据。</p>
          <USelect
            v-model="form.city"
            :items="cities"
            size="xl"
            placeholder="选择你所在的城市"
            class="w-full sm:w-auto"
          />
        </div>

        <!-- Step 4: 人生状态 -->
        <div v-else-if="currentStep === 4">
          <h2 class="text-3xl sm:text-4xl font-bold mb-8">你现在处于什么状态?</h2>
          <div class="grid sm:grid-cols-2 gap-3">
            <button
              v-for="s in lifeStatuses"
              :key="s"
              class="px-5 py-3 rounded-xl border text-left transition-all"
              :class="form.lifeStatus === s ? 'border-primary bg-primary/10 text-primary' : 'border-line hover:border-primary/50'"
              @click="form.lifeStatus = s"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- Step 5: 睡眠时间 -->
        <div v-else-if="currentStep === 5">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">你平均每天睡多久?</h2>
          <p class="text-sub mb-8">默认 8 小时,可以拖动调整。</p>
          <input v-model.number="form.sleepHours" type="range" min="4" max="12" step="0.5" class="w-full accent-primary" />
          <div class="mt-4 text-3xl font-semibold display-number">{{ form.sleepHours }} <span class="text-lg text-sub">小时</span></div>
        </div>

        <!-- Step 6: 工作/学习时间 -->
        <div v-else-if="currentStep === 6">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">每天花多少时间工作或学习?</h2>
          <input v-model.number="form.workHours" type="range" min="0" max="16" step="0.5" class="w-full accent-primary" />
          <div class="mt-4 text-3xl font-semibold display-number">{{ form.workHours }} <span class="text-lg text-sub">小时</span></div>
        </div>

        <!-- Step 7: 手机时间 -->
        <div v-else-if="currentStep === 7">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">每天大约花多少时间刷手机?</h2>
          <input v-model.number="form.phoneHours" type="range" min="0" max="12" step="0.5" class="w-full accent-primary" />
          <div class="mt-4 text-3xl font-semibold display-number">{{ form.phoneHours }} <span class="text-lg text-sub">小时</span></div>
        </div>

        <!-- Step 8: 假设寿命 -->
        <div v-else-if="currentStep === 8">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">假设寿命</h2>
          <p class="text-sub mb-8">以下数据只是基于你设定的目标寿命进行估算,并不是对实际寿命的预测。</p>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="y in [70, 75, 80, 85, 90]"
              :key="y"
              class="px-5 py-3 rounded-xl border transition-all"
              :class="form.lifeExpectancy === y ? 'border-primary bg-primary/10 text-primary' : 'border-line hover:border-primary/50'"
              @click="form.lifeExpectancy = y"
            >
              {{ y }} 岁
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 底部导航 -->
    <div class="mt-12 flex items-center justify-between">
      <button
        v-if="currentStep > 1"
        class="px-6 py-3 rounded-full border border-line text-ink dark:text-ink-dark hover:bg-card dark:hover:bg-card-dark transition-colors"
        @click="prev"
      >
        ← 上一步
      </button>
      <div v-else></div>

      <button
        v-if="currentStep < steps.length"
        class="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-deep transition-all"
        :disabled="!canNext"
        :class="{ 'opacity-40 cursor-not-allowed': !canNext }"
        @click="next"
      >
        下一步 →
      </button>
      <button
        v-else
        class="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-deep transition-all"
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

const steps = ['出生日期', '出生时间', '城市', '人生状态', '睡眠', '工作', '手机', '寿命']
const currentStep = ref(1)

const lifeStatuses = ['学生', '初入社会', '工作中', '创业中', '转型期', '休息中', '正在寻找方向', '不确定']

// 常用城市列表(USelect 使用)
const cities = [
  '北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安',
  '南京', '重庆', '苏州', '天津', '长沙', '郑州', '青岛', '厦门',
  '香港', '台北', '东京', '纽约', '伦敦', '巴黎', '悉尼', '其他',
]

// 出生日期(UInputDate 绑定 Date 对象)
const birthDateModel = ref<Date | null>(null)

// 今天(限制不能选择未来日期)——用 ZonedDateTime 兼容格式
const todayZoned = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
})

// 表单数据(初始默认值遵循文档)
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

// 将选中的出生日期同步到 form.birthDate(YYYY-MM-DD 字符串)
watch(birthDateModel, (d) => {
  if (!d) {
    form.birthDate = ''
    return
  }
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  form.birthDate = `${y}-${m}-${day}`
})

// 第一步(出生日期)必填,否则不能继续
const canNext = computed(() => {
  if (currentStep.value === 1) return !!form.birthDate
  return true
})

function next() {
  if (!canNext.value) return
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
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
</style>
