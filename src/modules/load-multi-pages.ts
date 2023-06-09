import {
  $,
  $$,
  addClass,
  addEventListener,
  createElement,
  hasClass,
  removeClass,
  runOnce,
  setAttribute,
  win as window,
} from "browser-extension-utils"

import { getSettingsValue } from "../components/settings"
import {
  getCachedReplyElements,
  getPagingNextButtons,
  getPagingPreviousButtons,
  getRepliesCount,
  parseUrl,
} from "../utils"
import { lazyLoadAvatars } from "./lazy-load-avatars"

const getTopicPage = async (topicId: string, page = 1) => {
  const url = `${location.protocol}//${location.host}/t/${topicId}?p=${page}`

  try {
    const response = await fetch(url)

    if (response.status === 200) {
      return await response.text()
    }
  } catch (error) {
    console.error(error)
  }
}

const getReplyElements = (html: string) => {
  const htmlNode = createElement("html")
  htmlNode.innerHTML = html
  return $$('.cell[id^="r_"]', htmlNode)
}

const insertReplyElementsToPage = (
  replyElements: HTMLElement[],
  page: number,
  inertPoint: HTMLElement
) => {
  if (!replyElements || replyElements.length === 0 || !inertPoint) {
    return
  }

  for (const replyElement of replyElements) {
    replyElement.dataset.page = String(page)
    if (getSettingsValue("lazyLoadAvatars")) {
      lazyLoadAvatars(replyElement)
    }

    inertPoint.before(replyElement)
  }
}

const gotoPage = (page: string | number | undefined, event: Event) => {
  if (!page) {
    return
  }

  history.pushState(null, null, `?p=${page}`)

  const main = $("#Main") || $(".content")
  const firstReply = $(`.cell[data-page="${page}"]`, main)
  if (firstReply) {
    firstReply.scrollIntoView({ block: "start" })
    event.preventDefault()
    event.stopImmediatePropagation()
  }

  for (const pagingElement of $$(".page_current,.page_normal")) {
    if (pagingElement.textContent === String(page)) {
      removeClass(pagingElement, "page_normal")
      addClass(pagingElement, "page_current")
    } else {
      removeClass(pagingElement, "page_current")
      addClass(pagingElement, "page_normal")
    }
  }

  for (const pageInput of $$(".page_input")) {
    pageInput.value = page
  }

  const repliesCount = getRepliesCount()
  const totalPage = Math.ceil(repliesCount / 100)

  for (const button of getPagingPreviousButtons()) {
    if (String(page) === "1") {
      addClass(button, "disable_now")
    } else {
      removeClass(button, "disable_now")
    }
  }

  for (const button of getPagingNextButtons()) {
    if (String(page) === String(totalPage)) {
      addClass(button, "disable_now")
    } else {
      removeClass(button, "disable_now")
    }
  }
}

const updatePagingElements = () => {
  runOnce("loadMultiPages:updatePagingElements", () => {
    for (const pagingElement of $$(".page_current,.page_normal")) {
      addEventListener(pagingElement, "click", (event) => {
        const page = pagingElement.textContent as string | undefined
        gotoPage(page, event)
      })
    }

    for (const pageInput of $$(".page_input")) {
      pageInput.removeAttribute("onkeydown")
      addEventListener(
        pageInput,
        "keydown",
        (event) => {
          if (event.keyCode === 13) {
            gotoPage(event.target?.value as string, event)
            return false
          }
        },
        true
      )
    }

    const buttons = [...getPagingPreviousButtons(), ...getPagingNextButtons()]
    for (const button of buttons) {
      button.removeAttribute("onclick")
      button.removeAttribute("onmouseover")
      button.removeAttribute("onmousedown")
      button.removeAttribute("onmouseleave")
      addEventListener(
        button,
        "mouseover",
        (event) => {
          if (!hasClass(button, "disable_now")) {
            addClass(button, "hover_now")
          }

          event.preventDefault()
          event.stopImmediatePropagation()
        },
        true
      )
      addEventListener(
        button,
        "mousedown",
        (event) => {
          if (!hasClass(button, "disable_now")) {
            addClass(button, "active_now")
          }

          event.preventDefault()
          event.stopImmediatePropagation()
        },
        true
      )
      addEventListener(
        button,
        "mouseleave",
        (event) => {
          removeClass(button, "hover_now")
          removeClass(button, "active_now")
          event.preventDefault()
          event.stopImmediatePropagation()
        },
        true
      )

      addEventListener(
        button,
        "click",
        (event) => {
          if (!hasClass(button, "disable_now")) {
            const page = Number.parseInt(
              ($(".page_input")?.value as string) || "",
              10
            )
            if (page) {
              if (hasClass(button, "normal_page_right")) {
                gotoPage(page + 1, event)
              } else {
                gotoPage(page - 1, event)
              }
            }
          }

          setTimeout(() => {
            removeClass(button, "hover_now")
            removeClass(button, "active_now")
          }, 100)
          event.preventDefault()
          event.stopImmediatePropagation()
        },
        true
      )
    }
  })
}

export const loadMultiPages = async () => {
  const repliesCount = getRepliesCount()
  if (repliesCount > 100) {
    const result = parseUrl()
    const topicId = result.topicId
    const currentPage = result.page
    const totalPage = Math.ceil(repliesCount / 100)
    const orgReplyElements = getCachedReplyElements()
    const firstReply = orgReplyElements[0]
    const pageElement = orgReplyElements[orgReplyElements.length - 1]
      .nextElementSibling as HTMLElement

    addClass(pageElement, "sticky_paging")
    updatePagingElements()

    for (const replyElement of orgReplyElements) {
      replyElement.dataset.page = String(currentPage)
    }

    for (let i = 1; i <= totalPage; i++) {
      if (i === currentPage) {
        continue
      }

      console.info("[V2EX.REP] Fetching page", i)
      // eslint-disable-next-line no-await-in-loop
      const html = await getTopicPage(topicId, i)
      if (html) {
        const replyElements = getReplyElements(html)
        insertReplyElementsToPage(
          replyElements,
          i,
          i < currentPage ? firstReply : pageElement
        )
        // 触发更新事件
        window.dispatchEvent(new Event("replyElementsLengthUpdated"))
      }
    }
  }
}
