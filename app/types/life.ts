// 用户个人信息模型 —— 所有可收集字段的统一定义
export interface UserProfile {
  // 必填
  birthDate: string // ISO 格式 'YYYY-MM-DD'
  // 推荐
  city: string // 城市名
  sleepHours: number // 每日睡眠小时
  workHours: number // 每日工作/学习小时
  phoneHours: number // 每日手机小时
  // 可选
  birthTime?: string | null // 'HH:mm' 或 null(不知道)
  lifeStatus?: string | null // 人生状态
  exerciseHours?: number // 每周运动小时
  // 假设寿命(默认 80)
  lifeExpectancy: number
  // 精确假设寿命(毫秒,可选;自定义时分秒时使用,兼容旧数据回退到 lifeExpectancy)
  lifeExpectancyMs?: number
  // 自定义时间线节点(用户自填的事件)
  customTimeline?: CustomTimelineItem[]
  // 被删除的预估节点年份(出生除外)
  timelineDeleted?: number[]
  // 元数据
  createdAt: string // 首次创建时间 ISO
  lastSeenAt: string // 最近访问时间 ISO
  seenDays: string[] // 记录过的访问日期(用于连续记录)
}

// 计算结果的完整输出
export interface LifeStats {
  // 核心
  age: number // 年龄(带小数)
  daysLived: number // 已经生活的天数
  hoursLived: number
  minutesLived: number
  progress: number // 人生进度 0~1
  progressPercent: number // 0~100
  ended: boolean // 是否已到寿命终点(精确到时刻,now >= 寿命终点)
  // 剩余时间
  yearsLeft: number
  monthsLeft: number
  daysLeft: number
  hoursLeft: number
  // 实时倒计时(相对剩余寿命)
  countdown: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
  // 剩余事件
  weekendsLeft: number
  birthdaysLeft: number
  summersLeft: number
  springFestivalsLeft: number // 春节
  sunsetsLeft: number
  // 时间分配(未来剩余时间折算成年)
  sleepYearsLeft: number
  workYearsLeft: number
  phoneYearsLeft: number
  freeYearsLeft: number
  // 自由时间占比(用于分配条)
  freeHoursPerDay: number
}

// 人生模拟器输入
export interface SimulationInput {
  phoneHours: number
  learnHours: number
  exerciseHours: number
}

// 人生模拟器输出
export interface SimulationResult {
  // 少刷手机
  phoneSaved: {
    perDay: number // 每天省下小时
    perYear: number
    perTenYears: number
    perLifetime: number
    daysGained: number // 相当于多少天
  }
  // 每天学习
  learn: {
    perYear: number
    perLifetime: number
    days: number
  }
  // 每周运动
  exercise: {
    perYear: number
    perLifetime: number
    days: number
  }
}

// 时间线上的节点
export interface TimelineItem {
  year: number
  label: string
  type: 'past' | 'now' | 'future' | 'milestone'
  // 自定义节点标记
  custom?: boolean
}

// 用户自定义的时间线节点(自填未来事件)
export interface CustomTimelineItem {
  year: number
  text: string
}
