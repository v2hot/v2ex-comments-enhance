import { $, addAttribute } from "browser-extension-utils"

export const alwaysShowThankButton = (replyElement: HTMLElement) => {
  const thankButton = $('a[onclick*="thankReply"]', replyElement)
  if (thankButton) {
    addAttribute(thankButton, "class", "emoji_button")
    thankButton.textContent = "🙏"
  }
}
