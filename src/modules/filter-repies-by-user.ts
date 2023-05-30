import {
  $,
  $$,
  addElement,
  addEventListener,
  doc,
  removeEventListener,
  setStyle,
} from "browser-extension-utils"

import {
  cloneReplyElement,
  getFloorNumber,
  getReplyElements,
  getReplyId,
} from "../utils"

let timeoutId: number | undefined

const showModalReplies = (
  replies: HTMLElement[],
  referElement: HTMLElement | undefined
) => {
  const main = $("#Main")
  if (!main) {
    return
  }

  if (!referElement) {
    return
  }

  const replyElement = referElement.closest("#Main .cell") as
    | HTMLElement
    | undefined

  const relatedBox = replyElement?.closest(".related_replies")
  if (replyElement && relatedBox) {
    const lastRelatedRepliesBox = $$(".related_replies_container").pop()
    if (lastRelatedRepliesBox?.contains(replyElement)) {
      // Do nothing
    } else {
      closeModal(true)
    }
  } else {
    closeModal()
  }

  const container = addElement(main, "div", {
    class: "related_replies_container",
  })

  const box = addElement(container, "div", {
    class: "box related_replies related_replies_before",
  })

  const box2 = addElement(container, "div", {
    class: "box related_replies related_replies_after",
  })

  box.innerHTML = "" // `<div class="cell"><div class="fr"></div><span class="fade">关联回复</span></div>`
  box2.innerHTML = ""

  const replyId = replyElement ? getReplyId(replyElement) : undefined
  const floorNumber = replyElement ? getFloorNumber(replyElement) : 0
  let beforeCount = 0
  let afterCount = 0

  for (const reply of replies) {
    const replyId2 = getReplyId(reply)
    const floorNumber2 = getFloorNumber(reply)
    if (replyId === replyId2) {
      continue
    }

    if (floorNumber > floorNumber2) {
      box.append(reply)
      beforeCount++
    } else {
      box2.append(reply)
      afterCount++
    }
  }

  if (beforeCount === 0 && afterCount === 0) {
    addElement(box, "div", {
      class: "cell",
      innerHTML: `<span class="fade">本页面没有其他回复</span>`,
    })
    container.classList.add("no_replies")
    addEventListener(
      referElement,
      "mouseout",
      () => {
        container.remove()
      },
      { once: true }
    )
  }

  if (beforeCount === 0 && afterCount > 0) {
    addElement(box, "div", {
      class: "cell",
      innerHTML: `<span class="fade">这条回复后面还有 ${afterCount} 条回复</span>`,
    })
  }

  if (beforeCount > 0 && afterCount === 0) {
    addElement(box2, "div", {
      class: "cell",
      innerHTML: `<span class="fade">这条回复前面还有 ${beforeCount} 条回复</span>`,
    })
  }

  if (replyElement) {
    const offsetTop = relatedBox
      ? relatedBox.offsetTop + replyElement.offsetTop
      : replyElement.offsetTop
    const height = box.offsetHeight || box.clientHeight
    const height2 = replyElement.offsetHeight || replyElement.clientHeight
    // console.log(offsetTop, replyElement)
    setStyle(box, { top: offsetTop - height + "px" })
    setStyle(box2, { top: offsetTop + height2 + "px" })
  } else if (afterCount > 0) {
    const headerElement = referElement?.closest("#Main .header") as
      | HTMLElement
      | undefined
    if (headerElement) {
      const offsetTop = headerElement.offsetTop
      const height2 = headerElement.offsetHeight || headerElement.clientHeight
      setStyle(box2, { top: offsetTop + height2 + "px" })
      box.remove()
    } else {
      const firstReply = $('.box .cell[id^="r_"]')
      const offsetTop = firstReply
        ? Math.max(firstReply.offsetTop, window.scrollY)
        : window.scrollY
      setStyle(box, { top: offsetTop + "px" })
      setStyle(box2, { top: offsetTop + "px" })
    }
  } else {
    box.remove()
    box2.remove()
  }
}

const filterRepliesPostedByMember = (memberIds: string[]) => {
  const replies: HTMLElement[] = []
  const replyElements = getReplyElements()
  for (const replyElement of replyElements) {
    const memberLink = $('a[href^="/member/"]', replyElement)
    if (!memberLink) {
      continue
    }

    const memberId = (/member\/(\w+)/.exec(memberLink.href) || [])[1]
    if (memberIds.includes(memberId)) {
      // console.log(replyElement)
      const cloned = cloneReplyElement(replyElement)
      cloned.id = "related_" + replyElement.id
      replies.push(cloned)
    }
  }

  return replies
}

const onMouseOver = (event) => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = undefined
  }

  const memberLink = event.target
  timeoutId = setTimeout(() => {
    // console.log(memberLink)
    const memberId = (/member\/(\w+)/.exec(memberLink.href) || [])[1]
    if (memberId) {
      // console.log(memberId)
      const replies = filterRepliesPostedByMember([memberId])
      showModalReplies(replies, memberLink)
    }
  }, 100)
}

const onMouseOut = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = undefined
  }
}

const closeModal = (closeLast = false) => {
  for (const element of $$(".related_replies_container").reverse()) {
    element.remove()
    if (closeLast) {
      break
    }
  }
}

const onDocumentClick = (event) => {
  const target = event.target
  const floorNumberElement = target.closest(".related_replies a.no")
  if (floorNumberElement) {
    closeModal()
    return
  }

  const lastRelatedRepliesBox = $$(".related_replies_container").pop()
  const relatedReply = target.closest(".related_replies .cell")
  if (relatedReply && lastRelatedRepliesBox?.contains(relatedReply)) {
    return
  }

  const relatedRepliesBox = target.closest(".related_replies")
  if (relatedRepliesBox) {
    closeModal(true)
    return
  }

  closeModal()
}

const onDocumentKeyDown = (event) => {
  if (event.defaultPrevented) {
    return // 如果事件已经在进行中，则不做任何事。
  }

  switch (event.key) {
    case "Escape": {
      // 按“ESC”键时要做的事。
      closeModal(true)
      break
    }

    default: {
      return
    } // 什么都没按就退出吧。
  }

  // 取消默认动作，从而避免处理两次。
  event.preventDefault()
}

export const filterRepliesByUser = (toogle: boolean) => {
  if (toogle) {
    const memberLinks = $$('a[href^="/member/"]')
    for (const memberLink of memberLinks) {
      if (!memberLink.boundEvent) {
        addEventListener(memberLink, "mouseover", onMouseOver, true)
        addEventListener(memberLink, "mouseout", onMouseOut)
        memberLink.boundEvent = true
      }
    }

    if (!doc.boundEvent) {
      addEventListener(doc, "click", onDocumentClick, true)
      addEventListener(doc, "keydown", onDocumentKeyDown, true)
      doc.boundEvent = true
    }
  } else if (doc.boundEvent) {
    // if toogle === false
    closeModal()
    removeEventListener(doc, "click", onDocumentClick, true)
    removeEventListener(doc, "keydown", onDocumentKeyDown, true)
    doc.boundEvent = false

    const memberLinks = $$('a[href^="/member/"]')
    for (const memberLink of memberLinks) {
      if (memberLink.boundEvent) {
        removeEventListener(memberLink, "mouseover", onMouseOver, true)
        removeEventListener(memberLink, "mouseout", onMouseOut)
        memberLink.boundEvent = false
      }
    }
  }
}
