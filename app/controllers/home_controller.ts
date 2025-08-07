import { bot } from '#providers/discord_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index({ view, auth }: HttpContext) {
    const botGuilds = bot.guilds
    const userGuilds = await auth.user!.getGuilds()
    const guilds = botGuilds.filter((guild) =>
      userGuilds.some((userGuild) => userGuild.id === guild.id)
    )
    // TODO: Filter guilds based on permissions
    return view.render('pages/home', {
      guilds: guilds.map((guild) => ({
        id: guild.id,
        name: guild.name,
        iconUrl: guild.iconURL(),
      })),
    })
  }
}
