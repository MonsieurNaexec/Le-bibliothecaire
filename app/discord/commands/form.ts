import BookCategory from '#models/book_category'
import type { MessageActionRowComponentBuilder } from 'discord.js'
import {
  ActionRowBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
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
    const categories = await BookCategory.findManyBy({ guildId: interaction.guildId })
    if (!interaction.guildId) return

    const select = new StringSelectMenuBuilder()
      .setCustomId('form_create')
      .setPlaceholder('Choisir les catégories')
      .setMinValues(1)
      .setMaxValues(Math.min(categories.length, 25))

    categories.forEach((category) => {
      select.addOptions(
        new StringSelectMenuOptionBuilder().setLabel(category.name).setValue(category.id.toString())
      )
    })

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(select)

    await interaction.reply({
      content: '## :clipboard: Création du formulaire:',
      components: [row],
      flags: MessageFlags.Ephemeral,
    })
  },
}

export default form
