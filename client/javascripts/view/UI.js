import Painter from './3D/Painter.js'
import Hud from './Hud.js'
import Sound from './Sound.js'
import UnitInfoPanel from './UnitInfoPanel.js'
import User from './User.js'
import { inventoryDrag } from './inventoryDrag.js'
import { itemInfoHtml } from './itemView.js'
import { popUp, popDown } from './Popup.js'
import Socket from '../net/Socket.js'
import Player from '../state/Player.js'
import Unit from '../state/Unit.js'
import { CLIENT_MESSAGES } from '../../../shared/protocol.js'
import { getCookie, getText } from '../utils.js'
import {
  CANCEL_MATCHING,
  MATCH,
  NOT_SUPPORTED_DEVICE,
  WAITING_FOR_CONNECTION,
} from '../constants/texts.js'

export default class UI {
  static init(playable = true) {
    scroll()
    createUnitCards()
    User.init()
    this.hydrate(playable)
  }

  static hydrate(playable) {
    document.onclick = Sound.playClick

    document.querySelector('#signinBtn').onclick = User.signIn
    document.querySelector('#signoutBtn').onclick = User.signOut
    document.querySelector('#deck').onclick = newMainCard
    document.querySelector('#fullscreenBtn').onclick = () => {
      fullscreen(document.documentElement)
    }

    //footer
    document.querySelector('#languageBtn').onclick = languageBtnClick

    document.querySelector('#ko').onclick = () => {
      languageChange('ko')
    }
    document.querySelector('#en').onclick = () => {
      languageChange('en')
    }
    document.querySelector('#soundBtn').onclick = () => {
      let soundImg = document.querySelector('#soundImg')
      Sound.mute()
      if (Sound.muted) soundImg.setAttribute('src', '/images/home/note2.png')
      else soundImg.setAttribute('src', '/images/home/note.png')
    }

    document.querySelector('#developerBtn').onclick = () => {
      window.open('https://github.com/wndgur2/CatChess')
    }

    if (!playable) {
      document.querySelector('#playBtnText').innerHTML = getText(NOT_SUPPORTED_DEVICE)
      return
    }

    document.querySelector('#playBtn').onclick = startMatching

    document.querySelector('#modalClose').onclick = UI.closeModal
    document.querySelector('#modalBackdrop').onclick = UI.closeModal

    document.querySelector('#surrenderBtn').onclick = () => {
      const surrenderEl = document.querySelector('#surrenderWrapper')
      UI.openModal(surrenderEl.innerHTML)
      document.querySelector('#surrenderConfirm').onclick = () => {
        Socket.sendMsg(CLIENT_MESSAGES.REQ_SURRENDER, '')
        UI.closeModal()
      }
    }

    document.querySelector('#reload').onclick = () => {
      Socket.sendMsg(CLIENT_MESSAGES.REQ_RELOAD, '')
    }

    document.onkeypress = (event) => {
      switch (event.key.toUpperCase()) {
        case 'D':
          Socket.sendMsg(CLIENT_MESSAGES.REQ_RELOAD, '')
          break
        case 'ㅇ':
          Socket.sendMsg(CLIENT_MESSAGES.REQ_RELOAD, '')
          break
        case 'F':
          Socket.sendMsg(CLIENT_MESSAGES.REQ_BUY_EXP, '')
          break
        case 'ㄹ':
          Socket.sendMsg(CLIENT_MESSAGES.REQ_BUY_EXP, '')
          break
        case 'E':
          Painter.sellUnitOnKeypress()
          break
        case 'ㄷ':
          Painter.sellUnitOnKeypress()
          break
      }
    }

    document.querySelector('#buyExp').onclick = () => {
      Socket.sendMsg(CLIENT_MESSAGES.REQ_BUY_EXP, '')
    }

    let shopEl = document.querySelector('#shop')
    shopEl.onmouseenter = shopMouseEnter
    shopEl.onmouseleave = shopMouseLeave
    shopEl.onpointerup = shopPointerUp

    let shoplistEl = document.querySelector('#shoplist')
    for (let i = 0; i < shoplistEl.children.length; ++i) {
      shoplistEl.children[i].onclick = () => {
        if (!Player.player.shop[i]) return
        Socket.sendMsg(CLIENT_MESSAGES.REQ_BUY_CAT, {
          index: i,
        })
        popDown()
      }
    }

    // 2 x 3 inventory
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        let item = document.querySelector(`#inventory-${i}-${j}`)
        item.ondragstart = inventoryDragStart
        item.draggable = false
        item.onmousemove = inventoryItemMouseMove
        item.onmouseleave = popDown
      }
    }

    UnitInfoPanel.hydrate()

    onclose = () => {
      Painter.running = false
    }
  }

  static openModal(content, callback) {
    console.log('open modal')
    const modalEl = document.getElementById('modal')
    modalEl.style.opacity = '1'
    modalEl.style.visibility = 'visible'

    const modalBodyEl = document.getElementById('modalBody')
    modalBodyEl.innerHTML = content
    if (callback) UI.callback = callback
  }

  static closeModal() {
    const modalEl = document.getElementById('modal')
    if (UI.callback) {
      UI.callback()
      UI.callback = null
    }
    modalEl.style.opacity = '0'
    setTimeout(() => {
      modalEl.style.visibility = 'hidden'
    }, 200)
  }

  static gameStart() {
    UI.closeModal()
    document.getElementById('home').style.display = 'none'
    document.getElementById('game').style.display = 'flex'
    fullscreen(document.getElementById('game'))

    Painter.startRender()
  }

  static readyToPlay() {
    document.getElementById('id').innerHTML = Socket.id
    const playBtn = document.getElementById('playBtn')
    playBtn.className = 'btnActive btn'
    playBtn.disabled = false

    const playBtnText = document.getElementById('playBtnText')

    playBtnText.innerHTML = `<span>${getText(MATCH)}</span>`
  }

  static blockPlayBtn() {
    const playBtn = document.getElementById('playBtn')
    playBtn.className = 'btnInactive btn btnWide'
    playBtn.disabled = true

    const playBtnText = document.getElementById('playBtnText')
    playBtnText.innerHTML = `<span>${getText(WAITING_FOR_CONNECTION)}</span>`
  }

  static gameEnd() {
    Painter.running = false
    cancelMatching()
    document.getElementById('game').style.display = 'none'
    document.getElementById('home').style.display = 'inline-block'
    User.authenticate()
    Painter.clearUnits()
  }
}

