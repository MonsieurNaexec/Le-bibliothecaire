import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'guild_configs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('storage_alert_threshold').notNullable().defaultTo(-1)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('storage_alert_threshold')
    })
  }
}
