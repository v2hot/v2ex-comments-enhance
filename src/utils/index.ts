import { $, $$ } from "browser-extension-utils"

// 从含有第一个评论的 box div 查询
export const getReplyElements = () => {
  const firstReply = $('.box .cell[id^="r_"]')
  if (firstReply?.parentElement) {
    return $$('.cell[id^="r_"]', firstReply.parentElement)
  }

  return []
}

export const getReplyId = (replyElement: HTMLElement | undefined) =>
  replyElement ? replyElement.id.replace(/((top|related)_)?r_/, "") : ""

export const getFloorNumberElement = (replyElement: HTMLElement | undefined) =>
  replyElement ? $(".no", replyElement) : undefined

export const getFloorNumber = (replyElement: HTMLElement | undefined) => {
  const numberElement = getFloorNumberElement(replyElement)
  if (numberElement) {
    return Number.parseInt(numberElement.textContent || "", 10) || 0
  }

  return 0
}
