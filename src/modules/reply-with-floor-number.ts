import { $, getAttribute, setAttribute } from "browser-extension-utils"

export const replyWithFloorNumber = (replyElement: HTMLElement) => {
  const replyButton = $('a[onclick^="replyOne"]', replyElement)
  const numberElement = $("span.no", replyElement)
  if (replyButton && numberElement) {
    // eslint-disable-next-line no-script-url
    setAttribute(replyButton, "href", "javascript:;")

    const onclick = getAttribute(replyButton, "onclick") || ""
    const number = numberElement.textContent
    if (number) {
      setAttribute(
        replyButton,
        "onclick",
        onclick.replace(
          /replyOne\('(\w+)(?: .*)?'\)/,
          `replyOne('$1 #${number}')`
        )
      )
      // To re-bind click event
      // eslint-disable-next-line no-self-assign
      replyButton.outerHTML = replyButton.outerHTML
    }
  }
}
