// module

import { handleServerMessage } from './controller/messageHandlers.js'
import Socket from './net/Socket.js'
import Unit from './state/Unit.js'
import Painter from './view/3D/Painter.js'
import UI from './view/UI.js'

window.onload = () => {
  init()
}

async function init() {
  fetchUserLog()
  await fetchResource()
  if (!isPlayableDevice()) {
    UI.init(false)
    return
  }
  UI.init()
  Socket.init({
    onMessage: handleServerMessage,
    onReady: UI.readyToPlay,
    onDisconnected: UI.blockPlayBtn,
  })
  Painter.init()
}

async function fetchResource() {
  await Unit.fetchData()
  await fetchImages()
  endLoading()
}

async function fetchImages() {
  const data = Object.values(Unit.CATS).concat(Object.values(Unit.CREEPS))
  let count = 0
  startLoading()
  data.forEach((unit) => {
    const img = new Image()
    img.src = `/images/portraits/${unit.id}.jpg`
    img.onload = () => {
      document.querySelector('#loadingText').innerHTML = `Fetching Data... ${count}/${data.length}`
    }
    img.onerror = () => {
      console.log('Error fetching image.')
    }
  })
}

function startLoading() {
  document.querySelector('#loading').style.display = 'flex'
}

function endLoading() {
  document.querySelector('#loading').style.display = 'none'
}

function isPlayableDevice() {
  const agent = navigator.userAgent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent)

  return !isMobile
}

async function fetchUserLog() {
  console.log('Logging user info...', new Date().toLocaleString())
  const browserInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language || navigator.userLanguage,
    createdAtLocale: new Date().toLocaleString(),
  }
  fetch('/user/log/browser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(browserInfo),
  })
    .then((res) => {
      if (res.status !== 200) {
        console.log('Failed to log user info.')
      } else {
        console.log('User info logged.')
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
