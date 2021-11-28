import './style.scss'

const isTouch = ('ontouchstart' in window)||(navigator.maxTouchPoints > 0)||(navigator.msMaxTouchPoints > 0)

// <div id="imagerDisplayId" className="imagerDisplay" style={{zIndex}}>
//   <div className="imagerBackground" onMouseDown={mouseDownBackground} onMouseUp={mouseUpBackground}></div>
//   <div className="imagerTransitioner" style={{zIndex: 2}}></div>
//   <div className="imagerList" style={{zIndex: 1}}></div>
// </div>

export const ImagerDisplay = (d) => {
  const zIndex = parseInt(d["z-index"])
  return (
    <div id="imagerDisplayId" className="imagerDisplay" style={{zIndex}} dis="false">
      <div className="imagerBackground" onMouseDown={mouseDownBackground} onMouseUp={mouseUpBackground}></div>
      <div className="imagerList"></div>
    </div>
  )
}

export const ImagerImg = (d) => {
  let images = d["images"] ? d["images"] : []
  images.unshift(d["src"]);
  return (
    <img src={d["src"]} alt={d["alt"]} width={d["width"]} height={d["height"]} images={images} onClick={imagerShowFromImg} />
  )
}

export const imagerShow = (event, imgs, start = 0) => {
  start = start < 0 ? 0 : start
  start = start > imgs.length-1 ? imgs.length-1 : start
  fill(imgs, start)
  animate(true, [event.clientX, event.clientY])
}

//-----------------------------------inner functions

const imagerShowFromImg = (e) => {
  const image = e.target
  const images = image.getAttribute("images").split(",")
  const boundig = image.getBoundingClientRect()

  fill(images, 0)
  animate(true, [boundig.left+boundig.width/2, boundig.top+boundig.height/2], [boundig.width, boundig.height])
}

const delay = (ms = 0) => new Promise((resolve, reject) => {
  setTimeout(() => { resolve() }, ms)
})

const waitSrc = img => new Promise((resolve, reject) => {
  img.addEventListener('load', () => resolve());
})

const waitElement = (el, property, value) => new Promise(function repeat(resolve, reject) {
  if (getComputedStyle(el)[property] !== value) {
    setTimeout(() => repeat(resolve, reject), 10)
  } else {
    resolve()
  }
})

async function add(src, id, side) {
  const wrap = document.createElement("div")
  wrap.setAttribute("class", "imagerWrapImg")
  wrap.onmousedown = (e) => { imgMouseDown(e) }
  wrap.onmouseup = (e) => { imgMouseUp(e) }
  wrap.ondblclick = (e) => { imgDblClick(e) }
  wrap.setAttribute("idimg", id)
  wrap.setAttribute("side", side)
  wrap.style.width = "100px"
  wrap.style.height = "100px"
  wrap.style.borderRadius = "50px"
  const loader = document.createElement("div")
  loader.setAttribute("class", "imagerLoader")
  wrap.appendChild(loader)
  const img = document.createElement("img")
  img.setAttribute("src", src)
  img.setAttribute("class", "imagerImage")
  img.setAttribute("draggable", "false")
  wrap.appendChild(img)
  document.getElementById("imagerDisplayId").querySelector(".imagerList").appendChild(wrap)

  img.style.display = "none"
  loader.style.display = "flex"

  await waitSrc(img)

  let setSize = [img.naturalWidth, img.naturalHeight]
  let windowSize = [window.innerWidth, window.innerHeight]
  const ratio = setSize[0]/setSize[1]
  if (setSize[0] >= setSize[1]) {
    if (setSize[0] > windowSize[0]*0.8) {
      setSize[0] = windowSize[0]*0.8
      setSize[1] = setSize[0]/ratio
    }
  } else if (setSize[0] < setSize[1]) {
    if (setSize[1] > windowSize[1]*0.8) {
      setSize[1] = windowSize[1]*0.8
      setSize[0] = setSize[1]*ratio
    }
  }
  wrap.style.width = setSize[0]+"px"
  wrap.style.height = setSize[1]+"px"
  wrap.style.borderRadius = "0px"

  img.style.display = "flex"
  loader.style.display = "none"
  wrap.style.backgroundColor = "unset"
}

