import { $, $$ } from "browser-extension-utils"

export const getReplyElements = () => $$('.box .cell[id^="r_"]')

export const getFloorNumberElement = (replyElement: HTMLElement) =>
  $("span.no", replyElement)

export const getFloorNumber = (replyElement: HTMLElement) => {
  const numberElement = getFloorNumberElement(replyElement)
  if (numberElement) {
    return Number.parseInt(numberElement.textContent || "", 10) || undefined
  }

  return undefined
}
