"use strict"
// SELECT ELEMENT ------------------------------------------------
// SECTION

const wrapper = document.querySelector(".wrapper")
const container = document.querySelector(".content-container")
const contentBefore = document.querySelector(".content-before")
const contentAfter = document.querySelector(".content-after")
const contents = document.querySelectorAll(".content")
const tatVideo = document.querySelector(".tat-video")

// SLIDE EFFECT ------------------------------------------------
// SECTION
let slider
let clicking = false

const createSlider = (content) => {
  slider = document.createElement("div")
  slider.classList.add("slider")
  slider.innerHTML = `<i class="fas fa-arrows-alt-h"></i>`
  content.parentNode.insertAdjacentElement("afterbegin", slider)
  slider.style.top = `${contentAfter.offsetHeight / 2}px`
  slider.style.left = `50%`
}

createSlider(contentBefore)

const getCursorPos = (e) =>
  e.clientX - contentBefore.getBoundingClientRect().left

const renderSlide = function (pos) {
  const percent = pos ? 100 - (pos / contentBefore.offsetWidth) * 100 : 50
  contentBefore.style.clipPath = `inset(0 ${percent}% 0 0)`
  slider.style.left = `${100 - percent}%`

  if (100 - percent > 25 && 100 - percent < 75)
    contents.forEach((content) => content.classList.remove("disactive"))
  if (100 - percent >= 75) contentAfter.classList.add("disactive")
  if (100 - percent <= 25) contentBefore.classList.add("disactive")
}

const slideMove = function (e) {
  if (!clicking) return

  let pos = getCursorPos(e)
  if (pos < 80) pos = 80
  if (pos > contentBefore.offsetWidth - 80) pos = contentBefore.offsetWidth - 80

  renderSlide(pos)
}

const slideStart = function (e) {
  // e.preventDefault()
  clicking = true
  window.addEventListener("mousemove", slideMove)
}

const slideFinish = function () {
  clicking = false
}

container.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("slider")) slideStart(e)
})

window.addEventListener("mouseup", slideFinish)

// GENERATE TRANSLATE GROUP ------------------------------------------------
// SECTION
let initNum = 1
const MAX = 3
let isItBefore = true

const generateMarkup = (isItBefore) =>
  `
      <div class="translate-group">
        <div class="input-group">
          <span>${isItBefore ? "string" : "unicode"}</span>
          <input type="text"  class="input ${
            isItBefore ? "string" : "unicode"
          }" />
        </div>
        <i class="fas fa-arrow-down"></i>
        <div class="output-group">
          <span>${isItBefore ? "unicode" : "string"}</span>
          <div class="output ${isItBefore ? "unicode" : "string"}"></div>
        </div>
      </div>
    `

const renderInputGroup = function (num = initNum, [...container] = contents) {
  if (num > MAX || num < 1) return
  let numOfInputGroup = Array.from({ length: num }, () => [])
  let html = []

  if (container.length === 2) {
    html.push(numOfInputGroup.map((el) => generateMarkup(isItBefore)).join(""))
    html.push(numOfInputGroup.map((el) => generateMarkup(!isItBefore)).join(""))
  } else {
    container.length === 1 && container[0].classList.contains("content-before")
      ? (isItBefore = true)
      : (isItBefore = false)

    html.push(numOfInputGroup.map((el) => generateMarkup(isItBefore)).join(""))
  }

  container.forEach((content) => {
    const main = content.querySelector(".content-main")
    main.innerHTML = ""

    if (container.length === 2)
      main.insertAdjacentHTML(
        "beforeend",
        content.classList.contains("content-before") ? html[0] : html[1]
      )
    else main.insertAdjacentHTML("beforeend", html[0])
  })

  slider.style.top = `${contentBefore.offsetHeight / 2}px`
  const inputs = wrapper.querySelectorAll(".input")
  inputs.forEach((input) => {
    input.addEventListener("paste", detectEmoji)
    input.addEventListener("input", resetMaxlength)
  })
}

function resetMaxlength(e) {
  if (e.target.classList.contains("string"))
    e.target.setAttribute("maxlength", e.target.value.length || 1)
}

function detectEmoji(e) {
  const paste = e.clipboardData.getData("text")
  if (!/\p{Emoji}/u.test(paste)) e.target.setAttribute("maxlength", "1")
  else e.target.setAttribute("maxlength", `${paste.length}`)
}

renderInputGroup()

wrapper.addEventListener("keydown", (e) => {
  if (e.target.classList.contains("input--num") && e.key === "Enter") {
    // select according input field and parent content box
    const input = e.target
    const parentContentBox = e.target.closest(".content")

    renderInputGroup(input.value, [parentContentBox])

    // clear input field
    input.value = ""
  }
})

// TRANSLATE FUNCTION ------------------------------------------------
// SECTION
const stringToUnicode = function (inputs, outputs) {
  inputs.forEach((input, i) => {
    if (input.value.trim().length === 0) outputs[i].textContent = ""
    else
      outputs[i].textContent = `U+${input.value
        .codePointAt()
        .toString(16)
        .toUpperCase()}`
  })
}

const unicodeToString = function (inputs, outputs) {
  inputs.forEach((input, i) => {
    if (input.value.trim().length === 0) {
      outputs[i].textContent = ""
      return
    }

    if (input.value.startsWith("0x"))
      outputs[i].textContent = String.fromCodePoint(input.value)
    if (input.value.toUpperCase().startsWith("U+"))
      outputs[i].textContent = String.fromCodePoint(`0x${input.value.slice(2)}`)
    if (
      !input.value.toUpperCase().startsWith("U+") &&
      !input.value.startsWith("0x")
    )
      outputs[i].textContent = String.fromCodePoint(`0x${input.value}`)

    if (outputs[i].textContent === "完") tatVideo.play()
  })
}

const translate = function (target) {
  const inputs = [
    ...target
      .closest(".content")
      .querySelector(".content-main")
      .querySelectorAll(".input"),
  ]

  const outputs = [
    ...target
      .closest(".content")
      .querySelector(".content-main")
      .querySelectorAll(".output"),
  ]

  target.closest(".content").classList.contains("content-before")
    ? stringToUnicode(inputs, outputs)
    : unicodeToString(inputs, outputs)
}

const reset = function (target) {
  const inputs = target.closest(".content").querySelectorAll(".input")
  const outputs = target.closest(".content").querySelectorAll(".output")

  inputs.forEach((input, i) => {
    input.value = ""
    outputs[i].textContent = ""
  })
}

wrapper.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn--translate")) translate(e.target)
  if (e.target.classList.contains("btn--reset")) reset(e.target)
})

// GENERATE BG CARD ------------------------------------------------
// SECTION

const cardContainer = document.querySelector(".card-container")

const numOfCard = 100

const cardArr = Array.from({ length: numOfCard }, () => [])

const createCard = function () {
  const html = cardArr
    .map((card) => {
      const random = Math.floor(Math.random() * 79) + 128512
      return `
      <div class="bg-card">
        <div class="icon">${String.fromCodePoint(random)}</div>
        <div class="text">U+${random.toString(16).toUpperCase()}</div>
      </div>  
    `
    })
    .join("")

  cardContainer.insertAdjacentHTML("beforeend", html)
}

createCard()