async function fill(imgs, start) {
  for (let i in imgs) {
    let side = ""
    if (i < start) {
      side = "left"
    } else if (i == start) {
      side = "center"
    } else if (i > start) {
      side = "right"
    }
    add(imgs[i], i, side)
  }
}

async function usualHide() {
  const display = document.getElementById("imagerDisplayId")
  const background = display.querySelector(".imagerBackground")
  const list = display.querySelector(".imagerList")
  const img = display.querySelector(`.imagerList .imagerWrapImg[side='center']`)

  img.style.opacity = "0"
  background.style.opacity = "0"
  img.style.marginTop = "-300px"
  await waitElement(background, "opacity", "0")
  display.style.display = "none"
  list.innerHTML = ""
}

async function animate(show, coord, originSize) {
  const display = document.getElementById("imagerDisplayId")
  const background = display.querySelector(".imagerBackground")
  const list = display.querySelector(".imagerList")
  if (show) { display.setAttribute("coord", `${coord[0]},${coord[1]}`) }
  const img = display.querySelector(`.imagerList .imagerWrapImg[side='center']`)
  originSize = originSize === undefined ? [0, 0] : originSize
  if (show && originSize[0] != 0) { display.setAttribute("originSize", `${originSize[0]},${originSize[1]}`) }
  if (!show && display.getAttribute("originSize") && img.getAttribute("idimg") == "0") {
    originSize = display.getAttribute("originSize").split(",")
    for (let i in originSize) { originSize[i] = parseInt(originSize[i]) }
  }

  // document.body.style.overflow = show ? "hidden" : "auto"
  // document.body.style.height = show ? "100%" : undefined
  // document.body.style.position = show ? "fixed" : undefined
  // document.getElementsByTagName("html")[0].style.overflow = show ? "hidden" : "auto"

  if (show) {
    document.addEventListener("touchmove", disableTouch, {passive: false})
  } else {
    document.removeEventListener("touchmove", disableTouch)
  }

  display.setAttribute("dis", "true")

  if (show) {
    document.body.style.overflow = "hidden"
    const duration = getComputedStyle(img).transitionDuration
    display.style.display = "flex"
    img.style.display = "none"
    img.style.transitionDuration = "0s"
    await delay(50)
    img.style.width = originSize[0]+"px"
    img.style.height = originSize[1]+"px"
    img.style.marginLeft = `${2*(coord[0]-window.innerWidth/2)}px`
    img.style.marginTop = `${2*(coord[1]-window.innerHeight/2)}px`
    await delay(50)
    background.style.opacity = "1"
    img.style.display = "flex"
    img.style.transitionDuration = duration
    await delay(50)
    const imgImg = img.querySelector(".imagerImage")
    let size = []
    if (imgImg.naturalWidth) {
      size = [imgImg.naturalWidth, imgImg.naturalHeight]
      let windowSize = [window.innerWidth, window.innerHeight]
      const ratio = size[0]/size[1]
      if (size[0] >= size[1]) {
        if (size[0] > windowSize[0]*0.8) {
          size[0] = windowSize[0]*0.8
          size[1] = size[0]/ratio
        }
      } else if (size[0] < size[1]) {
        if (size[1] > windowSize[1]*0.8) {
          size[1] = windowSize[1]*0.8
          size[0] = size[1]*ratio
        }
      }
    } else {
      size[0] = 100
      size[1] = 100
    }
    img.style.width = `${size[0]}px`
    img.style.height = `${size[1]}px`
    img.style.marginLeft = "0px"
    img.style.marginTop = "0px"
    await waitElement(img, "marginLeft", "0px")
    img.style.removeProperty("margin-left")
    img.style.removeProperty("margin-top")
  } else {
    const coord = display.getAttribute("coord").split(",")
    for (let i in coord) { coord[i] = parseFloat(coord[i]) }
    img.style.transform = "matrix(1, 0, 0, 1, 0, 0)"
    img.style.width = originSize[0]+"px"
    img.style.height = originSize[1]+"px"
    img.style.marginLeft = `${2*(coord[0]-window.innerWidth/2)}px`
    img.style.marginTop = `${2*(coord[1]-window.innerHeight/2)}px`
    background.style.opacity = "0"
    await waitElement(img, "width", originSize[0]+"px")
    display.style.display = "none"
    list.innerHTML = ""
    document.body.style.overflow = "auto"
  }

  display.setAttribute("dis", "false")
}

