import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

/**
 * GSAP 统一入口。
 * 插件注册已在 plugins/gsap.client.ts 中应用级完成一次,这里仅提供实例访问。
 */
export function useGSAP() {
  return { gsap, ScrollTrigger, ScrollToPlugin }
}
