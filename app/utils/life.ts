import type { LifeStats, SimulationInput, SimulationResult, TimelineItem, UserProfile } from '~/types/life'

const DAY_MS = 24 * 60 * 60 * 1000
const YEAR_DAYS = 365
const YEAR_MS = DAY_MS * YEAR_DAYS

/** 两个日期的整天差(忽略时分秒,按自然日计算) */
function dayDiff(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.floor((b.getTime() - a.getTime()) / DAY_MS)
}

/** 精确年龄(年,带小数) */
function preciseAge(birth: Date, now: Date): number {
  return (now.getTime() - birth.getTime()) / YEAR_MS
}

/** 解析出生时间 'HH:mm' -> [时, 分],非法/缺失返回 [0, 0] */
function parseBirthTime(bt: string | null | undefined): [number, number] {
  if (!bt) return [0, 0]
  const m = /^(\d{1,2}):(\d{2})$/.exec(bt)
  if (!m) return [0, 0]
  return [parseInt(m[1]!, 10), parseInt(m[2]!, 10)]
}

/** 出生时刻(含出生时间时分,未填则 00:00) */
export function birthMoment(birthDate: string, birthTime?: string | null): Date {
  const [h, m] = parseBirthTime(birthTime)
  const d = new Date(birthDate)
  d.setHours(h, m, 0, 0)
  return d
}

/** 精确寿命毫秒:优先使用 lifeExpectancyMs(支持时分秒自定义),否则按整年回退 */
export function lifespanMs(profile: Pick<UserProfile, 'lifeExpectancy' | 'lifeExpectancyMs'>): number {
  if (typeof profile.lifeExpectancyMs === 'number' && Number.isFinite(profile.lifeExpectancyMs)) {
    return profile.lifeExpectancyMs
  }
  return profile.lifeExpectancy * YEAR_MS
}

/** 根据出生时刻 + 精确寿命毫秒计算剩余天数(按自然日) */
function daysLeftCalc(birth: Date, now: Date, lifeMs: number): number {
  return dayDiff(now, new Date(birth.getTime() + lifeMs))
}

/** 已活时间的精细文本(年/天/时/分/秒),用于"你已经来到这个世界 X"。
 *  capMs:可选上限(如寿命毫秒),已活时间超过上限(生命结束)时停在寿命终点,不再累加。 */
export function livedDurationText(
  profile: Pick<UserProfile, 'birthDate' | 'birthTime'>,
  now: Date = new Date(),
  capMs?: number,
): string {
  const birth = birthMoment(profile.birthDate, profile.birthTime)
  let ms = Math.max(0, now.getTime() - birth.getTime())
  if (capMs != null && Number.isFinite(capMs)) ms = Math.min(ms, capMs)
  if (ms <= 0) return '0 秒'
  const totalSecs = Math.floor(ms / 1000)
  const s = totalSecs % 60
  const mins = Math.floor(totalSecs / 60)
  const m = mins % 60
  const hours = Math.floor(mins / 60)
  const h = hours % 24
  const days = Math.floor(hours / 24)
  const d = days % 365
  const years = Math.floor(days / 365)
  const parts: string[] = []
  if (years) parts.push(`${years} 年`)
  if (d) parts.push(`${d} 天`)
  if (h) parts.push(`${h} 小时`)
  if (m) parts.push(`${m} 分钟`)
  if (s) parts.push(`${s} 秒`)
  return parts.join(' ')
}

/**
 * 短寿命文案:当精确寿命不足 1 年(0 岁/出生即死亡)时,返回合适的说明文案;
 * 正常寿命(>=1 年)返回 null,由调用方沿用"活到 X 岁"的默认措辞。
 */