window.addEventListener("keydown", (e) => {
  const display = document.getElementById("imagerDisplayId")
  if (getComputedStyle(display).display == "none" || display.getAttribute("dis") == "true") { return }

  const img = display.querySelector(".imagerList .imagerWrapImg[side='center']")
  let ind = parseInt(img.getAttribute("idimg"))

  if (e.code === "ArrowLeft") {
    if (ind > 0) {
      const prev = display.querySelector(`.imagerList .imagerWrapImg[idimg='${ind-1}']`)
      img.style.transform = "matrix(1, 0, 0, 1, 0, 0)"
      img.setAttribute("side", "right")
      prev.setAttribute("side", "center")
    }
  } else if (e.code === "ArrowRight") {
    const len = display.querySelectorAll(".imagerList .imagerWrapImg").length
    if (ind < len-1) {
      const next = display.querySelector(`.imagerList .imagerWrapImg[idimg='${ind+1}']`)
      img.style.transform = "matrix(1, 0, 0, 1, 0, 0)"
      img.setAttribute("side", "left")
      next.setAttribute("side", "center")
    }
  }
})

window.addEventListener("wheel", (e) => {
  const display = document.getElementById("imagerDisplayId")
  if (getComputedStyle(display).display == "none" || display.getAttribute("dis") == "true") { return }

  const img = display.querySelector(".imagerList .imagerWrapImg[side='center']")
  const imgStyle = getComputedStyle(img)
  const matrix = imgStyle.transform.slice(7, -1).split(", ")
  for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }

  let zoom = e.deltaY <= 0 ? "+" : "-"

  const speed = 1
  if (zoom === "+") {
    matrix[0] += speed
    matrix[3] += speed
  } else if (zoom === "-") {
    matrix[0] -= speed
    matrix[3] -= speed

    matrix[4] = 0
    matrix[5] = 0

    img.transform = `matrix(${matrix.join(", ")})`
  }

  matrix[0] = matrix[0] < 1 ? 1 : matrix[0]
  matrix[3] = matrix[3] < 1 ? 1 : matrix[3]

  matrix[0] = matrix[0] > 10 ? 10 : matrix[0]
  matrix[3] = matrix[3] > 10 ? 10 : matrix[3]

  img.style.transform = `matrix(${matrix.join(", ")})`
})


function imgMouseDown(e) {
  const wrap = e.target.parentNode
  const style = getComputedStyle(wrap)
  const matrix = style.transform.slice(7, -1).split(", ")
  for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }
  wrap.setAttribute("start", `${e.clientX},${e.clientY}`)
  wrap.setAttribute("translate", `${matrix[4]},${matrix[5]}`)
  window.addEventListener("mousemove", imgMouseMove)
}
function imgMouseUp(e) {
  const wrap = e.target.parentNode
  if (!wrap) { return }
  if (!wrap.tagName) { return }
  if (wrap.getAttribute("class") !== "imagerWrapImg") { return }
  const style = getComputedStyle(wrap)
  const matrix = style.transform.slice(7, -1).split(", ")
  for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }

  if (matrix[0] == 1 || matrix[3] == 1) {
    wrap.style.transform = "matrix(1, 0, 0, 1, 0, 0)"
  }

  window.removeEventListener("mousemove", imgMouseMove)
}
function imgMouseMove(e, delta) {
  const wrap = e.target.parentNode
  if (!wrap) { return }
  if (!wrap.tagName) { return }
  if (wrap.getAttribute("class") !== "imagerWrapImg") { return }
  const style = getComputedStyle(wrap)
  const matrix = style.transform.slice(7, -1).split(", ")
  for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }
  const translate = wrap.getAttribute("translate").split(",")
  for (let i in translate) { translate[i] = parseFloat(translate[i]) }
  const start = wrap.getAttribute("start").split(",")
  for (let i in start) { start[i] = parseFloat(start[i]) }

  matrix[4] = translate[0]+e.clientX-start[0]
  matrix[5] = translate[1]+e.clientY-start[1]

  const limit = [
    window.innerWidth/2+matrix[0]*parseFloat(style.width.slice(0, -2))/2-500,
    window.innerHeight/2+matrix[3]*parseFloat(style.height.slice(0, -2))/2-500
  ]

  matrix[4] = matrix[4] > limit[0] ? limit[0] : matrix[4]
  matrix[4] = matrix[4] < -limit[0] ? -limit[0] : matrix[4]
  matrix[5] = matrix[5] > limit[1] ? limit[1] : matrix[5]
  matrix[5] = matrix[5] < -limit[1] ? -limit[1] : matrix[5]

  wrap.style.transform = `matrix(${matrix.join(", ")})`
}

