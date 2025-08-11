import GuildConfig from '#models/guild_config'
import logger from '@adonisjs/core/services/logger'
import type { Guild } from 'discord.js'
import { Client, GatewayIntentBits } from 'discord.js'

export class Bot {
  #client
  #token: string

  constructor(token: string) {
    this.#token = token
    this.#client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    })
    this.#client.on('ready', this.#ready)
    this.#client.on('error', (error) => {
      logger.error({ error }, `Discord Bot encountered an error: ${error.message}`)
    })
    this.#client.on('shardError', (error) => {
      logger.error({ error }, `Discord Bot encountered a shard error: ${error.message}`)
    })
  }

  get client() {
    return this.#client
  }

  get guilds(): Guild[] {
    return this.#client.guilds.cache.toJSON()
  }

  async start() {
    logger.info('Starting Discord Bot...')
    await this.#client.login(this.#token)
  }

  async stop() {
    logger.info('Stopping Discord Bot...')
    await this.#client.destroy()
  }

  async #ready(client: Client<true>) {
    logger.info(`Discord Bot is ready! Logged in as ${client.user.tag}`)
    await client.guilds.fetch()
  }

  async getGuild(id: string): Promise<GuildConfig | null> {
    if (this.#client.guilds.resolve(id) === null) return null
    const guild = await GuildConfig.firstOrCreate({ id })
    return guild
  }
}
