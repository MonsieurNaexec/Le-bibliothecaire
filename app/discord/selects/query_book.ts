import Book from '#models/book'
import Query from '#models/query'
import { bot } from '#providers/discord_provider'
import logger from '@adonisjs/core/services/logger'
import type { MessageActionRowComponentBuilder } from 'discord.js'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  roleMention,
  type StringSelectMenuInteraction,
} from 'discord.js'
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
      .select(
        'books.*',
        'book_categories.name as category_name',
        'book_categories.query_notification_mention_role_id as category_mention_role_id'
      )
      .first()

    if (!book) {
      logger.warn(`Book not found for guild ${interaction.guildId} with book ID ${bookId}`)
      await interaction.reply({
        content: "## :person_shrugging: Le livret demandé n'a pas été trouvé.",
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    const member = interaction.guild?.members.resolve(interaction.user.id)
    const displayName = member?.displayName ?? interaction.user.username
    const query = await Query.create({
      userId: interaction.user.id,
      userName: displayName,
      bookId: book.id,
    })

    const guildConfig = await bot.getGuild(interaction.guildId)
    if (!guildConfig) {
      logger.warn(
        `Guild config not found for guild ${interaction.guildId} while querying book ${book.title} (${book.id})`
      )
    } else if (guildConfig.queryNotificationChannelId) {
      const notificationChannel = interaction.guild?.channels.resolve(
        guildConfig.queryNotificationChannelId
      )
      if (notificationChannel?.isTextBased()) {
        const guildRole =
          interaction.guild && guildConfig.queryNotificationMentionRoleId
            ? interaction.guild.roles.resolve(guildConfig.queryNotificationMentionRoleId)
            : null
        const guildMention = !guildRole
          ? ''
          : guildRole.name === '@everyone'
            ? '@everyone '
            : `${roleMention(guildRole.id)} `
        const categoryRole =
          interaction.guild && book.$extras.category_mention_role_id
            ? interaction.guild.roles.resolve(book.$extras.category_mention_role_id)
            : null
        const categoryMention = !categoryRole
          ? ''
          : categoryRole.name === '@everyone'
            ? '@everyone '
            : `${roleMention(categoryRole.id)} `
        const mention = [guildMention, categoryMention].filter((m) => m.length > 0).join(' ')

        const roles = await guildConfig.getUserGroupRoles(interaction.user.id)
        let message = `${mention}**${displayName}** *(${roles.join(', ')})* a demandé le livret **${book.title}** *(${book.$extras.category_name})*`
        if (book.storageAmount <= 0) message += '\n:stop_sign: Plus de livret en stock!'
        else if (book.storageAmount <= guildConfig.storageAlertThreshold)
          message += `\n:warning: Plus que ${book.storageAmount} livrets en stock`
        await notificationChannel.send({
          content: message,
        })
      }
    }

    const cancelButton = new ButtonBuilder()
      .setCustomId(`cancel_query:${query.id}`)
      .setLabel('Annuler')
      .setStyle(ButtonStyle.Danger)
    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(cancelButton)

    await interaction.reply({
      content: `## :white_check_mark: La demande pour le livret **${book.title}** a bien été enregistrée!`,
      components: [row],
      flags: MessageFlags.Ephemeral,
    })
    await interaction.user.send({
      content: `## :white_check_mark: La demande pour le livret **${book.title}** a bien été enregistrée!`,
      components: [row],
    })
  },
}

export default queryBook
