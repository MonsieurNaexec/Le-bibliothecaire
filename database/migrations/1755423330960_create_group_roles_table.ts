import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'group_roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table
        .string('guild_id')
        .notNullable()
        .references('id')
        .inTable('guild_configs')
        .onDelete('CASCADE')
      table.string('role_id').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
