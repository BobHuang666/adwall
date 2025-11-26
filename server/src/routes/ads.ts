import { Router } from 'express'
import { adService } from '../services/adService.js'

const router = Router()

// GET /api/ads - 查询广告列表（已按竞价排序）
router.get('/', (req, res) => {
  try {
    const ads = adService.list()
    res.json(ads)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// POST /api/ads - 创建广告
router.post('/', (req, res) => {
  try {
    const ad = adService.create(req.body)
    res.status(201).json(ad)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

// PUT /api/ads/:id - 更新广告
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const ad = adService.update(id, req.body)
    res.json(ad)
  } catch (error) {
    const message = (error as Error).message
    if (message === '广告不存在') {
      res.status(404).json({ error: message })
    } else {
      res.status(400).json({ error: message })
    }
  }
})

// DELETE /api/ads/:id - 删除广告
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    adService.delete(id)
    res.status(204).send()
  } catch (error) {
    const message = (error as Error).message
    if (message === '广告不存在') {
      res.status(404).json({ error: message })
    } else {
      res.status(500).json({ error: message })
    }
  }
})

// POST /api/ads/:id/click - 点击次数+1
router.post('/:id/click', (req, res) => {
  try {
    const { id } = req.params
    const ad = adService.click(id)
    res.json(ad)
  } catch (error) {
    const message = (error as Error).message
    if (message === '广告不存在') {
      res.status(404).json({ error: message })
    } else {
      res.status(500).json({ error: message })
    }
  }
})

// POST /api/ads/:id/duplicate - 复制广告
router.post('/:id/duplicate', (req, res) => {
  try {
    const { id } = req.params
    const ad = adService.duplicate(id)
    res.status(201).json(ad)
  } catch (error) {
    const message = (error as Error).message
    if (message === '广告不存在') {
      res.status(404).json({ error: message })
    } else {
      res.status(500).json({ error: message })
    }
  }
})

export default router

