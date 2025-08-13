import BookCategory from '#models/book_category'
import type { MessageActionRowComponentBuilder } from 'discord.js'
import {
  ActionRowBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type StringSelectMenuInteraction,
} from 'discord.js'
import type { DiscordSelect } from '../interactions.js'

const formCreate: DiscordSelect = {
  name: 'form_create',
  async execute(interaction: StringSelectMenuInteraction) {
    if (!interaction.guildId) return
    const channel = interaction.channel
    if (!channel?.isSendable()) return
    const categories = await BookCategory.query()
      .where('guildId', interaction.guildId)
      .andWhereIn('id', interaction.values)

    const select = new StringSelectMenuBuilder()
      .setCustomId('query_category')
      .setPlaceholder('Sélectionner une catégorie')

    categories.forEach((category) => {
      select.addOptions(
        new StringSelectMenuOptionBuilder().setLabel(category.name).setValue(category.id.toString())
      )
    })

    if (select.options.length === 0) {
      await interaction.reply({
        content: '## :warning: Aucune catégorie créée pour ce serveur.',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(select)

    await interaction.reply({
      content:
        '## :white_check_mark: Voilà qui est fait!\nLe formulaire a été créé pour les catégories sélectionnées.',
      flags: MessageFlags.Ephemeral,
    })

    await channel.send({
      content: '## Sélectionner une catégorie pour demander un livret:',
      components: [row],
    })
  },
}

export default formCreate
