import { createCategorySelectRow } from '#providers/discord_provider'
import { MessageFlags, type StringSelectMenuInteraction } from 'discord.js'
import type { DiscordSelect } from '../interactions.js'

const formCreate: DiscordSelect = {
  name: 'form_create',
  async execute(interaction: StringSelectMenuInteraction) {
    if (!interaction.guildId) return
    const channel = interaction.channel
    if (!channel?.isSendable()) return

    const row = await createCategorySelectRow(
      interaction.guildId,
      'query_category',
      false,
      interaction.values
    )

    if (!row) {
      await interaction.reply({
        content: '## :warning: Aucune catégorie créée pour ce serveur.',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    await interaction.reply({
      content:
        '## :white_check_mark: Voilà qui est fait!\nLe formulaire a été créé pour les catégories sélectionnées.',
      flags: MessageFlags.Ephemeral,
    })

    await channel.send({
      content: '## Sélectionner une catégorie pour demander un livret:',
      components: [row],
    })
  },
}

export default formCreate
