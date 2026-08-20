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
import { SITE_URL } from '~/utils/seo'

const { init, now } = useAppState()
const { initTheme } = useTheme()

// 全局 SEO:主题色 + WebSite/SoftwareApplication 结构化数据
useHead({
  meta: [{ name: 'theme-color', content: '#e07a5f' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: '人生进度',
            description: '记录与感受人生进度的工具,看看今天是你人生的第几天。',
            url: SITE_URL,
            inLanguage: 'zh-CN',
          },
          {
            '@type': 'SoftwareApplication',
            name: '人生进度',
            url: SITE_URL,
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0' },
            description: '一个本地计算、不上传数据的在线人生进度记录工具。',
          },
        ],
      }),
    },
  ],
})

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
