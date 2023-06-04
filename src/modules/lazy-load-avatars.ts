import { $, getAttribute, setAttribute } from "browser-extension-utils"

export const lazyLoadAvatars = (replyElement: HTMLElement) => {
  const avatar = $("img.avatar", replyElement)
  if (avatar) {
    if (getAttribute(avatar, "loading") === "lazy") {
      return
    }

    setAttribute(avatar, "loading", "lazy")
    const src = getAttribute(avatar, "src")
    setAttribute(
      avatar,
      "src",
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    )
    setTimeout(() => {
      setAttribute(avatar, "src", src)
    })
  }
}
