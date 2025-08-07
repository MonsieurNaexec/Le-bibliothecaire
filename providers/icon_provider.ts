import type { ApplicationService } from '@adonisjs/core/types'
import { icons as heroIcons } from '@iconify-json/heroicons'
import { addCollection, edgeIconify } from 'edge-iconify'
import edge from 'edge.js'

export default class IconProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {
    addCollection(heroIcons)
    edge.use(edgeIconify)
  }

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
