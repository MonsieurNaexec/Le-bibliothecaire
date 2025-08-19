import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'book_categories'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('query_notification_mention_role_id').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('query_notification_mention_role_id')
    })
  }
}
