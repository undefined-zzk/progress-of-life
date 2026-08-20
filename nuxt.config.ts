// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  // 禁用 Nuxt UI 的 @nuxt/fonts 字体预取模块:
  // 项目已通过 @theme 自定义 --font-sans(Inter/系统字体),
  // 无需连接 Google Fonts,避免开发环境网络超时导致 google/googleicons provider 报错
  ui: { fonts: false },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: '人生进度 · 今天是你人生的第几天',
      titleTemplate: '%s · 人生进度',
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'charset', content: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#faf7f2' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'description', content: '一个记录与感受人生进度的工具。输入出生日期,看看你已经走过了多少天、多少小时,以及基于假设寿命还剩下多少时间。你的数据只在浏览器本地计算与保存,不会上传到任何服务器。' },
        { name: 'keywords', content: '人生进度,人生倒计时,今天是你人生的第几天,生命时间,人生计算器,第几天' },
        { name: 'author', content: '人生进度' },
        { name: 'robots', content: 'index, follow' },
        { name: 'format-detection', content: 'telephone=no' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '人生进度' },
        { property: 'og:title', content: '人生进度 · 今天是你人生的第几天' },
        { property: 'og:description', content: '输入出生日期,看看你已经走过多少天、多少小时,以及未来还剩下什么。你的数据只在本地,不会上传。' },
        // og 图用绝对 URL,第三方抓取器才能正确解析分享图
        { property: 'og:image', content: 'https://progress-of-life.vercel.app/og-cover.webp' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'zh_CN' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: '人生进度 · 今天是你人生的第几天' },
        { name: 'twitter:description', content: '看看你已经走过了多少天,以及未来还剩下什么。数据只在本地,不会上传。' },
        { name: 'twitter:image', content: 'https://progress-of-life.vercel.app/og-cover.webp' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // canonical 由各页面按路由动态设置,此处不设全局(避免所有页面指向首页)
      ],
    },
  },
})
