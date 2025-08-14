import Query from '#models/query'
import { bot } from '#providers/discord_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class QueriesController {
  async handle({ request, view, bouncer, response }: HttpContext) {
    const guildId = request.param('guildId')
    const guild = await bot.getGuild(guildId)
    if (!guild) {
      return view.render('errors.not_found', { message: 'Guild not found or not joined' })
    }
    if (await bouncer.denies('accessGuildBackend', guild.id)) {
      return response.forbidden('You do not have permission to access this guild queries')
    }

    const dbQueries = await Query.query()
      .join('books', 'books.id', 'queries.book_id')
      .join('book_categories', 'book_categories.id', 'books.category_id')
      .select('queries.*', 'books.title as book_title', 'book_categories.name as book_category')
      .orderBy('book_category', 'asc')
      .orderBy('book_title', 'asc')
      .orderBy('created_at', 'asc')

    const queries = dbQueries.map((query) => {
      const user = guild.discordGuild?.members.resolve(query.userId)
      return {
        id: query.id,
        userAvatar: user?.avatarURL() ?? user?.user.avatarURL() ?? null,
        userName: user?.displayName ?? query.userName,
        bookTitle: query.$extras.book_title,
        bookCategory: query.$extras.book_category,
      }
    })

    await guild.load('announcementChannels')

    return view.render('pages/queries', { queries })
  }

  async deleteQuery({ params, response }: HttpContext) {
    const query = await Query.query()
      .join('books', 'books.id', 'queries.book_id')
      .join('book_categories', 'book_categories.id', 'books.category_id')
      .where('queries.id', params.queryId)
      .andWhere('book_categories.guild_id', params.guildId)
      .select('queries.*')
      .first()

    if (!query) return response.redirect().back()

    await query.load('book')
    query.book.storageAmount = query.book.storageAmount - 1
    await query.book.save()

    await query.delete()
    return response.redirect().back()
  }
}
