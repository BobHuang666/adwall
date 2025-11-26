import express from 'express'
import cors from 'cors'
import adsRouter from './routes/ads.js'
import formSchemaRouter from './routes/form-schema.js'
import mediaRouter from './routes/media.js'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/ads', adsRouter)
app.use('/api/form-schema', formSchemaRouter)
app.use('/api/media', mediaRouter)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error('Error:', err)
  res.status(500).json({ error: '服务器内部错误', message: err.message })
})

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
  console.log(`📡 API 基础路径: http://localhost:${PORT}/api`)
})

