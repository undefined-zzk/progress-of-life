<template>
  <span ref="el" class="display-number">{{ display }}</span>
</template>

<script setup lang="ts">
// 数字滚动动画:进入视口时从 0 滚动到目标值
// 入场动画完成后,若 props.value 变化(如 simulator 拖动滑块),
// 同样用 gsap 从当前值过渡到新值,保持视觉连贯。
const props = defineProps<{
  value: number
  formatter?: (n: number) => string
}>()

const el = ref<HTMLElement | null>(null)
const display = ref('0')

const { gsap, ScrollTrigger } = useGSAP()
let trigger: ScrollTrigger | null = null
// 入场动画是否已完成
let entered = false
// 当前数字的动画状态对象(入场与后续过渡共用)
const animObj = { val: 0 }
// 当前正在运行的过渡 tween,用于在新变化到来时先终止旧动画
let tween: gsap.core.Tween | null = null

const fmt = computed(() => props.formatter ?? ((n: number) => Math.round(n).toLocaleString('en-US')))

function render() {
  display.value = fmt.value(animObj.val)
}

onMounted(() => {
  if (!el.value) return
  animObj.val = 0
  display.value = fmt.value(0)

  tween = gsap.to(animObj, {
    val: props.value,
    duration: 1.4,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el.value,
      start: 'top 90%',
      once: true,
    },
    onUpdate: render,
    onComplete: () => {
      // 入场结束,后续 prop 变化走 watch 做过渡动画
      entered = true
      animObj.val = props.value
      render()
    },
  })
  // 记录本组件创建的触发器,卸载时只清理自己的,避免误伤其他组件的 ScrollTrigger
  const all = ScrollTrigger.getAll()
  trigger = all[all.length - 1] ?? null
})

// 入场动画完成后,props.value 变化时从当前值过渡到新值
// (入场期间不干预,避免与入场动画抢写造成跳动)
// 用 overwrite 终止上一个过渡,保证拖动滑块连续变化时不堆叠动画
watch(
  () => props.value,
  (v) => {
    if (!entered) return
    tween?.kill()
    tween = gsap.to(animObj, {
      val: v,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: render,
      overwrite: true,
    })
  },
)

onUnmounted(() => {
  tween?.kill()
  trigger?.kill()
})
</script>
