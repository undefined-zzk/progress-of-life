<template>
  <div class="flip-group" :class="`flip-group--${size}`">
    <span
      v-for="(digit, i) in digits"
      :key="i"
      class="flip-card"
      :class="{ 'is-flipping': isFlipping(i) }"
    >
      <!-- 上半:当前数字(前面) -->
      <span class="flip-card__half flip-card__half--top-front">{{ digit }}</span>
      <!-- 下半:当前数字(前面) -->
      <span class="flip-card__half flip-card__half--bottom-front">{{ prevDigits[i] ?? digit }}</span>
      <!-- 上半:新数字(背面,翻下来) -->
      <span class="flip-card__half flip-card__half--top-back">{{ digit }}</span>
      <!-- 下半:新数字(背面,接续翻) -->
      <span class="flip-card__half flip-card__half--bottom-back">{{ prevDigits[i] ?? digit }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
// 翻页时钟:翻日历式翻牌数字(参考经典 FlipClock 四面板结构)
const props = withDefaults(
  defineProps<{
    value: number | string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const digits = ref<string[]>([])
const prevDigits = ref<string[]>([])
const flippingSet = ref<Set<number>>(new Set())

function toDigits(v: number | string): string[] {
  return String(v).split('')
}

function isFlipping(i: number): boolean {
  return flippingSet.value.has(i)
}

watch(
  () => props.value,
  (newVal) => {
    const next = toDigits(newVal)
    const cur = digits.value

    // 首次或位数变化:直接显示,不翻页
    if (cur.length === 0 || next.length !== cur.length) {
      digits.value = next
      prevDigits.value = [...next]
      return
    }

    if (next.join('') === cur.join('')) return

    // 标记变化的位,触发翻页动画
    const changed = new Set<number>()
    next.forEach((d, i) => {
      if (d !== cur[i]) changed.add(i)
    })
    flippingSet.value = changed

    // 记录旧值
    prevDigits.value = [...cur]

    // 翻页动画结束后,更新为最终值并清除翻转状态
    setTimeout(() => {
      digits.value = next
      prevDigits.value = [...next]
      flippingSet.value = new Set()
    }, 600)
  },
  { immediate: true },
)
</script>

<style scoped>
.flip-group {
  display: inline-flex;
  gap: 0.2em;
  perspective: 600px;
}

.flip-card {
  position: relative;
  display: inline-block;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: #fff;
  background: var(--color-primary);
  border-radius: 0.2em;
  line-height: 1;
  height: 1.1em;
  overflow: hidden;
}

/* 尺寸档位 */
.flip-group--sm .flip-card { font-size: 1.25rem; min-width: 0.8em; }
.flip-group--md .flip-card { font-size: 2rem; min-width: 0.9em; }
.flip-group--lg .flip-card { font-size: 3rem; min-width: 1em; }

/* 四个半页面板 */
.flip-card__half {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  text-align: center;
  backface-visibility: hidden;
}

/* 上半前面:当前数字上半 */
.flip-card__half--top-front {
  top: 0;
  line-height: 1.1em;
  z-index: 1;
}

/* 下半前面:当前数字下半 */
.flip-card__half--bottom-front {
  bottom: 0;
  line-height: 0;
  padding-top: 0.55em;
  z-index: 1;
}

/* 上半背面:新数字上半(初始背对,翻页时翻下来) */
.flip-card__half--top-back {
  top: 0;
  line-height: 1.1em;
  transform: rotateX(180deg);
  transform-origin: bottom center;
  z-index: 2;
}

/* 下半背面:新数字下半(初始背对) */
.flip-card__half--bottom-back {
  bottom: 0;
  line-height: 0;
  padding-top: 0.55em;
  transform: rotateX(180deg);
  transform-origin: top center;
  z-index: 3;
}

/* 翻页动画 */
.flip-card.is-flipping .flip-card__half--top-back {
  animation: flip-top 0.6s ease-in forwards;
}
.flip-card.is-flipping .flip-card__half--bottom-back {
  animation: flip-bottom 0.6s ease-out 0.3s forwards;
}

@keyframes flip-top {
  from { transform: rotateX(180deg); }
  to { transform: rotateX(0deg); }
}

@keyframes flip-bottom {
  from { transform: rotateX(180deg); }
  to { transform: rotateX(0deg); }
}
</style>
