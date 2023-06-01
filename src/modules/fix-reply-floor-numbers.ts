import { $ } from "browser-extension-utils"

import { getFloorNumberElement, getReplyElements } from "../utils"

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
  let floorNumberOffset = 0
  const dataOffSet = (page - 1) * 100
  const length = Math.min(replies.length - (page - 1) * 100, 100)
  for (let i = 0; i < length; i++) {
    const reply = replies[i + dataOffSet]
    const id = reply.id
    const element = $("#r_" + id)
    if (!element) {
      console.info(
        `[V2EX.REP] 屏蔽或隐藏的回复: #${i + dataOffSet + 1}, 用户 ID: ${
          reply.member?.username
        }, 回复 ID: ${reply.id}, 回复内容: ${reply.content}`
      )
      floorNumberOffset++
      continue
    }

    element.found = true
    if (floorNumberOffset > 0) {
      const numberElement = getFloorNumberElement(element)
      if (numberElement) {
        numberElement.textContent = String(i + dataOffSet + 1)
      }
    }
  }

  if (floorNumberOffset > 0) {
    const replyElements = getReplyElements()
    // 如果 API 返回的数据不是最新，实际页面的回复数会比 API 里的多。更新多的部分
    for (const element of replyElements) {
      if (element.found) {
        continue
      }

      const numberElement = getFloorNumberElement(element)
      if (numberElement) {
        const oldNumber = Number.parseInt(numberElement.textContent || "", 10)
        if (oldNumber) {
          numberElement.textContent = String(oldNumber + floorNumberOffset)
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
