<template>
  <div class="min-h-screen relative">
    <!-- 悬浮品牌标识 + 返回 -->
    <header class="app-header fixed top-0 left-0 right-0 z-50 pointer-events-none safe-top" :class="{ 'is-hero': isHero }">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 pointer-events-auto">
        <NuxtLink to="/" class="logo-brand text-base sm:text-lg font-semibold tracking-tight flex items-center gap-2 min-h-10">
          <img src="/logo.webp" alt="人生进度" class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover" />
          <span class="hidden sm:inline">人生进度</span>
        </NuxtLink>

        <div class="flex items-center gap-2 sm:gap-4">
          <template v-if="profile">
            <NuxtLink to="/life" class="nav-link text-sm text-sub hover:text-ink transition-colors px-1 sm:px-0 py-2 min-h-10 flex items-center">我的进度</NuxtLink>
            <NuxtLink to="/simulator" class="nav-link text-sm text-sub hover:text-ink transition-colors px-1 sm:px-0 py-2 min-h-10 flex items-center">模拟器</NuxtLink>
          </template>
          <!-- 全屏展示:仅在首页且已计算过(已有 profile)时显示,点击将首页第一屏进入/退出全屏 -->
          <button
            v-if="isHome && profile"
            class="fullscreen-toggle w-9 h-9 rounded-full flex items-center justify-center border border-line bg-card/60 backdrop-blur-sm hover:bg-card transition-colors"
            :aria-label="isFullscreen ? '退出全屏' : '全屏展示'"
            :title="isFullscreen ? '退出全屏' : '全屏展示'"
            @click="toggleFullscreen"
          >
            <svg
              v-if="!isFullscreen"
              viewBox="0 0 24 24"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          </button>
          <button
            class="theme-toggle w-9 h-9 rounded-full flex items-center justify-center border border-line bg-card/60 backdrop-blur-sm hover:bg-card transition-colors"
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

// 仅首页第一屏为深色星空背景,需要深色玻璃导航;其余页面(如 life)都是浅色背景,
// 导航保持浅色玻璃,不出现黑色。
const route = useRoute()
const isHome = computed(() => route.path === '/')

// 首页第一屏滚动离开前切换为深色玻璃 + 浅色文字以保持可读。
// 判定:在首页且滚动量不足半屏,视为仍停留在第一屏。
const isHero = ref(false)
function updateIsHero() {
  isHero.value = isHome.value && window.scrollY < window.innerHeight * 0.5
}
onMounted(() => {
  updateIsHero()
  window.addEventListener('scroll', updateIsHero, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateIsHero)
})

// 全屏展示:仅首页导航显示。点击将首页第一屏(.fss-panel)进入全屏。
// 由于 header 是 panel 的兄弟节点,浏览器全屏时只渲染全屏元素的祖先与后代,
// 因此头部导航(header)在全屏期间自动隐藏,符合"第1屏全屏、导航不显示"的需求。
const isFullscreen = ref(false)
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      const panel = document.querySelector('.fss-panel') as HTMLElement | null
      if (!panel) return
      await panel.requestFullscreen()
    }
  } catch {
    // 浏览器不支持或被拒绝时静默失败
  }
}
function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}
onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
})
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  }
})
</script>

<style scoped>
/* 顶部导航:羽毛玻璃(毛玻璃)效果。
   半透明底色 + backdrop-blur 磨砂 + 底部细分隔线,内容滚动时背景透出柔和磨砂。
   默认(浅色页面)用半透明白玻璃;第一屏 hero 深色星空时切换为半透明深色玻璃。 */
.app-header {
  background-color: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* 深色主题下的默认玻璃(若站点启用了 .dark) */
:global(.dark) .app-header {
  background-color: rgba(31, 26, 23, 0.5);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

/* 第一屏(hero)深色星空背景:更深一层的玻璃底 + 浅色文字,保证可读 */
.app-header.is-hero {
  background-color: rgba(15, 12, 10, 0.35);
  border-bottom-color: rgba(255, 255, 255, 0.12);
}
.is-hero .logo-brand {
  color: #fdf7f1;
}
.is-hero .nav-link {
  color: #f6ede4;
}
.is-hero .nav-link:hover {
  color: #fdf7f1;
}
.is-hero .theme-toggle {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.28);
}
.is-hero .theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 主题切换图标:给图标显式配色并随背景切换,保证始终可辨。
   浅色玻璃底 -> 深色图标;深色玻璃底(hero / dark) -> 浅色图标。 */
.theme-toggle span {
  color: #4a403a;
  line-height: 1;
}
.theme-toggle:hover span {
  color: #2a2622;
}
.app-header.is-hero .theme-toggle span {
  color: #fdf7f1;
}
:global(.dark) .theme-toggle span {
  color: #f4efe9;
}

/* 全屏按钮:与主题切换按钮一致,图标颜色随背景切换。 */
.fullscreen-toggle {
  color: #4a403a;
}
.fullscreen-toggle:hover {
  color: #2a2622;
}
.app-header.is-hero .fullscreen-toggle {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.28);
  color: #fdf7f1;
}
.app-header.is-hero .fullscreen-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
:global(.dark) .fullscreen-toggle {
  color: #f4efe9;
}
</style>
