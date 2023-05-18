// ==UserScript==
// @name                 V2EX.REP - 专注提升 V2EX 主题回复浏览体验
// @name:zh-CN           V2EX.REP - 专注提升 V2EX 主题回复浏览体验
// @namespace            https://github.com/v2hot/v2ex.rep
// @homepageURL          https://github.com/v2hot/v2ex.rep#readme
// @supportURL           https://github.com/v2hot/v2ex.rep/issues
// @version              0.0.1
// @description          专注提升 V2EX 主题回复浏览体验的浏览器扩展/用户脚本。主要功能有 ✅ 修复有被 block 的用户时错位的楼层号；✅ 回复时自动带上楼层号；✅ 一直显示感谢按钮 🙏；✅ 一直显示隐藏回复按钮 🙈；✅ 快速发送感谢/快速隐藏回复（no confirm）等。
// @description:zh-CN    专注提升 V2EX 主题回复浏览体验的浏览器扩展/用户脚本。主要功能有 ✅ 修复有被 block 的用户时错位的楼层号；✅ 回复时自动带上楼层号；✅ 一直显示感谢按钮 🙏；✅ 一直显示隐藏回复按钮 🙈；✅ 快速发送感谢/快速隐藏回复（no confirm）等。
// @icon                 https://www.v2ex.com/favicon.ico
// @author               Pipecraft
// @license              MIT
// @match                https://*.v2ex.com/*
// @run-at               document-end
// @grant                GM_addElement
// @grant                GM_addStyle
// @grant                GM.registerMenuCommand
// @grant                GM.getValue
// @grant                GM.setValue
// @grant                GM_addValueChangeListener
// @grant                GM_removeValueChangeListener
// ==/UserScript==
//
;(() => {
  "use strict"
  var doc = document
  var $ = (selectors, element) => (element || doc).querySelector(selectors)
  var $$ = (selectors, element) => [
    ...(element || doc).querySelectorAll(selectors),
  ]
  var createElement = (tagName, attributes) =>
    setAttributes(doc.createElement(tagName), attributes)
  var addElement = (parentNode, tagName, attributes) => {
    if (!parentNode) {
      return
    }
    if (typeof parentNode === "string") {
      attributes = tagName
      tagName = parentNode
      parentNode = doc.head
    }
    if (typeof tagName === "string") {
      const element = createElement(tagName, attributes)
      parentNode.append(element)
      return element
    }
    setAttributes(tagName, attributes)
    parentNode.append(tagName)
    return tagName
  }
  var addStyle = (styleText) => {
    const element = createElement("style", { textContent: styleText })
    doc.head.append(element)
    return element
  }
  var addEventListener = (element, type, listener, options) => {
    if (!element) {
      return
    }
    if (typeof type === "object") {
      for (const type1 in type) {
        if (Object.hasOwn(type, type1)) {
          element.addEventListener(type1, type[type1])
        }
      }
    } else if (typeof type === "string" && typeof listener === "function") {
      element.addEventListener(type, listener, options)
    }
  }
  var removeEventListener = (element, type, listener, options) => {
    if (!element) {
      return
    }
    if (typeof type === "object") {
      for (const type1 in type) {
        if (Object.hasOwn(type, type1)) {
          element.removeEventListener(type1, type[type1])
        }
      }
    } else if (typeof type === "string" && typeof listener === "function") {
      element.removeEventListener(type, listener, options)
    }
  }
  var getAttribute = (element, name) =>
    element ? element.getAttribute(name) : null
  var setAttribute = (element, name, value) =>
    element ? element.setAttribute(name, value) : void 0
  var setAttributes = (element, attributes) => {
    if (element && attributes) {
      for (const name in attributes) {
        if (Object.hasOwn(attributes, name)) {
          const value = attributes[name]
          if (value === void 0) {
            continue
          }
          if (/^(value|textContent|innerText|innerHTML)$/.test(name)) {
            element[name] = value
          } else if (name === "style") {
            setStyle(element, value, true)
          } else if (/on\w+/.test(name)) {
            const type = name.slice(2)
            addEventListener(element, type, value)
          } else {
            setAttribute(element, name, value)
          }
        }
      }
    }
    return element
  }
  var addAttribute = (element, name, value) => {
    const orgValue = getAttribute(element, name)
    if (!orgValue) {
      setAttribute(element, name, value)
    } else if (!orgValue.includes(value)) {
      setAttribute(element, name, orgValue + " " + value)
    }
  }
  var setStyle = (element, values, overwrite) => {
    if (!element) {
      return
    }
    const style = element.style
    if (typeof values === "string") {
      style.cssText = overwrite ? values : style.cssText + ";" + values
      return
    }
    if (overwrite) {
      style.cssText = ""
    }
    for (const key in values) {
      if (Object.hasOwn(values, key)) {
        style[key] = values[key].replace("!important", "")
      }
    }
  }
  if (typeof Object.hasOwn !== "function") {
    Object.hasOwn = (instance, prop) =>
      Object.prototype.hasOwnProperty.call(instance, prop)
  }
  var addElement2 =
    typeof GM_addElement === "function"
      ? (parentNode, tagName, attributes) => {
          if (!parentNode) {
            return
          }
          if (typeof parentNode === "string") {
            attributes = tagName
            tagName = parentNode
            parentNode = doc.head
          }
          if (typeof tagName === "string") {
            const element = GM_addElement(tagName)
            setAttributes(element, attributes)
            parentNode.append(element)
            return element
          }
          setAttributes(tagName, attributes)
          parentNode.append(tagName)
          return tagName
        }
      : addElement
  var addStyle2 =
    typeof GM_addStyle === "function"
      ? (styleText) => GM_addStyle(styleText)
      : addStyle
  var registerMenuCommand = (name, callback, accessKey) => {
    if (window !== top) {
      return
    }
    if (typeof GM.registerMenuCommand !== "function") {
      console.warn("Do not support GM.registerMenuCommand!")
      return
    }
    GM.registerMenuCommand(name, callback, accessKey)
  }
  var content_default =
    "a.emoji_button{opacity:100%;visibility:visible;margin-right:14px}a.emoji_button:last-child{margin-right:0}a.emoji_button:hover{opacity:70%}"
  var listeners = {}
  var getValue = async (key) => {
    const value = await GM.getValue(key)
    return value && value !== "undefined" ? JSON.parse(value) : void 0
  }
  var setValue = async (key, value) => {
    if (value !== void 0) {
      const newValue = JSON.stringify(value)
      if (listeners[key]) {
        const oldValue = await GM.getValue(key)
        await GM.setValue(key, newValue)
        if (newValue !== oldValue) {
          for (const func of listeners[key]) {
            func(key, oldValue, newValue)
          }
        }
      } else {
        await GM.setValue(key, newValue)
      }
    }
  }
  var _addValueChangeListener = (key, func) => {
    listeners[key] = listeners[key] || []
    listeners[key].push(func)
    return () => {
      if (listeners[key] && listeners[key].length > 0) {
        for (let i = listeners[key].length - 1; i >= 0; i--) {
          if (listeners[key][i] === func) {
            listeners[key].splice(i, 1)
          }
        }
      }
    }
  }
  var addValueChangeListener = (key, func) => {
    if (typeof GM_addValueChangeListener !== "function") {
      console.warn("Do not support GM_addValueChangeListener!")
      return _addValueChangeListener(key, func)
    }
    const listenerId = GM_addValueChangeListener(key, func)
    return () => {
      GM_removeValueChangeListener(listenerId)
    }
  }
  var style_default =
    "#browser_extension_settings{--browser-extension-settings-background-color: #f3f3f3;--browser-extension-settings-text-color: #444444;position:fixed;top:10px;right:30px;min-width:250px;max-height:90%;overflow-y:auto;overflow-x:hidden;display:none;box-sizing:border-box;padding:10px 15px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color);z-index:100000;border-radius:5px;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}#browser_extension_settings h2{text-align:center;margin:5px 0 0;font-size:18px;font-weight:600;border:none}#browser_extension_settings footer{display:flex;justify-content:center;flex-direction:column;font-size:11px;margin:10px auto 0px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color)}#browser_extension_settings footer a{color:#217dfc;text-decoration:none;padding:0}#browser_extension_settings footer p{text-align:center;padding:0;margin:2px;line-height:13px}#browser_extension_settings .option_groups{background-color:#fff;padding:6px 15px 6px 15px;border-radius:10px;display:flex;flex-direction:column;margin:10px 0 0}#browser_extension_settings .option_groups .action{font-size:14px;border-top:1px solid #ccc;padding:6px 0 6px 0;color:#217dfc;cursor:pointer}#browser_extension_settings .option_groups textarea{margin:10px 0 10px 0;height:100px;width:100%;border:1px solid #a9a9a9;border-radius:4px;box-sizing:border-box}#browser_extension_settings .switch_option{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #ccc;padding:6px 0 6px 0;font-size:14px}#browser_extension_settings .switch_option:first-of-type,#browser_extension_settings .option_groups .action:first-of-type{border-top:none}#browser_extension_settings .switch_option>span{margin-right:10px}#browser_extension_settings .option_groups .tip{position:relative;margin:0;padding:0 15px 0 0;border:none;max-width:none;font-size:14px}#browser_extension_settings .option_groups .tip .tip_anchor{cursor:help;text-decoration:underline}#browser_extension_settings .option_groups .tip .tip_content{position:absolute;bottom:15px;left:0;background-color:#fff;color:var(--browser-extension-settings-text-color);text-align:left;padding:10px;display:none;border-radius:5px;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}#browser_extension_settings .option_groups .tip .tip_anchor:hover+.tip_content,#browser_extension_settings .option_groups .tip .tip_content:hover{display:block}#browser_extension_settings .option_groups .tip p,#browser_extension_settings .option_groups .tip pre{margin:revert;padding:revert}#browser_extension_settings .option_groups .tip pre{font-family:Consolas,panic sans,bitstream vera sans mono,Menlo,microsoft yahei,monospace;font-size:13px;letter-spacing:.015em;line-height:120%;white-space:pre;overflow:auto;background-color:#f5f5f5;word-break:normal;overflow-wrap:normal;padding:.5em;border:none}#browser_extension_settings .container{--button-width: 51px;--button-height: 24px;--toggle-diameter: 20px;--color-off: #e9e9eb;--color-on: #34c759;width:var(--button-width);height:var(--button-height);position:relative;padding:0;margin:0;flex:none}#browser_extension_settings input[type=checkbox]{opacity:0;width:0;height:0;position:absolute}#browser_extension_settings .switch{width:100%;height:100%;display:block;background-color:var(--color-off);border-radius:calc(var(--button-height)/2);border:none;cursor:pointer;transition:all .2s ease-out}#browser_extension_settings .switch::before{display:none}#browser_extension_settings .slider{width:var(--toggle-diameter);height:var(--toggle-diameter);position:absolute;left:2px;top:calc(50% - var(--toggle-diameter)/2);border-radius:50%;background:#fff;box-shadow:0px 3px 8px rgba(0,0,0,.15),0px 3px 1px rgba(0,0,0,.06);transition:all .2s ease-out;cursor:pointer}#browser_extension_settings input[type=checkbox]:checked+.switch{background-color:var(--color-on)}#browser_extension_settings input[type=checkbox]:checked+.switch .slider{left:calc(var(--button-width) - var(--toggle-diameter) - 2px)}"
  function createSwitch(options = {}) {
    const container = createElement("label", { class: "container" })
    const checkbox = createElement(
      "input",
      options.checked ? { type: "checkbox", checked: "" } : { type: "checkbox" }
    )
    addElement2(container, checkbox)
    const switchElm = createElement("span", { class: "switch" })
    addElement2(switchElm, "span", { class: "slider" })
    addElement2(container, switchElm)
    if (options.onchange) {
      addEventListener(checkbox, "change", options.onchange)
    }
    return container
  }
  function createSwitchOption(text, options) {
    const div = createElement("div", { class: "switch_option" })
    addElement2(div, "span", { textContent: text })
    div.append(createSwitch(options))
    return div
  }
  var settingsElementId =
    "browser_extension_settings_" + String(Math.round(Math.random() * 1e4))
  var getSettingsElement = () => $("#" + settingsElementId)
  var getSettingsStyle = () =>
    style_default.replace(/browser_extension_settings/gm, settingsElementId)
  var storageKey = "settings"
  var settingsOptions = {}
  var settingsTable = {}
  var settings = {}
  async function getSettings() {
    var _a
    return (_a = await getValue(storageKey)) != null ? _a : {}
  }
  async function saveSattingsValue(key, value) {
    const settings2 = await getSettings()
    settings2[key] =
      settingsTable[key] && settingsTable[key].defaultValue === value
        ? void 0
        : value
    await setValue(storageKey, settings2)
  }
  function getSettingsValue(key) {
    var _a
    return Object.hasOwn(settings, key)
      ? settings[key]
      : (_a = settingsTable[key]) == null
      ? void 0
      : _a.defaultValue
  }
  var modalHandler = (event) => {
    let target = event.target
    const settingsLayer = getSettingsElement()
    if (settingsLayer) {
      while (target !== settingsLayer && target) {
        target = target.parentNode
      }
      if (target === settingsLayer) {
        return
      }
      settingsLayer.style.display = "none"
    }
    removeEventListener(document, "click", modalHandler)
  }
  async function updateOptions() {
    if (!getSettingsElement()) {
      return
    }
    for (const key in settingsTable) {
      if (Object.hasOwn(settingsTable, key)) {
        const checkbox = $(
          `#${settingsElementId} .option_groups .switch_option[data-key="${key}"] input`
        )
        if (checkbox) {
          checkbox.checked = getSettingsValue(key)
        }
      }
    }
    const host = location.host
    const group2 = $(`#${settingsElementId} .option_groups:nth-of-type(2)`)
    if (group2) {
      group2.style.display = getSettingsValue(
        `enableCustomRulesForCurrentSite_${host}`
      )
        ? "block"
        : "none"
    }
    const customStyleValue = $(`#${settingsElementId} .option_groups textarea`)
    if (customStyleValue) {
      customStyleValue.value =
        settings[`customRulesForCurrentSite_${host}`] || ""
    }
  }
  function createSettingsElement() {
    let settingsLayer = getSettingsElement()
    if (!settingsLayer) {
      addStyle2(getSettingsStyle())
      settingsLayer = addElement2(document.body, "div", {
        id: settingsElementId,
      })
      if (settingsOptions.title) {
        addElement2(settingsLayer, "h2", { textContent: settingsOptions.title })
      }
      const options = addElement2(settingsLayer, "div", {
        class: "option_groups",
      })
      for (const key in settingsTable) {
        if (Object.hasOwn(settingsTable, key)) {
          const item = settingsTable[key]
          if (!item.type || item.type === "switch") {
            const switchOption = createSwitchOption(item.title, {
              async onchange(event) {
                await saveSattingsValue(key, event.target.checked)
              },
            })
            switchOption.dataset.key = key
            addElement2(options, switchOption)
          }
        }
      }
      const options2 = addElement2(settingsLayer, "div", {
        class: "option_groups",
      })
      let timeoutId
      addElement2(options2, "textarea", {
        placeholder: `/* Custom rules for internal URLs, matching URLs will be opened in new tabs */`,
        onkeyup(event) {
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          timeoutId = setTimeout(async () => {
            const host = location.host
            await saveSattingsValue(
              `customRulesForCurrentSite_${host}`,
              event.target.value.trim()
            )
          }, 100)
        },
      })
      const tip = addElement2(options2, "div", {
        class: "tip",
      })
      addElement2(tip, "a", {
        class: "tip_anchor",
        textContent: "Examples",
      })
      const tipContent = addElement2(tip, "div", {
        class: "tip_content",
        innerHTML: `<p>Custom rules for internal URLs, matching URLs will be opened in new tabs</p>
      <p>
      - One line per url pattern<br>
      - All URLs contains '/posts' or '/users/'<br>
      <pre>/posts/
/users/</pre>
      - Regex is supported<br>
      <pre>^/(posts|members)/d+</pre>
      - '*' for all URLs
      </p>`,
      })
      if (settingsOptions.footer) {
        const footer = addElement2(settingsLayer, "footer")
        footer.innerHTML =
          typeof settingsOptions.footer === "string"
            ? settingsOptions.footer
            : `<p>Made with \u2764\uFE0F by
      <a href="https://www.pipecraft.net/" target="_blank">
        Pipecraft
      </a></p>`
      }
    }
    return settingsLayer
  }
  async function showSettings() {
    const settingsLayer = createSettingsElement()
    await updateOptions()
    settingsLayer.style.display = "block"
    addEventListener(document, "click", modalHandler)
  }
  var initSettings = async (options) => {
    settingsOptions = options
    settingsTable = options.settingsTable || {}
    addValueChangeListener(storageKey, async () => {
      settings = await getSettings()
      await updateOptions()
      if (typeof options.onValueChange === "function") {
        options.onValueChange()
      }
    })
    settings = await getSettings()
  }
  var alwaysShowHideButton = (replyElement) => {
    const hideButton = $('a[onclick*="ignoreReply"]', replyElement)
    if (hideButton) {
      addAttribute(hideButton, "class", "emoji_button")
      hideButton.textContent = "\u{1F648}"
      const nextSibling = hideButton.nextSibling
      if (nextSibling && nextSibling.nodeType === 3) {
        nextSibling.textContent = ""
      }
    }
  }
  var alwaysShowThankButton = (replyElement) => {
    const thankButton = $('a[onclick*="thankReply"]', replyElement)
    if (thankButton) {
      addAttribute(thankButton, "class", "emoji_button")
      thankButton.textContent = "\u{1F64F}"
    }
  }
  var getTopicReplies = async (topicId) => {
    const url = `${location.protocol}//${location.host}/api/replies/show.json?topic_id=${topicId}`
    const response = await fetch(url)
    if (response.status === 200) {
      return response.json()
    }
  }
  var updateReplyElements = (replies, page = 1) => {
    var _a
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
          `[V2EX \u56DE\u590D\u589E\u5F3A] \u5C4F\u853D\u6216\u9690\u85CF\u7684\u56DE\u590D: #${
            index + offset + elementOffset + 1
          }, \u7528\u6237 ID: ${
            (_a = reply.member) == null ? void 0 : _a.username
          }, \u56DE\u590D ID: ${reply.id}, \u56DE\u590D\u5185\u5BB9: ${
            reply.content
          }`
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
  var fixReplyFloorNumbers = async (topicId, page = 1) => {
    const replies = await getTopicReplies(topicId)
    if (replies) {
      updateReplyElements(replies, page)
    }
  }
  var quickHideReply = (replyElement) => {
    const hideButton = $('a[onclick*="ignoreReply"]', replyElement)
    if (hideButton) {
      const onclick = getAttribute(hideButton, "onclick")
      setAttribute(
        hideButton,
        "onclick",
        onclick.replace(/.*(ignoreReply\(.+\)).*/, "$1")
      )
      setAttribute(hideButton, "href", "javascript:;")
    }
  }
  var quickSendThank = (replyElement) => {
    const thankButton = $('a[onclick*="thankReply"]', replyElement)
    if (thankButton) {
      const onclick = getAttribute(thankButton, "onclick")
      setAttribute(
        thankButton,
        "onclick",
        onclick.replace(/.*(thankReply\(.+\)).*/, "$1")
      )
      setAttribute(thankButton, "href", "javascript:;")
    }
  }
  var replyWithFloorNumber = (replyElement) => {
    const replyButton = $('a[onclick^="replyOne"]', replyElement)
    const numberElement = $("span.no", replyElement)
    if (replyButton && numberElement) {
      const number = numberElement.textContent
      const onclick = getAttribute(replyButton, "onclick") || ""
      if (number) {
        setAttribute(
          replyButton,
          "onclick",
          onclick.replace(
            /replyOne\('(\w+)(?: .*)?'\)/,
            `replyOne('$1 #${number}')`
          )
        )
      }
      setAttribute(replyButton, "href", "javascript:;")
    }
  }
  var config = {
    matches: ["https://*.v2ex.com/*"],
    run_at: "document_end",
  }
  var settingsTable2 = {
    fixReplyFloorNumbers: {
      title: "\u4FEE\u590D\u697C\u5C42\u53F7",
      defaultValue: true,
    },
    replyWithFloorNumber: {
      title: "\u56DE\u590D\u65F6\u5E26\u4E0A\u697C\u5C42\u53F7",
      defaultValue: true,
    },
    quickSendThank: {
      title: "\u5FEB\u901F\u53D1\u9001\u611F\u8C22",
      defaultValue: false,
    },
    alwaysShowThankButton: {
      title: "\u4E00\u76F4\u663E\u793A\u611F\u8C22\u6309\u94AE",
      defaultValue: false,
    },
    quickHideReply: {
      title: "\u5FEB\u901F\u9690\u85CF\u56DE\u590D",
      defaultValue: false,
    },
    alwaysShowHideButton: {
      title: "\u4E00\u76F4\u663E\u793A\u9690\u85CF\u56DE\u590D\u6309\u94AE",
      defaultValue: false,
    },
  }
  function registerMenuCommands() {
    registerMenuCommand("\u2699\uFE0F \u8BBE\u7F6E", showSettings, "o")
  }
  var fixedReplyFloorNumbers = false
  async function process2() {
    if (/\/t\/\d+/.test(location.href)) {
      const replyElements = $$('.cell[id^="r_"]')
      for (const replyElement of replyElements) {
        if (getSettingsValue("replyWithFloorNumber")) {
          replyWithFloorNumber(replyElement)
        }
        if (getSettingsValue("quickSendThank")) {
          quickSendThank(replyElement)
        }
        if (getSettingsValue("quickHideReply")) {
          quickHideReply(replyElement)
        }
        if (getSettingsValue("alwaysShowThankButton")) {
          alwaysShowThankButton(replyElement)
        }
        if (getSettingsValue("alwaysShowHideButton")) {
          alwaysShowHideButton(replyElement)
        }
      }
      addEventListener(window, "floorNumberUpdated", () => {
        fixedReplyFloorNumbers = true
        if (getSettingsValue("replyWithFloorNumber")) {
          const replyElements2 = $$('.cell[id^="r_"]')
          for (const replyElement of replyElements2) {
            replyWithFloorNumber(replyElement)
          }
        }
      })
      if (!getSettingsValue("fixReplyFloorNumbers") || fixedReplyFloorNumbers) {
        return
      }
      const matched = /\/t\/(\d+)(?:.+\bp=(\d+))?/.exec(location.href) || []
      const topicId = matched[1]
      const page = Number.parseInt(matched[2], 10) || 1
      const replyCount = $$("span.no").length
      const displayNumber =
        Number.parseInt(
          (/(\d+)\s条回复/.exec($(".fr + .gray").textContent || "") || [])[1],
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
    <p>\u66F4\u6539\u8BBE\u7F6E\u540E\uFF0C\u9700\u8981\u91CD\u65B0\u52A0\u8F7D\u9875\u9762</p>
    <p>
    <a href="https://github.com/v2hot/v2ex.rep/issues" target="_blank">
    \u95EE\u9898\u53CD\u9988
    </a></p>
    <p>Made with \u2764\uFE0F by
    <a href="https://www.pipecraft.net/" target="_blank">
      Pipecraft
    </a></p>`,
      settingsTable: settingsTable2,
      onValueChange() {
        process2()
      },
    })
    registerMenuCommands()
    addStyle2(content_default)
    process2()
  }
  main()
})()
