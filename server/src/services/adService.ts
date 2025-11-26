import { v4 as uuid } from 'uuid'
import type { Ad, AdDraft } from '../types.js'
import { seedAds } from './adSeed.js'

// 竞价排序算法（与前端保持一致）
const MYSTERY_COEFFICIENT = 0.42

const calculateBidScore = (ad: Ad): number => {
  return ad.price + ad.price * ad.clicked * MYSTERY_COEFFICIENT
}

const sortAdsByBid = (ads: Ad[]): Ad[] => {
  return [...ads].sort((a, b) => {
    const scoreA = calculateBidScore(a)
    const scoreB = calculateBidScore(b)
    return scoreB - scoreA
  })
}

// 内存存储
let adsStore: Ad[] = [...seedAds]

const normalizeDraft = (draft: AdDraft): AdDraft => ({
  ...draft,
  mediaAssets: draft.mediaAssets ?? [],
  videoUrls: draft.videoUrls ?? [],
})

export const adService = {
  // 获取所有广告（已排序）
  list: (): Ad[] => {
    return sortAdsByBid(adsStore)
  },

  // 根据 ID 查找广告
  findById: (id: string): Ad | undefined => {
    return adsStore.find((ad) => ad.id === id)
  },

  // 创建广告
  create: (payload: AdDraft): Ad => {
    const now = new Date().toISOString()
    const ad: Ad = {
      ...normalizeDraft(payload),
      id: uuid(),
      clicked: 0,
      createdAt: now,
      updatedAt: now,
    }
    adsStore.push(ad)
    return ad
  },

  // 更新广告
  update: (id: string, payload: AdDraft): Ad => {
    const index = adsStore.findIndex((ad) => ad.id === id)
    if (index === -1) {
      throw new Error('广告不存在')
    }

    const now = new Date().toISOString()
    const updated: Ad = {
      ...adsStore[index],
      ...normalizeDraft(payload),
      updatedAt: now,
    }
    adsStore[index] = updated
    return updated
  },

  // 删除广告
  delete: (id: string): void => {
    const index = adsStore.findIndex((ad) => ad.id === id)
    if (index === -1) {
      throw new Error('广告不存在')
    }
    adsStore.splice(index, 1)
  },

  // 点击广告（点击数+1）
  click: (id: string): Ad => {
    const index = adsStore.findIndex((ad) => ad.id === id)
    if (index === -1) {
      throw new Error('广告不存在')
    }

    const now = new Date().toISOString()
    const updated: Ad = {
      ...adsStore[index],
      clicked: adsStore[index].clicked + 1,
      updatedAt: now,
    }
    adsStore[index] = updated
    return updated
  },

  // 复制广告
  duplicate: (id: string): Ad => {
    const origin = adsStore.find((ad) => ad.id === id)
    if (!origin) {
      throw new Error('广告不存在')
    }

    return adService.create({
      title: origin.title,
      author: origin.author,
      description: origin.description,
      url: origin.url,
      price: origin.price,
      mediaAssets: origin.mediaAssets,
      videoUrls: origin.videoUrls,
    })
  },

  // 重置为种子数据（用于开发/测试）
  seed: (): void => {
    adsStore = [...seedAds]
  },
}

