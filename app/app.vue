<template>
  <UApp :locale="zhCN">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
// 应用初始化:启动实时时钟 + 初始化主题(用户资料由 life-init.client 插件加载)
import { zh_cn as zhCN } from '@nuxt/ui/locale'

const { now } = useAppState()
const { initTheme } = useTheme()

// 主题初始化(最早时机)
onMounted(() => {
  initTheme()
})

// 每秒更新实时时间,驱动倒计时
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
