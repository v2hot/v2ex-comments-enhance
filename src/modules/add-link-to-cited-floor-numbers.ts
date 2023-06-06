import {
  $,
  $$,
  addEventListener,
  createElement,
  doc,
  hasClass,
} from "browser-extension-utils"

import {
  getMemberIdFromMemberLink,
  getReplyElementByMemberIdAndFloorNumber,
  runOnce,
} from "../utils"

export const addlinkToCitedFloorNumbers = (replyElement: HTMLElement) => {
  const content = $(".reply_content", replyElement)
  const memberLinks = $$('a[href^="/member/"]', content) as HTMLAnchorElement[]
  for (const memberLink of memberLinks) {
    const previousTextNode = memberLink.previousSibling
    const nextTextNode = memberLink.nextSibling
    const memberId = getMemberIdFromMemberLink(memberLink)
    if (
      previousTextNode &&
      previousTextNode.nodeType === 3 /* TEXT_NODE */ &&
      previousTextNode.textContent &&
      previousTextNode.textContent.endsWith("@") &&
      nextTextNode &&
      nextTextNode.nodeType === 3 /* TEXT_NODE */ &&
      nextTextNode.textContent &&
      memberId
    ) {
      const textContent = nextTextNode.textContent
      if (!/^\s#\d+/.test(textContent)) {
        continue
      }

      const match = /^(\s*)(#(\d+))(.*)/.exec(textContent)
      if (!match) {
        continue
      }

      if (match[1]) {
        nextTextNode.before(doc.createTextNode(match[1]))
      }

      if (match[2]) {
        const element = createElement("a", {
          class: "cited_floor_number",
          textContent: match[2],
          "data-member-id": memberId,
          "data-floor-number": match[3],
        })
        nextTextNode.before(element)
      }

      nextTextNode.textContent = match[4]
    }
  }

  runOnce("addlinkToCitedFloorNumbers:document-onclick", () => {
    addEventListener(doc, "click", (event) => {
      const target = event.target as HTMLElement
      if (hasClass(target, "cited_floor_number")) {
        const memberId = target.dataset.memberId
        const floorNumber = Number.parseInt(
          target.dataset.floorNumber || "",
          10
        )
        const citedReplyElement = getReplyElementByMemberIdAndFloorNumber(
          memberId,
          floorNumber
        )
        if (citedReplyElement) {
          citedReplyElement.scrollIntoView({ block: "start" })
          event.preventDefault()
          event.stopPropagation()
        }
      }
    })
  })
}
