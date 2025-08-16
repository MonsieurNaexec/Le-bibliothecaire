import Query from '#models/query'
import logger from '@adonisjs/core/services/logger'
import { MessageFlags, type ButtonInteraction } from 'discord.js'
import type { DiscordButton } from '../interactions.js'

const cancelQuery: DiscordButton = {
  name: 'cancel_query',
  async execute(interaction: ButtonInteraction, args) {
    logger.debug(`Cancelling query ${args[0]} for user ${interaction.user.id}`)
    const queryId = args[0]
    const query = await Query.query()
      .join('books', 'books.id', 'queries.book_id')
      .where('queries.id', queryId)
      .andWhere('queries.user_id', interaction.user.id)
      .select('queries.*', 'books.title as book_title')
      .first()

    if (!query) {
      await interaction.reply({
        content:
          "## :person_shrugging: Nous n'avons pas pu annuler cette demande.\nElle a peut-être déjà été annulée ou prise en charge...",
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    await query.delete()

    await interaction.reply({
      content: `## :white_check_mark: La demande pour le livret **${query.$extras.book_title}** a été annulée!`,
      flags: MessageFlags.Ephemeral,
    })
  },
}

export default cancelQuery
