import { create } from 'zustand'
import type { Ad, AdDraft, FormFieldConfig } from '@shared/types/ad'
import { adRepository } from '@shared/repository/adRepository'
import { sortAdsByBid } from '@shared/utils/bid'

type AdsState = {
  ads: Ad[]
  schema: FormFieldConfig[]
  isLoading: boolean
  isProcessing: boolean
  error?: string
  loadAds: () => Promise<void>
  createAd: (payload: AdDraft) => Promise<Ad>
  updateAd: (id: string, payload: AdDraft) => Promise<Ad>
  duplicateAd: (id: string) => Promise<Ad>
  deleteAd: (id: string) => Promise<void>
  clickAd: (id: string) => Promise<Ad>
  seedAds: () => Promise<void>
}

export const useAdsStore = create<AdsState>((set, get) => ({
  ads: [],
  schema: [],
  isLoading: false,
  isProcessing: false,

  loadAds: async () => {
    set({ isLoading: true, error: undefined })
    try {
      const [ads, schema] = await Promise.all([
        adRepository.list(),
        adRepository.getFormSchema(),
      ])
      set({ ads, schema })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ isLoading: false })
    }
  },

  createAd: async (payload) => {
    set({ isProcessing: true, error: undefined })
    try {
      const ad = await adRepository.create(payload)
      set({ ads: sortAdsByBid([...get().ads, ad]) })
      return ad
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ isProcessing: false })
    }
  },

  updateAd: async (id, payload) => {
    set({ isProcessing: true, error: undefined })
    try {
      const updated = await adRepository.update(id, payload)
      set({
        ads: sortAdsByBid(
          get().ads.map((ad) => (ad.id === id ? updated : ad)),
        ),
      })
      return updated
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ isProcessing: false })
    }
  },

  duplicateAd: async (id) => {
    set({ isProcessing: true, error: undefined })
    try {
      const duplicated = await adRepository.duplicate(id)
      set({ ads: sortAdsByBid([...get().ads, duplicated]) })
      return duplicated
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ isProcessing: false })
    }
  },

  deleteAd: async (id) => {
    set({ isProcessing: true, error: undefined })
    try {
      await adRepository.delete(id)
      set({ ads: get().ads.filter((ad) => ad.id !== id) })
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ isProcessing: false })
    }
  },

  clickAd: async (id) => {
    try {
      const clicked = await adRepository.click(id)
      set({
        ads: sortAdsByBid(
          get().ads.map((ad) => (ad.id === id ? clicked : ad)),
        ),
      })
      return clicked
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  seedAds: async () => {
    await adRepository.seed()
    await get().loadAds()
  },
}))

