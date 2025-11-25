import * as Dialog from '@radix-ui/react-dialog'

type DeleteConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
  title?: string
  description?: string
  isProcessing?: boolean
}

export const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = '删除广告',
  description = '确认后，该广告将从列表中移除且无法恢复。',
  isProcessing,
}: DeleteConfirmDialogProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="dialog__overlay" />
      <Dialog.Content className="dialog dialog--confirm">
        <Dialog.Title className="dialog__title">{title}</Dialog.Title>
        <Dialog.Description className="dialog__description">
          {description}
        </Dialog.Description>
        <div className="dialog__actions">
          <Dialog.Close asChild>
            <button className="ghost-button" disabled={isProcessing}>
              取消
            </button>
          </Dialog.Close>
          <button
            className="primary-button danger"
            onClick={() => onConfirm()}
            disabled={isProcessing}
          >
            {isProcessing ? '删除中...' : '删除'}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)

