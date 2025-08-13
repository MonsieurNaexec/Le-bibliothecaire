import { bot } from '#providers/discord_provider'
import env from '#start/env'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { REST, Routes } from 'discord.js'
import { getCommandBuilder } from '../app/discord/interactions.js'

export default class DiscordCommands extends BaseCommand {
  static commandName = 'discord:commands'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const botCommands = await bot.loadCommands()
    const rest = new REST().setToken(env.get('DISCORD_BOT_TOKEN'))
    const commands = Object.values(botCommands).map((command) => getCommandBuilder(command))

    try {
      this.logger.info(`Started refreshing ${commands.length} application (/) commands.`)
      const data = await rest.put(Routes.applicationCommands(env.get('DISCORD_CLIENT_ID')), {
        body: commands,
      })

      this.logger.info(
        `Successfully reloaded application (/) commands:\n${JSON.stringify(data, null, 2)}`
      )
    } catch (error) {
      this.logger.error('Error reloading Discord commands:', error)
    }
  }
}
