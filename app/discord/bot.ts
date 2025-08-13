import GuildConfig from '#models/guild_config'
import env from '#start/env'
import { fsImportAll } from '@adonisjs/core/helpers'
import logger from '@adonisjs/core/services/logger'
import type {
  ButtonInteraction,
  CommandInteraction,
  Guild,
  StringSelectMenuInteraction,
} from 'discord.js'
import { Client, Events, GatewayIntentBits } from 'discord.js'
import { existsSync } from 'node:fs'
import type { DiscordButton, DiscordSelect } from './interactions.js'
import { getCommandBuilder, type DiscordCommand } from './interactions.js'

export class Bot {
  #client
  #token: string

  constructor(token: string) {
    this.#token = token
    this.#client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    })
    this.#client.on('ready', (client) => this.#ready(client))
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
    await this.loadCommands()
    await this.loadButtons()
    await this.loadSelects()
    this.registerInteractions()
    await this.#client.login(this.#token)
  }

  async stop() {
    logger.info('Stopping Discord Bot...')
    await this.#client.destroy()
  }

  async #ready(client: Client<true>) {
    logger.info(`Discord Bot is ready! Logged in as ${client.user.tag}`)
    await client.guilds.fetch()

    const localGuildId = env.get('DiSCORD_LOCAL_GUILD')
    if (localGuildId && this.commands) {
      const localGuild = client.guilds.resolve(localGuildId)
      if (localGuild) {
        await localGuild.commands.set(
          Object.values(this.commands).map((command) => getCommandBuilder(command))
        )
        logger.info(`Registered commands for local guild: ${localGuild.name} (${localGuild.id})`)
      }
    }
  }

  async getGuild(id: string): Promise<GuildConfig | null> {
    if (this.#client.guilds.resolve(id) === null) return null
    const guild = await GuildConfig.firstOrCreate({ id })
    return guild
  }

  async registerInteractions() {
    this.#client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isCommand()) this.handleCommand(interaction)
      else if (interaction.isButton()) this.handleButton(interaction)
      else if (interaction.isStringSelectMenu()) this.handleSelect(interaction)
    })
  }

  private commands: Record<string, DiscordCommand> | null = null

  async loadCommands() {
    if (this.commands) return
    this.commands = {}
    const commandsPath = new URL('./commands', import.meta.url)
    if (!existsSync(commandsPath)) return
    const collection: { [file: string]: any } = await fsImportAll(commandsPath)
    for (const file in collection) {
      const command = collection[file]
      if (command) {
        this.commands[command.name] = command
        logger.info(`Loaded command: ${command.name}`)
      } else {
        logger.warn(`Skipping invalid command file: ${file}`)
      }
    }
  }

  async handleCommand(interaction: CommandInteraction) {
    if (!this.commands) {
      logger.warn('No commands loaded, cannot handle interaction')
      return
    }
    const commandName = interaction.commandName
    const command = this.commands[commandName]
    if (!command) {
      logger.debug(`No command found for interaction: ${interaction.commandName}`)
      return
    }
    try {
      await command.execute(interaction)
    } catch (error) {
      logger.error({ error }, `Error executing command ${commandName}: ${error.message}`)
    }
  }

  private buttons: Record<string, DiscordButton> | null = null

  async loadButtons() {
    if (this.buttons) return
    this.buttons = {}
    const buttonsPath = new URL('./buttons', import.meta.url)
    if (!existsSync(buttonsPath)) return
    const collection: { [file: string]: any } = await fsImportAll(buttonsPath)
    for (const file in collection) {
      const button = collection[file]
      if (button) {
        this.buttons[button.name] = button
        logger.info(`Loaded button: ${button.name}`)
      } else {
        logger.warn(`Skipping invalid button file: ${file}`)
      }
    }
  }

  async handleButton(interaction: ButtonInteraction) {
    if (!this.buttons) {
      logger.warn('No buttons loaded, cannot handle interaction')
      return
    }
    const buttonName = interaction.customId.split(':')[0]
    const args = interaction.customId.split(':').slice(1)
    const button = this.buttons[buttonName]
    if (!button) {
      logger.debug(`No button found for custom ID: ${interaction.customId}`)
      return
    }
    try {
      await button.execute(interaction, args)
    } catch (error) {
      logger.error({ error }, `Error executing button ${buttonName}: ${error.message}`)
    }
  }

  private selects: Record<string, DiscordSelect> | null = null

  async loadSelects() {
    if (this.selects) return
    this.selects = {}
    const selectsPath = new URL('./selects', import.meta.url)
    if (!existsSync(selectsPath)) return
    const collection: { [file: string]: any } = await fsImportAll(selectsPath)
    for (const file in collection) {
      const select = collection[file]
      if (select) {
        this.selects[select.name] = select
        logger.info(`Loaded select: ${select.name}`)
      } else {
        logger.warn(`Skipping invalid select file: ${file}`)
      }
    }
  }

  async handleSelect(interaction: StringSelectMenuInteraction) {
    if (!this.selects) {
      logger.warn('No selects loaded, cannot handle interaction')
      return
    }
    const selectName = interaction.customId.split(':')[0]
    const args = interaction.customId.split(':').slice(1)
    const select = this.selects[selectName]
    if (!select) {
      logger.debug(`No select found for custom ID: ${interaction.customId}`)
      return
    }
    try {
      await select.execute(interaction, args)
    } catch (error) {
      logger.error({ error }, `Error executing select ${selectName}: ${error.message}`)
    }
  }
}
