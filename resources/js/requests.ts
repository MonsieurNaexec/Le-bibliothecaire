export const post = async (url: string, data: any) => {
  try {
    const result = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': (await cookieStore.get('XSRF-TOKEN'))?.value ?? '',
      },
      body: JSON.stringify(data),
    })
    if (!result.ok) {
      console.error('Error during PATCH request:', result.statusText)
      return null
    }
    if (result.status === 204) return {}
    return await result.json()
  } catch (error) {
    console.error('Error during PATCH request:', error)
    return null
  }
}
