import vine from '@vinejs/vine'

export const updateSettingsValidator = vine.compile(
  vine.object({
    adminRoleId: vine.string().optional(),
    backendRoleId: vine.string().optional(),
    storageAlertThreshold: vine.number().optional(),
    queryNotificationChannelId: vine.string().optional(),
    queryNotificationMentionRoleId: vine.string().optional(),
  })
)

export const createFormValidator = vine.compile(
  vine.object({
    channelId: vine.string(),
    categoryId: vine.unionOfTypes([
      vine.array(vine.number()).minLength(1).maxLength(25),
      vine.number(),
    ]),
  })
)
