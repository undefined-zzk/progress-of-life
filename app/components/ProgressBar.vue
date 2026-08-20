<template>
  <div ref="el" class="w-full">
    <div class="h-3 rounded-full bg-line overflow-hidden">
      <div
        class="h-full rounded-full bg-linear-to-r from-primary to-accent transition-none"
        :style="{ width: `${animatedPercent}%` }"
      ></div>
    </div>
    <div v-if="label" class="mt-2 flex justify-between text-sm text-sub">
      <span>{{ label }}</span>
      <span class="font-medium text-ink">{{ animatedPercent.toFixed(1) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 人生进度条:进入视口时宽度动画展开
const props = defineProps<{
  percent: number
  label?: string
}>()

const el = ref<HTMLElement | null>(null)
const animatedPercent = ref(0)

const { gsap, ScrollTrigger } = useGSAP()
let trigger: ScrollTrigger | null = null
// 初始进入视口的动画是否已完成;完成后 percent 再变化时用普通动画补齐最终值
let finished = false

onMounted(() => {
  if (!el.value) return
  const obj = { p: 0 }
  gsap.to(obj, {
    p: props.percent,
    duration: 1.4,
    ease: 'power2.out',
    scrollTrigger: { trigger: el.value, start: 'top 90%', once: true },
    onUpdate: () => {
      animatedPercent.value = obj.p
    },
    onComplete: () => {
      finished = true
    },
  })
  // 记录本组件创建的触发器,卸载时只清理自己的,避免误伤其他组件的 ScrollTrigger
  const all = ScrollTrigger.getAll()
  trigger = all[all.length - 1] ?? null
})

// percent 变化(如 hydration 后从 0 变为真实值)时,若初始动画已完成,则补齐到新值。
// 修复:首次加载 percent 为 0,挂载后 profile 恢复导致 percent 变为 100,此前不再动画。
watch(
  () => props.percent,
  (v) => {
    if (!finished) return
    const o = { p: animatedPercent.value }
    gsap.to(o, {
      p: v,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        animatedPercent.value = o.p
      },
    })
  },
)

onUnmounted(() => {
  trigger?.kill()
})
</script>
