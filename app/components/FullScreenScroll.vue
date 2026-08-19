<template>
  <div ref="root" class="fss relative">
    <!-- 内容槽:每个直接子元素(.fss-panel)占满一屏 -->
    <slot />

    <!-- 侧边导航点 -->
    <nav
      class="fss-nav fixed right-5 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
      aria-label="章节导航"
    >
      <button
        v-for="(label, i) in labels"
        :key="i"
        class="fss-dot group flex items-center justify-end gap-2.5"
        :class="{ 'is-active': i === activeIndex }"
        :aria-label="label"
        :aria-current="i === activeIndex ? 'true' : undefined"
        @click="goTo(i)"
      >
        <span
          class="hidden sm:inline text-xs text-sub opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
          :class="{ '!opacity-100': i === activeIndex }"
        >
          {{ label }}
        </span>
        <span
          class="w-2.5 h-2.5 rounded-full transition-all duration-300"
          :class="i === activeIndex ? 'bg-primary scale-150' : 'bg-line group-hover:bg-primary/50'"
        ></span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
// 全屏滚动容器:整屏吸附切换 + 导航点 + 每屏整体切换动画
const props = defineProps<{
  labels: string[]
}>()

const root = ref<HTMLElement | null>(null)
const activeIndex = ref(0)

const { gsap, ScrollTrigger } = useGSAP()
let ctx: gsap.Context | null = null

onMounted(() => {
  if (!root.value) return

  ctx = gsap.context(() => {
    const panels = gsap.utils.toArray<HTMLElement>('.fss-panel', root.value)

    // 每个面板:根据 data-enter 属性决定进入方向
    // up:从下方冲入(默认)  left:从左侧滑入  right:从右侧滑入  down:从上方坠入
    panels.forEach((panel) => {
      const inner = panel.querySelector('.fss-inner')
      const target = (inner as HTMLElement) ?? panel
      const direction = panel.dataset.enter ?? 'up'

      const from: gsap.TweenVars = { autoAlpha: 0, ease: 'none' }
      const to: gsap.TweenVars = { autoAlpha: 1, x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0, filter: 'blur(0px)', ease: 'none', transformPerspective: 800 }

      switch (direction) {
        case 'left':
          from.x = -window.innerWidth * 0.6
          from.scale = 0.9
          from.filter = 'blur(6px)'
          break
        case 'right':
          from.x = window.innerWidth * 0.6
          from.scale = 0.9
          from.filter = 'blur(6px)'
          break
        case 'down':
          from.y = -200
          from.scale = 0.85
          from.rotateX = -20
          from.filter = 'blur(8px)'
          break
        case 'up':
        default:
          from.y = 200
          from.scale = 0.7
          from.rotateX = 25
          from.rotateY = -12
          from.filter = 'blur(8px)'
          break
      }

      gsap.fromTo(target, from, {
        ...to,
        scrollTrigger: {
          trigger: panel,
          start: 'top 95%',
          end: 'top 10%',
          scrub: 1,
        },
      })
    })

    // 每个面板的背景层:大幅位移视差 + 缩放,增强纵深冲击
    panels.forEach((panel) => {
      const bg = panel.querySelector('.fss-bg')
      if (!bg) return
      gsap.fromTo(
        bg,
        { yPercent: -25, scale: 1.2 },
        {
          yPercent: 25,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    })

    // 导航点高亮:定位当前屏
    panels.forEach((panel, i) => {
      ScrollTrigger.create({
        trigger: panel,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) activeIndex.value = i
        },
      })
    })

    // 整屏吸附:滚动结束后吸附到最近的屏,带弹性回弹增强冲击感
    ScrollTrigger.create({
      trigger: root.value,
      start: 'top top',
      end: 'bottom bottom',
      snap: {
        snapTo: (value) => {
          const count = panels.length
          if (count <= 1) return value
          const step = 1 / (count - 1)
          return Math.round(value / step) * step
        },
        duration: { min: 0.4, max: 0.9 },
        ease: 'power3.inOut',
        delay: 0.1,
      },
    })
  }, root.value)

  // 等待图片/字体加载后刷新触发位置
  requestAnimationFrame(() => ScrollTrigger.refresh())
})

onUnmounted(() => {
  ctx?.revert()
})

function goTo(i: number) {
  const panels = gsap.utils.toArray<HTMLElement>('.fss-panel', root.value ?? undefined)
  const target = panels[i]
  if (!target) return
  gsap.to(window, {
    scrollTo: { y: target, autoKill: false },
    duration: 0.8,
    ease: 'power2.inOut',
  })
}
</script>

<style scoped>
/* 每个面板占满视口,更深透视增强 3D 冲击 */
:deep(.fss-panel) {
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  perspective: 800px;
}
</style>
