/**
 * Refer to https://github.com/coolpace/V2EX_Polish and https://github.com/sciooga/v2ex-plus
 */
// 注册应用获取 Client ID：https://api.imgur.com/oauth2/addclient

import {
  $,
  addClass,
  addElement,
  addEventListener,
  createElement,
  doc,
  hasClass,
  removeClass,
  runOnce,
  setAttribute,
  win as window,
} from "browser-extension-utils"

import {
  getReplyInputElement,
  getReplyInputText,
  insertTextToReplyInput,
  replaceReplyInputText,
} from "../utils"

// 查看已注册的应用：https://imgur.com/account/settings/apps
const imgurClientIdPool = [
  // 以下 Client ID 来自「V2EX Polish」
  "3107b9ef8b316f3",

  // 以下 Client ID 来自「V2EX Plus」
  "442b04f26eefc8a",
  "59cfebe717c09e4",
  "60605aad4a62882",
  "6c65ab1d3f5452a",
  "83e123737849aa9",
  "9311f6be1c10160",
  "c4a4a563f698595",
  "81be04b9e4a08ce",
] as const satisfies readonly string[]

type ImgurResponse = {
  status: number
  success: boolean
  data: {
    /** 上传成功后生成的图片资源 hash */
    id: string
    /** 上传成功后生成的在线链接 */
    link: string
  }
}

async function uploadImageToImgur(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("image", file)

  // 随机获取一个 Imgur Client ID。
  const randomIndex = Math.floor(Math.random() * imgurClientIdPool.length)
  const clidenId = imgurClientIdPool[randomIndex]

  // 使用详情参考 Imgur API 文档：https://apidocs.imgur.com/
  const response = await fetch("https://api.imgur.com/3/upload", {
    method: "POST",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    headers: { Authorization: `Client-ID ${clidenId}` },
    body: formData,
  })

  if (response.ok) {
    const responseData: ImgurResponse = (await response.json()) as ImgurResponse

    if (responseData.success) {
      return responseData.data.link
    }
  }

  throw new Error("上传失败")
}

const handleUploadImage = (file: File) => {
  window.dispatchEvent(new Event("uploadImageStart"))
  uploadImageToImgur(file)
    .then((imgLink) => {
      window.dispatchEvent(
        new CustomEvent("uploadImageSuccess", { detail: { imgLink } })
      )
    })
    .catch(() => {
      window.dispatchEvent(new Event("uploadImageFailed"))
    })
}

const handleClickUploadImage = () => {
  const imgInput = document.createElement("input")

  imgInput.style.display = "none"
  imgInput.type = "file"
  imgInput.accept = "image/*"

  addEventListener(imgInput, "change", () => {
    const selectedFile = imgInput.files?.[0]

    if (selectedFile) {
      handleUploadImage(selectedFile)
    }
  })

  imgInput.click()
}

const init = () => {
  const replyTextArea = getReplyInputElement()
  if (!replyTextArea) {
    return
  }

  const appendPosition = $("#reply-box > div > div")
  if (!appendPosition) {
    return
  }

  setAttribute(
    replyTextArea,
    "placeholder",
    "您可以在回复框内直接粘贴图片或拖拽图片文件至回复框内上传"
  )

  const uploadTip = "+ 插入图片"
  const placeholder = "[上传图片中...]"

  addElement(appendPosition, "span", {
    class: "snow",
    textContent: " · ",
  })

  const uploadButton = createElement("a", {
    class: "vr_upload_image",
    textContent: uploadTip,
  })
  appendPosition.append(uploadButton)

  addEventListener(uploadButton, "click", () => {
    if (!hasClass(uploadButton, "vr_button_disabled")) {
      handleClickUploadImage()
    }
  })

  // 粘贴图片并上传的功能。
  addEventListener(
    doc,
    "paste",
    (event) => {
      if (!(event instanceof ClipboardEvent)) {
        return
      }

      event.preventDefault()
      event.stopImmediatePropagation()

      const replyTextArea = getReplyInputElement()
      if (!replyTextArea?.matches(":focus")) {
        return
      }

      const items = event.clipboardData?.items

      if (!items) {
        return
      }

      // 查找属于图像类型的数据项。
      const imageItem = Array.from(items).find((item) =>
        item.type.includes("image")
      )

      if (imageItem) {
        const file = imageItem.getAsFile()

        if (file) {
          handleUploadImage(file)
        }
      }
    },
    true
  )

  // 拖拽图片上传文件
  addEventListener(
    replyTextArea,
    "drop",
    (event) => {
      if (!(event instanceof DragEvent)) {
        return
      }

      event.preventDefault()
      event.stopImmediatePropagation()

      const file = event.dataTransfer?.files[0]

      if (file) {
        handleUploadImage(file)
      }
    },
    true
  )

  addEventListener(window, {
    uploadImageStart() {
      addClass(uploadButton, "vr_button_disabled")
      uploadButton.textContent = "正在上传图片..."

      const replyTextArea = getReplyInputElement()
      if (replyTextArea) {
        insertTextToReplyInput(
          replyTextArea.value.trim().length > 0 &&
            replyTextArea.selectionStart > 0
            ? `\n${placeholder}\n`
            : `${placeholder}\n`
        )
      }
    },
    uploadImageSuccess(event: CustomEvent) {
      removeClass(uploadButton, "vr_button_disabled")
      uploadButton.textContent = uploadTip
      replaceReplyInputText(
        placeholder,
        (event.detail.imgLink as string) || "",
        true
      )
    },
    uploadImageFailed() {
      removeClass(uploadButton, "vr_button_disabled")
      uploadButton.textContent = uploadTip
      replaceReplyInputText(placeholder, "")

      // eslint-disable-next-line no-alert
      alert("[V2EX.REP] ❌ 上传图片失败，请打开控制台查看原因")
    },
  })
}

export const uploadImage = () => {
  runOnce("uploadImage:init", init)
}
