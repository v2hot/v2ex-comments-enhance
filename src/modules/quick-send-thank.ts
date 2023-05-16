import { $, getAttribute, setAttribute } from "browser-extension-utils"

export const quickSendThank = (replyElement: HTMLElement) => {
  const thankButton = $('a[onclick*="thankReply"]', replyElement)
  if (thankButton) {
    const onclick = getAttribute(thankButton, "onclick")
    setAttribute(
      thankButton,
      "onclick",
      onclick.replace(/.*(thankReply\(.+\)).*/, "$1")
    )
    // eslint-disable-next-line no-script-url
    setAttribute(thankButton, "href", "javascript:;")
  }
}
