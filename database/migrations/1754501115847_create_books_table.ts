import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'books'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.string('title').notNullable()
      table.string('description').notNullable().defaultTo('')
      table.timestamp('published_at').nullable()
      table
        .integer('category_id')
        .unsigned()
        .references('id')
        .inTable('book_categories')
        .onDelete('RESTRICT')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
