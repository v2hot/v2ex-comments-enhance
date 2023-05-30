import {
  $,
  $$,
  addEventListener,
  addStyle,
  doc,
  registerMenuCommand,
  throttle,
} from "browser-extension-utils"
import styleText from "data-text:./content.scss"
import type { PlasmoCSConfig } from "plasmo"

import {
  getSettingsValue,
  initSettings,
  showSettings,
} from "./components/settings"
import { alwaysShowHideButton } from "./modules/always-show-hide-button"
import { alwaysShowThankButton } from "./modules/always-show-thank-button"
import { filterRepliesByUser } from "./modules/filter-repies-by-user"
import { fixReplyFloorNumbers } from "./modules/fix-reply-floor-numbers"
import { quickHideReply } from "./modules/quick-hide-reply"
import { quickSendThank } from "./modules/quick-send-thank"
import { replyWithFloorNumber } from "./modules/reply-with-floor-number"
import { showTopReplies } from "./modules/show-top-replies"
import { getReplyElements } from "./utils"

export const config: PlasmoCSConfig = {
  matches: ["https://*.v2ex.com/*"],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  run_at: "document_end",
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
  filterRepliesByUser: {
    title: "查看指定用户在当前主题下的所有回复",
    description: "鼠标移至用户名，会显示该用户在当前主题下的所有回复",
    defaultValue: true,
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
}

function registerMenuCommands() {
  registerMenuCommand("⚙️ 设置", showSettings, "o")
}

let fixedReplyFloorNumbers = false

async function process() {
  if (/\/t\/\d+/.test(location.href)) {
    const replyElements = getReplyElements()
    for (const replyElement of replyElements) {
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
    }

    showTopReplies(getSettingsValue("showTopReplies"))

    filterRepliesByUser(getSettingsValue("filterRepliesByUser"))

    addEventListener(window, "floorNumberUpdated", () => {
      fixedReplyFloorNumbers = true
      if (getSettingsValue("replyWithFloorNumber")) {
        const replyElements = getReplyElements()
        for (const replyElement of replyElements) {
          replyWithFloorNumber(replyElement)
        }
      }

      showTopReplies(getSettingsValue("showTopReplies"))

      filterRepliesByUser(getSettingsValue("filterRepliesByUser"))
    })

    if (!getSettingsValue("fixReplyFloorNumbers") || fixedReplyFloorNumbers) {
      return
    }

    const matched = /\/t\/(\d+)(?:.+\bp=(\d+))?/.exec(location.href) || []
    const topicId = matched[1]
    const page = Number.parseInt(matched[2], 10) || 1

    const replyCount = $$(".box > .cell span.no").length
    const displayNumber =
      Number.parseInt(
        (/(\d+)\s条回复/.exec($(".box .cell .gray")?.textContent || "") ||
          [])[1],
        10
      ) || 0

    if (topicId && displayNumber > replyCount) {
      await fixReplyFloorNumbers(topicId, page)
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

  await process()

  const scanNodes = throttle(() => {
    process()
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
