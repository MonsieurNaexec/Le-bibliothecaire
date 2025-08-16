import BookCategory from '#models/book_category'
import { createBookSelectRow } from '#providers/discord_provider'
import { MessageFlags, type StringSelectMenuInteraction } from 'discord.js'
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
      .first()
    if (!category) {
      await interaction.reply({
        content: '## :warning: Catégorie non trouvée.',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    const row = await createBookSelectRow(interaction.guildId, 'query_book', false, category.id)

    if (!row) {
      await interaction.reply({
        content: '## :person_shrugging: Aucun livret disponible dans cette catégorie.',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    await interaction.reply({
      content: `## Demander un livret dans la catégorie \`${category.name}\`:`,
      components: [row],
      flags: MessageFlags.Ephemeral,
    })
  },
}

export default queryCategory
