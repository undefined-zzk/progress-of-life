// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  // 禁用 Nuxt UI 的 @nuxt/fonts 字体预取模块:
  // 项目已通过 @theme 自定义 --font-sans(Inter/系统字体),
  // 无需连接 Google Fonts,避免开发环境网络超时导致 google/googleicons provider 报错
  ui: { fonts: false },
  css: ['~/assets/css/main.css']
})
