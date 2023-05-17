import { $, addAttribute } from "browser-extension-utils"

export const alwaysShowHideButton = (replyElement: HTMLElement) => {
  const hideButton = $('a[onclick*="ignoreReply"]', replyElement)
  if (hideButton) {
    addAttribute(hideButton, "class", "emoji_button")
    hideButton.textContent = "🙈"
    const nextSibling = hideButton.nextSibling
    if (nextSibling && nextSibling.nodeType === 3 /* TEXT_NODE */) {
      nextSibling.textContent = ""
    }
  }
}
