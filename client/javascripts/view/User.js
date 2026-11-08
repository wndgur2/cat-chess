import Socket from '../net/Socket.js'
import { getCookie } from '../utils.js'

export default class User {
  static isAuthenticated() {
    let token = getCookie('token')
    if (!token) return false
    return true
  }

  static init() {
    User.authenticate()
  }

  static authenticate() {
    if (User.isAuthenticated()) {
      Socket.id = getCookie('email').split('@')[0]
      document.getElementById('id').innerHTML = Socket.id

      fetch(`/user/init`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getCookie('token')}`,
        },
      })
        .then((res) => {
          return res.json()
        })
        .then((data) => {
          document.cookie = `record=${encodeURIComponent(getRecord(data.win, data.loss))}`

          document.querySelector('#signinBtnWrapper').style.display = 'none'

          document.querySelector('#userInfoWrapper').style.display = 'flex'
          document.querySelector('#userName').innerHTML = Socket.id
          document.querySelector('#record').innerHTML = `${getCookie('record')}`
        })
    } else {
      document.querySelector('#signinBtnWrapper').style.display = 'flex'
      document.querySelector('#userInfoWrapper').style.display = 'none'
    }
  }

  static signIn() {
    window.location.href = `/auth/google`
  }

  static signOut() {
    const cookies = document.cookie.split(';')

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i]
      const eqPos = cookie.indexOf('=')
      const key = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      if (key !== 'lang') document.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }

    location.reload(true)
  }

  static saveLog(winOrLose) {
    fetch(`/user/${winOrLose}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getCookie('token')}`,
      },
    })
  }
}

function getRecord(win, loss) {
  let rate = 0
  if (win + loss > 0) rate = (win / (win + loss)) * 100

  return `${win}W ${loss}L (${rate.toFixed(0)}%)`
}
