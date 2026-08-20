import { computed, onMounted } from 'vue'
import type { LifeStats, UserProfile } from '~/types/life'
import { computeLifeStats } from '~/utils/life'
import { useLifeStore } from './useLifeStore'

/**
 * 应用全局状态:持有用户资料与实时统计。
 * 使用 Nuxt 的 useState 实现 SSR/客户端共享,确保刷新后数据一致。
 */
export function useAppState() {
  const store = useLifeStore()

  // 共享状态:useState 保证跨组件、跨请求一致
  const profile = useState<UserProfile | null>('life-profile', () => null)
  const now = useState<number>('life-now', () => Date.now())

  /** 初始化:从 LocalStorage 加载资料(仅客户端) */
  function init(): void {
    if (import.meta.server) return
    // profile 已存在则无需重复加载
    if (profile.value) return
    const loaded = store.loadProfile()
    if (loaded) {
      profile.value = store.recordVisit(loaded)
    }
  }

  // 客户端挂载后再从 LocalStorage 恢复。
  // 若在 setup 阶段同步 init,则服务端渲染(profile 为 null)与客户端水合首帧
  // (profile 已恢复)状态不一致,会导致 Vue hydration mismatch。
  // 延迟到 onMounted:水合首帧与 SSR 一致(均无 profile),挂载后再恢复触发更新。
  if (!import.meta.server) {
    onMounted(() => {
      init()
    })
  }

  /** 设置资料(保存并触发重新计算) */
  function setProfile(p: UserProfile): void {
    profile.value = p
    store.saveProfile(p)
  }

  /** 清除资料 */
  function reset(): void {
    profile.value = null
    store.clearProfile()
  }

  /** 实时统计(随 now 变化自动重算) */
  const stats = computed<LifeStats | null>(() => {
    if (!profile.value) return null
    return computeLifeStats(profile.value, new Date(now.value))
  })

  /** 实时倒计时(直接读 now,驱动秒级更新) */
  const countdownNow = computed(() => new Date(now.value))

  return {
    profile,
    now,
    stats,
    countdownNow,
    init,
    setProfile,
    reset,
  }
}
