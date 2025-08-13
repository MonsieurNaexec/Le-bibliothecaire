import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'guild_configs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('query_notification_channel_id').nullable()
      table.string('query_notification_mention_role_id').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('query_notification_channel_id')
      table.dropColumn('query_notification_mention_role_id')
    })
  }
}