export function shortLifeText(profile: Pick<UserProfile, 'lifeExpectancy' | 'lifeExpectancyMs'>): string | null {
  const ms = profile.lifeExpectancyMs
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return null
  if (ms >= YEAR_MS) return null
  if (ms <= 0) return '出生即死亡,人生在此刻结束'
  const totalSecs = Math.floor(ms / 1000)
  const d = Math.floor(totalSecs / 86400)
  const h = Math.floor((totalSecs % 86400) / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  const parts: string[] = []
  if (d) parts.push(`${d}天`)
  if (h) parts.push(`${h}小时`)
  if (m) parts.push(`${m}分钟`)
  if (s) parts.push(`${s}秒`)
  return `寿命只有 ${parts.join(' ')}`
}

/**
 * 核心计算引擎:根据用户信息和当前时间,生成完整的人生统计。
 * 所有计算均在客户端完成,符合隐私原则。
 */
export function computeLifeStats(profile: UserProfile, now: Date = new Date()): LifeStats {
  const birth = birthMoment(profile.birthDate, profile.birthTime)
  const lifeExpectancy = profile.lifeExpectancy
  const lifeMs = lifespanMs(profile)

  // ---- 核心 ----
  // 出生日期晚于当前时间(如误选未来日期)时,已活时间不取负数,统一按 0 处理。
  const daysLived = Math.max(0, dayDiff(birth, now))
  const age = Math.max(0, preciseAge(birth, now))
  const hoursLived = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (60 * 60 * 1000)))
  const minutesLived = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (60 * 1000)))

  // 人生进度:用精确寿命毫秒与已活毫秒计算,短寿命(不足1年/0岁)时进度合理,
  // 避免 lifeExpectancy 为 0 时进度恒为 0 的问题。
  const end = new Date(birth.getTime() + lifeMs)
  const livedMs = Math.max(0, now.getTime() - birth.getTime())
  // 已到寿命终点(now >= end)时进度为 100%
  const progress = now.getTime() >= end.getTime() ? 1 : lifeMs > 0 ? Math.min(1, Math.max(0, livedMs / lifeMs)) : 0

  // ---- 剩余时间(精确到出生时刻 + 精确寿命毫秒) ----
  const daysLeft = Math.max(0, dayDiff(now, end))
  const hoursLeft = daysLeft * 24
  const yearsLeft = daysLeft / YEAR_DAYS
  const monthsLeft = yearsLeft * 12

  // ---- 实时倒计时(到假设寿命终点) ----
  const remainMs = Math.max(0, end.getTime() - now.getTime())
  const cdDays = Math.floor(remainMs / DAY_MS)
  const cdHours = Math.floor((remainMs % DAY_MS) / (60 * 60 * 1000))
  const cdMinutes = Math.floor((remainMs % (60 * 60 * 1000)) / (60 * 1000))
  const cdSeconds = Math.floor((remainMs % (60 * 1000)) / 1000)

  // ---- 剩余事件 ----
  const weekendsLeft = Math.round(yearsLeft * 52)
  const birthdaysLeft = Math.floor(yearsLeft)
  const summersLeft = Math.floor(yearsLeft)
  const springFestivalsLeft = Math.floor(yearsLeft)
  const sunsetsLeft = daysLeft // 每天一次日落

  // ---- 时间分配(未来剩余时间折算成年) ----
  const sleepYearsLeft = (daysLeft * profile.sleepHours) / 24 / YEAR_DAYS
  const workYearsLeft = (daysLeft * profile.workHours) / 24 / YEAR_DAYS
  const phoneYearsLeft = (daysLeft * profile.phoneHours) / 24 / YEAR_DAYS
  const freeHoursPerDay = Math.max(0, 24 - profile.sleepHours - profile.workHours - profile.phoneHours)
  const freeYearsLeft = (daysLeft * freeHoursPerDay) / 24 / YEAR_DAYS

  return {
    age,
    daysLived,
    hoursLived,
    minutesLived,
    progress,
    progressPercent: progress * 100,
    ended: now.getTime() >= end.getTime(),
    yearsLeft,
    monthsLeft,
    daysLeft,
    hoursLeft,
    countdown: { days: cdDays, hours: cdHours, minutes: cdMinutes, seconds: cdSeconds },
    weekendsLeft,
    birthdaysLeft,
    summersLeft,
    springFestivalsLeft,
    sunsetsLeft,
    sleepYearsLeft,
    workYearsLeft,
    phoneYearsLeft,
    freeYearsLeft,
    freeHoursPerDay,
  }
}

/**
 * 人生模拟器:输入目标习惯,输出"如果改变习惯会怎样"的估算。
 */
