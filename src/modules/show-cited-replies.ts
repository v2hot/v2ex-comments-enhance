import { $, $$, addClass } from "browser-extension-utils"

import { getFloorNumber } from "~utils"

import { filterRepliesPostedByMember } from "./filter-repies-by-user"

export const showCitedReplies = (replyElement: HTMLElement) => {
  // Don't show cited replies if v2ex plish extension is enabled
  if (replyElement.dataset.showCitedReplies || $(".v2p-color-mode-toggle")) {
    return
  }

  const floorNumber = getFloorNumber(replyElement)
  if (!floorNumber) {
    return
  }

  replyElement.dataset.showCitedReplies = "done"
  const content = $(".reply_content", replyElement)
  const memberLinks = $$('a[href^="/member/"]', content)
  for (const memberLink of memberLinks) {
    const textNode = memberLink.previousSibling
    if (
      textNode &&
      textNode.nodeType === 3 /* TEXT_NODE */ &&
      textNode.textContent &&
      textNode.textContent.endsWith("@")
    ) {
      // console.log(memberLink)
      const memberId = (/member\/(\w+)/.exec(memberLink.href) || [])[1]
      const replies = filterRepliesPostedByMember([memberId])
      let hasCitedReplies = false

      for (let i = replies.length - 1; i >= 0; i--) {
        const reply = replies[i]
        const floorNumber2 = getFloorNumber(reply)
        if (floorNumber2 >= floorNumber) {
          continue
        }

        if (floorNumber - floorNumber2 <= 1 && !hasCitedReplies) {
          // 如果引用的是前一个回复，并且没有其他引用的回复，则不显示
          break
        }

        // console.log(reply, floorNumber2)
        reply.id = reply.id.replace("related", "cited")
        addClass(reply, "cited_reply")
        // textNode.before(reply)
        memberLink.after(reply)
        hasCitedReplies = true
        break
      }
    }
  }
}
