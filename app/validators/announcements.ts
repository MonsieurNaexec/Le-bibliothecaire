import vine from '@vinejs/vine'

export const createAnnouncementChannelValidator = vine.compile(
  vine.object({
    categoryId: vine.number(),
    channelId: vine.string().regex(/^\d+$/),
    mentionRoleId: vine.string().optional(),
  })
)

export const updateAnnouncementChannelValidator = vine.compile(
  vine.object({
    channelId: vine.string().regex(/^\d+$/).optional(),
    mentionRoleId: vine.string().optional(),
  })
)
