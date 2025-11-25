import type { Ad, BidScore } from '@shared/types/ad'

const MYSTERY_COEFFICIENT = 0.42

export const calculateBidScore = (ad: Ad): BidScore => ({
  id: ad.id,
  value: ad.price + ad.price * ad.clicked * MYSTERY_COEFFICIENT,
})

export const sortAdsByBid = (ads: Ad[]): Ad[] => {
  return [...ads].sort((a, b) => {
    const scoreA = calculateBidScore(a).value
    const scoreB = calculateBidScore(b).value
    return scoreB - scoreA
  })
}

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(value)

