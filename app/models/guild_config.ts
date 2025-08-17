import BookCategory from '#models/book_category'
import { bot } from '#providers/discord_provider'
import { BaseModel, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'
import AnnouncementChannel from './announcement_channel.js'
import GroupRole from './group_role.js'

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

  @column()
  declare queryNotificationChannelId: string | null

  @column()
  declare queryNotificationMentionRoleId: string | null

  @hasMany(() => BookCategory)
  declare bookCategories: HasMany<typeof BookCategory>

  @hasMany(() => AnnouncementChannel, {
    foreignKey: 'guildId',
  })
  declare announcementChannels: HasMany<typeof AnnouncementChannel>
  get discordGuild() {
    return bot.client.guilds.resolve(this.id)
  }

  @computed()
  get name() {
    return this.discordGuild?.name ?? null
  }

  @computed()
  get iconUrl() {
    return this.discordGuild?.iconURL() ?? null
  }

  @column()
  declare storageAlertThreshold: number

  @hasMany(() => GroupRole, { foreignKey: 'guildId' })
  declare groupRoles: HasMany<typeof GroupRole>

  async getUserGroupRoles(userId: string): Promise<string[]> {
    if (!this.discordGuild) return []
    if (!this.groupRoles) await (this as GuildConfig).load('groupRoles')
    const member = this.discordGuild.members.resolve(userId)
    if (!member) return []
    return (
      member.roles.cache
        .toJSON()
        .filter((r) => this.groupRoles.some((gr) => gr.roleId === r.id))
        .map((role) => role.name) || []
    )
  }
}
