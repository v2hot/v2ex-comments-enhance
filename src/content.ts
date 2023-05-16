import { $, $$ } from "browser-extension-utils"
import type { PlasmoCSConfig } from "plasmo"

import { fixReplyFloorNumbers } from "./modules/fix-reply-floor-numbers"

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

  if (/\/t\/\d+/.test(location.href)) {
    const matched = /\/t\/(\d+)(?:.+\bp=(\d+))?/.exec(location.href) || []
    const topicId = matched[1]
    const page = Number.parseInt(matched[2], 10) || 1

    const replyCount = $$("span.no").length
    const displayNumber =
      Number.parseInt(
        (/(\d+)\s条回复/.exec($(".fr + .gray").textContent || "") || [])[1],
        10
      ) || 0
    if (topicId && displayNumber > replyCount) {
      await fixReplyFloorNumbers(topicId, page)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
main()
