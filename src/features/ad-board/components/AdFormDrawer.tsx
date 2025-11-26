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
  isLoadingSchema?: boolean
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

// 根据 schema 动态生成初始值
const buildInitialValues = (
  schema: FormFieldConfig[],
  defaultValues?: Partial<AdDraft>,
): Record<string, unknown> => {
  const initial: Record<string, unknown> = {}
  schema.forEach((field) => {
    if (defaultValues && field.field in defaultValues) {
      initial[field.field] = defaultValues[field.field as keyof AdDraft]
    } else if (field.component === 'number') {
      initial[field.field] = 0
    } else if (field.field === 'mediaAssets' || field.field === 'videoUrls') {
      initial[field.field] = []
    } else {
      initial[field.field] = ''
    }
  })
  // 确保 mediaAssets 和 videoUrls 始终存在（即使不在 schema 中）
  if (!('mediaAssets' in initial)) {
    initial.mediaAssets = defaultValues?.mediaAssets ?? []
  }
  if (!('videoUrls' in initial)) {
    initial.videoUrls = defaultValues?.videoUrls ?? []
  }
  return initial
}

// 根据 schema 动态生成提交数据
const buildSubmitData = (
  values: Record<string, unknown>,
  schema: FormFieldConfig[],
): AdDraft => {
  const draft: Partial<AdDraft> = {}

  // 根据 schema 中的字段映射数据
  schema.forEach((field) => {
    const value = values[field.field]
    const fieldKey = field.field as keyof AdDraft

    if (field.component === 'number') {
      const numValue = typeof value === 'number' ? value : Number(value) || 0
        ; (draft as Record<string, unknown>)[fieldKey] = numValue
    } else if (fieldKey === 'mediaAssets' || fieldKey === 'videoUrls') {
      ; (draft as Record<string, unknown>)[fieldKey] = (value as string[]) ?? []
    } else {
      ; (draft as Record<string, unknown>)[fieldKey] = (value as string) ?? ''
    }
  })

  // 确保 mediaAssets 和 videoUrls 存在
  draft.mediaAssets = (values.mediaAssets as string[]) ?? []
  draft.videoUrls = (values.videoUrls as string[]) ?? []

  return draft as AdDraft
}

export const AdFormDrawer = ({
  open,
  mode,
  schema,
  defaultValues,
  mediaSlot,
  isProcessing,
  isLoadingSchema = false,
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
    if (open && schema.length > 0) {
      if (mode === 'create') {
        // 根据 schema 动态生成初始值
        reset(buildInitialValues(schema))
      } else {
        // 编辑/复制模式：使用传入的 defaultValues，但确保所有 schema 字段都有值
        reset(buildInitialValues(schema, defaultValues))
      }
    }
  }, [open, mode, schema, defaultValues, reset])

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
              // 根据 schema 动态生成提交数据
              const submitData = buildSubmitData(values, schema)
              await onSubmit(submitData)
            })}
          >
            {isLoadingSchema ? (
              <div className="form-field">
                <div className="form-field__label">加载表单配置中...</div>
              </div>
            ) : schema.length === 0 ? (
              <div className="form-field">
                <div className="form-field__error">表单配置加载失败，请刷新页面重试</div>
              </div>
            ) : (
              schema.map((field) => (
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
              ))
            )}

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

