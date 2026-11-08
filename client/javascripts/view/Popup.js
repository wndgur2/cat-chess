function popUp(html, mouseEvent) {
  let popUpEl = document.getElementById('popUp')
  popUpEl.innerHTML = html
  popUpEl.style.display = 'flex'

  if (mouseEvent.clientX + popUpEl.clientWidth > window.innerWidth)
    popUpEl.style.left = mouseEvent.clientX - popUpEl.clientWidth + 'px'
  else popUpEl.style.left = mouseEvent.clientX + 'px'

  if (mouseEvent.clientY + popUpEl.clientHeight > window.innerHeight)
    popUpEl.style.top = mouseEvent.clientY - popUpEl.clientHeight + 'px'
  else popUpEl.style.top = mouseEvent.clientY + 'px'
}

function popDown() {
  let popUpEl = document.getElementById('popUp')
  popUpEl.style.display = 'none'
}

export { popUp, popDown }
