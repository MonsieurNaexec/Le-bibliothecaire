document.addEventListener('DOMContentLoaded', () => {
  const patchSelects = document.querySelectorAll('select[data-patch]')
  patchSelects.forEach((select) => {
    let currentValue = (select as HTMLSelectElement).value
    select.addEventListener('change', async (event) => {
      const target = event.target as HTMLSelectElement
      const url = target.dataset.patch ?? location.href
      fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': (await cookieStore.get('XSRF-TOKEN'))?.value ?? '',
        },
        body: JSON.stringify({ [target.name]: target.value }),
      })
        .then((response) => {
          if (response.ok) currentValue = target.value
          else target.value = currentValue
        })
        .catch(() => {
          target.value = currentValue
        })
    })
  })
})
