import { $, $$, win as window } from "browser-extension-utils"

import {
  Cache,
  getFloorNumberElement,
  getRepliesCount,
  getReplyId,
  parseUrl,
} from "../utils"

const getTopicReplies = async (topicId: string, replyCount?: number) => {
  const cached = Cache.get(["getTopicReplies", topicId, replyCount]) as
    | Record<string, unknown>
    | undefined
  if (cached) {
    return cached
  }

  const url = `${location.protocol}//${
    location.host
  }/api/replies/show.json?topic_id=${topicId}${
    replyCount ? "&replyCount=" + String(replyCount) : ""
  }`

  try {
    const response = await fetch(url)

    if (response.status === 200) {
      const result = (await response.json()) as Record<string, unknown>
      Cache.add(["getTopicReplies", topicId, replyCount], result)
      return result
    }
  } catch (error) {
    console.error(error)
  }
}

const updateFloorNumber = (
  replyElement: HTMLElement,
  newFloorNumber: number
) => {
  const numberElement = getFloorNumberElement(replyElement)
  if (numberElement) {
    if (!numberElement.dataset.orgNumber) {
      const orgNumber = Number.parseInt(numberElement.textContent || "", 10)
      if (orgNumber) {
        numberElement.dataset.orgNumber = String(orgNumber)
      }
    }

    numberElement.textContent = String(newFloorNumber)
    replyElement.dataset.floorNumber = String(newFloorNumber)
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
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
    `[V2EX.REP] page: ${page}, floorNumberOffset: ${floorNumberOffset}, hideCount: ${hideCount}`
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

const splitArrayPerPages = (replyElements: HTMLElement[]) => {
  if (!replyElements[0].dataset.page) {
    return
  }

  const replyElementsPerPages = [] as HTMLElement[][]
  let lastPage: string | undefined
  let replyElementsPerPage = [] as HTMLElement[]
  for (const reply of replyElements) {
    if (reply.dataset.page !== lastPage) {
      lastPage = reply.dataset.page
      const page = Number.parseInt(reply.dataset.page || "", 10)
      replyElementsPerPage = replyElementsPerPages[page - 1] || []
      replyElementsPerPages[page - 1] = replyElementsPerPage
    }

    replyElementsPerPage.push(reply)
  }

  return replyElementsPerPages
}

const process = async (
  topicId: string,
  page: number,
  displayNumber: number,
  replyElements: HTMLElement[],
  forceUpdate = false
  // eslint-disable-next-line max-params
) => {
  if (isRunning) {
    return
  }

  isRunning = true

  const replies = (await getTopicReplies(
    topicId,
    forceUpdate ? displayNumber : undefined
  )) as Array<Record<string, unknown>> | undefined

  if (replies) {
    const replyElementsPerPages = splitArrayPerPages(replyElements)
    if (replyElementsPerPages) {
      // eslint-disable-next-line unicorn/no-for-loop
      for (let i = 0; i < replyElementsPerPages.length; i++) {
        const replyElementsPerPage = replyElementsPerPages[i]

        if (
          !replyElementsPerPage ||
          displayNumber === replyElementsPerPage.length ||
          displayNumber % 100 === replyElementsPerPage.length % 100 ||
          replyElementsPerPage.length % 100 === 0
        ) {
          continue
        }

        updateReplyElements(replies, replyElementsPerPage, i + 1)
      }
    } else {
      updateReplyElements(replies, replyElements, page)
    }

    if (replies.length < displayNumber) {
      console.info("[V2EX.REP] API data outdated, re-fetch it")
      setTimeout(async () => {
        await process(topicId, page, displayNumber, replyElements, true)
      }, 100)
    }
  }

  isRunning = false
}

export const fixReplyFloorNumbers = async (replyElements: HTMLElement[]) => {
  if (isRunning) {
    return
  }

  const result = parseUrl()
  const topicId = result.topicId
  const page = result.page

  if (!topicId) {
    return
  }

  const displayNumber = getRepliesCount()

  if (
    displayNumber === replyElements.length ||
    displayNumber % 100 === replyElements.length % 100 ||
    replyElements.length % 100 === 0
  ) {
    return
  }

  await process(topicId, page, displayNumber, replyElements)
}
