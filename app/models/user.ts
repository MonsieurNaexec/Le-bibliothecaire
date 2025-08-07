import { API_ENDPOINTS } from '#providers/discord_provider'
import type { DiscordToken } from '@adonisjs/ally/types'
import encryption from '@adonisjs/core/services/encryption'
import logger from '@adonisjs/core/services/logger'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { PermissionFlagsBits } from 'discord.js'
import type { DateTime } from 'luxon'

type UserGuild = {
  id: string
  name: string
  iconUrl: string | null
  permissions: string
  isAdmin: boolean
}

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare nickname: string

  @column()
  declare avatarUrl: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column({
    prepare: (value: DiscordToken) => encryption.encrypt(JSON.stringify(value)),
    consume: (value: string) => {
      const decrypted = encryption.decrypt(value)
      if (typeof decrypted !== 'string') return null
      const parsed = JSON.parse(decrypted)
      parsed.expiresAt = new Date(parsed.expiresAt)
      return parsed as DiscordToken
    },
  })
  declare token: DiscordToken

  async #fetch(endpoint: string) {
    logger.debug(`Fetching ${endpoint} for user ${this.id}`)
    const result = await fetch(endpoint, {
      headers: {
        'Authorization': `${this.token.type} ${this.token.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })
    if (!result.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${result.status} ${result.statusText}`)
    }
    return result.json()
  }

  @column({
    columnName: 'guilds',
    prepare: (value: UserGuild[] | null) => {
      return value ? JSON.stringify(value) : null
    },
    consume: (value: string | null) => {
      return value ? JSON.parse(value) : null
    },
  })
  declare private _guilds: UserGuild[]
  async getGuilds(forceFetch = false) {
    if (this._guilds && !forceFetch) return this._guilds
    const guilds = (await this.#fetch(API_ENDPOINTS.CURRENT_USER_GUILDS)) as any[]
    this._guilds = guilds.map((guild: any) => ({
      id: guild.id,
      name: guild.name,
      iconUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
      permissions: guild.permissions,
      isAdmin: (BigInt(guild.permissions) & PermissionFlagsBits.Administrator) > 0n,
    }))
    await this.save()
    return this._guilds
  }
}
