import { $, addClass, hasClass, removeClass } from "browser-extension-utils"

export const stickyTopicButtons = (toggle = false) => {
  const main = $("#Main") || $(".content")
  if (!main) {
    return
  }

  if (hasClass(main, "content")) {
    const buttons = $(".inner", main)
    if (buttons) {
      addClass(buttons, "topic_buttons_mobile")
    }
  }

  if (toggle) {
    addClass(main, "sticky_topic_buttons")
  } else {
    removeClass(main, "sticky_topic_buttons")
  }
}
