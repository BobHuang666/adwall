import type { Ad } from '../types.js'

export const seedAds: Ad[] = [
  {
    id: 'seed-1',
    title: '巨量引擎 · 全域增长季',
    author: '字节广告君',
    description:
      '围绕全链路营销打造一站式解决方案，助力品牌在 2025 高效增长。',
    url: 'https://www.oceanengine.com/',
    price: 6.8,
    clicked: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mediaAssets: [],
    videoUrls: [],
  },
  {
    id: 'seed-2',
    title: '抖音生活服务 · 城市合伙人招募',
    author: '抖音生活服务',
    description:
      '覆盖吃喝玩乐的整合营销方案，开放城市合伙人计划，共建本地生活增长引擎。',
    url: 'https://life.douyin.com/',
    price: 5.2,
    clicked: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mediaAssets: [],
    videoUrls: [],
  },
  {
    id: 'seed-3',
    title: '穿山甲联盟 · 品效协同',
    author: '穿山甲',
    description:
      '以场景原生广告 + Pangle API 助力出海开发者在关键市场实现品效协同。',
    url: 'https://www.pangle.cn/',
    price: 4.5,
    clicked: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mediaAssets: [],
    videoUrls: [],
  },
]

