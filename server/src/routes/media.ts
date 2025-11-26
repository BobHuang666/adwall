import { Router } from 'express'

const router = Router()

// POST /api/media/upload - 上传媒体文件（为任务2预留）
router.post('/upload', (req, res) => {
  try {
    // TODO: 实现文件上传逻辑
    // 当前返回占位响应
    res.status(501).json({
      error: '媒体上传功能尚未实现',
      message: '此接口为进阶任务2预留',
    })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router

