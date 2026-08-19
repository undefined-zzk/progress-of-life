<template>
  <div class="min-h-screen relative">
    <!-- 悬浮品牌标识 + 返回 -->
    <header class="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div class="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between pointer-events-auto">
        <NuxtLink to="/" class="text-lg font-semibold tracking-tight flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-primary"></span>
          人生进度
        </NuxtLink>

        <div class="flex items-center gap-4">
          <template v-if="profile">
            <NuxtLink to="/life" class="text-sm text-sub hover:text-ink dark:hover:text-ink-dark transition-colors">我的进度</NuxtLink>
            <NuxtLink to="/simulator" class="text-sm text-sub hover:text-ink dark:hover:text-ink-dark transition-colors">模拟器</NuxtLink>
          </template>
          <button
            class="w-9 h-9 rounded-full flex items-center justify-center border border-line bg-card/60 dark:bg-card-dark/60 backdrop-blur-sm hover:bg-card dark:hover:bg-card-dark transition-colors"
            :aria-label="isDark ? '切换到浅色主题' : '切换到深色主题'"
            @click="toggleTheme"
          >
            <span v-if="isDark">☀</span>
            <span v-else>☾</span>
          </button>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// 沉浸式布局:悬浮式 header,无 footer,适合全屏滚动页面
const { profile } = useAppState()
const { isDark, toggleTheme } = useTheme()
</script>
