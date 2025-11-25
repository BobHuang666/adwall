export type Ad = {
  id: string
  title: string
  author: string
  description: string
  url: string
  price: number
  clicked: number
  createdAt: string
  updatedAt: string
  mediaAssets?: string[]
  videoUrls?: string[]
}

export type AdDraft = {
  title: string
  author: string
  description: string
  url: string
  price: number
  mediaAssets?: string[]
  videoUrls?: string[]
}

export type AdFormMode = 'create' | 'edit' | 'duplicate'

export type BidScore = {
  id: string
  value: number
}

export type FormFieldComponent =
  | 'input'
  | 'textarea'
  | 'number'
  | 'url'

export type FormFieldValidator = {
  required?: boolean
  maxLength?: number
  min?: number
  max?: number
  url?: boolean
}

export type FormFieldConfig = {
  field: keyof AdDraft
  label: string
  placeholder?: string
  component: FormFieldComponent
  validator?: FormFieldValidator
}

export type AdFormSchemaResponse = FormFieldConfig[]

export type RepositoryResult<T> = {
  data: T
  updatedAt: string
}

