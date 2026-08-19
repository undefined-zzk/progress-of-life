<template>
  <div ref="el" class="w-full">
    <div class="h-3 rounded-full bg-line overflow-hidden">
      <div
        class="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-none"
        :style="{ width: `${animatedPercent}%` }"
      ></div>
    </div>
    <div v-if="label" class="mt-2 flex justify-between text-sm text-sub">
      <span>{{ label }}</span>
      <span class="font-medium text-ink dark:text-ink-dark">{{ animatedPercent.toFixed(1) }}%</span>
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
  })
})

onUnmounted(() => {
  ScrollTrigger.getAll().forEach((t) => t.kill())
})
</script>
