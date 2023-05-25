import { $, $$ } from "browser-extension-utils"

import { getFloorNumberElement } from "../utils"

const getTopicReplies = async (topicId: string) => {
  const url = `${location.protocol}//${location.host}/api/replies/show.json?topic_id=${topicId}`

  const response = await fetch(url)

  if (response.status === 200) {
    return response.json()
  }
}

const updateReplyElements = (
  replies: Array<Record<string, unknown>>,
  page = 1
) => {
  const replyElements = $$('.cell[id^="r_"]')
  let index = 0
  let elementOffset = 0
  const offset = (page - 1) * 100
  const length = Math.min(replies.length - (page - 1) * 100, 100)
  for (let i = 0; i < length; i++) {
    const reply = replies[i + offset]
    const id = reply.id
    const element = $("#r_" + id)
    if (!element) {
      console.info(
        `[V2EX 回复增强] 屏蔽或隐藏的回复: #${
          index + offset + elementOffset + 1
        }, 用户 ID: ${reply.member?.username}, 回复 ID: ${
          reply.id
        }, 回复内容: ${reply.content}`
      )
      elementOffset++
      continue
    }

    element.found = true
    if (elementOffset > 0) {
      const numberElement = getFloorNumberElement(element)
      if (numberElement) {
        numberElement.textContent = String(index + offset + elementOffset + 1)
      }
    }

    index++
  }

  if (elementOffset > 0) {
    const v2exPolishModel = $(".v2p-model-mask")
    // 如果 API 返回的数据不是最新，实际页面的回复数会比 API 里的多。更新多的部分
    for (const element of replyElements) {
      if (element.found) {
        continue
      }

      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (v2exPolishModel && v2exPolishModel.contains(element)) {
        continue
      }

      const numberElement = getFloorNumberElement(element)
      if (numberElement) {
        const oldNumber = Number.parseInt(numberElement.textContent || "", 10)
        if (oldNumber) {
          numberElement.textContent = String(oldNumber + elementOffset)
        }
      }
    }

    // 触发更新事件
    window.dispatchEvent(new Event("floorNumberUpdated"))
  }
}

export const fixReplyFloorNumbers = async (topicId: string, page = 1) => {
  const replies = (await getTopicReplies(topicId)) as Array<
    Record<string, unknown>
  >

  if (replies) {
    updateReplyElements(replies, page)
  }
}
