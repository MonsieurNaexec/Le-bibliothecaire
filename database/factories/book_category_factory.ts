import factory from '@adonisjs/lucid/factories'
import BookCategory from '#models/book_category'

export const BookCategoryFactory = factory
  .define(BookCategory, async ({ faker }) => {
    return {}
  })
  .build()