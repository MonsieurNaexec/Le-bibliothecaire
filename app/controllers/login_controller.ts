import User from '#models/user'
import { getBotInviteUrl } from '#providers/discord_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  async login({ ally, logger, response }: HttpContext) {
    logger.debug('Redirecting to Discord for login')
    await ally.use('discord').redirect()
    logger.debug(response.getBody())
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/')
  }

  async discord_callback({ ally, auth, response, logger, session }: HttpContext) {
    const discord = ally.use('discord')

    if (discord.accessDenied()) {
      session.flashErrors({
        E_AUTHENTICATION_FAILURE: "Vous avez annulé la procédure d'authentification",
      })
      return response.redirect('/')
    }
    if (discord.stateMisMatch()) {
      session.flashErrors({
        E_AUTHENTICATION_FAILURE: 'Impossible de vérifier votre identité, veuillez réessayer',
      })
      return response.redirect('/')
    }
    if (discord.hasError()) {
      session.flashErrors({
        E_AUTHENTICATION_FAILURE:
          'Une erreur est survenue lors de la connexion: ' + discord.getError(),
      })
      return response.redirect('/')
    }

    const discordUser = await discord.user()
    logger.debug({ discordUser }, 'Logged in with Discord')

    const user = await User.updateOrCreate(
      { id: discordUser.id },
      {
        nickname: discordUser.original.global_name ?? discordUser.nickName,
        avatarUrl: discordUser.avatarUrl,
        token: discordUser.token,
      }
    )
    try {
      const guilds = await user.getGuilds(true)
      logger.debug(
        { user: { id: user.id, nickname: user.nickname }, guilds },
        'Fetched user guilds'
      )
    } catch (error) {
      logger.error({ error }, 'Failed to fetch user guilds')
      session.flashErrors({
        E_AUTHENTICATION_FAILURE: 'Impossible de récupérer les serveurs Discord',
      })
      return response.redirect('/')
    }
    await auth.use('web').login(user)
    return response.redirect('/')
  }

  async discord_invite({ response }: HttpContext) {
    response.redirect(getBotInviteUrl())
  }
}
