import Book from '#models/book'
import BookCategory from '#models/book_category'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import type { MessageActionRowComponentBuilder } from 'discord.js'
import {
  ActionRowBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { Bot } from '../app/discord/bot.js'

export const API_ENDPOINTS = {
  CURRENT_USER: 'https://discord.com/api/users/@me',
  CURRENT_USER_GUILDS: 'https://discord.com/api/users/@me/guilds',
}

export const bot = new Bot(env.get('DISCORD_BOT_TOKEN'))

export default class DiscordProvider {
  constructor() {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {
    if (app.getEnvironment() !== 'web') return
    await bot.start()
  }

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    if (app.getEnvironment() !== 'web') return
    await bot.stop()
  }
}

export const getBotInviteUrl = () => {
  const clientId = env.get('DISCORD_CLIENT_ID')
  const permissions = PermissionFlagsBits.SendMessages
  const redirectUri = encodeURIComponent(
    env.get('DISCORD_REDIRECT_URL', 'http://localhost:3333/discord/callback')
  )
  return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&redirect_uri=${redirectUri}&integration_type=0&scope=bot`
}

export const createStringSelectRow = (
  id: string,
  placeholder: string,
  options: StringSelectMenuOptionBuilder[],
  multiple?: boolean
) => {
  const select = new StringSelectMenuBuilder()
    .setCustomId(id)
    .setPlaceholder(placeholder)
    .setOptions(options)
  if (multiple) {
    select.setMinValues(1).setMaxValues(options.length)
  }
  if (select.options.length === 0) return null
  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(select)
}

export const createCategorySelectRow = async (
  guildId: string,
  selectId: string,
  multiple?: boolean,
  categoriesId?: number[] | string[]
) => {
  const categories = await BookCategory.query()
    .where('guildId', guildId)
    .if(categoriesId, (q) => q.whereIn('id', categoriesId!))
    .orderBy('name', 'asc')
    .limit(25)

  return createStringSelectRow(
    selectId,
    multiple ? 'Sélectionner les catégories' : 'Sélectionner une catégorie',
    categories.map((category) =>
      new StringSelectMenuOptionBuilder().setLabel(category.name).setValue(category.id.toString())
    ),
    multiple
  )
}

export const createBookSelectRow = async (
  guildId: string,
  selectId: string,
  multiple?: boolean,
  categoryId?: number
) => {
  const books = await Book.query()
    .select('books.*')
    .join('book_categories', 'book_categories.id', 'books.category_id')
    .where('book_categories.guild_id', guildId)
    .if(categoryId, (query) => {
      query.andWhere('book_categories.id', categoryId!)
    })
    .orderBy('books.title', 'asc')
    .limit(25)

  return createStringSelectRow(
    selectId,
    multiple ? 'Sélectionner les livrets' : 'Sélectionner un livret',
    books.map((book) => {
      const option = new StringSelectMenuOptionBuilder()
        .setLabel(book.title)
        .setValue(book.id.toString())
      if (book.description && book.description.length > 0) {
        option.setDescription(book.description)
      }
      return option
    }),
    multiple
  )
}
