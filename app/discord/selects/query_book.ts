import Book from '#models/book'
import { MessageFlags, type StringSelectMenuInteraction } from 'discord.js'
import type { DiscordSelect } from '../interactions.js'

const queryBook: DiscordSelect = {
  name: 'query_book',
  async execute(interaction: StringSelectMenuInteraction) {
    if (!interaction.guildId) return
    const channel = interaction.channel
    if (!channel?.isSendable()) return
    const bookId = interaction.values[0]
    const book = await Book.query()
      .join('book_categories', 'book_categories.id', 'books.category_id')
      .where('books.id', bookId)
      .andWhere('book_categories.guild_id', interaction.guildId)
      .first()

    if (!book) {
      await interaction.reply({
        content: "## :person_shrugging: Le livret demandé n'a pas été trouvé.",
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    //TODO: Add query
    //TODO: Notify in notification channel

    await interaction.reply({
      content: `## :white_check_mark: La demande pour le livret **${book.title}** a bien été enregistrée!`,
      flags: MessageFlags.Ephemeral,
    })
  },
}

export default queryBook
