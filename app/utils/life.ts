import type { LifeStats, SimulationInput, SimulationResult, TimelineItem, UserProfile } from '~/types/life'

const DAY_MS = 24 * 60 * 60 * 1000
const YEAR_DAYS = 365

/** 两个日期的整天差(忽略时分秒,按自然日计算) */
function dayDiff(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.floor((b.getTime() - a.getTime()) / DAY_MS)
}

/** 精确年龄(年,带小数) */
function preciseAge(birth: Date, now: Date): number {
  return (now.getTime() - birth.getTime()) / (DAY_MS * YEAR_DAYS)
}

/** 根据出生日期 + 假设寿命计算剩余天数(按自然日) */
function daysLeftCalc(birth: Date, now: Date, lifeExpectancy: number): number {
  const end = new Date(birth.getFullYear() + lifeExpectancy, birth.getMonth(), birth.getDate())
  return dayDiff(now, end)
}

/**
 * 核心计算引擎:根据用户信息和当前时间,生成完整的人生统计。
 * 所有计算均在客户端完成,符合隐私原则。
 */
export function computeLifeStats(profile: UserProfile, now: Date = new Date()): LifeStats {
  const birth = new Date(profile.birthDate)
  const lifeExpectancy = profile.lifeExpectancy

  // ---- 核心 ----
  const daysLived = dayDiff(birth, now)
  const age = preciseAge(birth, now)
  const hoursLived = Math.floor((now.getTime() - birth.getTime()) / (60 * 60 * 1000))
  const minutesLived = Math.floor((now.getTime() - birth.getTime()) / (60 * 1000))

  const totalDays = lifeExpectancy * YEAR_DAYS
  const progress = totalDays > 0 ? Math.min(1, Math.max(0, daysLived / totalDays)) : 0

  // ---- 剩余时间 ----
  const daysLeft = Math.max(0, daysLeftCalc(birth, now, lifeExpectancy))
  const hoursLeft = daysLeft * 24
  const yearsLeft = daysLeft / YEAR_DAYS
  const monthsLeft = yearsLeft * 12

  // ---- 实时倒计时(到假设寿命终点) ----
  const end = new Date(birth.getFullYear() + lifeExpectancy, birth.getMonth(), birth.getDate())
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
  const birth = new Date(profile.birthDate)
  const daysLeft = Math.max(0, daysLeftCalc(birth, now, profile.lifeExpectancy))
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
 * 根据出生日期生成人生时间线(过去 + 现在 + 未来的年龄阶段示意)。
 * 未来节点仅为基于年龄阶段的示意,不代表真实预测。
 */
export function buildTimeline(profile: UserProfile, now: Date = new Date()): TimelineItem[] {
  const birthYear = new Date(profile.birthDate).getFullYear()
  const currentYear = now.getFullYear()
  const currentAge = Math.floor(preciseAge(new Date(profile.birthDate), now))

  const items: TimelineItem[] = []
  // 过去的关键节点(基于年龄阶段的典型事件,非真实预测)
  const pastMilestones: Array<[number, string]> = [
    [0, '出生'],
    [6, '开始上学'],
    [18, '成年'],
    [22, '大学毕业'],
  ]
  for (const [ageAt, label] of pastMilestones) {
    const y = birthYear + ageAt
    if (ageAt <= currentAge) {
      items.push({ year: y, label, type: ageAt === 0 ? 'milestone' : 'past' })
    }
  }

  // 现在
  items.push({ year: currentYear, label: '现在', type: 'now' })

  // 未来(每 10 年一个节点)
  const nextDecade = Math.ceil((currentAge + 1) / 10) * 10
  for (let ageAt = nextDecade; ageAt <= profile.lifeExpectancy; ageAt += 10) {
    const isEnd = ageAt === profile.lifeExpectancy
    items.push({
      year: birthYear + ageAt,
      label: isEnd ? `${profile.lifeExpectancy} 岁` : '未来',
      type: isEnd ? 'milestone' : 'future',
    })
  }

  return items.sort((a, b) => a.year - b.year)
}

/** 数字千分位格式化 */
export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/** 保留一位小数 */
export function formatPercent(n: number): string {
  return n.toFixed(1)
}
