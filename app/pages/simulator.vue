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
        <input v-model.number="input.phoneHours" type="range" min="0" max="12" step="0.5" class="w-full accent-primary" />
        <p class="text-xs text-sub mt-1">当前习惯:{{ profile.phoneHours }} 小时/天</p>
      </div>

      <!-- 学习时间 -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="font-medium">每天学习</label>
          <span class="display-number font-semibold text-primary">{{ input.learnHours }} 小时</span>
        </div>
        <input v-model.number="input.learnHours" type="range" min="0" max="6" step="0.5" class="w-full accent-primary" />
      </div>

      <!-- 运动时间 -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="font-medium">每周运动</label>
          <span class="display-number font-semibold text-primary">{{ input.exerciseHours }} 小时</span>
        </div>
        <input v-model.number="input.exerciseHours" type="range" min="0" max="14" step="0.5" class="w-full accent-primary" />
      </div>
    </div>

    <!-- 结果区 -->
    <div v-if="result" class="mt-10 space-y-6">
      <!-- 少刷手机 -->
      <div class="card p-8">
        <h2 class="text-lg font-semibold mb-6">如果每天少刷 {{ result.phoneSaved.perDay.toFixed(1) }} 小时手机</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-xl bg-bg dark:bg-bg-dark">
            <p class="text-xs text-sub mb-1">一年省下</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.phoneSaved.perYear" /> 小时</p>
          </div>
          <div class="p-4 rounded-xl bg-bg dark:bg-bg-dark">
            <p class="text-xs text-sub mb-1">十年省下</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.phoneSaved.perTenYears" /> 小时</p>
          </div>
        </div>
        <p class="mt-6 text-lg leading-relaxed">
          如果每天少刷 {{ result.phoneSaved.perDay.toFixed(1) }} 小时,你可能会为自己多出约
          <span class="display-number font-semibold text-primary">{{ Math.round(result.phoneSaved.daysGained).toLocaleString('en-US') }}</span> 天。
        </p>
      </div>

      <!-- 学习 -->
      <div class="card p-8">
        <h2 class="text-lg font-semibold mb-6">如果每天学习 {{ input.learnHours }} 小时</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-xl bg-bg dark:bg-bg-dark">
            <p class="text-xs text-sub mb-1">一年累计</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.learn.perYear" /> 小时</p>
          </div>
          <div class="p-4 rounded-xl bg-bg dark:bg-bg-dark">
            <p class="text-xs text-sub mb-1">一生累计</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.learn.perLifetime" /> 小时</p>
          </div>
        </div>
      </div>

      <!-- 运动 -->
      <div class="card p-8">
        <h2 class="text-lg font-semibold mb-6">如果每周运动 {{ input.exerciseHours }} 小时</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-xl bg-bg dark:bg-bg-dark">
            <p class="text-xs text-sub mb-1">一年累计</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.exercise.perYear" /> 小时</p>
          </div>
          <div class="p-4 rounded-xl bg-bg dark:bg-bg-dark">
            <p class="text-xs text-sub mb-1">一生累计</p>
            <p class="display-number text-2xl font-bold"><AnimatedNumber :value="result.exercise.perLifetime" /> 小时</p>
          </div>
        </div>
      </div>

      <p class="text-xs text-sub text-center">以上均为基于假设寿命的估算,不构成任何预测。</p>
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
import { reactive, computed } from 'vue'
import { computeSimulation } from '~/utils/life'

const { profile, now } = useAppState()

const input = reactive({
  phoneHours: 2, // 默认建议少刷到 2 小时
  learnHours: 1,
  exerciseHours: 3,
})

// 初始化手机输入为当前习惯(若有)
watchEffect(() => {
  if (profile.value && input.phoneHours === 2) {
    input.phoneHours = Math.max(0, profile.value.phoneHours - 1)
  }
})

const result = computed(() => {
  if (!profile.value) return null
  return computeSimulation(profile.value, input, new Date(now.value))
})
</script>
