import Book from '#models/book'
import BookCategory from '#models/book_category'
import { bot } from '#providers/discord_provider'
import { createBookValidator } from '#validators/books'
import type { HttpContext } from '@adonisjs/core/http'

export default class StorageController {
  async handle({ request, view, response, bouncer }: HttpContext) {
    const guildId = request.param('guildId')
    const guild = await bot.getGuild(guildId)
    if (!guild) return response.notFound('Guild not found or not joined')

    if (await bouncer.denies('accessGuildBackend', guildId)) {
      return response.forbidden('You do not have permission to access this guild storage')
    }

    const categories = await BookCategory.query()
      .where('guildId', guildId)
      .orderBy('name', 'asc')
      .preload('books')

    return view.render('pages/storage', { categories, guild: guild.serialize() })
  }

  async addCategory({ request, response, bouncer }: HttpContext) {
    const guildId = request.param('guildId')
    const name = request.input('categoryName')

    if (await bouncer.denies('accessGuildBackend', guildId)) {
      return response.forbidden('You do not have permission to  this guild')
    }

    if (!name) {
      return response.badRequest('Category name is required')
    }

    await BookCategory.create({ name, guildId })
    return response.redirect().back()
  }

  async editCategory({ request, response, bouncer }: HttpContext) {
    const guildId = request.param('guildId')
    const categoryId = request.input('categoryId')
    const name = request.input('categoryName')

    if (await bouncer.denies('accessGuildBackend', guildId)) {
      return response.forbidden('You do not have permission to access this guild storage')
    }

    const category = await BookCategory.find(categoryId)
    if (!category || category.guildId !== guildId) {
      return response.notFound('Category not found or does not belong to this guild')
    }

    if (!name) {
      return response.badRequest('Category name is required')
    }

    category.name = name
    await category.save()
    return response.redirect().back()
  }

  async deleteCategory({ request, response, bouncer }: HttpContext) {
    const guildId = request.param('guildId')
    const categoryId = request.input('categoryId')

    if (await bouncer.denies('accessGuildBackend', guildId)) {
      return response.forbidden('You do not have permission to access this guild storage')
    }

    if (!categoryId) {
      return response.badRequest('Category ID is required')
    }

    const category = await BookCategory.find(categoryId)
    if (!category || category.guildId !== guildId) {
      return response.notFound('Category not found or does not belong to this guild')
    }

    await category.delete()
    return response.redirect().back()
  }

  async addBook({ request, response, bouncer }: HttpContext) {
    const guildId = request.param('guildId')
    const { categoryId, title, description } = await createBookValidator.validate(request.all())

    if (await bouncer.denies('accessGuildBackend', guildId)) {
      return response.forbidden('You do not have permission to access this guild storage')
    }

    const category = await BookCategory.find(categoryId)
    if (!category || category.guildId !== guildId) {
      return response.notFound('Category not found or does not belong to this guild')
    }

    await category.related('books').create({ title, description })
    return response.redirect().back()
  }

  async editBook({ request, response, bouncer }: HttpContext) {
    const guildId = request.param('guildId')
    const bookId = request.input('bookId')
    const { title, description } = await createBookValidator.validate(request.all)

    if (await bouncer.denies('accessGuildBackend', guildId)) {
      return response.forbidden('You do not have permission to access this guild storage')
    }

    const book = await Book.query()
      .where('id', bookId)
      .whereHas('category', (query) => query.where('guildId', guildId))
      .first()
    if (!book) {
      return response.notFound('Book not found or does not belong to this guild')
    }

    book.title = title
    book.description = description
    await book.save()
    return response.redirect().back()
  }

  async deleteBook({ request, response, bouncer }: HttpContext) {
    const guildId = request.param('guildId')
    const bookId = request.input('bookId')

    if (await bouncer.denies('accessGuildBackend', guildId)) {
      return response.forbidden('You do not have permission to access this guild storage')
    }

    const book = await Book.query()
      .where('id', bookId)
      .whereHas('category', (query) => query.where('guildId', guildId))
      .first()
    if (!book) {
      return response.notFound('Book not found or does not belong to this guild')
    }

    await book.delete()
    return response.redirect().back()
  }
}
