import { useEffect, useMemo, useState } from 'react'
import * as Toast from '@radix-ui/react-toast'
import type { Ad, AdDraft, AdFormMode } from '@shared/types/ad'
import { useAdsStore } from '../store/useAdsStore'
import { AdCard } from './AdCard'
import { AdFormDrawer } from './AdFormDrawer'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

type ToastState = {
  open: boolean
  title: string
  description?: string
  variant?: 'default' | 'error'
}

export const AdBoardPage = () => {
  const {
    ads,
    schema,
    isLoading,
    isProcessing,
    loadAds,
    createAd,
    updateAd,
    duplicateAd,
    deleteAd,
    clickAd,
  } = useAdsStore()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mode, setMode] = useState<AdFormMode>('create')
  const [activeAd, setActiveAd] = useState<Ad | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toast, setToast] = useState<ToastState>({
    open: false,
    title: '',
  })

  useEffect(() => {
    loadAds()
  }, [loadAds])

  const defaultValues = useMemo<AdDraft | undefined>(() => {
    if (!activeAd) return undefined
    return {
      title: activeAd.title,
      author: activeAd.author,
      description: activeAd.description,
      url: activeAd.url,
      price: activeAd.price,
      mediaAssets: activeAd.mediaAssets,
      videoUrls: activeAd.videoUrls,
    }
  }, [activeAd])

  const openDrawer = (nextMode: AdFormMode, ad?: Ad) => {
    setMode(nextMode)
    setActiveAd(ad ?? null)
    setDrawerOpen(true)
  }

  const handleSubmit = async (payload: AdDraft) => {
    try {
      if (mode === 'create') {
        await createAd(payload)
        setToast({ open: true, title: '创建成功', description: '广告已进入竞价列表' })
      } else if (mode === 'edit' && activeAd) {
        await updateAd(activeAd.id, payload)
        setToast({ open: true, title: '已更新', description: '广告信息已保存' })
      } else if (mode === 'duplicate' && activeAd) {
        await duplicateAd(activeAd.id)
        setToast({ open: true, title: '复制成功', description: '可继续微调信息' })
      }
      setDrawerOpen(false)
    } catch (error) {
      setToast({
        open: true,
        title: '操作失败',
        description: (error as Error).message,
        variant: 'error',
      })
    }
  }

  const handleDelete = async () => {
    if (!activeAd) return
    try {
      await deleteAd(activeAd.id)
      setToast({ open: true, title: '已删除', description: '广告已被移除' })
    } catch (error) {
      setToast({
        open: true,
        title: '删除失败',
        description: (error as Error).message,
        variant: 'error',
      })
    } finally {
      setDeleteOpen(false)
    }
  }

  const handleClickAd = async (ad: Ad) => {
    try {
      if (typeof window !== 'undefined') {
        window.open(ad.url, '_blank')
      }
      await clickAd(ad.id)
    } catch (error) {
      setToast({
        open: true,
        title: '跳转失败',
        description: (error as Error).message,
        variant: 'error',
      })
    }
  }

  return (
    <Toast.Provider swipeDirection="right">
      <section className="board">
        <div className="board__header">
          <button
            className="primary-button"
            onClick={() => openDrawer('create')}
          >
            + 新增广告
          </button>
        </div>

        {isLoading ? (
          <div className="board__placeholder">加载广告数据中...</div>
        ) : ads.length === 0 ? (
          <div className="board__placeholder">
            还没有广告，点击「新增广告」开始创建吧。
          </div>
        ) : (
          <div className="board__grid">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onEdit={(target) => openDrawer('edit', target)}
                onDuplicate={(target) => openDrawer('duplicate', target)}
                onDelete={(target) => {
                  setActiveAd(target)
                  setDeleteOpen(true)
                }}
                onClickAd={handleClickAd}
              />
            ))}
          </div>
        )}
      </section>

      <AdFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={mode}
        schema={schema}
        defaultValues={defaultValues}
        isProcessing={isProcessing}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isProcessing={isProcessing}
      />

      <Toast.Root
        className={`toast ${toast.variant === 'error' ? 'toast--error' : ''}`}
        open={toast.open}
        onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
      >
        <Toast.Title className="toast__title">{toast.title}</Toast.Title>
        {toast.description ? (
          <Toast.Description className="toast__description">
            {toast.description}
          </Toast.Description>
        ) : null}
      </Toast.Root>
      <Toast.Viewport className="toast__viewport" />
    </Toast.Provider>
  )
}

