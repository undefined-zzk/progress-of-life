<template>
  <div class="flip-group" :class="`flip-group--${size}`">
    <div
      v-for="(digit, i) in display"
      :key="i"
      class="flip"
      :class="{ play: changing[i] }"
    >
      <!-- 0~9 全部渲染,只有 before / active 参与翻页 -->
      <div
        v-for="n in 10"
        :key="n"
        class="item"
        :class="{
          before: changing[i] && n - 1 === Number(beforeDigits[i]),
          active: n - 1 === Number(digit),
        }"
      >
        <div class="up">
          <div class="shadow"></div>
          <div class="inn">{{ n - 1 }}</div>
        </div>
        <div class="down">
          <div class="shadow"></div>
          <div class="inn">{{ n - 1 }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 翻页时钟:复刻 newcodercircle/front-demo-training 的纯 CSS 翻页倒计时
// 机制:每个数字卡片渲染 0~9 全部 item;active 始终是新值,正常显示;
//      变化时:beforeDigits 记录旧值,额外给对应旧 item 加 .before 类,
//      同时加 .play 触发 CSS 动画;动画结束后清除 before,恢复正常状态。
const props = withDefaults(
  defineProps<{
    value: number | string
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  { size: 'md' },
)

// display: 当前值(始终跟随 props.value)
const display = ref<string[]>([])
// beforeDigits: 翻页期间记录旧值;非翻页期间为 '-1' 表示没有 before
const beforeDigits = ref<string[]>([])
const changing = ref<boolean[]>([])

const timers = new Map<number, ReturnType<typeof setTimeout>>()

function toDigits(v: number | string): string[] {
  return String(v).split('')
}

watch(
  () => props.value,
  (newVal) => {
    const next = toDigits(newVal)
    const cur = display.value

    if (cur.length === 0 || next.length !== cur.length) {
      display.value = next
      beforeDigits.value = next.map(() => '-1')
      changing.value = next.map(() => false)
      return
    }

    const changed = next.map((d, i) => d !== cur[i])
    if (!changed.some(Boolean)) return

    // 动画前:记录旧值作为 before;active 立即更新为新值
    beforeDigits.value = cur.map((d, i) => (changed[i] ? d : '-1'))
    changing.value = changed
    display.value = next

    // 动画结束后清除该位的 before
    next.forEach((_, i) => {
      if (!changed[i]) return
      if (timers.has(i)) clearTimeout(timers.get(i)!)
      timers.set(
        i,
        setTimeout(() => {
          beforeDigits.value[i] = '-1'
          changing.value[i] = false
          timers.delete(i)
        }, 1000),
      )
    })
  },
  { immediate: true },
)

onUnmounted(() => {
  timers.forEach((t) => clearTimeout(t))
  timers.clear()
})
</script>

<style scoped>
.flip-group {
  display: inline-flex;
  align-items: center;
  --width: 3rem;
  --height: 4.5rem;
  --fontSize: 3.4rem;
  --lineWidth: 2px;
  --radius: 6px;
  --bg: var(--color-primary);
  --text: #fff;
}

.flip-group--sm {
  --width: 2rem;
  --height: 3rem;
  --fontSize: 2.3rem;
}

.flip-group--md {
  --width: 3rem;
  --height: 4.5rem;
  --fontSize: 3.4rem;
}

.flip-group--lg {
  --width: 4rem;
  --height: 6.5rem;
  --fontSize: 4.8rem;
}

.flip-group--xl {
  --width: 5.2rem;
  --height: 8.5rem;
  --fontSize: 6.4rem;
}

.flip {
  position: relative;
  margin: 0 2px;
  width: var(--width);
  height: var(--height);
  font-size: var(--fontSize);
  font-weight: bold;
  line-height: calc(var(--height) - var(--lineWidth));
  border-radius: var(--radius);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
}

.flip .item {
  z-index: 1;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  perspective: 200px;
  transition: opacity 0.3s;
}

.flip .item.active {
  z-index: 2;
}

.flip .item:first-child {
  z-index: 2;
}

.flip .item .up,
.flip .item .down {
  z-index: 1;
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip .item .up {
  transform-origin: 50% 100%;
  top: 0;
}

/* 中缝分割线 */
.flip .item .up:after {
  content: '';
  position: absolute;
  top: calc((var(--height) - var(--lineWidth)) / 2);
  left: 0;
  z-index: 5;
  width: 100%;
  height: var(--lineWidth);
  background-color: rgba(0, 0, 0, 0.4);
}

.flip .item .down {
  transform-origin: 50% 0%;
  bottom: 0;
  transition: opacity 0.3s;
}

.flip .item .inn {
  position: absolute;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 200%;
  color: var(--text);
  text-align: center;
  background-color: var(--bg);
  border-radius: var(--radius);
}

.flip .item .up .inn {
  top: 0;
}

.flip .item .down .inn {
  bottom: 0;
}

/* ===== 翻页动画(纯 CSS) ===== */
.play .item.before {
  z-index: 3;
}

.play .item.active {
  animation: asd 0.5s 0.5s linear both;
  z-index: 2;
}

.play .item.before .up {
  z-index: 2;
  animation: turn-up 0.5s linear both;
}

.play .item.active .down {
  z-index: 2;
  animation: turn-down 0.5s 0.5s linear both;
}

@keyframes turn-down {
  0% {
    transform: rotateX(90deg);
  }
  100% {
    transform: rotateX(0deg);
  }
}

@keyframes turn-up {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-90deg);
  }
}

@keyframes asd {
  0% {
    z-index: 2;
  }
  5% {
    z-index: 4;
  }
  100% {
    z-index: 4;
  }
}

/* 翻页阴影 */
.play .shadow {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.play .before .up .shadow {
  background: linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 1) 100%);
  animation: show 0.5s linear both;
}

.play .active .up .shadow {
  background: linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 1) 100%);
  animation: hide 0.5s 0.3s linear both;
}

.play .before .down .shadow {
  background: linear-gradient(rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.1) 100%);
  animation: show 0.5s linear both;
}

.play .active .down .shadow {
  background: linear-gradient(rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.1) 100%);
  animation: hide 0.5s 0.3s linear both;
}

@keyframes show {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes hide {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