const disableTouch = (e) => {
  if (e.touches.length > 1) {
     e.preventDefault();
  }
}

// document.addEventListener("touchmove", e => {
//   if (e.touches.length > 1) {
//      e.preventDefault();
//   }
// }, {passive: false})

function mouseDownBackground(e) {
  if (isTouch) { return }
  e.target.setAttribute("hide", "true")
}
function mouseUpBackground(e) {
  if (e && e.target && e.target.tagName && e.target.getAttribute("class") == "imagerBackground" && e.target.getAttribute("hide") == "true") {
    animate(false)
    e.target.removeAttribute("hide")
  }
}

function imgDblClick(e) {
  const wrap = e.target.parentNode
  if (!wrap) { return }
  if (!wrap.tagName) { return }
  if (wrap.getAttribute("class") !== "imagerWrapImg") { return }
  if (isTouch) { return }

  const style = getComputedStyle(wrap)
  const matrix = style.transform.slice(7, -1).split(", ")
  for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }

  if (matrix[0] == 1) {
    matrix[0] = 3
    matrix[3] = 3
  } else {
    matrix[0] = 1
    matrix[3] = 1
  }

  matrix[4] = 0
  matrix[5] = 0

  wrap.style.transform = `matrix(${matrix.join(", ")})`
}

const arrange = (c1, c2) => ((c1[0]-c2[0])**2+(c1[1]-c2[1])**2)**.5

