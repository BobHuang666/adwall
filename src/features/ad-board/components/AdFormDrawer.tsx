import { useEffect, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AdDraft, AdFormMode, FormFieldConfig } from '@shared/types/ad'

type AdFormDrawerProps = {
  open: boolean
  mode: AdFormMode
  schema: FormFieldConfig[]
  defaultValues?: Partial<AdDraft>
  mediaSlot?: React.ReactNode
  isProcessing: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AdDraft) => Promise<void>
}

const buildZodSchema = (fields: FormFieldConfig[]) => {
  const shape: Record<string, z.ZodTypeAny> = {}
  fields.forEach((field) => {
    const rules = field.validator ?? {}
    const isOptional = !rules.required

    if (field.component === 'number') {
      let baseNumber = z.number({
        message: `${field.label}需要为数字`,
      })

      if (typeof rules.min === 'number') {
        baseNumber = baseNumber.min(
          rules.min,
          `${field.label}不得小于 ${rules.min}`,
        )
      }

      if (typeof rules.max === 'number') {
        baseNumber = baseNumber.max(
          rules.max,
          `${field.label}不得大于 ${rules.max}`,
        )
      }

      const numberValidator = z.preprocess(
        (value) =>
          value === '' || value === undefined || value === null
            ? undefined
            : Number(value),
        isOptional ? baseNumber.optional() : baseNumber,
      )

      shape[field.field] = numberValidator
      return
    }

    let stringValidator: z.ZodString | z.ZodOptional<z.ZodString> = z.string({
      message: `${field.label}为必填项`,
    })

    if (field.component === 'url') {
      stringValidator = stringValidator.url(`${field.label}需要为合法链接`) as z.ZodString
    }

    if (typeof rules.maxLength === 'number') {
      stringValidator = stringValidator.max(
        rules.maxLength,
        `${field.label}最多 ${rules.maxLength} 字`,
      ) as z.ZodString
    }

    if (isOptional) {
      stringValidator = stringValidator.optional()
    } else {
      stringValidator = (stringValidator as z.ZodString).min(1, `${field.label}为必填项`)
    }

    shape[field.field] = stringValidator
  })

  return z.object(shape)
}

export const AdFormDrawer = ({
  open,
  mode,
  schema,
  defaultValues,
  mediaSlot,
  isProcessing,
  onOpenChange,
  onSubmit,
}: AdFormDrawerProps) => {
  const zodSchema = useMemo(() => buildZodSchema(schema), [schema])

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(zodSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      if (mode === 'create') {
        reset({
          title: '',
          author: '',
          description: '',
          url: '',
          price: 0,
          mediaAssets: [],
          videoUrls: [],
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [open, mode, defaultValues, reset])

  const titleMap: Record<AdFormMode, string> = {
    create: '新建广告',
    edit: '编辑广告',
    duplicate: '复制广告',
  }

  const submitLabelMap: Record<AdFormMode, string> = {
    create: '创建广告',
    edit: '更新广告',
    duplicate: '创建广告',
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog__overlay" />
        <Dialog.Content className="dialog dialog--form">
          <div className="dialog__header">
            <Dialog.Title className="dialog__title">
              {titleMap[mode]}
            </Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="关闭对话框">
              ×
            </Dialog.Close>
          </div>

          <form
            className="dialog__form"
            onSubmit={handleSubmit(async (values) => {
              await onSubmit({
                title: values.title as string,
                author: values.author as string,
                description: values.description as string,
                url: values.url as string,
                price: typeof values.price === 'number' ? values.price : Number(values.price) || 0,
                mediaAssets: (values.mediaAssets as string[]) ?? [],
                videoUrls: (values.videoUrls as string[]) ?? [],
              })
            })}
          >
            {schema.map((field) => (
              <div key={field.field} className="form-field">
                <label className="form-field__label">
                  {field.label}
                  {field.validator?.required !== false && (
                    <span className="form-field__required">*</span>
                  )}
                </label>
                <div className="form-field__wrapper">
                  {field.component === 'textarea' ? (
                    <textarea
                      className="form-field__control"
                      placeholder={field.placeholder}
                      rows={3}
                      {...register(field.field)}
                    />
                  ) : (
                    <div className="form-field__input-wrapper">
                      <input
                        className="form-field__control"
                        type={
                          field.component === 'number'
                            ? 'number'
                            : field.component === 'url'
                              ? 'url'
                              : 'text'
                        }
                        placeholder={field.placeholder}
                        step={field.component === 'number' ? '0.01' : undefined}
                        {...register(field.field)}
                      />
                      {field.component === 'number' && (
                        <span className="form-field__unit">元</span>
                      )}
                    </div>
                  )}
                  {errors[field.field]?.message ? (
                    <span className="form-field__error">
                      {errors[field.field]?.message?.toString()}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}

            <div className="dialog__media-slot">
              <div className="media-slot__label">媒体上传（预留）</div>
              <div className="media-slot__body">
                {mediaSlot ?? (
                  <span className="media-slot__placeholder">
                    未来可在此插入图片/视频上传组件
                  </span>
                )}
              </div>
            </div>

            <div className="dialog__actions">
              <button
                className="ghost-button"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                取消
              </button>
              <button
                className="primary-button"
                type="submit"
                disabled={isProcessing}
              >
                {isProcessing ? '提交中...' : submitLabelMap[mode]}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

