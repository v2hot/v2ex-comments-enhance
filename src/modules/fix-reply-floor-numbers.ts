import { $, $$ } from "browser-extension-utils"

import {
  getFloorNumberElement,
  getReplyElements,
  getReplyId,
  parseUrl,
} from "../utils"

const getTopicReplies = async (topicId: string, replyCount?: number) => {
  const url = `${location.protocol}//${
    location.host
  }/api/replies/show.json?topic_id=${topicId}${
    replyCount ? "&replyCount=" + replyCount : ""
  }`

  const response = await fetch(url)

  if (response.status === 200) {
    return response.json()
  }
}

const updateFloorNumber = (
  replyElement: HTMLElement,
  newFloorNumber: number
) => {
  const numberElement = getFloorNumberElement(replyElement)
  if (numberElement) {
    const orgNumber = Number.parseInt(
      numberElement.dataset.orgNumber || numberElement.textContent || "",
      10
    )
    if (orgNumber) {
      numberElement.dataset.orgNumber = String(orgNumber)
    }

    numberElement.textContent = String(newFloorNumber)
  }
}

const updateAllFloorNumberById = (id: string, newFloorNumber: number) => {
  // 替换所有其他回复 ID 相同的回复，包括热门回复、关联回复、引用回复等
  for (const replyElement of $$(
    `#r_${id},
     #top_r_${id},
     #related_r_${id},
     #cited_r_${id}`
  )) {
    updateFloorNumber(replyElement, newFloorNumber)
  }
}

const updateReplyElements = (
  replies: Array<Record<string, unknown>>,
  replyElements: HTMLElement[],
  page = 1
) => {
  let floorNumberOffset = 0
  let hideCount = 0
  const dataOffSet = (page - 1) * 100
  const length = Math.min(replies.length - (page - 1) * 100, 100)
  for (let i = 0; i < length; i++) {
    const realFloorNumber = i + dataOffSet + 1
    const reply = replies[i + dataOffSet]
    const id = reply.id as string
    const element = $("#r_" + id)
    if (!element) {
      console.info(
        `[V2EX.REP] 屏蔽或隐藏的回复: #${realFloorNumber}, 用户 ID: ${reply.member?.username}, 回复 ID: ${reply.id}, 回复内容: ${reply.content}`
      )
      hideCount++
      continue
    }

    element.found = true

    if (hideCount > 0) {
      const numberElement = getFloorNumberElement(element)
      if (numberElement) {
        const orgNumber = Number.parseInt(
          numberElement.dataset.orgNumber || numberElement.textContent || "",
          10
        )
        if (orgNumber) {
          numberElement.dataset.orgNumber = String(orgNumber)
          floorNumberOffset = realFloorNumber - orgNumber
        }

        numberElement.textContent = String(realFloorNumber)
      }

      updateAllFloorNumberById(id, realFloorNumber)
    }
  }

  console.info(
    "[V2EX.REP] floorNumberOffset",
    floorNumberOffset,
    "hideCount",
    hideCount
  )

  if (floorNumberOffset > 0) {
    // 如果 API 返回的数据不是最新，实际页面的回复数会比 API 里的多。更新多的部分
    for (const element of replyElements) {
      if (element.found) {
        continue
      }

      const id = getReplyId(element)
      const numberElement = getFloorNumberElement(element)
      if (numberElement) {
        const orgNumber = Number.parseInt(
          numberElement.dataset.orgNumber || numberElement.textContent || "",
          10
        )
        if (orgNumber) {
          numberElement.dataset.orgNumber = String(orgNumber)
          numberElement.textContent = String(orgNumber + floorNumberOffset)

          updateAllFloorNumberById(id, orgNumber + floorNumberOffset)
        }
      }
    }
  }

  // 触发更新事件
  window.dispatchEvent(new Event("floorNumberUpdated"))
}

let isRunning = false

export const fixReplyFloorNumbers = async () => {
  if (isRunning) {
    return
  }

  isRunning = true
  const result = parseUrl()
  const topicId = result.topicId
  const page = result.page

  if (!topicId) {
    return
  }

  const replyElements = getReplyElements()

  const displayNumber =
    Number.parseInt(
      (/(\d+)\s条回复/.exec($(".box .cell .gray")?.textContent || "") || [])[1],
      10
    ) || 0

  if (
    displayNumber === replyElements.length ||
    displayNumber % 100 === replyElements.length ||
    replyElements.length === 100
  ) {
    return
  }

  const replies = (await getTopicReplies(topicId)) as Array<
    Record<string, unknown>
  >

  if (replies) {
    // console.error(
    //   "fixReplyFloorNumbers",
    //   displayNumber,
    //   replyElements.length,
    //   replies.length
    // )
    updateReplyElements(replies, replyElements, page)

    if (replies.length < displayNumber) {
      console.info("[V2EX.REP] API data outdated, re-fetch it")
      setTimeout(async () => {
        isRunning = true
        const replies = (await getTopicReplies(
          topicId,
          displayNumber
        )) as Array<Record<string, unknown>>

        if (replies) {
          // console.error(
          //   "fixReplyFloorNumbers",
          //   displayNumber,
          //   replyElements.length,
          //   replies.length
          // )
          updateReplyElements(replies, replyElements, page)
        }

        isRunning = false
      }, 100)
    }
  }

  isRunning = false
}
