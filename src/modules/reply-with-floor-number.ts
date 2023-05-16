import { $, getAttribute, setAttribute } from "browser-extension-utils"

export const replyWithFloorNumber = (replyElement: HTMLElement) => {
  const replyButton = $('a[onclick^="replyOne"]', replyElement)
  const numberElement = $("span.no", replyElement)
  if (replyButton && numberElement) {
    const number = numberElement.textContent
    const onclick = getAttribute(replyButton, "onclick") || ""
    if (number) {
      setAttribute(
        replyButton,
        "onclick",
        onclick.replace(
          /replyOne\('(\w+)(?: .*)?'\)/,
          `replyOne('$1 #${number}')`
        )
      )
    }

    // eslint-disable-next-line no-script-url
    setAttribute(replyButton, "href", "javascript:;")
  }
}
