const imageEls = new WeakMap()

function itemImageSrc(item) {
  return `/images/items/${item.id}.png`
}

function getItemImage(item) {
  if (!imageEls.has(item)) {
    const imageEl = document.createElement('img')
    imageEl.src = itemImageSrc(item)
    imageEl.className = 'itemImg'
    imageEls.set(item, imageEl)
  }
  return imageEls.get(item)
}

function itemInfoHtml(item) {
  return `<div style="text-align:center;">
        <div>${item.img}</div>
        <div>${item.name}</div>
        <div>${item.getStat()}</div>
        </div>`
}

export { itemImageSrc, getItemImage, itemInfoHtml }
