import { v4 as uuid } from 'uuid'
import type { Ad, AdDraft, FormFieldConfig } from '@shared/types/ad'
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

// API 基础 URL，从环境变量读取，默认为开发环境地址
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// HTTP 请求辅助函数
const apiRequest = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `请求失败: ${response.status} ${response.statusText}`,
    }))
    throw new Error(error.error || `请求失败: ${response.status}`)
  }

  // 204 No Content 响应没有 body
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const httpAdRepository: AdRepository = {
  list: async () => {
    return apiRequest<Ad[]>('/api/ads')
  },

  create: async (payload: AdDraft) => {
    return apiRequest<Ad>('/api/ads', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update: async (id: string, payload: AdDraft) => {
    return apiRequest<Ad>(`/api/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  duplicate: async (id: string) => {
    return apiRequest<Ad>(`/api/ads/${id}/duplicate`, {
      method: 'POST',
    })
  },

  delete: async (id: string) => {
    await apiRequest<void>(`/api/ads/${id}`, {
      method: 'DELETE',
    })
  },

  click: async (id: string) => {
    return apiRequest<Ad>(`/api/ads/${id}/click`, {
      method: 'POST',
    })
  },

  seed: async () => {
    // 后端暂不支持 seed，使用创建接口批量创建种子数据
    // 或者可以添加一个专门的 seed 接口
    throw new Error('HTTP 模式下暂不支持 seed 操作')
  },

  getFormSchema: async () => {
    return apiRequest<FormFieldConfig[]>('/api/form-schema')
  },
}

// 根据环境变量选择使用的 repository
// 如果 VITE_USE_LOCAL_STORAGE=true，使用 localStorage
// 否则使用 HTTP API
const useLocalStorage =
  import.meta.env.VITE_USE_LOCAL_STORAGE === 'true' ||
  !import.meta.env.VITE_API_BASE_URL

export const adRepository: AdRepository = useLocalStorage
  ? localAdRepository
  : httpAdRepository

