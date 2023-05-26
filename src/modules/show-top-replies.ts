import { $, $$, addEventListener, createElement } from "browser-extension-utils"

import { getFloorNumber, getReplyElements } from "../utils"

export const showTopReplies = (toggle) => {
  const element = $("#top_replies")
  if (element) {
    const sep20 = element.previousElementSibling
    if (sep20?.classList.contains("sep20")) {
      sep20.remove()
    }

    element.remove()
  }

  if (!toggle) {
    $("#Wrapper")?.classList.remove("sticky_rightbar")
    return
  }

  $("#Wrapper")?.classList.add("sticky_rightbar")

  const v2exPolishModel = $(".v2p-model-mask")
  const replyElements = getReplyElements()
    .filter((reply) => {
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (v2exPolishModel && v2exPolishModel.contains(reply)) {
        return false
      }

      /* v2ex polish: .v2p-icon-heart */
      const heartElement = $('img[alt="❤️"],.v2p-icon-heart', reply)
      if (heartElement) {
        /* handle v2ex polish nested replies */
        const childReplies = $$('.cell[id^="r_"]', reply)
        for (const child of childReplies) {
          if (child.contains(heartElement)) {
            return false
          }
        }

        const thanked = Number.parseInt(
          heartElement.nextSibling?.textContent || "0",
          10
        )
        if (thanked > 0) {
          reply.thanked = thanked
          return true
        }
      }

      return false
    })
    .sort((a, b) => {
      if (b.thanked === a.thanked) {
        const floorNumberA = getFloorNumber(a) || 0
        const floorNumberB = getFloorNumber(b) || 0
        return floorNumberA - floorNumberB
      }

      return b.thanked - a.thanked
    })
  // .slice(0, 10)

  if (replyElements.length > 0) {
    const box = createElement("div", {
      class: "box",
      id: "top_replies",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      innerHTML: `<div class="cell"><div class="fr"></div><span class="fade">当前页热门回复</span></div>`,
    })

    for (const element of replyElements) {
      const cloned = element.cloneNode(true)
      cloned.id = "top_" + element.id
      const floorNumber = $(".no", cloned)
      const toolbox = $(".fr", cloned)
      if (toolbox && floorNumber) {
        const floorNumber2 = createElement("a", {
          class: "no",
          textContent: floorNumber.textContent,
        })
        addEventListener(floorNumber2, "click", () => {
          element.scrollIntoView({ block: "start" })
        })
        toolbox.innerHTML = ""
        toolbox.append(floorNumber2)
      }

      const ago = $(".ago", cloned)
      if (ago) {
        ago.before(createElement("br"))
      }

      /* fix v2ex polish start */
      const cells = $$(".cell", cloned)
      for (const cell of cells) {
        cell.remove()
      }
      /* fix v2ex polish end */

      box.append(cloned)
    }

    const appendPosition = $("#Rightbar .box")
    const sep20 = createElement("div", {
      class: "sep20",
    })
    if (appendPosition) {
      appendPosition.after(box)
      appendPosition.after(sep20)
    }
  }
}
