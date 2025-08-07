import type { HttpContext } from '@adonisjs/core/http'

export default class QueriesController {
  async handle({ request, view }: HttpContext) {
    const guildId = request.param('guildId')
    return view.render('pages/storage')
  }
}
