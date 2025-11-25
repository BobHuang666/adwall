import { v4 as uuid } from 'uuid'
import type { Ad, AdDraft, AdFormMode, FormFieldConfig } from '@shared/types/ad'
import { sortAdsByBid } from '@shared/utils/bid'
import { seedAds } from './adSeed'

export type AdRepository = {
  list: () => Promise<Ad[]>
  create: (payload: AdDraft) => Promise<Ad>
  update: (id: string, payload: AdDraft) => Promise<Ad>
  duplicate: (id: string) => Promise<Ad>
  delete: (id: string) => Promise<void>
  click: (id: string) => Promise<Ad>
  seed: () => Promise<void>
  getFormSchema: () => Promise<FormFieldConfig[]>
}

const STORAGE_KEY = 'mini-adwall.ads.v1'

const getStorage = (): Storage | undefined => {
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

const readFromStorage = (): Ad[] => {
  const storage = getStorage()
  if (!storage) return seedAds
  const record = storage.getItem(STORAGE_KEY)
  if (!record) return []
  try {
    return JSON.parse(record) as Ad[]
  } catch {
    return []
  }
}

const writeToStorage = (data: Ad[]) => {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const ensureSeed = () => {
  const existing = readFromStorage()
  if (existing.length === 0) {
    writeToStorage(seedAds)
  }
}

const withLatency = async <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 150))

const defaultFormSchema: FormFieldConfig[] = [
  {
    field: 'title',
    label: '广告标题',
    placeholder: '请输入广告标题',
    component: 'input',
    validator: { required: true, maxLength: 30 },
  },
  {
    field: 'author',
    label: '发布人',
    placeholder: '如：字节广告君',
    component: 'input',
    validator: { required: true, maxLength: 20 },
  },
  {
    field: 'description',
    label: '内容文案',
    placeholder: '一句话描述核心卖点',
    component: 'textarea',
    validator: { required: true, maxLength: 180 },
  },
  {
    field: 'url',
    label: '落地页',
    placeholder: 'https://example.com/',
    component: 'url',
    validator: { required: true, url: true },
  },
  {
    field: 'price',
    label: '出价',
    placeholder: '5.00',
    component: 'number',
    validator: { required: true, min: 1, max: 999 },
  },
]

const normalizeDraft = (draft: AdDraft): AdDraft => ({
  ...draft,
  mediaAssets: draft.mediaAssets ?? [],
  videoUrls: draft.videoUrls ?? [],
})

const createLocalAdRepository = (): AdRepository => {
  const list = async () => {
    ensureSeed()
    return withLatency(sortAdsByBid(readFromStorage()))
  }

  const create = async (payload: AdDraft) => {
    const now = new Date().toISOString()
    const ad: Ad = {
      ...normalizeDraft(payload),
      id: uuid(),
      clicked: 0,
      createdAt: now,
      updatedAt: now,
    }
    const data = [...readFromStorage(), ad]
    writeToStorage(data)
    return withLatency(ad)
  }

  const update = async (id: string, payload: AdDraft) => {
    const now = new Date().toISOString()
    let next: Ad | undefined
    const updated = readFromStorage().map((ad) => {
      if (ad.id !== id) return ad
      next = {
        ...ad,
        ...normalizeDraft(payload),
        updatedAt: now,
      }
      return next
    })
    if (!next) throw new Error('广告不存在')
    writeToStorage(updated)
    return withLatency(next)
  }

  const duplicate = async (id: string) => {
    const origin = readFromStorage().find((ad) => ad.id === id)
    if (!origin) throw new Error('广告不存在')
    return create({
      title: origin.title,
      author: origin.author,
      description: origin.description,
      url: origin.url,
      price: origin.price,
      mediaAssets: origin.mediaAssets,
      videoUrls: origin.videoUrls,
    })
  }

  const remove = async (id: string) => {
    const data = readFromStorage().filter((ad) => ad.id !== id)
    writeToStorage(data)
    return withLatency(undefined)
  }

  const click = async (id: string) => {
    let next: Ad | undefined
    const updated = readFromStorage().map((ad) => {
      if (ad.id !== id) return ad
      next = { ...ad, clicked: ad.clicked + 1, updatedAt: new Date().toISOString() }
      return next
    })
    if (!next) throw new Error('广告不存在')
    writeToStorage(updated)
    return withLatency(next)
  }

  const seed = async () => {
    writeToStorage(seedAds)
    return withLatency(undefined)
  }

  const getFormSchema = async () => withLatency(defaultFormSchema)

  return {
    list,
    create,
    update,
    duplicate,
    delete: remove,
    click,
    seed,
    getFormSchema,
  }
}

export const localAdRepository = createLocalAdRepository()

export const httpAdRepository: AdRepository = {
  list: () => Promise.reject(new Error('HTTP 仓储尚未实现')),
  create: () => Promise.reject(new Error('HTTP 仓储尚未实现')),
  update: () => Promise.reject(new Error('HTTP 仓储尚未实现')),
  duplicate: () => Promise.reject(new Error('HTTP 仓储尚未实现')),
  delete: () => Promise.reject(new Error('HTTP 仓储尚未实现')),
  click: () => Promise.reject(new Error('HTTP 仓储尚未实现')),
  seed: () => Promise.reject(new Error('HTTP 仓储尚未实现')),
  getFormSchema: () => Promise.reject(new Error('HTTP 仓储尚未实现')),
}

