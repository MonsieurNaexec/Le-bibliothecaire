import Book from '#models/book'
import GuildConfig from '#models/guild_config'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'

export default class BookCategory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare name: string

  @column()
  declare guildId: string

  @belongsTo(() => GuildConfig)
  declare guild: BelongsTo<typeof GuildConfig>

  @hasMany(() => Book)
  declare books: HasMany<typeof Book>
}
