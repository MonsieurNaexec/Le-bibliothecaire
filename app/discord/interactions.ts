import type { ButtonInteraction, CommandInteraction, StringSelectMenuInteraction } from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

export interface DiscordCommand {
  name: string
  description: string

  buildOptions(builder: SlashCommandBuilder): SlashCommandBuilder | void

  execute(interaction: CommandInteraction): Promise<void>
}

export const getCommandBuilder = (command: DiscordCommand): SlashCommandBuilder => {
  const builder = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)

  if (command.buildOptions) {
    command.buildOptions(builder)
  }

  return builder
}

export interface DiscordButton {
  name: string
  execute(interaction: ButtonInteraction, args: string[]): Promise<void>
}

export interface DiscordSelect {
  name: string
  execute(interaction: StringSelectMenuInteraction, args: string[]): Promise<void>
}
