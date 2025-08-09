import { post } from './requests.js'

let openedCollapsibles = new Set(
  JSON.parse(localStorage.getItem('openedCollapsibles') ?? '[]') as string[]
)

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Handle patch requests for select elements.
   */
  const patchSelects = document.querySelectorAll('select[data-patch]')
  patchSelects.forEach((select) => {
    let currentValue = (select as HTMLSelectElement).value
    select.addEventListener('change', async (event) => {
      const target = event.target as HTMLSelectElement
      const url = target.dataset.patch ?? location.href
      const result = await post(url, {
        [target.name]: target.value,
      })
      if (result !== null) currentValue = target.value
      else target.value = currentValue
    })
  })

  /**
   * Auto open collapses
   */
  const collapsibles = document.querySelectorAll('.collapse') as NodeListOf<HTMLElement>
  collapsibles.forEach((collapse) => {
    const toggle = collapse.querySelector(
      'input[type="checkbox"],input[type="radio"]'
    ) as HTMLInputElement | null
    if (toggle && collapse.id) {
      if (openedCollapsibles.has(collapse.id)) {
        toggle.checked = true
        collapse.focus()
      }

      toggle.addEventListener('change', () => {
        if (toggle.checked) {
          openedCollapsibles.add(collapse.id)
        } else {
          openedCollapsibles.delete(collapse.id)
        }
        localStorage.setItem('openedCollapsibles', JSON.stringify(Array.from(openedCollapsibles)))
      })
    }
  })

  /**
   * Handle modal triggers
   */
  const modalTriggers = document.querySelectorAll('[data-modal]')
  modalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault()
      const modalId = (trigger as HTMLElement).dataset.modal
      const modalInputs = Object.entries((trigger as HTMLElement).dataset)
        .filter(([key]) => key.startsWith('modalInput'))
        .map(([key, value]) => [key.replace('modalInput', ''), value])
      console.debug(`Opening modal: ${modalId}`, modalInputs)
      if (modalId) {
        const modal = document.getElementById(modalId) as HTMLDialogElement | null
        if (modal) {
          modalInputs.forEach(([inputId, value]) => {
            if (!inputId || !value) return
            const input = modal.querySelector(`#${modalId}_${inputId}`) as HTMLElement | null
            if (input instanceof HTMLInputElement && typeof value === 'string') input.value = value
            else if (input && typeof value === 'string') input.innerText = value
          })
          modal.showModal()
        } else {
          console.warn(`Modal with ID ${modalId} not found`)
        }
      }
    })
  })

  /**
   * Global class toggling
   */
  const toggleElements = document.querySelectorAll(
    'input[type="checkbox"][data-toggle-class],input[type="radio"][data-toggle-class]'
  ) as NodeListOf<HTMLInputElement>
  toggleElements.forEach((element) => {
    const toggleClass = element.dataset.toggleClass
    if (!toggleClass) return

    element.addEventListener('change', () => {
      const container = document.querySelector(`[data-toggle-container="${toggleClass}"]`)
      container?.classList.toggle(`**:data-[${toggleClass}]:hidden`, !element.checked)
      localStorage.setItem('toggle-' + toggleClass, element.checked.toString())
    })
    const storedValue = localStorage.getItem('toggle-' + toggleClass)
    if (storedValue === 'true' || storedValue === '1') {
      element.checked = true
      document
        .querySelector(`[data-toggle-container="${toggleClass}"]`)
        ?.classList.remove(`**:data-[${toggleClass}]:hidden`)
    }
  })
})
