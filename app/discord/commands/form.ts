import { createCategorySelectRow } from '#providers/discord_provider'
import {
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  type CommandInteraction,
  type SlashCommandBuilder,
} from 'discord.js'
import type { DiscordCommand } from '../interactions.js'

const form: DiscordCommand = {
  name: 'formulaire',
  description: 'Créer un formulaire de demande de livret',

  buildOptions(builder: SlashCommandBuilder) {
    builder
      .setContexts(InteractionContextType.Guild)
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  },

  async execute(interaction: CommandInteraction) {
    if (!interaction.guildId) return

    const row = await createCategorySelectRow(interaction.guildId, 'form_create', true)

    if (!row) {
      await interaction.reply({
        content: '## :warning: Aucune catégorie créée pour ce serveur.',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    await interaction.reply({
      content: '## :clipboard: Création du formulaire:',
      components: [row],
      flags: MessageFlags.Ephemeral,
    })
  },
}

export default form
