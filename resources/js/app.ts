import { patch } from './requests.js'

let openedCollapsibles = new Set(
  JSON.parse(localStorage.getItem('openedCollapsibles') ?? '[]') as string[]
)

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Handle patch requests for select elements.
   */
  const patchSelects = document.querySelectorAll('select[data-patch],input[data-patch]')
  patchSelects.forEach((select) => {
    let currentValue = (select as HTMLSelectElement).value
    select.addEventListener('change', async (event) => {
      const target = event.target as HTMLSelectElement
      const url = target.dataset.patch ?? location.href
      const result = await patch(url, {
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
      event.stopPropagation()
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

  /**
   * Handle increment/decrement buttons
   */
  const incrementButtons = document.querySelectorAll('[data-increment]') as NodeListOf<HTMLElement>
  incrementButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!button.dataset.increment) return
      const [targetId, amount] = button.dataset.increment.split(',')
      const target = document.getElementById(targetId) as HTMLElement | null
      if (!target) return
      const currentValue = parseInt(target.innerText) || 0
      const amountValue = parseInt(amount)
      const newValue =
        amount.startsWith('+') || amount.startsWith('-')
          ? currentValue + amountValue
          : amountValue || 0
      target.innerText = `${newValue < 0 ? '' : '+'}${newValue}`
    })
  })

  /**
   * Handle tag selection
   */
  const taggedHTMLElements = document.querySelectorAll('[data-tags]') as NodeListOf<HTMLElement>
  const tags = new Set<string>()
  const taggedElements: { element: HTMLElement; tags: Set<string> }[] = []
  taggedHTMLElements.forEach((element) => {
    const tagsData = element.dataset.tags
    if (!tagsData) return
    const elementTags = new Set(JSON.parse(tagsData) as string[])
    taggedElements.push({ element, tags: elementTags })
    elementTags.forEach((tag) => tags.add(tag))
  })
  const tagSelects = document.querySelectorAll(
    'select[data-tags-select]'
  ) as NodeListOf<HTMLSelectElement>
  tagSelects.forEach((select) => {
    tags.forEach((tag) => {
      const option = document.createElement('option')
      option.value = tag
      option.innerText = tag
      if (select) select.appendChild(option)
    })
    select.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement
      const selectedValue = target.value
      taggedElements.forEach(({ element, tags }) => {
        if (selectedValue === 'null' || tags.has(selectedValue)) {
          element.classList.remove('hidden')
        } else {
          element.classList.add('hidden')
        }
      })
    })
  })
  const tagsInputs = document.querySelectorAll('[data-tags-input]') as NodeListOf<HTMLDivElement>
  tagsInputs.forEach((inputContainer) => {
    const input = inputContainer.querySelector('input[type="hidden"]') as HTMLInputElement
    const textInput = inputContainer.querySelector(
      'input[data-tags-text-input]'
    ) as HTMLInputElement
    const addButton = inputContainer.querySelector(
      'button[data-tags-add-button]'
    ) as HTMLButtonElement
    const tagList = inputContainer.querySelector('[data-tag-list]') as HTMLDivElement
    const thisTags = new Set<string>(JSON.parse(input.value || '[]') as string[])
    const template = inputContainer.querySelector('template') as HTMLTemplateElement

    const updateTagList = () => {
      tagList.innerHTML = ''
      thisTags.forEach((tag) => {
        const tagElement = template.content.cloneNode(true) as HTMLSpanElement
        ;(tagElement.querySelector('span[data-tag-label]') as HTMLSpanElement).innerText = tag
        tagElement.querySelector('button')?.addEventListener('click', () => {
          thisTags.delete(tag)
          input.value = JSON.stringify(Array.from(thisTags))
          input.dispatchEvent(new Event('change'))
        })
        tagList.appendChild(tagElement)
      })
    }

    input.addEventListener('change', () => {
      console.log('Input changed:', input.value)
      const tagsArray = JSON.parse(input.value || '[]') as string[]
      thisTags.clear()
      tagsArray.forEach((tag) => thisTags.add(tag))
      updateTagList()
    })

    const addTag = () => {
      const tag = textInput.value.trim()
      if (!tag) return
      thisTags.add(tag)
      textInput.value = ''
      input.value = JSON.stringify(Array.from(thisTags))
      input.dispatchEvent(new Event('change'))
    }

    textInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        addTag()
      }
    })
    addButton.addEventListener('click', (event) => {
      event.preventDefault()
      if (textInput.value.trim()) {
        addTag()
      }
    })
  })
})
