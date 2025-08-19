import vine from '@vinejs/vine'

export const createBookValidator = vine.compile(
  vine.object({
    categoryId: vine.number(),
    title: vine.string().minLength(1),
    description: vine.string().optional(),
    storageAmount: vine.number().optional(),
    url: vine.string().optional(),
  })
)

export const editBookValidator = vine.compile(
  vine.object({
    bookId: vine.number(),
    title: vine.string().minLength(1).optional(),
    description: vine.string().optional(),
    storageAmount: vine.number().optional(),
    url: vine.string().optional(),
  })
)
