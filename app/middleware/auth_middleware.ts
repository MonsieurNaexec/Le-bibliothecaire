import { errors } from '@adonisjs/auth'
import type { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
    if (
      !ctx.auth.user ||
      !ctx.auth.user.token.expiresAt ||
      DateTime.fromJSDate(ctx.auth.user.token.expiresAt) < DateTime.now()
    )
      throw new errors.E_UNAUTHORIZED_ACCESS('Your session has expired. Please log in again.', {
        redirectTo: this.redirectTo,
        guardDriverName: ctx.auth.defaultGuard,
      })

    ctx.view.share({
      user: {
        name: ctx.auth.user?.nickname,
        avatar: ctx.auth.user?.avatarUrl,
      },
    })
    return next()
  }
}
