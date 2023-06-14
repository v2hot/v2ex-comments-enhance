import {
  $,
  addEventListener,
  addStyle,
  doc,
  registerMenuCommand,
  runOnce,
  throttle,
  win as window,
} from "browser-extension-utils"
import styleText from "data-text:./content.scss"
import type { PlasmoCSConfig } from "plasmo"

import {
  getSettingsValue,
  initSettings,
  showSettings,
} from "./components/settings"
import { addLinkToAvatars } from "./modules/add-link-to-avatars"
import { addlinkToCitedFloorNumbers } from "./modules/add-link-to-cited-floor-numbers"
import { alwaysShowHideButton } from "./modules/always-show-hide-button"
import { alwaysShowThankButton } from "./modules/always-show-thank-button"
import { dailyCheckIn } from "./modules/daily-check-in"
import { filterRepliesByUser } from "./modules/filter-repies-by-user"
import { fixReplyFloorNumbers } from "./modules/fix-reply-floor-numbers"
import { lazyLoadAvatars } from "./modules/lazy-load-avatars"
import { loadMultiPages } from "./modules/load-multi-pages"
import { quickHideReply } from "./modules/quick-hide-reply"
import { quickSendThank } from "./modules/quick-send-thank"
import { removeLocationHash } from "./modules/remove-location-hash"
import { replyWithFloorNumber } from "./modules/reply-with-floor-number"
import { showCitedReplies } from "./modules/show-cited-replies"
import { showTopReplies } from "./modules/show-top-replies"
import { stickyTopicButtons } from "./modules/sticky-topic-buttons"
import { uploadImage } from "./modules/upload-image"
import {
  getCachedReplyElements,
  getReplyElements,
  resetCachedReplyElements,
} from "./utils"

export const config: PlasmoCSConfig = {
  matches: ["https://*.v2ex.com/*"],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  run_at: "document_start",
}

const settingsTable = {
  fixReplyFloorNumbers: {
    title: "修复楼层号",
    defaultValue: true,
  },
  replyWithFloorNumber: {
    title: "回复时带上楼层号",
    defaultValue: true,
  },
  showTopReplies: {
    title: "显示热门回复",
    defaultValue: true,
  },
  showCitedReplies: {
    title: "显示被引用的回复",
    defaultValue: true,
  },
  filterRepliesByUser: {
    title: "查看用户在当前主题下的所有回复与被提及的回复",
    description:
      "鼠标移至用户名，会显示该用户在当前主题下的所有回复与被提及的回复",
    defaultValue: true,
  },
  loadMultiPages: {
    title: "预加载所有分页",
    defaultValue: true,
  },
  uploadImage: {
    title: "回复时上传图片",
    defaultValue: true,
  },
  dailyCheckIn: {
    title: "每日自动签到",
    defaultValue: true,
  },
  lazyLoadAvatars: {
    title: "懒加载用户头像图片",
    defaultValue: false,
  },
  quickSendThank: {
    title: "快速发送感谢",
    defaultValue: false,
  },
  alwaysShowThankButton: {
    title: "一直显示感谢按钮",
    defaultValue: false,
  },
  quickHideReply: {
    title: "快速隐藏回复",
    defaultValue: false,
  },
  alwaysShowHideButton: {
    title: "一直显示隐藏回复按钮",
    defaultValue: false,
  },
  removeLocationHash: {
    title: "去掉 URL 中的 #replyXX",
    defaultValue: true,
  },
  stickyTopicButtons: {
    title: "主题内容底部固定显示按钮栏",
    defaultValue: true,
  },
}

function registerMenuCommands() {
  registerMenuCommand("⚙️ 设置", showSettings, "o")
}

let fixedReplyFloorNumbers = false

