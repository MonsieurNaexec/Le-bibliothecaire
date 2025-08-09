import vine from '@vinejs/vine'

export const createBookValidator = vine.compile(
  vine.object({
    categoryId: vine.number(),
    title: vine.string().minLength(1),
    description: vine.string(),
  })
)
