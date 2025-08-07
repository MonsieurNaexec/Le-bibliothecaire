import BookCategory from '#models/book_category'
import { bot } from '#providers/discord_provider'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'

export default class GuildConfig extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare adminRoleId: string | null

  @column()
  declare backendRoleId: string | null

  @hasMany(() => BookCategory)
  declare bookCategories: HasMany<typeof BookCategory>

  get discordGuild() {
    return bot.client.guilds.resolve(this.id)
  }
}