function inventoryDragStart(event) {
  inventoryDrag.id = event.target.id
  inventoryDrag.active = true
}

function inventoryItemMouseMove(event) {
  let index = parseInt(this.id.split('-')[1]) * 2 + parseInt(this.id.split('-')[2])
  if (Player.player.items[index]) popUp(itemInfoHtml(Player.player.items[index]), event)
}

function shopMouseEnter(event) {
  if (!Painter.isDragging) return
  event.preventDefault()

  let shoplistEl = document.getElementById('shoplist')
  shoplistEl.style.display = 'none'

  let sellEl = document.getElementById('sell')
  sellEl.innerHTML = `고양이 판매하기 [E]<br/>💰${Painter.draggingObject.unit.cost}`
  sellEl.style.display = 'flex'
}

function shopMouseLeave(event) {
  if (!Painter.isDragging) return
  event.preventDefault()

  let sellEl = document.getElementById('sell')
  sellEl.style.display = 'none'

  let shoplistEl = document.getElementById('shoplist')
  shoplistEl.style.display = 'flex'
}

function shopPointerUp(event) {
  if (!Painter.isDragging) return
  Socket.sendMsg(CLIENT_MESSAGES.REQ_SELL_CAT, {
    uid: Painter.draggingObject.unit.uid,
  })

  let sellEl = document.getElementById('sell')
  sellEl.style.display = 'none'

  let shoplistEl = document.getElementById('shoplist')
  shoplistEl.style.display = 'flex'

  Hud.renderShop(Player.player)
}

