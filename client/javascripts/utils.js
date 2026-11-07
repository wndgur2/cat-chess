function getCookie(key) {
  let cookie = decodeURIComponent(document.cookie)
  let cookieArr = cookie.split('; ')
  let value = ''
  cookieArr.forEach((cookie) => {
    if (cookie.includes(key)) value = cookie.split('=')[1]
  })
  if (!value) return null
  return value
}

function getText(text) {
  return text[getCookie('lang') || 'en']
}

export { getCookie, getText }
