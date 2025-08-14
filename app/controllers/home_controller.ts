import { bot } from '#providers/discord_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index(ctx: HttpContext) {
    if (ctx.auth.isAuthenticated && ctx.auth.user) return this.loggedIn(ctx)
    return ctx.view.render('pages/login')
  }

  async loggedIn({ view, auth, bouncer }: HttpContext) {
    const userGuilds = await auth.user!.getGuilds()
    const guilds = await Promise.all(
      userGuilds.map(async (guild) =>
        (await bouncer.allows('accessGuildBackend', guild.id)) ? await bot.getGuild(guild.id) : null
      )
    )
    return view.render('pages/home', {
      guilds: guilds
        .filter((g) => g !== null && g.discordGuild !== null)
        .map((guild) => ({
          id: guild!.id,
          name: guild!.discordGuild!.name,
          iconUrl: guild!.discordGuild!.iconURL(),
        })),
    })
  }
}
