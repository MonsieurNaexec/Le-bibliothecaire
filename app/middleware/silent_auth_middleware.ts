import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Silent auth middleware can be used as a global middleware to silent check
 * if the user is logged-in or not.
 *
 * The request continues as usual, even when the user is not logged-in.
 */
export default class SilentAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.auth.check()

    if (ctx.auth.user && !ctx.auth.user.lastGuild) {
      await ctx.auth.user.load('lastGuild')
    }
    ctx.view.share({
      user: {
        name: ctx.auth.user?.nickname,
        avatar: ctx.auth.user?.avatarUrl,
        lastGuild: ctx.auth.user?.lastGuild,
      },
    })

    return next()
  }
}
