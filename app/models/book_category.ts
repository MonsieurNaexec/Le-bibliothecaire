import Book from '#models/book'
import GuildConfig from '#models/guild_config'
import logger from '@adonisjs/core/services/logger'
import { BaseModel, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
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

  @hasMany(() => Book, {
    foreignKey: 'categoryId',
  })
  declare books: HasMany<typeof Book>

  @column({
    prepare: (value: string[]) => {
      return JSON.stringify(value)
    },
    consume: (value: string) => {
      try {
        return JSON.parse(value) as string[]
      } catch (error) {
        logger.error(`Error parsing tags for BookCategory ${value}`)
        return []
      }
    },
  })
  declare tags: string[]

  @column()
  declare queryNotificationMentionRoleId: string | null

  @computed()
  get unpublishedBooks() {
    return this.books?.filter((book) => book.publishedAt === null)
  }
}
