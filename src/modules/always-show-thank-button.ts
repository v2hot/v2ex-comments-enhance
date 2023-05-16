import { $, setStyle } from "browser-extension-utils"

export const alwaysShowThankButton = (replyElement: HTMLElement) => {
  const thankButton = $('a[onclick*="thankReply"]', replyElement)
  if (thankButton) {
    setStyle(thankButton, {
      visibility: "visible",
    })
    thankButton.textContent = "🙏"
  }
}
