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

const queryCategory: DiscordSelect = {
  name: 'query_category',
  async execute(interaction: StringSelectMenuInteraction) {
    if (!interaction.guildId) return
    const channel = interaction.channel
    if (!channel?.isSendable()) return
    const categoryId = interaction.values[0]
    const category = await BookCategory.query()
      .where('guildId', interaction.guildId)
      .andWhere('id', categoryId)
      .preload('books')
      .first()
    if (!category) {
      await interaction.reply({
        content: '## :warning: Catégorie non trouvée.',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId('query_book')
      .setPlaceholder('Sélectionner un livret')

    category.books.forEach((book) => {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(book.title)
          .setDescription(book.description)
          .setValue(book.id.toString())
      )
    })

    if (category.books.length === 0) {
      await interaction.reply({
        content: '## :person_shrugging: Aucun livret disponible dans cette catégorie.',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(select)

    await interaction.reply({
      content: `## Demander un livret dans la catégorie **${category.name}**:`,
      components: [row],
      flags: MessageFlags.Ephemeral,
    })
  },
}

export default queryCategory
