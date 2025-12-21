export class StorageAmountComponent extends HTMLElement {
  private currentAmount: number = 0
  private diff: number = 0
  private readonly: boolean = true

  constructor() {
    super()
    // Use event delegation on the component itself
    this.addEventListener('click', this.handleClick.bind(this))
  }

  connectedCallback() {
    this.injectStyles()
    this.render()
  }

  static get observedAttributes() {
    return ['amount', 'readonly']
  }

  private injectStyles() {
    // Only inject once
    if (document.getElementById('storage-amount-styles')) return

    const style = document.createElement('style')
    style.id = 'storage-amount-styles'
    style.textContent = `
      storage-amount input[type="number"]::-webkit-outer-spin-button,
      storage-amount input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      storage-amount input[type="number"] {
        -moz-appearance: textfield;
        appearance: textfield;
      }
    `
    document.head.appendChild(style)
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === 'amount') {
      this.currentAmount = parseInt(newValue) || 0
      this.diff = 0
      this.render()
    } else if (name === 'readonly') {
      this.readonly = newValue !== 'false'
      this.render()
    }
  }

  private handleClick(event: Event) {
    const target = event.target as HTMLElement
    const button = target.closest('[data-increment], [data-decrement]') as HTMLElement | null

    if (!button) return

    if (button.hasAttribute('data-increment')) {
      this.increment(1)
    } else if (button.hasAttribute('data-decrement')) {
      this.increment(-1)
    }
  }

  private increment(amount: number) {
    const newAmount = Math.max(this.currentAmount + amount, 0)
    this.diff += newAmount - this.currentAmount
    this.currentAmount = newAmount
    this.updateDisplay()
    this.dispatchChangeEvent()
  }

  private updateDisplay() {
    // Update only the necessary parts without re-rendering everything
    const input = this.querySelector('[data-storage-input]') as HTMLInputElement
    const diffSpan = this.querySelector('[data-diff]') as HTMLSpanElement

    if (input) {
      input.value = this.currentAmount.toString()
    }
    if (diffSpan) {
      diffSpan.textContent = `${this.diff >= 0 ? '+' : ''}${this.diff}`
    }
  }

  private render() {
    const isReadonly = this.readonly

    this.innerHTML = `
      <div class="rounded p-2 bg-base-200 mt-4 flex items-center gap-2">
        <div class="grow flex items-center gap-1">
          <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
            <path fill-rule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.163 3.75A.75.75 0 0 1 10 12h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
          </svg>
          Stock actuel :
          <input type="number" ${isReadonly ? 'readonly' : ''} name="storageAmount"
            class="w-10 focus-visible:outline-0 font-semibold bg-transparent"
            value="${this.currentAmount}" data-storage-input />
          (<span data-diff>${this.diff >= 0 ? '+' : ''}${this.diff}</span>)
        </div>
        ${
          !isReadonly
            ? `
          <button class="btn btn-circle btn-soft btn-sm" type="button" title="Diminuer le stock" data-decrement>
            <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
            </svg>
          </button>
          <button class="btn btn-circle btn-soft btn-sm" type="button" title="Augmenter le stock" data-increment>
            <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
            </svg>
          </button>
        `
            : ''
        }
      </div>
    `

    // Attach input listener after render
    const input = this.querySelector('[data-storage-input]') as HTMLInputElement
    if (input && !isReadonly) {
      input.addEventListener('input', () => {
        const newValue = parseInt(input.value) || 0
        this.diff += newValue - this.currentAmount
        this.currentAmount = newValue
        this.dispatchChangeEvent()
        this.updateDisplay()
      })
    }
  }

  private dispatchChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('storage-change', {
        detail: { amount: this.currentAmount, diff: this.diff },
        bubbles: true,
      })
    )
  }

  public getAmount(): number {
    return this.currentAmount
  }

  public getDiff(): number {
    return this.diff
  }

  public reset() {
    this.diff = 0
    this.updateDisplay()
  }
}