window.addEventListener("touchstart", (e) => {
  if (e.touches.length != 1) { return }
  const display = document.getElementById("imagerDisplayId")
  const img = display.querySelector(".imagerList .imagerWrapImg[side='center']")

  if (display.getAttribute("dblTouch") === "true") {
    const style = getComputedStyle(img)
    const matrix = style.transform.slice(7, -1).split(", ")
    for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }

    if (matrix[0] == 1) {
      matrix[0] = 3
      matrix[3] = 3
      matrix[4] = 0
      matrix[5] = 0
    } else {
      matrix[0] = 1
      matrix[3] = 1
      matrix[4] = 0
      matrix[5] = 0
    }

    img.style.transform = `matrix(${matrix.join(", ")})`
  }

  display.setAttribute("dblTouch", "true")
  setTimeout(() => display.removeAttribute("dblTouch"), 200)
})
window.addEventListener("touchstart", (e) => {
  if (e.touches.length != 2) { return }

  const display = document.getElementById("imagerDisplayId")
  const img = display.querySelector(".imagerList .imagerWrapImg[side='center']")
  display.setAttribute("arrange", arrange([e.touches[0].clientX, e.touches[0].clientY], [e.touches[1].clientX, e.touches[1].clientY]))

  const style = getComputedStyle(img)
  const matrix = style.transform.slice(7, -1).split(", ")
  for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }

  display.setAttribute("zoom", `${matrix[0]},${matrix[3]}`)
})
window.addEventListener("touchend", (e) => {
  if (e.touches.length != 2) { return }

  const display = document.getElementById("imagerDisplayId")
  const img = display.querySelector(".imagerList .imagerWrapImg[side='center']")

  const style = getComputedStyle(img)
  const matrix = style.transform.slice(7, -1).split(", ")
  for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }

  if (matrix[0] == 1) {
    img.style.transform = `matrix(1, 0, 0, 1, 0, 0)`
  }

  const limit = [
    window.innerWidth/2+matrix[0]*parseFloat(style.width.slice(0, -2))/2-200,
    window.innerHeight/2+matrix[3]*parseFloat(style.height.slice(0, -2))/2-200
  ]
  matrix[4] = matrix[4] > limit[0] ? limit[0] : matrix[4]
  matrix[4] = matrix[4] < -limit[0] ? -limit[0] : matrix[4]
  matrix[5] = matrix[5] > limit[1] ? limit[1] : matrix[5]
  matrix[5] = matrix[5] < -limit[1] ? -limit[1] : matrix[5]
})
window.addEventListener("touchmove", (e) => {
  if (e.touches.length != 2) { return }

  const display = document.getElementById("imagerDisplayId")
  const img = display.querySelector(".imagerList .imagerWrapImg[side='center']")
  if (!img) { return }
  const arrangeStart = parseFloat(display.getAttribute("arrange"))
  if (!arrangeStart) { return }
  const startZoom = display.getAttribute("zoom").split(",")
  for (let i in startZoom) { startZoom[i] = parseFloat(startZoom[i]) }

  const currArrange = arrange([e.touches[0].clientX, e.touches[0].clientY], [e.touches[1].clientX, e.touches[1].clientY])

  const zoom = (currArrange-arrangeStart)/250

  const style = getComputedStyle(img)
  const matrix = style.transform.slice(7, -1).split(", ")
  for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }

  matrix[0] = startZoom[0]+zoom
  matrix[3] = startZoom[1]+zoom

  matrix[0] = matrix[0] < 1 ? 1 : matrix[0]
  matrix[3] = matrix[3] < 1 ? 1 : matrix[3]

  img.style.transform = `matrix(${matrix.join(", ")})`
})

