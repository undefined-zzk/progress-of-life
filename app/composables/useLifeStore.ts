import type { UserProfile } from '~/types/life'

const STORAGE_KEY = 'life-progress-profile'

/**
 * 用户数据的本地存储管理。
 * 第一版采用 LocalStorage 匿名方案,数据不上传服务器,符合隐私原则。
 */
export function useLifeStore() {
  /** 读取用户资料,不存在则返回 null */
  function loadProfile(): UserProfile | null {
    if (import.meta.server) return null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as UserProfile) : null
    } catch {
      return null
    }
  }

  /** 保存用户资料 */
  function saveProfile(profile: UserProfile): void {
    if (import.meta.server) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }

  /** 清除用户资料 */
  function clearProfile(): void {
    if (import.meta.server) return
    localStorage.removeItem(STORAGE_KEY)
  }

  /** 记录今日访问(用于连续访问统计) */
  function recordVisit(profile: UserProfile): UserProfile {
    if (import.meta.server) return profile
    const today = new Date().toISOString().slice(0, 10)
    const seenDays = profile.seenDays ?? []
    if (!seenDays.includes(today)) {
      seenDays.push(today)
    }
    const updated: UserProfile = { ...profile, seenDays, lastSeenAt: new Date().toISOString() }
    saveProfile(updated)
    return updated
  }

  /** 计算连续访问天数(从最近一次往前连续) */
  function streakDays(profile: UserProfile): number {
    const seen = new Set(profile.seenDays ?? [])
    let streak = 0
    const d = new Date()
    // 若今天没记录,从昨天开始数
    if (!seen.has(d.toISOString().slice(0, 10))) {
      d.setDate(d.getDate() - 1)
    }
    while (seen.has(d.toISOString().slice(0, 10))) {
      streak++
      d.setDate(d.getDate() - 1)
    }
    return streak
  }

  /** 创建默认资料(出生日期必填,其余为文档默认值) */
  function createDefaultProfile(birthDate: string): UserProfile {
    return {
      birthDate,
      city: '',
      sleepHours: 8,
      workHours: 8,
      phoneHours: 3,
      birthTime: null,
      lifeStatus: null,
      exerciseHours: 3,
      lifeExpectancy: 80,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      seenDays: [new Date().toISOString().slice(0, 10)],
    }
  }

  return {
    loadProfile,
    saveProfile,
    clearProfile,
    recordVisit,
    streakDays,
    createDefaultProfile,
  }
}
