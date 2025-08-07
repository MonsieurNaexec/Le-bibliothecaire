import vine from '@vinejs/vine'

export const updateSettingsValidator = vine.compile(
  vine.object({
    id: vine.string(),
    adminRoleId: vine.string().optional(),
    backendRoleId: vine.string().optional(),
  })
)
