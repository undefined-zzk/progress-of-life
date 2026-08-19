<template>
  <span ref="el" class="display-number">{{ display }}</span>
</template>

<script setup lang="ts">
// 数字滚动动画:进入视口时从 0 滚动到目标值
const props = defineProps<{
  value: number
  formatter?: (n: number) => string
}>()

const el = ref<HTMLElement | null>(null)
const display = ref('0')

const { gsap, ScrollTrigger } = useGSAP()

onMounted(() => {
  if (!el.value) return
  const formatter = props.formatter ?? ((n: number) => Math.round(n).toLocaleString('en-US'))
  const obj = { val: 0 }
  display.value = formatter(0)

  gsap.to(obj, {
    val: props.value,
    duration: 1.4,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el.value,
      start: 'top 90%',
      once: true,
    },
    onUpdate: () => {
      display.value = formatter(obj.val)
    },
  })
})

onUnmounted(() => {
  ScrollTrigger.getAll().forEach((t) => t.kill())
})
</script>
