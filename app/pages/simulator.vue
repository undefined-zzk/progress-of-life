<template>
  <div v-if="profile" class="max-w-2xl mx-auto px-5 py-12">
    <h1 class="text-3xl sm:text-4xl font-bold mb-2">人生模拟器</h1>
    <p class="text-sub mb-10">调整你的习惯,看看如果改变,你可能会为自己多出多少时间。</p>

    <!-- 输入区 -->
    <div class="card p-8 space-y-8">
      <!-- 手机时间 -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="font-medium">每天刷手机</label>
          <span class="display-number font-semibold text-primary">{{ input.phoneHours }} 小时</span>
        </div>
        <input v-model.number="input.phoneHours" type="range" min="0" max="24" step="0.5" class="w-full accent-primary" />
        <p class="text-xs text-sub mt-1">当前习惯:{{ profile.phoneHours }} 小时/天</p>
      </div>

      <!-- 学习时间 -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="font-medium">每天学习</label>
          <span class="display-number font-semibold text-primary">{{ input.learnHours }} 小时</span>
        </div>
        <input v-model.number="input.learnHours" type="range" min="0" max="24" step="0.5" class="w-full accent-primary" />
        <p class="text-xs text-sub mt-1">当前习惯:{{ currentLearnHours }} 小时/天</p>
      </div>

      <!-- 运动时间 -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="font-medium">每周运动</label>
          <span class="display-number font-semibold text-primary">{{ input.exerciseHours }} 小时</span>
        </div>
        <input v-model.number="input.exerciseHours" type="range" min="0" max="168" step="0.5" class="w-full accent-primary" />
        <p class="text-xs text-sub mt-1">当前习惯:{{ currentExerciseHours }} 小时/周</p>
      </div>
    </div>

    <!-- 结果区 -->
    <div v-if="result" class="mt-10 space-y-6">
      <!-- 少刷手机:仅当确实有节省时显示 -->
      <div v-if="result.phoneSaved.perDay > 0" class="card p-8">
        <h2 class="text-lg font-semibold mb-6">如果每天少刷 {{ result.phoneSaved.perDay.toFixed(1) }} 小时手机</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-xl bg-bg">
            <p class="text-xs text-sub mb-1">一年省下</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.phoneSaved.perYear" /> 小时</p>
          </div>
          <div class="p-4 rounded-xl bg-bg">
            <p class="text-xs text-sub mb-1">十年省下</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.phoneSaved.perTenYears" /> 小时</p>
          </div>
        </div>
        <p class="mt-6 text-lg leading-relaxed">
          如果每天少刷 {{ result.phoneSaved.perDay.toFixed(1) }} 小时,你可能会为自己多出约
          <span class="display-number font-semibold text-primary">{{ Math.round(result.phoneSaved.daysGained).toLocaleString('en-US') }}</span> 天。
        </p>
      </div>

      <!-- 多刷手机的提示:当目标值高于当前习惯 -->
      <div v-else-if="result.phoneSaved.perDay === 0 && input.phoneHours > profile.phoneHours" class="card p-8">
        <h2 class="text-lg font-semibold mb-2">你把手机时间调高了</h2>
        <p class="text-sub leading-relaxed">
          当前习惯是 {{ profile.phoneHours }} 小时/天,你设置了 {{ input.phoneHours }} 小时。
          尝试把滑块调低,看看能为自己省下多少时间。
        </p>
      </div>

      <!-- 学习:仅当有学习时间时显示意义 -->
      <div v-if="input.learnHours > 0" class="card p-8">
        <h2 class="text-lg font-semibold mb-6">如果每天学习 {{ input.learnHours }} 小时</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-xl bg-bg">
            <p class="text-xs text-sub mb-1">一年累计</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.learn.perYear" /> 小时</p>
          </div>
          <div class="p-4 rounded-xl bg-bg">
            <p class="text-xs text-sub mb-1">一生累计</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.learn.perLifetime" /> 小时</p>
          </div>
        </div>
      </div>

      <!-- 运动:仅当有运动时间时显示意义 -->
      <div v-if="input.exerciseHours > 0" class="card p-8">
        <h2 class="text-lg font-semibold mb-6">如果每周运动 {{ input.exerciseHours }} 小时</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-xl bg-bg">
            <p class="text-xs text-sub mb-1">一年累计</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.exercise.perYear" /> 小时</p>
          </div>
          <div class="p-4 rounded-xl bg-bg">
            <p class="text-xs text-sub mb-1">一生累计</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.exercise.perLifetime" /> 小时</p>
          </div>
        </div>
      </div>

      <!-- 三项均为 0 的兜底 -->
      <div v-if="result.phoneSaved.perDay === 0 && input.learnHours === 0 && input.exerciseHours === 0" class="card p-8 text-center">
        <p class="text-sub leading-relaxed">拖动上方的滑块,试试改变你的习惯。</p>
      </div>
    </div>
  </div>

  <div v-else class="max-w-xl mx-auto px-5 py-24 text-center">
    <h1 class="text-3xl font-bold mb-4">还没有你的信息</h1>
    <p class="text-sub mb-8">先填写信息,再来探索改变的可能。</p>
    <NuxtLink to="/onboarding" class="inline-block px-8 py-4 rounded-full bg-primary text-white font-medium hover:bg-primary-deep transition-colors">
      开始计算
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
// simulator:人生模拟器,实时计算"如果改变习惯会怎样"
import { reactive, computed, watch } from 'vue'
import { computeSimulation } from '~/utils/life'

const { profile, now } = useAppState()

const input = reactive({
  phoneHours: 0,
  learnHours: 0,
  exerciseHours: 0,
})

// 当前习惯(用于展示对比)。学习时间 profile 未存,默认按 0 显示。
const currentLearnHours = computed(() => 0)
const currentExerciseHours = computed(() => profile.value?.exerciseHours ?? 0)

// profile 就绪时一次性初始化各滑块为"略优于当前习惯"的建议值,
// 用 watch + once 标志,避免 watchEffect 反复触发、覆盖用户后续的手动调整。
let inited = false
watch(
  profile,
  (p) => {
    if (!p || inited) return
    inited = true
    // 手机:建议比当前少 1 小时,但不低于 0
    input.phoneHours = Math.max(0, +(p.phoneHours - 1).toFixed(1))
    // 学习:默认 1 小时(无当前习惯可对比)
    input.learnHours = 1
    // 运动:沿用当前习惯作为起点,便于看"如果增加会怎样"
    input.exerciseHours = p.exerciseHours ?? 3
  },
  { immediate: true },
)

const result = computed(() => {
  if (!profile.value) return null
  // clamp 防止边界(NaN / 越界)传入计算引擎
  const safeInput = {
    phoneHours: clamp(input.phoneHours, 0, 24),
    learnHours: clamp(input.learnHours, 0, 24),
    exerciseHours: clamp(input.exerciseHours, 0, 168),
  }
  return computeSimulation(profile.value, safeInput, new Date(now.value))
})

function clamp(n: unknown, min: number, max: number): number {
  const v = typeof n === 'number' && !Number.isNaN(n) ? n : 0
  return Math.min(max, Math.max(min, v))
}
</script>