window.addEventListener("touchstart", (e) => {
  if (e.touches.length > 1) { return }
  const display = document.getElementById("imagerDisplayId")
  const img = display.querySelector(".imagerList .imagerWrapImg[side='center']")
  if (!img) { return }
  const ind = parseInt(img.getAttribute("idimg"))

  const style = getComputedStyle(img)
  const matrix = style.transform.slice(7, -1).split(", ")
  for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }

  display.setAttribute("touchCoord", `${e.touches[0].clientX}`)
  display.setAttribute("touchStart", `${e.touches[0].clientX},${e.touches[0].clientY}`)
  display.setAttribute("translate", `${matrix[4]},${matrix[5]}`)
  display.setAttribute("transition", `${img.style.transitionDuration}`)
  display.setAttribute("speed", "true")
  setTimeout(() => { display.removeAttribute("speed") }, 200)

  const prev = display.querySelector(`.imagerList .imagerWrapImg[idimg='${ind-1}']`)
  const next = display.querySelector(`.imagerList .imagerWrapImg[idimg='${ind+1}']`)

  img.style.transitionDuration = "0s"

  if (prev) { prev.style.transitionDuration = "0s" }
  if (next) { next.style.transitionDuration = "0s" }
})
window.addEventListener("touchend", (e) => {
  const display = document.getElementById("imagerDisplayId")
  display.removeAttribute("touchCoord")
  const img = display.querySelector(".imagerList .imagerWrapImg[side='center']")
  const len = display.querySelectorAll(".imagerList .imagerWrapImg").length
  if (!img) { return }
  const ind = parseInt(img.getAttribute("idimg"))

  const prev = display.querySelector(`.imagerList .imagerWrapImg[idimg='${ind-1}']`)
  const next = display.querySelector(`.imagerList .imagerWrapImg[idimg='${ind+1}']`)

  const transition = display.getAttribute("transition")
  img.style.transitionDuration = transition

  if (prev) { prev.style.transitionDuration = transition }
  if (next) { next.style.transitionDuration = transition }

  img.style.removeProperty("margin-left")
  if (prev) { prev.style.removeProperty("margin-left") }
  if (next) { next.style.removeProperty("margin-left") }

  const style = getComputedStyle(img)
  const matrix = style.transform.slice(7, -1).split(", ")
  for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }

  const margin = parseFloat(style.marginLeft)

  if (margin/2 >= window.innerWidth/2*0.8 && ind > 0) {
    img.setAttribute("side", "right")
    prev.setAttribute("side", "center")
  } else if (margin/2 <= -window.innerWidth/2*0.8 && ind < len-1) {
    img.setAttribute("side", "left")
    next.setAttribute("side", "center")
  } else if (matrix[5] < -150 && matrix[0] == 1 && margin == 0) {
    usualHide()
    return
  } else if (display.getAttribute("speed") === "true") {
    if (margin < 0 && ind < len-1) {
      img.setAttribute("side", "left")
      next.setAttribute("side", "center")
    } else if (margin > 0 && ind > 0) {
      img.setAttribute("side", "right")
      prev.setAttribute("side", "center")
    } else if (matrix[5] < 0 && matrix[0] == 1) {
      usualHide()
      return
    }
  } else if (matrix[0] == 1) {
    img.style.transform = "matrix(1, 0, 0, 1, 0, 0)"
  }
  img.style.opacity = "1"
})
window.addEventListener("touchmove", (e) => {
  if (e.touches.length > 1) { return }
  const display = document.getElementById("imagerDisplayId")
  const touchCoord = parseFloat(display.getAttribute("touchCoord"))
  const img = display.querySelector(".imagerList .imagerWrapImg[side='center']")
  if (!img) { return }
  const ind = parseInt(img.getAttribute("idimg"))

  const translate = display.getAttribute("translate").split(",")
  for (let i in translate) { translate[i] = parseFloat(translate[i]) }
  const start = display.getAttribute("touchStart").split(",")
  for (let i in start) { start[i] = parseFloat(start[i]) }

  const style = getComputedStyle(img)
  const matrix = style.transform.slice(7, -1).split(", ")
  for (let i in matrix) { matrix[i] = parseFloat(matrix[i]) }

  if (matrix[0] > 1) {

    matrix[4] = translate[0]+e.touches[0].clientX-start[0]
    matrix[5] = translate[1]+e.touches[0].clientY-start[1]

    const limit = [
      window.innerWidth/2+matrix[0]*parseFloat(style.width.slice(0, -2))/2-200,
      window.innerHeight/2+matrix[3]*parseFloat(style.height.slice(0, -2))/2-200
    ]

    matrix[4] = matrix[4] > limit[0] ? limit[0] : matrix[4]
    matrix[4] = matrix[4] < -limit[0] ? -limit[0] : matrix[4]
    matrix[5] = matrix[5] > limit[1] ? limit[1] : matrix[5]
    matrix[5] = matrix[5] < -limit[1] ? -limit[1] : matrix[5]

    img.style.transform = `matrix(${matrix.join(", ")})`

    return
  }

  const prev = display.querySelector(`.imagerList .imagerWrapImg[idimg='${ind-1}']`)
  const next = display.querySelector(`.imagerList .imagerWrapImg[idimg='${ind+1}']`)

  if (e.touches[0].clientY-start[1] < 0 && Math.abs(e.touches[0].clientX-touchCoord) < 30) {
    matrix[5] = e.touches[0].clientY-start[1]
    img.style.transform = `matrix(${matrix.join(", ")})`
    let opacity = (300+(e.touches[0].clientY-start[1]))/300
    opacity = (opacity < 0) ? 0 : opacity
    img.style.opacity = `${opacity}`

  } else if (e.touches[0].clientY-start[1] < 50 && Math.abs(e.touches[0].clientX-touchCoord) > 0) {
    img.style.marginLeft = `${2*(e.touches[0].clientX-touchCoord)}px`
    if (prev) { prev.style.marginLeft = `${2*(e.touches[0].clientX-touchCoord-window.innerWidth)}px` }
    if (next) { next.style.marginLeft = `${2*(e.touches[0].clientX-touchCoord+window.innerWidth)}px` }
    img.style.transform = `matrix(1, 0, 0, 1, 0, 0)`
  }

})


