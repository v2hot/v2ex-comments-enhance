import { $, $$, addEventListener, addStyle } from "browser-extension-utils"
import styleText from "data-text:./content.scss"
import type { PlasmoCSConfig } from "plasmo"

import { alwaysShowHideButton } from "./modules/always-show-hide-button"
import { alwaysShowThankButton } from "./modules/always-show-thank-button"
import { fixReplyFloorNumbers } from "./modules/fix-reply-floor-numbers"
import { quickHideReply } from "./modules/quick-hide-reply"
import { quickSendThank } from "./modules/quick-send-thank"
import { replyWithFloorNumber } from "./modules/reply-with-floor-number"

export const config: PlasmoCSConfig = {
  matches: ["https://*.v2ex.com/*"],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  run_at: "document_end",
}

async function main() {
  if (!document.body) {
    setTimeout(main, 100)
    return
  }

  addStyle(styleText)

  if (/\/t\/\d+/.test(location.href)) {
    const replyElements = $$('.cell[id^="r_"]')
    for (const replyElement of replyElements) {
      replyWithFloorNumber(replyElement)
      quickSendThank(replyElement)
      quickHideReply(replyElement)
      alwaysShowThankButton(replyElement)
      alwaysShowHideButton(replyElement)
    }

    const matched = /\/t\/(\d+)(?:.+\bp=(\d+))?/.exec(location.href) || []
    const topicId = matched[1]
    const page = Number.parseInt(matched[2], 10) || 1

    const replyCount = $$("span.no").length
    const displayNumber =
      Number.parseInt(
        (/(\d+)\s条回复/.exec($(".fr + .gray").textContent || "") || [])[1],
        10
      ) || 0
    addEventListener(window, "floorNumberUpdated", () => {
      const replyElements = $$('.cell[id^="r_"]')
      for (const replyElement of replyElements) {
        replyWithFloorNumber(replyElement)
      }
    })
    if (topicId && displayNumber > replyCount) {
      await fixReplyFloorNumbers(topicId, page)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
main()
