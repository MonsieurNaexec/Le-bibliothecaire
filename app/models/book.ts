import BookCategory from '#models/book_category'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'

export default class Book extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare publishedAt: DateTime | null

  @column()
  declare categoryId: number

  @belongsTo(() => BookCategory, { foreignKey: 'categoryId' })
  declare category: BelongsTo<typeof BookCategory>

  @column()
  declare storageAmount: number
}
