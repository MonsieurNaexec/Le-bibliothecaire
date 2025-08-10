import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'
import BookCategory from './book_category.js'
import GuildConfig from './guild_config.js'

export default class AnnouncementChannel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare guildId: string | null

  @belongsTo(() => GuildConfig, { foreignKey: 'guildId' })
  declare guild: BelongsTo<typeof GuildConfig>

  @column()
  declare categoryId: number | null

  @belongsTo(() => BookCategory, { foreignKey: 'categoryId' })
  declare category: BelongsTo<typeof BookCategory>

  @column()
  declare channelId: string

  @column()
  declare mentionRoleId: string | null
}
