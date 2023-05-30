import {
  $,
  createElement,
  getAttribute,
  setAttribute,
} from "browser-extension-utils"

export const quickSendThank = (replyElement: HTMLElement) => {
  const thankButton = $('a[onclick*="thankReply"]', replyElement)
  if (thankButton) {
    const replyId = replyElement.id.replace("r_", "")
    const onclick = getAttribute(thankButton, "onclick")
    if (!onclick.includes("confirm")) {
      return
    }

    setAttribute(
      thankButton,
      "onclick",
      onclick.replace(/.*(thankReply\(.+\)).*/, "$1")
    )
    // eslint-disable-next-line no-script-url
    setAttribute(thankButton, "href", "javascript:;")

    /* fix v2ex polish start */
    if (thankButton.parentElement?.classList.contains("v2p-controls")) {
      const div = createElement("div", {
        id: "thank_area_" + replyId,
      })
      thankButton.after(div)

      const hideButton = $('a[onclick*="ignoreReply"]', replyElement)
      if (hideButton) {
        div.append(hideButton)
      }

      div.append(thankButton)
    }
    /* fix v2ex polish end */

    // eslint-disable-next-line no-self-assign
    thankButton.outerHTML = thankButton.outerHTML
  }
}
