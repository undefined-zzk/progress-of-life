<template>
  <div class="min-h-screen flex flex-col">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 backdrop-blur-md bg-bg/80 border-b border-line">
      <nav class="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="text-lg font-semibold tracking-tight flex items-center gap-2.5">
          <img src="/logo.webp" alt="人生进度" class="w-8 h-8 rounded-lg object-cover" />
          人生进度
        </NuxtLink>

        <div class="flex items-center gap-4">
          <template v-if="profile">
            <NuxtLink to="/life" class="text-sm text-sub hover:text-ink transition-colors">我的进度</NuxtLink>
            <NuxtLink to="/simulator" class="text-sm text-sub hover:text-ink transition-colors">模拟器</NuxtLink>
          </template>
          <!-- 主题切换 -->
          <button
            class="w-9 h-9 rounded-full flex items-center justify-center border border-line hover:bg-card transition-colors"
            :aria-label="isDark ? '切换到浅色主题' : '切换到深色主题'"
            @click="toggleTheme"
          >
            <span v-if="isDark" class="text-base">☀</span>
            <span v-else class="text-base">☾</span>
          </button>
        </div>
      </nav>
    </header>

    <!-- 页面内容 -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- 页脚 -->
    <footer class="border-t border-line py-8">
      <div class="max-w-5xl mx-auto px-5 text-center text-sm text-sub">
        <p>今天,是你人生的第几天?</p>
        <p class="mt-1 text-xs">所有数据仅在浏览器本地计算与存储,不会上传服务器。</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { profile } = useAppState()
const { isDark, toggleTheme } = useTheme()
</script>