async function process() {
  const domReady =
    doc.readyState === "interactive" || doc.readyState === "complete"

  if (doc.readyState === "complete" && getSettingsValue("dailyCheckIn")) {
    // Run on every page
    runOnce("dailyCheckIn", () => {
      setTimeout(dailyCheckIn, 1000)
    })
  }

  if (/\/t\/\d+/.test(location.href)) {
    const replyElements = getReplyElements()
    for (const replyElement of replyElements) {
      if (!$(".reply_content", replyElement)) {
        // 页面加载中，次回复标签还没有加在完整
        continue
      }

      if (getSettingsValue("lazyLoadAvatars")) {
        lazyLoadAvatars(replyElement)
      }

      addLinkToAvatars(replyElement)

      if (getSettingsValue("replyWithFloorNumber")) {
        replyWithFloorNumber(replyElement)
      }

      if (getSettingsValue("alwaysShowThankButton")) {
        alwaysShowThankButton(replyElement)
      }

      if (getSettingsValue("alwaysShowHideButton")) {
        alwaysShowHideButton(replyElement)
      }

      if (getSettingsValue("quickSendThank")) {
        quickSendThank(replyElement)
      }

      if (getSettingsValue("quickHideReply")) {
        quickHideReply(replyElement)
      }

      addlinkToCitedFloorNumbers(replyElement)

      if (getSettingsValue("showCitedReplies")) {
        showCitedReplies(replyElement)
      }
    }

    if (domReady) {
      showTopReplies(
        replyElements,
        getSettingsValue("showTopReplies") as boolean
      )
    }

    filterRepliesByUser(getSettingsValue("filterRepliesByUser") as boolean)

    if (
      domReady &&
      getSettingsValue("fixReplyFloorNumbers") &&
      !fixedReplyFloorNumbers
    ) {
      await fixReplyFloorNumbers(replyElements)
    }

    if (domReady && getSettingsValue("uploadImage")) {
      uploadImage()
    }

    if (domReady && getSettingsValue("removeLocationHash")) {
      runOnce("main:removeLocationHash", removeLocationHash)
    }

    if (domReady) {
      stickyTopicButtons(getSettingsValue("stickyTopicButtons"))
    }

    if (doc.readyState === "complete" && getSettingsValue("loadMultiPages")) {
      runOnce("main:loadMultiPages", () => {
        setTimeout(loadMultiPages, 1000)
      })
    }
  }
}

async function main() {
  if (!document.body) {
    setTimeout(main, 100)
    return
  }

  await initSettings({
    title: "V2EX.REP",
    footer: `
    <p>更改设置后，需要重新加载页面</p>
    <p>
    <a href="https://github.com/v2hot/v2ex.rep/issues" target="_blank">
    问题反馈
    </a></p>
    <p>Made with ❤️ by
    <a href="https://www.pipecraft.net/" target="_blank">
      Pipecraft
    </a></p>`,
    settingsTable,
    async onValueChange() {
      await process()
    },
  })
  registerMenuCommands()

  addStyle(styleText)

  const resetCachedReplyElementsThenProcess = async () => {
    resetCachedReplyElements()
    await process()
  }

  addEventListener(window, {
    floorNumberUpdated() {
      fixedReplyFloorNumbers = true
      if (
        getSettingsValue("replyWithFloorNumber") ||
        getSettingsValue("showCitedReplies")
      ) {
        const replyElements = getReplyElements()
        for (const replyElement of replyElements) {
          if (getSettingsValue("replyWithFloorNumber")) {
            replyWithFloorNumber(replyElement, true)
          }

          if (getSettingsValue("showCitedReplies")) {
            showCitedReplies(replyElement, true)
          }
        }
      }
    },
    async replyElementsLengthUpdated() {
      await resetCachedReplyElementsThenProcess()
      const replyElements = getCachedReplyElements()
      for (const replyElement of replyElements) {
        if (getSettingsValue("showCitedReplies")) {
          showCitedReplies(replyElement, true)
        }
      }

      showTopReplies(
        replyElements,
        getSettingsValue("showTopReplies") as boolean,
        true
      )
      if (getSettingsValue("fixReplyFloorNumbers")) {
        await fixReplyFloorNumbers(replyElements)
      }
    },
  })

  addEventListener(doc, "readystatechange", resetCachedReplyElementsThenProcess)

  await process()

  const scanNodes = throttle(async () => {
    await process()
  }, 500)

  const observer = new MutationObserver((mutationsList) => {
    // console.error("mutation", Date.now(), mutationsList)
    scanNodes()
  })

  observer.observe($("#Main") || doc, {
    childList: true,
    subtree: true,
  })
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
main()
