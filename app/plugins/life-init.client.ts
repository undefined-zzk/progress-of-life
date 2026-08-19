// 客户端插件:在应用 hydration 时尽早加载用户资料
// 早于组件 onMounted,确保首页等页面首次渲染就能拿到 profile
export default defineNuxtPlugin(() => {
  const { init } = useAppState()
  init()
})
