// ==UserScript==
// @name                 V2EX.REP - 专注提升 V2EX 主题回复浏览体验
// @name:zh-CN           V2EX.REP - 专注提升 V2EX 主题回复浏览体验
// @namespace            https://github.com/v2hot/v2ex.rep
// @homepageURL          https://github.com/v2hot/v2ex.rep#readme
// @supportURL           https://github.com/v2hot/v2ex.rep/issues
// @version              0.1.1
// @description          专注提升 V2EX 主题回复浏览体验的浏览器扩展/用户脚本。主要功能有 ✅ 修复有被 block 的用户时错位的楼层号；✅ 回复时自动带上楼层号；✅ 显示热门回复；✅ 查看用户在当前主题下的所有回复与被提及的回复；✅ 一直显示感谢按钮 🙏；✅ 一直显示隐藏回复按钮 🙈；✅ 快速发送感谢/快速隐藏回复（no confirm）等。
// @description:zh-CN    专注提升 V2EX 主题回复浏览体验的浏览器扩展/用户脚本。主要功能有 ✅ 修复有被 block 的用户时错位的楼层号；✅ 回复时自动带上楼层号；✅ 显示热门回复；✅ 查看用户在当前主题下的所有回复与被提及的回复；✅ 一直显示感谢按钮 🙏；✅ 一直显示隐藏回复按钮 🙈；✅ 快速发送感谢/快速隐藏回复（no confirm）等。
// @icon                 https://www.v2ex.com/favicon.ico
// @author               Pipecraft
// @license              MIT
// @match                https://*.v2ex.com/*
// @run-at               document-start
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
  var addClass = (element, className) => {
    if (!element) {
      return
    }
    element.classList.add(className)
  }
  var removeClass = (element, className) => {
    if (!element) {
      return
    }
    element.classList.remove(className)
  }
  var hasClass = (element, className) => {
    if (!element) {
      return false
    }
    return element.classList.contains(className)
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
  var throttle = (func, interval) => {
    let timeoutId2 = null
    let next = false
    const handler = (...args) => {
      if (timeoutId2) {
        next = true
      } else {
        func.apply(void 0, args)
        timeoutId2 = setTimeout(() => {
          timeoutId2 = null
          if (next) {
            next = false
            handler()
          }
        }, interval)
      }
    }
    return handler
  }
  if (typeof Object.hasOwn !== "function") {
    Object.hasOwn = (instance, prop) =>
      Object.prototype.hasOwnProperty.call(instance, prop)
  }
  var actionHref = "javascript:;"
  var getOffsetPosition = (element, referElement) => {
    const position = { top: 0, left: 0 }
    referElement = referElement || doc.body
    while (element && element !== referElement) {
      position.top += element.offsetTop
      position.left += element.offsetLeft
      element = element.offsetParent
    }
    return position
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
    'a.icon_button{opacity:1 !important;visibility:visible;margin-right:14px}a.icon_button:last-child{margin-right:0}a.icon_button svg{vertical-align:text-top}body .v2p-controls{opacity:1}body .v2p-controls>a.icon_button{margin-right:0}body .v2p-controls div a{margin-right:15px}body .v2p-controls div a:last-child{margin-right:0}body .v2p-controls a[onclick^=replyOne]{opacity:1 !important}.sticky_rightbar #Rightbar{position:sticky;top:0;max-height:100vh;overflow-y:auto;overflow-x:hidden;--sb-track-color: #00000000;--sb-thumb-color: #33334480;--sb-size: 2px;scrollbar-color:rgba(0,0,0,0) rgba(0,0,0,0);scrollbar-width:thin}.sticky_rightbar #Rightbar:hover{scrollbar-color:var(--sb-thumb-color) var(--sb-track-color)}.sticky_rightbar #Rightbar::-webkit-scrollbar{width:var(--sb-size)}.sticky_rightbar #Rightbar::-webkit-scrollbar-track{background:rgba(0,0,0,0);border-radius:10px}.sticky_rightbar #Rightbar:hover::-webkit-scrollbar-track{background:var(--sb-track-color)}.sticky_rightbar #Rightbar::-webkit-scrollbar-thumb{background:rgba(0,0,0,0);border-radius:10px}.sticky_rightbar #Rightbar:hover::-webkit-scrollbar-thumb{background:var(--sb-thumb-color)}.sticky_rightbar #Rightbar .v2p-tool-box{position:unset}.related_replies_container .related_replies{position:absolute;z-index:10000;width:100%;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}.related_replies_container .related_replies_before::before{content:"";display:block;width:100%;height:10000px;position:absolute;margin-top:-10000px;background-color:#334;opacity:50%}.related_replies_container .related_replies_after::after{content:"";display:block;width:100%;height:10000px;position:absolute;background-color:#334;opacity:50%}.related_replies_container.no_replies .related_replies_before::before,.related_replies_container.no_replies .related_replies_after::after{display:none}.related_replies_container .tabs{position:sticky;top:0;display:flex;justify-content:center}.related_replies_container .tabs a{cursor:pointer}a.no{background-color:rgba(0,0,0,0) !important;color:#1484cd !important;border:1px solid #1484cd;border-radius:3px !important;opacity:1 !important}'
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
  var style_default = `#browser_extension_settings{--browser-extension-settings-background-color: #f3f3f3;--browser-extension-settings-text-color: #444444;--browser-extension-settings-link-color: #217dfc;--sb-track-color: #00000000;--sb-thumb-color: #33334480;--sb-size: 2px;position:fixed;top:10px;right:30px;min-width:250px;max-height:90%;overflow-y:auto;overflow-x:hidden;scrollbar-color:var(--sb-thumb-color) var(--sb-track-color);scrollbar-width:thin;display:none;box-sizing:border-box;padding:10px 15px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color);z-index:100000;border-radius:5px;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}#browser_extension_settings::-webkit-scrollbar{width:var(--sb-size)}#browser_extension_settings::-webkit-scrollbar-track{background:var(--sb-track-color);border-radius:10px}#browser_extension_settings::-webkit-scrollbar-thumb{background:var(--sb-thumb-color);border-radius:10px}#browser_extension_settings h2{text-align:center;margin:5px 0 0;font-size:18px;font-weight:600;border:none}#browser_extension_settings footer{display:flex;justify-content:center;flex-direction:column;font-size:11px;margin:10px auto 0px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color)}#browser_extension_settings footer a{color:var(--browser-extension-settings-link-color) !important;text-decoration:none;padding:0}#browser_extension_settings footer p{text-align:center;padding:0;margin:2px;line-height:13px}#browser_extension_settings .option_groups{background-color:#fff;padding:6px 15px 6px 15px;border-radius:10px;display:flex;flex-direction:column;margin:10px 0 0}#browser_extension_settings .option_groups .action{font-size:14px;border-top:1px solid #ccc;padding:6px 0 6px 0;color:var(--browser-extension-settings-link-color);cursor:pointer}#browser_extension_settings .option_groups textarea{margin:10px 0 10px 0;height:100px;width:100%;border:1px solid #a9a9a9;border-radius:4px;box-sizing:border-box}#browser_extension_settings .switch_option{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #ccc;padding:6px 0 6px 0;font-size:14px}#browser_extension_settings .switch_option:first-of-type,#browser_extension_settings .option_groups .action:first-of-type{border-top:none}#browser_extension_settings .switch_option>span{margin-right:10px}#browser_extension_settings .option_groups .tip{position:relative;margin:0;padding:0 15px 0 0;border:none;max-width:none;font-size:14px}#browser_extension_settings .option_groups .tip .tip_anchor{cursor:help;text-decoration:underline}#browser_extension_settings .option_groups .tip .tip_content{position:absolute;bottom:15px;left:0;background-color:#fff;color:var(--browser-extension-settings-text-color);text-align:left;padding:10px;display:none;border-radius:5px;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}#browser_extension_settings .option_groups .tip .tip_anchor:hover+.tip_content,#browser_extension_settings .option_groups .tip .tip_content:hover{display:block}#browser_extension_settings .option_groups .tip p,#browser_extension_settings .option_groups .tip pre{margin:revert;padding:revert}#browser_extension_settings .option_groups .tip pre{font-family:Consolas,panic sans,bitstream vera sans mono,Menlo,microsoft yahei,monospace;font-size:13px;letter-spacing:.015em;line-height:120%;white-space:pre;overflow:auto;background-color:#f5f5f5;word-break:normal;overflow-wrap:normal;padding:.5em;border:none}#browser_extension_settings .container{--button-width: 51px;--button-height: 24px;--toggle-diameter: 20px;--color-off: #e9e9eb;--color-on: #34c759;width:var(--button-width);height:var(--button-height);position:relative;padding:0;margin:0;flex:none}#browser_extension_settings input[type=checkbox]{opacity:0;width:0;height:0;position:absolute}#browser_extension_settings .switch{width:100%;height:100%;display:block;background-color:var(--color-off);border-radius:calc(var(--button-height)/2);border:none;cursor:pointer;transition:all .2s ease-out}#browser_extension_settings .switch::before{display:none}#browser_extension_settings .slider{width:var(--toggle-diameter);height:var(--toggle-diameter);position:absolute;left:2px;top:calc(50% - var(--toggle-diameter)/2);border-radius:50%;background:#fff;box-shadow:0px 3px 8px rgba(0,0,0,.15),0px 3px 1px rgba(0,0,0,.06);transition:all .2s ease-out;cursor:pointer}#browser_extension_settings input[type=checkbox]:checked+.switch{background-color:var(--color-on)}#browser_extension_settings input[type=checkbox]:checked+.switch .slider{left:calc(var(--button-width) - var(--toggle-diameter) - 2px)}#browser_extension_side_menu{min-height:200px;width:40px;opacity:0;position:fixed;top:80px;right:0;padding-top:20px}#browser_extension_side_menu:hover{opacity:1}#browser_extension_side_menu button{cursor:pointer;width:24px;height:24px;border:none;background-color:rgba(0,0,0,0);background-image:url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.0002 16C14.2094 16 16.0002 14.2091 16.0002 12C16.0002 9.79086 14.2094 8 12.0002 8C9.79109 8 8.00023 9.79086 8.00023 12C8.00023 14.2091 9.79109 16 12.0002 16ZM12.0002 14C13.1048 14 14.0002 13.1046 14.0002 12C14.0002 10.8954 13.1048 10 12.0002 10C10.8957 10 10.0002 10.8954 10.0002 12C10.0002 13.1046 10.8957 14 12.0002 14Z' fill='black'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15.1182 1.86489L15.5203 4.81406C15.8475 4.97464 16.1621 5.1569 16.4623 5.35898L19.2185 4.23223C19.6814 4.043 20.2129 4.2248 20.463 4.65787L22.5901 8.34213C22.8401 8.77521 22.7318 9.3264 22.3365 9.63266L19.9821 11.4566C19.9941 11.6362 20.0002 11.8174 20.0002 12C20.0002 12.1826 19.9941 12.3638 19.9821 12.5434L22.3365 14.3673C22.7318 14.6736 22.8401 15.2248 22.5901 15.6579L20.463 19.3421C20.2129 19.7752 19.6814 19.957 19.2185 19.7678L16.4623 18.641C16.1621 18.8431 15.8475 19.0254 15.5203 19.1859L15.1182 22.1351C15.0506 22.6306 14.6274 23 14.1273 23H9.87313C9.37306 23 8.94987 22.6306 8.8823 22.1351L8.48014 19.1859C8.15296 19.0254 7.83835 18.8431 7.53818 18.641L4.78195 19.7678C4.31907 19.957 3.78756 19.7752 3.53752 19.3421L1.41042 15.6579C1.16038 15.2248 1.26869 14.6736 1.66401 14.3673L4.01841 12.5434C4.00636 12.3638 4.00025 12.1826 4.00025 12C4.00025 11.8174 4.00636 11.6362 4.01841 11.4566L1.66401 9.63266C1.26869 9.3264 1.16038 8.77521 1.41041 8.34213L3.53752 4.65787C3.78755 4.2248 4.31906 4.043 4.78195 4.23223L7.53818 5.35898C7.83835 5.1569 8.15296 4.97464 8.48014 4.81406L8.8823 1.86489C8.94987 1.3694 9.37306 1 9.87313 1H14.1273C14.6274 1 15.0506 1.3694 15.1182 1.86489ZM13.6826 6.14004L14.6392 6.60948C14.8842 6.72975 15.1201 6.86639 15.3454 7.01805L16.231 7.61423L19.1674 6.41382L20.4216 8.58619L17.9153 10.5278L17.9866 11.5905C17.9956 11.7255 18.0002 11.8621 18.0002 12C18.0002 12.1379 17.9956 12.2745 17.9866 12.4095L17.9153 13.4722L20.4216 15.4138L19.1674 17.5862L16.231 16.3858L15.3454 16.982C15.1201 17.1336 14.8842 17.2702 14.6392 17.3905L13.6826 17.86L13.2545 21H10.746L10.3178 17.86L9.36131 17.3905C9.11626 17.2702 8.88037 17.1336 8.6551 16.982L7.76954 16.3858L4.83313 17.5862L3.57891 15.4138L6.0852 13.4722L6.01392 12.4095C6.00487 12.2745 6.00024 12.1379 6.00024 12C6.00024 11.8621 6.00487 11.7255 6.01392 11.5905L6.0852 10.5278L3.57891 8.58619L4.83312 6.41382L7.76953 7.61423L8.6551 7.01805C8.88037 6.86639 9.11625 6.72976 9.36131 6.60949L10.3178 6.14004L10.746 3H13.2545L13.6826 6.14004Z' fill='black'/%3E%3C/svg%3E")}#browser_extension_side_menu button:hover{opacity:70%}#browser_extension_side_menu button:active{opacity:100%}`
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
      let timeoutId2
      addElement2(options2, "textarea", {
        placeholder: `/* Custom rules for internal URLs, matching URLs will be opened in new tabs */`,
        onkeyup(event) {
          if (timeoutId2) {
            clearTimeout(timeoutId2)
            timeoutId2 = null
          }
          timeoutId2 = setTimeout(async () => {
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
  function addSideMenu(options) {
    const menu =
      $("#browser_extension_side_menu") ||
      addElement2(doc.body, "div", {
        id: "browser_extension_side_menu",
        "data-version": 1,
      })
    addElement2(menu, "button", {
      type: "button",
      title: options.title ? "\u8BBE\u7F6E - " + options.title : "\u8BBE\u7F6E",
      onclick() {
        setTimeout(showSettings, 1)
      },
    })
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
    addStyle2(getSettingsStyle())
    addSideMenu(options)
  }
  var addLinkToAvatars = (replyElement) => {
    var _a
    const memberLink = $('a[href^="/member/"]', replyElement)
    if (
      memberLink &&
      ((_a = memberLink.firstChild) == null ? void 0 : _a.tagName) === "IMG"
    ) {
      return
    }
    const avatar = $("img.avatar", replyElement)
    if (memberLink && avatar) {
      const memberLink2 = createElement("a", {
        href: getAttribute(memberLink, "href"),
      })
      avatar.after(memberLink2)
      memberLink2.append(avatar)
    }
  }
  var alwaysShowHideButton = (replyElement) => {
    const hideButton = $('a[onclick*="ignoreReply"]', replyElement)
    if (hideButton && !hasClass(hideButton, "icon_button")) {
      addAttribute(hideButton, "class", "icon_button")
      if (!$(".v2p-controls", replyElement)) {
        hideButton.innerHTML = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.3536 2.35355C13.5488 2.15829 13.5488 1.84171 13.3536 1.64645C13.1583 1.45118 12.8417 1.45118 12.6464 1.64645L10.6828 3.61012C9.70652 3.21671 8.63759 3 7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253334 7.60288 0.0760014 7.76501C0.902945 9.08812 2.02314 10.1861 3.36061 10.9323L1.64645 12.6464C1.45118 12.8417 1.45118 13.1583 1.64645 13.3536C1.84171 13.5488 2.15829 13.5488 2.35355 13.3536L4.31723 11.3899C5.29348 11.7833 6.36241 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C14.0971 5.9119 12.9769 4.81391 11.6394 4.06771L13.3536 2.35355ZM9.90428 4.38861C9.15332 4.1361 8.34759 4 7.5 4C4.80285 4 2.52952 5.37816 1.09622 7.50001C1.87284 8.6497 2.89609 9.58106 4.09974 10.1931L9.90428 4.38861ZM5.09572 10.6114L10.9003 4.80685C12.1039 5.41894 13.1272 6.35031 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11C6.65241 11 5.84668 10.8639 5.09572 10.6114Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`
      }
      const nextSibling = hideButton.nextSibling
      if (nextSibling && nextSibling.nodeType === 3) {
        nextSibling.textContent = ""
      }
    }
  }
  var alwaysShowThankButton = (replyElement) => {
    const thankButton = $('a[onclick*="thankReply"]', replyElement)
    if (thankButton && !hasClass(thankButton, "icon_button")) {
      addAttribute(thankButton, "class", "icon_button")
      if (!$(".v2p-controls", replyElement)) {
        thankButton.innerHTML = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.89346 2.35248C3.49195 2.35248 2.35248 3.49359 2.35248 4.90532C2.35248 6.38164 3.20954 7.9168 4.37255 9.33522C5.39396 10.581 6.59464 11.6702 7.50002 12.4778C8.4054 11.6702 9.60608 10.581 10.6275 9.33522C11.7905 7.9168 12.6476 6.38164 12.6476 4.90532C12.6476 3.49359 11.5081 2.35248 10.1066 2.35248C9.27059 2.35248 8.81894 2.64323 8.5397 2.95843C8.27877 3.25295 8.14623 3.58566 8.02501 3.88993C8.00391 3.9429 7.98315 3.99501 7.96211 4.04591C7.88482 4.23294 7.7024 4.35494 7.50002 4.35494C7.29765 4.35494 7.11523 4.23295 7.03793 4.04592C7.01689 3.99501 6.99612 3.94289 6.97502 3.8899C6.8538 3.58564 6.72126 3.25294 6.46034 2.95843C6.18109 2.64323 5.72945 2.35248 4.89346 2.35248ZM1.35248 4.90532C1.35248 2.94498 2.936 1.35248 4.89346 1.35248C6.0084 1.35248 6.73504 1.76049 7.20884 2.2953C7.32062 2.42147 7.41686 2.55382 7.50002 2.68545C7.58318 2.55382 7.67941 2.42147 7.79119 2.2953C8.265 1.76049 8.99164 1.35248 10.1066 1.35248C12.064 1.35248 13.6476 2.94498 13.6476 4.90532C13.6476 6.74041 12.6013 8.50508 11.4008 9.96927C10.2636 11.3562 8.92194 12.5508 8.00601 13.3664C7.94645 13.4194 7.88869 13.4709 7.83291 13.5206C7.64324 13.6899 7.3568 13.6899 7.16713 13.5206C7.11135 13.4709 7.05359 13.4194 6.99403 13.3664C6.0781 12.5508 4.73641 11.3562 3.59926 9.96927C2.39872 8.50508 1.35248 6.74041 1.35248 4.90532Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`
      }
    }
  }
  var getReplyElements = () => {
    const firstReply = $('.box .cell[id^="r_"]')
    if (firstReply == null ? void 0 : firstReply.parentElement) {
      const v2exPolishModel = $(".v2p-model-mask")
      return $$('.cell[id^="r_"]', firstReply.parentElement).filter((reply) => {
        if (v2exPolishModel && v2exPolishModel.contains(reply)) {
          return false
        }
        return true
      })
    }
    return []
  }
  var getReplyId = (replyElement) =>
    replyElement ? replyElement.id.replace(/((top|related)_)?r_/, "") : ""
  var getFloorNumberElement = (replyElement) =>
    replyElement ? $(".no", replyElement) : void 0
  var getFloorNumber = (replyElement) => {
    const numberElement = getFloorNumberElement(replyElement)
    if (numberElement) {
      return Number.parseInt(numberElement.textContent || "", 10) || 0
    }
    return 0
  }
  var cloneReplyElement = (replyElement) => {
    const cloned = replyElement.cloneNode(true)
    const floorNumber = $(".no", cloned)
    const toolbox = $(".fr", cloned)
    if (toolbox && floorNumber) {
      const floorNumber2 = createElement("a", {
        class: "no",
        textContent: floorNumber.textContent,
      })
      addEventListener(floorNumber2, "click", (event) => {
        replyElement.scrollIntoView({ block: "start" })
        event.preventDefault()
        event.stopPropagation()
      })
      toolbox.innerHTML = ""
      toolbox.append(floorNumber2)
    }
    const cells = $$(".cell,.v2p-topic-reply-ref", cloned)
    for (const cell of cells) {
      cell.remove()
    }
    return cloned
  }
  var sortReplyElementsByFloorNumberCompareFn = (a, b) =>
    getFloorNumber(a) - getFloorNumber(b)
  var parseUrl = () => {
    const matched = /\/t\/(\d+)(?:.+\bp=(\d+))?/.exec(location.href) || []
    const topicId = matched[1]
    const page = Number.parseInt(matched[2], 10) || 1
    return { topicId, page }
  }
  var isTouchScreen = "ontouchstart" in document.documentElement
  var timeoutId
  var showModalReplies = (replies, referElement, memberId, type) => {
    var _a
    const main2 = $("#Main") || $(".content")
    if (!main2) {
      return
    }
    setStyle(main2, "position: relative;")
    const replyElement = $("#Main")
      ? referElement.closest("#Main .cell")
      : referElement.closest(".cell")
    const relatedBox =
      replyElement == null ? void 0 : replyElement.closest(".related_replies")
    if (replyElement && relatedBox) {
      const lastRelatedRepliesBox = $$(".related_replies_container").pop()
      if (
        lastRelatedRepliesBox == null
          ? void 0
          : lastRelatedRepliesBox.contains(replyElement)
      ) {
      } else {
        closeModal(true)
      }
    } else {
      closeModal()
    }
    const container = addElement2(main2, "div", {
      class: "related_replies_container",
    })
    const box = addElement2(container, "div", {
      class: "box related_replies related_replies_before",
    })
    const box2 = addElement2(container, "div", {
      class: "box related_replies related_replies_after",
    })
    box.innerHTML = ""
    box2.innerHTML = ""
    const tabs = addElement2(box, "div", {
      class: "box tabs inner",
    })
    addElement2(tabs, "a", {
      class: !type || type === "all" ? "tab_current" : "tab",
      href: actionHref,
      textContent: "\u5168\u90E8\u56DE\u590D",
      onclick() {
        showRelatedReplies(referElement, memberId)
      },
    })
    addElement2(tabs, "a", {
      class: type === "posted" ? "tab_current" : "tab",
      href: actionHref,
      textContent: `\u4EC5 ${memberId} \u53D1\u8868\u7684\u56DE\u590D`,
      onclick() {
        showRelatedReplies(referElement, memberId, "posted")
      },
    })
    const replyId = replyElement ? getReplyId(replyElement) : void 0
    const floorNumber = replyElement ? getFloorNumber(replyElement) : 0
    let beforeCount = 0
    let afterCount = 0
    replies.sort(sortReplyElementsByFloorNumberCompareFn)
    for (const reply of replies) {
      const replyId2 = getReplyId(reply)
      const floorNumber2 = getFloorNumber(reply)
      if (replyId === replyId2) {
        continue
      }
      if (floorNumber > floorNumber2) {
        box.append(reply)
        beforeCount++
      } else {
        box2.append(reply)
        afterCount++
      }
    }
    if (beforeCount === 0 && afterCount === 0) {
      addElement2(box, "div", {
        class: "cell",
        innerHTML: `<span class="fade">\u672C\u9875\u9762\u6CA1\u6709\u5176\u4ED6\u56DE\u590D</span>`,
      })
      if (!type || type === "all") {
        tabs.remove()
        addClass(container, "no_replies")
        addEventListener(
          referElement,
          "mouseout",
          () => {
            container.remove()
          },
          { once: true }
        )
      }
    }
    if (beforeCount === 0 && afterCount > 0) {
      addElement2(box, "div", {
        class: "cell",
        innerHTML: `<span class="fade">\u8FD9\u6761\u56DE\u590D\u540E\u9762\u8FD8\u6709 ${afterCount} \u6761\u56DE\u590D</span>`,
      })
    }
    if (beforeCount > 0 && afterCount === 0) {
      addElement2(box2, "div", {
        class: "cell",
        innerHTML: `<span class="fade">\u8FD9\u6761\u56DE\u590D\u524D\u9762\u8FD8\u6709 ${beforeCount} \u6761\u56DE\u590D</span>`,
      })
    }
    if (replyElement) {
      const offsetTop = getOffsetPosition(replyElement, main2).top
      const height = box.offsetHeight || box.clientHeight
      const height2 = replyElement.offsetHeight || replyElement.clientHeight
      setStyle(box, {
        top: offsetTop - height + "px",
        width: replyElement.offsetWidth + "px",
      })
      setStyle(box2, {
        top: offsetTop + height2 + "px",
        width: replyElement.offsetWidth + "px",
      })
    } else if (afterCount > 0) {
      ;(_a = box2.firstChild) == null ? void 0 : _a.before(tabs)
      const headerElement =
        referElement == null ? void 0 : referElement.closest(".header")
      if (headerElement) {
        const offsetTop = getOffsetPosition(headerElement, main2).top
        const height2 = headerElement.offsetHeight || headerElement.clientHeight
        setStyle(box2, {
          top: offsetTop + height2 + "px",
          width: headerElement.offsetWidth + "px",
        })
        box.remove()
      } else {
        const firstReply = $('.box .cell[id^="r_"]')
        const offsetTop = firstReply
          ? Math.max(getOffsetPosition(firstReply, main2).top, window.scrollY)
          : window.scrollY
        setStyle(box, {
          top: offsetTop + "px",
          width: firstReply ? firstReply.offsetWidth + "px" : "100%",
        })
        setStyle(box2, {
          top: offsetTop + "px",
          width: firstReply ? firstReply.offsetWidth + "px" : "100%",
        })
        box2.scrollIntoView({ block: "nearest" })
      }
    } else {
      box.remove()
      box2.remove()
    }
  }
  var filterRepliesPostedByMember = (memberIds) => {
    const replies = []
    const replyElements = getReplyElements()
    for (const replyElement of replyElements) {
      const memberLink = $('a[href^="/member/"]', replyElement)
      if (!memberLink) {
        continue
      }
      const memberId = (/member\/(\w+)/.exec(memberLink.href) || [])[1]
      if (memberIds.includes(memberId)) {
        const cloned = cloneReplyElement(replyElement)
        cloned.id = "related_" + replyElement.id
        replies.push(cloned)
      }
    }
    return replies
  }
  var filterRepliesByPosterOrMentioned = (memberId) => {
    const replies = []
    const replyElements = getReplyElements()
    for (const replyElement of replyElements) {
      const memberLink = $(`a[href^="/member/${memberId}"]`, replyElement)
      if (!memberLink) {
        continue
      }
      const cloned = cloneReplyElement(replyElement)
      const memberLink2 = $(`a[href^="/member/${memberId}"]`, cloned)
      if (!memberLink2) {
        continue
      }
      cloned.id = "related_" + replyElement.id
      replies.push(cloned)
    }
    return replies
  }
  var showRelatedReplies = (memberLink, memberId, type) => {
    const replies =
      type === "posted"
        ? filterRepliesPostedByMember([memberId])
        : filterRepliesByPosterOrMentioned(memberId)
    showModalReplies(replies, memberLink, memberId, type)
  }
  var onMouseOver = (event) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = void 0
    }
    const memberLink = event.target
    timeoutId = setTimeout(() => {
      const memberId = (/member\/(\w+)/.exec(memberLink.href) || [])[1]
      if (memberId) {
        showRelatedReplies(memberLink, memberId)
      }
    }, 500)
  }
  var onMouseOut = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = void 0
    }
  }
  var closeModal = (closeLast = false) => {
    for (const element of $$(".related_replies_container").reverse()) {
      element.remove()
      if (closeLast) {
        break
      }
    }
  }
  var onDocumentClick = (event) => {
    const target = event.target
    if (isTouchScreen) {
      const memberLink = target.closest('a[href^="/member/"]')
      if (memberLink && !$("img", memberLink)) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
    }
    const floorNumberElement = target.closest(".related_replies a.no")
    if (floorNumberElement) {
      closeModal()
      return
    }
    const lastRelatedRepliesBox = $$(".related_replies_container").pop()
    const relatedReply = target.closest(".related_replies .cell")
    if (
      relatedReply &&
      (lastRelatedRepliesBox == null
        ? void 0
        : lastRelatedRepliesBox.contains(relatedReply))
    ) {
      return
    }
    const relatedRepliesBox = target.closest(".related_replies_container")
    if (relatedRepliesBox) {
      closeModal(true)
      return
    }
    closeModal()
  }
  var onDocumentKeyDown = (event) => {
    if (event.defaultPrevented) {
      return
    }
    switch (event.key) {
      case "Escape": {
        closeModal(true)
        break
      }
      default: {
        return
      }
    }
    event.preventDefault()
  }
  var filterRepliesByUser = (toogle) => {
    if (toogle) {
      const memberLinks = $$('a[href^="/member/"]')
      for (const memberLink of memberLinks) {
        if (!memberLink.boundEvent) {
          addEventListener(memberLink, "mouseover", onMouseOver, true)
          addEventListener(memberLink, "mouseout", onMouseOut)
          if (isTouchScreen) {
            addEventListener(memberLink, "touchstart", onMouseOver, true)
          }
          memberLink.boundEvent = true
        }
      }
      if (!doc.boundEvent) {
        addEventListener(doc, "click", onDocumentClick, true)
        addEventListener(doc, "keydown", onDocumentKeyDown, true)
        doc.boundEvent = true
      }
    } else if (doc.boundEvent) {
      closeModal()
      removeEventListener(doc, "click", onDocumentClick, true)
      removeEventListener(doc, "keydown", onDocumentKeyDown, true)
      doc.boundEvent = false
      const memberLinks = $$('a[href^="/member/"]')
      for (const memberLink of memberLinks) {
        if (memberLink.boundEvent) {
          removeEventListener(memberLink, "mouseover", onMouseOver, true)
          removeEventListener(memberLink, "mouseout", onMouseOut)
          if (isTouchScreen) {
            removeEventListener(memberLink, "touchstart", onMouseOver, true)
          }
          memberLink.boundEvent = false
        }
      }
    }
  }
  var getTopicReplies = async (topicId, replyCount) => {
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
  var updateReplyElements = (replies, replyElements, page = 1) => {
    var _a
    let floorNumberOffset = 0
    let hideCount = 0
    const dataOffSet = (page - 1) * 100
    const length = Math.min(replies.length - (page - 1) * 100, 100)
    for (let i = 0; i < length; i++) {
      const realFloorNumber = i + dataOffSet + 1
      const reply = replies[i + dataOffSet]
      const id = reply.id
      const element = $("#r_" + id)
      if (!element) {
        console.info(
          `[V2EX.REP] \u5C4F\u853D\u6216\u9690\u85CF\u7684\u56DE\u590D: #${realFloorNumber}, \u7528\u6237 ID: ${
            (_a = reply.member) == null ? void 0 : _a.username
          }, \u56DE\u590D ID: ${reply.id}, \u56DE\u590D\u5185\u5BB9: ${
            reply.content
          }`
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
      }
    }
    console.info(
      "[V2EX.REP] floorNumberOffset",
      floorNumberOffset,
      "hideCount",
      hideCount
    )
    if (floorNumberOffset > 0) {
      for (const element of replyElements) {
        if (element.found) {
          continue
        }
        const numberElement = getFloorNumberElement(element)
        if (numberElement) {
          const orgNumber = Number.parseInt(
            numberElement.dataset.orgNumber || numberElement.textContent || "",
            10
          )
          if (orgNumber) {
            numberElement.dataset.orgNumber = String(orgNumber)
            numberElement.textContent = String(orgNumber + floorNumberOffset)
          }
        }
      }
    }
    window.dispatchEvent(new Event("floorNumberUpdated"))
  }
  var isRunning = false
  var fixReplyFloorNumbers = async () => {
    var _a
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
        (/(\d+)\s条回复/.exec(
          ((_a = $(".box .cell .gray")) == null ? void 0 : _a.textContent) || ""
        ) || [])[1],
        10
      ) || 0
    if (
      displayNumber === replyElements.length ||
      displayNumber % 100 === replyElements.length ||
      replyElements.length === 100
    ) {
      return
    }
    const replies = await getTopicReplies(topicId)
    if (replies) {
      updateReplyElements(replies, replyElements, page)
      if (replies.length < displayNumber) {
        console.info("[V2EX.REP] API data outdated, re-fetch it")
        setTimeout(async () => {
          isRunning = true
          const replies2 = await getTopicReplies(topicId, displayNumber)
          if (replies2) {
            updateReplyElements(replies2, replyElements, page)
          }
          isRunning = false
        }, 100)
      }
    }
    isRunning = false
  }
  var lazyLoadAvatars = (replyElement) => {
    const avatar = $("img.avatar", replyElement)
    if (avatar) {
      if (getAttribute(avatar, "loading") === "lazy") {
        return
      }
      setAttribute(avatar, "loading", "lazy")
      const src = getAttribute(avatar, "src")
      setAttribute(
        avatar,
        "src",
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      )
      setTimeout(() => {
        setAttribute(avatar, "src", src)
      })
    }
  }
  var quickHideReply = (replyElement) => {
    const hideButton = $('a[onclick*="ignoreReply"]', replyElement)
    if (hideButton) {
      const onclick = getAttribute(hideButton, "onclick")
      if (!onclick.includes("confirm")) {
        return
      }
      setAttribute(
        hideButton,
        "onclick",
        onclick.replace(/.*(ignoreReply\(.+\)).*/, "$1")
      )
      setAttribute(hideButton, "href", actionHref)
      hideButton.outerHTML = hideButton.outerHTML
    }
  }
  var quickSendThank = (replyElement) => {
    const thankButton = $('a[onclick*="thankReply"]', replyElement)
    if (thankButton) {
      const replyId = replyElement.id.replace("r_", "")
      const onclick = getAttribute(thankButton, "onclick")
      if (!onclick.includes("confirm")) {
        return
      }
      setAttribute(
        thankButton,
        "onclick",
        onclick.replace(/.*(thankReply\(.+\)).*/, "$1")
      )
      setAttribute(thankButton, "href", actionHref)
      if (hasClass(thankButton.parentElement, "v2p-controls")) {
        const div = createElement("div", {
          id: "thank_area_" + replyId,
        })
        thankButton.after(div)
        const hideButton = $('a[onclick*="ignoreReply"]', replyElement)
        if (hideButton) {
          div.append(hideButton)
        }
        div.append(thankButton)
      }
      thankButton.outerHTML = thankButton.outerHTML
    }
  }
  var replyWithFloorNumber = (replyElement, forceUpdate = false) => {
    const replyButton = $('a[onclick^="replyOne"]', replyElement)
    if (replyButton) {
      setAttribute(replyButton, "href", actionHref)
      const onclick = getAttribute(replyButton, "onclick") || ""
      if (onclick.includes("#") && !forceUpdate) {
        return
      }
      const number = getFloorNumber(replyElement)
      if (number) {
        setAttribute(
          replyButton,
          "onclick",
          onclick.replace(
            /replyOne\('(\w+)(?: .*)?'\)/,
            `replyOne('$1 #${number}')`
          )
        )
        replyButton.outerHTML = replyButton.outerHTML
      }
    }
  }
  var done = false
  var reset = () => {
    const element = $("#top_replies")
    if (element) {
      const sep20 = element.previousElementSibling
      if (hasClass(sep20, "sep20")) {
        sep20.remove()
      }
      element.remove()
    }
  }
  var showTopReplies = (toggle, forceUpdate = false) => {
    if (!toggle) {
      reset()
      removeClass($("#Wrapper"), "sticky_rightbar")
      done = false
      return
    }
    if (done && !forceUpdate) {
      return
    }
    done = true
    reset()
    addClass($("#Wrapper"), "sticky_rightbar")
    const replyElements = getReplyElements()
      .filter((reply) => {
        var _a
        const heartElement = $('img[alt="\u2764\uFE0F"],.v2p-icon-heart', reply)
        if (heartElement) {
          const childReplies = $$('.cell[id^="r_"]', reply)
          for (const child of childReplies) {
            if (child.contains(heartElement)) {
              return false
            }
          }
          const thanked = Number.parseInt(
            ((_a = heartElement.nextSibling) == null
              ? void 0
              : _a.textContent) || "0",
            10
          )
          if (thanked > 0) {
            reply.thanked = thanked
            return true
          }
        }
        return false
      })
      .sort((a, b) =>
        b.thanked === a.thanked
          ? sortReplyElementsByFloorNumberCompareFn(a, b)
          : b.thanked - a.thanked
      )
    if (replyElements.length > 0) {
      const box = createElement("div", {
        class: "box",
        id: "top_replies",
        innerHTML: `<div class="cell"><div class="fr"></div><span class="fade">\u5F53\u524D\u9875\u70ED\u95E8\u56DE\u590D</span></div>`,
      })
      for (const element of replyElements) {
        const cloned = cloneReplyElement(element)
        cloned.id = "top_" + element.id
        const ago = $(".ago", cloned)
        if (ago) {
          ago.before(createElement("br"))
        }
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
  var config = {
    matches: ["https://*.v2ex.com/*"],
    run_at: "document_start",
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
    showTopReplies: {
      title: "\u663E\u793A\u70ED\u95E8\u56DE\u590D",
      defaultValue: true,
    },
    filterRepliesByUser: {
      title:
        "\u67E5\u770B\u7528\u6237\u5728\u5F53\u524D\u4E3B\u9898\u4E0B\u7684\u6240\u6709\u56DE\u590D\u4E0E\u88AB\u63D0\u53CA\u7684\u56DE\u590D",
      description:
        "\u9F20\u6807\u79FB\u81F3\u7528\u6237\u540D\uFF0C\u4F1A\u663E\u793A\u8BE5\u7528\u6237\u5728\u5F53\u524D\u4E3B\u9898\u4E0B\u7684\u6240\u6709\u56DE\u590D\u4E0E\u88AB\u63D0\u53CA\u7684\u56DE\u590D",
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
    const domReady =
      doc.readyState === "interactive" || doc.readyState === "complete"
    if (/\/t\/\d+/.test(location.href)) {
      const replyElements = getReplyElements()
      for (const replyElement of replyElements) {
        lazyLoadAvatars(replyElement)
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
      }
      if (domReady) {
        showTopReplies(getSettingsValue("showTopReplies"))
      }
      filterRepliesByUser(getSettingsValue("filterRepliesByUser"))
      if (
        domReady &&
        getSettingsValue("fixReplyFloorNumbers") &&
        !fixedReplyFloorNumbers
      ) {
        await fixReplyFloorNumbers()
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
      async onValueChange() {
        await process2()
      },
    })
    registerMenuCommands()
    addStyle2(content_default)
    addEventListener(window, "floorNumberUpdated", () => {
      fixedReplyFloorNumbers = true
      if (getSettingsValue("replyWithFloorNumber")) {
        const replyElements = getReplyElements()
        for (const replyElement of replyElements) {
          replyWithFloorNumber(replyElement, true)
        }
      }
      showTopReplies(getSettingsValue("showTopReplies"), true)
    })
    addEventListener(doc, "readystatechange", async () => {
      await process2()
    })
    await process2()
    const scanNodes = throttle(() => {
      process2()
    }, 500)
    const observer = new MutationObserver((mutationsList) => {
      scanNodes()
    })
    observer.observe($("#Main") || doc, {
      childList: true,
      subtree: true,
    })
  }
  main()
})()
