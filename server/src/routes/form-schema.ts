import { Router } from 'express'
import type { FormFieldConfig } from '../types.js'

const router = Router()

// GET /api/form-schema - 获取表单配置（为任务3预留）
router.get('/', (req, res) => {
  try {
    const schema: FormFieldConfig[] = [
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
    res.json(schema)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

export default router

