import { $, $$ } from "browser-extension-utils"

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
    const element = replyElements[index]
    const elementId = element
      ? Number.parseInt(element.id.replace("r_", ""), 10)
      : -1
    if (id !== elementId) {
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

    const numberElement = $("span.no", element)
    if (numberElement && elementOffset > 0) {
      numberElement.textContent = String(index + offset + elementOffset + 1)
    }

    index++
  }

  for (let i = index; i < replyElements.length; i++) {
    const element = replyElements[i]
    const numberElement = $("span.no", element)
    if (numberElement && elementOffset > 0) {
      numberElement.textContent = String(i + offset + elementOffset + 1)
    }
  }

  if (elementOffset > 0) {
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
