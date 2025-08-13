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
