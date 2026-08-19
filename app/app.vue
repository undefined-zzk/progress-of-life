<template>
  <UApp :locale="zhCN">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
// 应用初始化:加载用户资料 + 启动实时时钟 + 初始化主题
import { zh_cn as zhCN } from '@nuxt/ui/locale'

const { init, now } = useAppState()
const { initTheme } = useTheme()

// hydration 后初始化:加载 LocalStorage 资料 + 主题
onMounted(() => {
  initTheme()
  init()
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