export function computeSimulation(profile: UserProfile, input: SimulationInput, now: Date = new Date()): SimulationResult {
  const birth = birthMoment(profile.birthDate, profile.birthTime)
  const daysLeft = Math.max(0, daysLeftCalc(birth, now, lifespanMs(profile)))
  const yearsLeft = daysLeft / YEAR_DAYS

  // 少刷手机:相对用户当前手机时间
  const phoneSavedPerDay = Math.max(0, profile.phoneHours - input.phoneHours)
  const phoneSavedPerYear = phoneSavedPerDay * YEAR_DAYS
  const phoneSavedPerTenYears = phoneSavedPerYear * 10
  const phoneSavedPerLifetime = phoneSavedPerDay * daysLeft
  const phoneDaysGained = phoneSavedPerLifetime / 24

  // 每天学习
  const learnPerYear = input.learnHours * YEAR_DAYS
  const learnPerLifetime = input.learnHours * daysLeft

  // 每周运动
  const exercisePerYear = input.exerciseHours * 52
  const exercisePerLifetime = input.exerciseHours * 52 * yearsLeft

  return {
    phoneSaved: {
      perDay: phoneSavedPerDay,
      perYear: phoneSavedPerYear,
      perTenYears: phoneSavedPerTenYears,
      perLifetime: phoneSavedPerLifetime,
      daysGained: phoneDaysGained,
    },
    learn: {
      perYear: learnPerYear,
      perLifetime: learnPerLifetime,
      days: learnPerLifetime / 24,
    },
    exercise: {
      perYear: exercisePerYear,
      perLifetime: exercisePerLifetime,
      days: exercisePerLifetime / 24,
    },
  }
}

/**
 * 根据出生日期生成人生时间线(过去 + 现在 + 未来的年龄阶段预估 + 用户自定义)。
 * 出生为固定锚点;过去/未来的自动节点为基于年龄阶段的预估示意,可与用户自定义节点并存。
 */
export function buildTimeline(profile: UserProfile, now: Date = new Date()): TimelineItem[] {
  const birth = birthMoment(profile.birthDate, profile.birthTime)
  const birthYear = birth.getFullYear()
  const currentYear = now.getFullYear()
  const currentAge = Math.floor(preciseAge(birth, now))

  // 出生(固定锚点)
  const items: TimelineItem[] = [{ year: birthYear, label: '出生', type: 'milestone' }]

  // 过去的预估节点(基于年龄阶段的典型事件)
  const pastMilestones: Array<[number, string]> = [
    [6, '开始上学'],
    [18, '成年'],
    [22, '大学毕业'],
  ]
  for (const [ageAt, label] of pastMilestones) {
    const y = birthYear + ageAt
    if (ageAt <= currentAge) {
      items.push({ year: y, label, type: 'past' })
    }
  }

  // 现在
  items.push({ year: currentYear, label: '现在', type: 'now' })

  // 未来的预估节点(每 10 年一个节点)
  const nextDecade = Math.ceil((currentAge + 1) / 10) * 10
  for (let ageAt = nextDecade; ageAt <= profile.lifeExpectancy; ageAt += 10) {
    const isEnd = ageAt === profile.lifeExpectancy
    items.push({
      year: birthYear + ageAt,
      label: isEnd ? `${profile.lifeExpectancy} 岁` : '未来',
      type: isEnd ? 'milestone' : 'future',
    })
  }

  // 合并用户自定义的时间线节点(自填的过去/未来事件)
  // 当前年份的自定义节点按"现在"处理(高亮),其余按"未来"处理。
  const customs = (profile.customTimeline ?? []).map((c) => ({
    year: c.year,
    label: c.text,
    type: (c.year === currentYear ? 'now' : 'future') as const,
    custom: true,
  }))
  // 出生为固定锚点,保留;其余预估节点若被删除或被自定义覆盖,则跳过。
  const customYears = new Set((profile.customTimeline ?? []).map((c) => c.year))
  const deletedSet = new Set(profile.timelineDeleted ?? [])
  const merged = items.filter((it) => {
    if (it.label === '出生') return true
    return !deletedSet.has(it.year) && !customYears.has(it.year)
  })
  merged.push(...customs)

  return merged.sort((a, b) => a.year - b.year)
}

/** 数字千分位格式化 */
export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/** 保留一位小数 */
export function formatPercent(n: number): string {
  return n.toFixed(1)
}
