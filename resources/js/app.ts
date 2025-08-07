import { post } from './requests.js'

document.addEventListener('DOMContentLoaded', () => {
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
})
