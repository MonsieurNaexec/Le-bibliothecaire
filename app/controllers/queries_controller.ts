import Query from '#models/query'
import { bot } from '#providers/discord_provider'
import type { HttpContext } from '@adonisjs/core/http'

type QuerySummary = {
  id: number
  userId: string
  userAvatar: string | null
  userName: string
  bookTitle: string
  bookStorageAmount: number
  bookCategory: string
}

type BookSummary = {
  title: string
  category: string
  storageAmount: number
  queries: QuerySummary[]
}

type UserSummary = {
  name: string
  avatar: string | null
  groupRoles: string[]
  queries: QuerySummary[]
}

export default class QueriesController {
  async handle({ request, view, bouncer, response }: HttpContext) {
    const guildId = request.param('guildId')
    const guild = await bot.getGuild(guildId)
    if (!guild) {
      return view.render('errors.not_found', { message: 'Guild not found or not joined' })
    }
    guild.load('groupRoles')
    if (await bouncer.denies('accessGuildBackend', guild.id)) {
      return response.forbidden('You do not have permission to access this guild queries')
    }

    const dbQueries = await Query.query()
      .join('books', 'books.id', 'queries.book_id')
      .join('book_categories', 'book_categories.id', 'books.category_id')
      .select(
        'queries.*',
        'books.title as book_title',
        'books.storage_amount as book_storage_amount',
        'book_categories.name as book_category'
      )
      .orderBy('book_category', 'asc')
      .orderBy('book_title', 'asc')
      .orderBy('created_at', 'asc')
      .where('book_categories.guild_id', guild.id)

    const queries: QuerySummary[] = dbQueries.map((query) => {
      const user = guild.discordGuild?.members.resolve(query.userId)
      return {
        id: query.id,
        userId: query.userId,
        userAvatar: user?.avatarURL() ?? user?.user.avatarURL() ?? null,
        userName: user?.displayName ?? query.userName,
        bookTitle: query.$extras.book_title,
        bookStorageAmount: query.$extras.book_storage_amount,
        bookCategory: query.$extras.book_category,
      }
    })

    const booksSummary = Object.values(
      queries.reduce(
        (acc, query) => {
          if (!acc[query.bookTitle]) {
            acc[query.bookTitle] = {
              title: query.bookTitle,
              category: query.bookCategory,
              storageAmount: query.bookStorageAmount,
              queries: [],
            }
          }
          acc[query.bookTitle].queries.push(query)
          return acc
        },
        {} as Record<string, BookSummary>
      )
    ).sort((a, b) => {
      const categoryComparison = a.category.localeCompare(b.category)
      if (categoryComparison !== 0) return categoryComparison
      return a.title.localeCompare(b.title)
    })

    const userSummary: Record<string, UserSummary> = {}

    for (const query of queries) {
      if (!userSummary[query.userName]) {
        userSummary[query.userName] = {
          name: query.userName,
          avatar: query.userAvatar,
          groupRoles: await guild.getUserGroupRoles(query.userId),
          queries: [],
        }
      }
      userSummary[query.userName].queries.push(query)
    }

    return view.render('pages/queries', { userSummary, booksSummary })
  }

  async deleteQuery({ params, response, request }: HttpContext) {
    const query = await Query.query()
      .join('books', 'books.id', 'queries.book_id')
      .join('book_categories', 'book_categories.id', 'books.category_id')
      .where('queries.id', params.queryId)
      .andWhere('book_categories.guild_id', params.guildId)
      .select('queries.*')
      .first()

    if (!query) return response.redirect().back()

    if (request.input('confirm')) {
      await query.load('book')
      query.book.storageAmount = query.book.storageAmount - 1
      await query.book.save()
    }

    await query.delete()
    return response.redirect().back()
  }
}
