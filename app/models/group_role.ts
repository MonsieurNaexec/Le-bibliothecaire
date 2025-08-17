import GuildConfig from '#models/guild_config'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'

export default class GroupRole extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare guildId: string

  @belongsTo(() => GuildConfig)
  declare guildConfig: BelongsTo<typeof GuildConfig>

  @column()
  declare roleId: string
}