function startMatching() {
  Socket.sendMsg(CLIENT_MESSAGES.START_MATCHING, '')

  const playBtn = document.getElementById('playBtn')
  const playBtnText = document.getElementById('playBtnText')
  playBtn.className = 'btnWide btn'

  let mouseOver = false
  let matchingTime = 0
  let timeText = '00:00'

  playBtnText.innerHTML = timeText
  UI.interval = setInterval(() => {
    matchingTime++
    const minute = Math.floor(matchingTime / 60)
    const second = matchingTime % 60
    timeText = `${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
    if (mouseOver) return
    playBtnText.innerHTML = timeText
  }, 1000)

  playBtn.onclick = () => {
    cancelMatching()
    playBtn.onclick = startMatching
  }
  playBtn.onmouseover = () => {
    mouseOver = true
    playBtnText.innerHTML = getText(CANCEL_MATCHING)
  }
  playBtn.onmouseout = () => {
    mouseOver = false
    playBtnText.innerHTML = timeText
  }
}

function cancelMatching() {
  Socket.sendMsg(CLIENT_MESSAGES.CANCEL_MATCHING, '')
  clearInterval(UI.interval)

  const playBtn = document.getElementById('playBtn')
  playBtn.className = `btnActive btn`
  playBtn.onmouseover = null
  playBtn.onmouseout = null
  const playBtnText = document.getElementById('playBtnText')
  playBtnText.innerHTML = getText(MATCH)
}

function scroll() {
  if (!getCookie('scroll')) return
  window.scrollTo(0, parseInt(getCookie('scroll')))
  document.cookie = 'scroll=0'
}

function createUnitCards() {
  newMainCard()
  loadDescCards()
}

function newMainCard() {
  const MAX_AMOUNT = 5
  const cards = document.getElementById('cards')
  const currentCats = [...cards.children].map((card) => card.id)
  const values = Object.values(Unit.CATS).filter((value) => !currentCats.includes(value.id))
  if (values.length > 0) {
    if (cards.children.length >= MAX_AMOUNT) {
      const i = cards.children.length - MAX_AMOUNT
      cards.children[i].setAttribute(
        'style',
        'width: 0px; margin:0px; opacity: 0; pointer-events: none;'
      )
      setTimeout(() => {
        if (cards.children.length > MAX_AMOUNT) cards.removeChild(cards.children[0])
      }, 400)
    }

    const cat = values[Math.floor(Math.random() * values.length)]
    const cardWrapper = newCard('main', cat)
    cards.appendChild(cardWrapper)

    setTimeout(() => {
      cardWrapper.style.opacity = '1'
      cardWrapper.style.width = '11dvw'
      cardWrapper.onmouseover = (e) => {
        cardWrapper.style.width = '12dvw'
      }
      cardWrapper.onmouseout = (e) => {
        cardWrapper.style.width = '11dvw'
      }
    }, 20)
  }
}

function loadDescCards() {
  var timeout
  ;['Poeir', 'Therme', 'Nature'].forEach((synergy) => {
    const cats = Object.values(Unit.CATS).filter((cat) => cat.synergies.includes(synergy))
    cats.forEach((cat) => {
      const cardWrapper = newCard('desc', cat)
      cardWrapper.onmouseenter = () => {
        if (timeout) clearTimeout(timeout)
        // show full body image on the right
        const popUp = document.getElementById('unitPopUpWrapper')
        popUp.style.visibility = 'visible'
        popUp.style.opacity = '1'
        const popUpImage = document.getElementById('popUpImage')
        popUpImage.onerror = () => {
          popUpImage.src = `/images/portraits/${cat.id}.jpg`
        }
        popUpImage.src = `/images/fullbody/${cat.id}.jpg`
      }
      cardWrapper.onmouseleave = () => {
        const popUp = document.getElementById('unitPopUpWrapper')
        popUp.style.opacity = '0'
        timeout = setTimeout(() => {
          popUp.style.visibility = 'hidden'
        }, 200)
      }
      document.getElementById(synergy).appendChild(cardWrapper)
    })
  })

  const creeps = Unit.CREEPS
  for (const creep in creeps) {
    document.getElementById('Creep').appendChild(newCard('desc', creeps[creep]))
  }
}

function newCard(type, cat) {
  let cardWrapper = document.createElement('div')
  cardWrapper.id = cat.id
  cardWrapper.className = type == 'main' ? 'mainCardWrapper' : 'cardWrapper'

  let card = document.createElement('div')
  card.className = type == 'main' ? 'mainCard' : 'card'
  cardWrapper.appendChild(card)

  let cardImgWrapper = document.createElement('div')
  cardImgWrapper.className = 'cardImgWrapper'
  card.appendChild(cardImgWrapper)

  let cardImg = document.createElement('img')
  cardImg.className = 'cardImg'
  cardImg.src = `/images/portraits/${cat.id}.jpg`
  cardImgWrapper.appendChild(cardImg)

  let cardDescWrapper = document.createElement('div')
  cardDescWrapper.className = 'cardDescWrapper'
  cardDescWrapper.style.wordBreak = 'break-all'

  let cardName = document.createElement('span')
  cardName.className = 'cardName'
  cardName.innerHTML = cat.name
  cardDescWrapper.appendChild(cardName)

  let cardDesc = document.createElement('span')
  cardDesc.className = 'cardDesc'
  cardDesc.innerHTML = cat.desc
  cardDescWrapper.appendChild(cardDesc)

  card.appendChild(cardDescWrapper)

  return cardWrapper
}

function fullscreen(el) {
  if (document.fullscreenElement) document.exitFullscreen()
  else el.requestFullscreen()
}

function languageBtnClick() {
  const language = document.getElementById('languagePopUp')
  if (language.style.display === 'flex') language.style.display = 'none'
  else language.style.display = 'flex'
}

function languageChange(language) {
  document.cookie = `scroll=${window.scrollY}`
  document.cookie = `lang=${language}`
  location.href = `/?lang=${language}`
}
