<template>
  <div v-if="stats && profile" class="max-w-2xl mx-auto px-5 py-12">
    <h1 class="text-3xl sm:text-4xl font-bold mb-2 text-center">分享我的人生</h1>
    <p class="text-sub mb-10 text-center">生成一张只展示核心数据、不泄露隐私的分享卡片。</p>

    <!-- 分享卡片 -->
    <div ref="cardEl" class="share-card mx-auto max-w-md rounded-2xl overflow-hidden shadow-lg">
      <div class="p-8 sm:p-10 text-center bg-card">
        <p class="text-xs tracking-[0.3em] text-sub mb-6 sm:mb-8">MY LIFE</p>
        <p class="text-base sm:text-lg text-sub mb-2">第</p>
        <p class="display-number text-6xl sm:text-7xl font-bold text-primary leading-none">{{ stats.daysLived.toLocaleString('en-US') }}</p>
        <p class="text-base sm:text-lg text-sub mt-2">天</p>

        <div class="my-6 sm:my-8">
          <p class="display-number text-4xl sm:text-5xl font-bold">{{ formatPercent(stats.progressPercent) }}%</p>
          <p class="text-sm text-sub mt-2">已经走过的人生</p>
        </div>

        <div class="h-3 rounded-full bg-line overflow-hidden mb-6 sm:mb-8">
          <div class="h-full rounded-full bg-linear-to-r from-primary to-accent" :style="{ width: `${stats.progressPercent}%` }"></div>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center">
          <div>
            <p class="display-number text-xl sm:text-2xl font-bold">{{ stats.weekendsLeft.toLocaleString('en-US') }}</p>
            <p class="text-xs text-sub mt-1">个周末</p>
          </div>
          <div>
            <p class="display-number text-xl sm:text-2xl font-bold">{{ stats.sunsetsLeft.toLocaleString('en-US') }}</p>
            <p class="text-xs text-sub mt-1">次日落</p>
          </div>
          <div>
            <p class="display-number text-xl sm:text-2xl font-bold">{{ stats.daysLeft.toLocaleString('en-US') }}</p>
            <p class="text-xs text-sub mt-1">天</p>
          </div>
        </div>
      </div>
      <div class="py-4 text-center bg-primary">
        <p class="text-white text-sm font-medium">今天,是你人生的第几天?</p>
      </div>
    </div>

    <!-- 操作区 -->
    <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <button
        class="px-8 py-4 rounded-full bg-primary text-white font-medium hover:bg-primary-deep transition-colors"
        @click="downloadCard"
      >
        保存图片
      </button>
      <button
        class="px-8 py-4 rounded-full border border-line text-ink font-medium hover:bg-card transition-colors"
        @click="copyLink"
      >
        {{ copied ? '已复制链接' : '复制链接' }}
      </button>
    </div>

    <p class="mt-8 text-center text-xs text-sub">分享卡片不包含你的出生日期、城市等个人隐私信息。</p>
  </div>

  <div v-else class="max-w-xl mx-auto px-5 py-24 text-center">
    <h1 class="text-3xl font-bold mb-4">还没有你的信息</h1>
    <p class="text-sub mb-8">先填写信息,再来生成分享卡片。</p>
    <NuxtLink to="/onboarding" class="inline-block px-8 py-4 rounded-full bg-primary text-white font-medium hover:bg-primary-deep transition-colors">
      开始计算
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
// share:分享卡片生成,只展示核心数据,不泄露隐私
import { formatPercent } from '~/utils/life'
import { SITE_URL, OG_IMAGE } from '~/utils/seo'

useSeoMeta({
  title: '分享我的人生',
  description: '生成一张只展示核心人生数据、不泄露隐私的分享卡片。你的数据只在本地,不会上传。',
  ogTitle: '分享我的人生',
  ogDescription: '生成一张不泄露隐私的人生进度分享卡片。',
  ogImage: OG_IMAGE,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: '分享我的人生',
  twitterDescription: '生成一张不泄露隐私的人生进度分享卡片。',
  twitterImage: OG_IMAGE,
})
useHead({ link: [{ rel: 'canonical', href: `${SITE_URL}/share` }] })

const { profile, stats } = useAppState()
const cardEl = ref<HTMLElement | null>(null)
const copied = ref(false)

async function downloadCard() {
  if (!cardEl.value) return
  // 使用 Canvas 将 DOM 渲染为图片(不额外引入依赖,用原生 API)
  try {
    // 动态加载 html2canvas 若不存在则提示使用浏览器截图
    // 这里采用简单方案:直接导出为 PNG 需要 canvas,优先尝试系统能力
    // 第一版提供"复制链接"作为主要分享方式,图片下载提示用户使用浏览器截图
    alert('图片保存功能需要截图。请在浏览器中截图,或使用"复制链接"分享。')
  } catch {
    alert('保存失败,请使用浏览器截图。')
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.origin)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // 降级方案
    alert('复制失败,请手动复制地址栏链接。')
  }
}
</script>
