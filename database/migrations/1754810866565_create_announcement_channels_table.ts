import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'announcement_channels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table
        .string('guild_id')
        .nullable()
        .references('id')
        .inTable('guild_configs')
        .onDelete('CASCADE')
      table
        .integer('category_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('book_categories')
        .onDelete('CASCADE')
      table.string('channel_id').notNullable()
      table.string('mention_role_id').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