//-----------------------------------old
//------------------------------------old
//------------------------------------old
//------------------------------------old
//------------------------------------old
//------------------------------------old

// let store = {
//   imgs: [],
//   index: 0
//   // imgsOpen: [],
//   // startOpen: [],
//   // coordOpen: [0, 0],
//   // sizeOpen: [0, 0],
//   // mouseDownBackgroundFlag: false,
//   // disabled: false,
//   // loading: false,
//   // loadingDir: "right",
//   // loadingInd1: 0,
//   // loadingInd2: 0
// }
//
// const delay = (ms = 0) => new Promise((resolve, reject) => {
//   setTimeout(() => { resolve() }, ms)
// })
//
// const waitElement = (el, property, value) => new Promise(function repeat(resolve, reject) {
//   if (getComputedStyle(el)[property] !== value) {
//     setTimeout(() => repeat(resolve, reject), 10)
//   } else {
//     resolve()
//   }
// })
//
// const loadImage = src => new Promise((resolve, reject) => {
//   let img = new Image();
//   img.onload = () => resolve(img)
//   img.onerror = reject
//   img.src = src
// })
//
// const mouseDownBackground = e => {
//   store.mouseDownBackgroundFlag = true;
// }
// const mouseUpBackground = e => {
//   if (store.mouseDownBackgroundFlag) {
//     imagerAnimate(store.imgsOpen, store.startOpen, false, store.coordOpen, store.sizeOpen)
//     store.mouseDownBackgroundFlag = false;
//   }
// }
//
// async function addToList(src, place = "end") {
//   const img = document.createElement("img")
//   img.setAttribute("src", src)
//   await waitSrcImg(img)
//
//   let setSize = [img.naturalWidth, img.naturalHeight]
//   let windowSize = [window.innerWidth, window.innerHeight]
//
//   const ratio = setSize[0]/setSize[1]
//   if (setSize[0] >= setSize[1]) {
//     if (setSize[0] > windowSize[0]*0.8) {
//       setSize[0] = windowSize[0]*0.8
//       setSize[1] = setSize[0]/ratio
//     }
//   } else if (setSize[0] < setSize[1]) {
//     if (setSize[1] > windowSize[1]*0.8) {
//       setSize[1] = windowSize[1]*0.8
//       setSize[0] = setSize[1]*ratio
//     }
//   }
//   img.style.width = setSize[0]+"px"
//   img.style.height = setSize[1]+"px"
//   img.style.margin = `0px ${(windowSize[0]-setSize[0])/2}px`
//
//   const display = document.getElementById("imagerDisplayId")
//   const list = display.querySelector(".imagerList")
//   if (place === "end") {
//     list.appendChild(img)
//   } else if (place === "start") {
//     list.prepend(img)
//   }
//   return
// }
//
// async function loadingOtherImages() {
//   if (store.loadingDir === "right") {
//     store.loadingDir = "left"
//     if (store.loadingInd1 >= 0 && store.loadingInd2 >= store.imgsOpen.length) {
//       loadingOtherImages()
//     } else if (store.loadingInd2 < store.imgsOpen.length) {
//       store.loadingInd2++
//       console.log(store.loadingInd1, store.loadingInd2)
//       await addToList(store.imgsOpen[store.loadingInd2], "end")
//     }
//   } else if (store.loadingDir === "left") {
//     store.loadingDir = "right"
//     if (store.loadingInd1 < 0 && store.loadingInd2 < store.imgsOpen.length) {
//       loadingOtherImages()
//     } else if (store.loadingInd1 >= 0) {
//       store.loadingInd1--
//       await addToList(store.imgsOpen[store.loadingInd1], "start")
//       const list = document.getElementById("imagerDisplayId").querySelector(".imagerList")
//       const computedList = getComputedStyle(list)
//       var duration = computedList.transitionDuration
//       list.style.transitionDuration = "0s"
//       list.style.marginLeft = `${parseInt(computedList.marginLeft.slice(0, -2))-window.innerWidth}px`;
//       await delay(10)
//       list.style.transitionDuration = duration
//     }
//   }
//   if (store.loadingInd1 < 0 && store.loadingInd2 >= store.imgsOpen.length) {
//     return
//   } else {
//     loadingOtherImages()
//   }
// }
//
// async function imagerAnimate(imgs, start = 0, show = true, coords = [0, 0], size = [0, 0]) {
//
//   if (store.disabled) { return }
//
//   start = start < 0 ? 0 : start
//   start = start > imgs.length-1 ? imgs.length-1 : start
//
//   const display = document.getElementById("imagerDisplayId")
//   const background = display.querySelector(".imagerBackground")
//   const transitioner = display.querySelector(".imagerTransitioner")
//   const list = display.querySelector(".imagerList")
//
//   let image = await loadImage(imgs[start])
//   let setSize = [image.naturalWidth, image.naturalHeight]
//   let windowSize = [window.innerWidth, window.innerHeight]
//
//   const ratio = setSize[0]/setSize[1]
//   if (setSize[0] >= setSize[1]) {
//     if (setSize[0] > windowSize[0]*0.8) {
//       setSize[0] = windowSize[0]*0.8
//       setSize[1] = setSize[0]/ratio
//     }
//   } else if (setSize[0] < setSize[1]) {
//     if (setSize[1] > windowSize[1]*0.8) {
//       setSize[1] = windowSize[1]*0.8
//       setSize[0] = setSize[1]*ratio
//     }
//   }
//
//   let setCoord = [
//     (windowSize[0]-setSize[0])/2,
//     (windowSize[1]-setSize[1])/2,
//   ]
//
//   store.disabled = true
//
//   // transitioner.setAttribute("src", `${imgs[start]}`)
//   // await waitSrcImg(transitioner)
//   addImage(transitioner, imgs[start])
//
//   const transitionerImg = display.querySelector(".imagerTransitioner .imagerWrapImg")
//
//   // list.innerHTML = ""
//   // await addToList(imgs[start])
//
//   if (show) {
//     document.body.style.overflow = "hidden"
//     list.style.display = "none"
//     display.style.display = "flex"
//     transitioner.style.display = "flex"
//     transitionerImg.style.width = size[0]+"px"
//     transitionerImg.style.height = size[1]+"px"
//     transitionerImg.style.left = `${coords[0]}px`
//     transitionerImg.style.top = `${coords[1]}px`
//     await delay(10)
//     background.style.opacity = "1"
//     transitionerImg.style.width = setSize[0]+"px"
//     transitionerImg.style.height = setSize[1]+"px"
//     transitionerImg.style.left = `${setCoord[0]}px`
//     transitionerImg.style.top = `${setCoord[1]}px`
//     await waitElement(background, "opacity", "1")
//     await delay(100)
//     // transitioner.style.display = "none"
//     // transitionerImg.remove()
//     // list.style.display = "flex"
//   } else {
//     await delay(10)
//     transitionerImg.style.width = setSize[0]+"px"
//     transitionerImg.style.height = setSize[1]+"px"
//     transitionerImg.style.left = `${setCoord[0]}px`
//     transitionerImg.style.top = `${setCoord[1]}px`
//     await waitElement(transitioner, "width", setSize[0]+"px")
//     await delay(100)
//     transitionerImg.style.display = "flex"
//     list.style.display = "none"
//     await delay(10)
//     background.style.opacity = "0"
//     transitionerImg.style.width = size[0]+"px"
//     transitionerImg.style.height = size[1]+"px"
//     transitionerImg.style.left = `${coords[0]}px`
//     transitionerImg.style.top = `${coords[1]}px`
//     await waitElement(background, "opacity", "0")
//     await delay(100)
//     transitionerImg.style.backgroundImage = "unset"
//     transitionerImg.style.width = "0px"
//     transitionerImg.style.height = "0px"
//     transitionerImg.style.left = "0px"
//     transitionerImg.style.top = "0px"
//     transitionerImg.style.display = "none"
//     display.style.display = "none"
//     document.body.style.overflow = "auto"
//   }
//
//   store.disabled = false
//
//   // store.loading = true
//   // store.loadingDir = "right"
//   // store.loadingInd1 = start
//   // store.loadingInd2 = start
//   // loadingOtherImages()
// }
