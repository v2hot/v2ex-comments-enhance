# V2EX.REP - 专注提升 V2EX 主题回复浏览体验

> REP = Reply Experience Plus, Reply Extension Plus, Reply Enjoyment Plus, Reply, Repair

专注提升 V2EX 主题回复浏览体验的浏览器扩展/用户脚本。

## 主要功能

- ✅ 修复有被 block 的用户时错位的楼层号
- ✅ 回复时自动带上楼层号
- ✅ 显示热门回复
- ✅ 显示被引用的回复
- ✅ 查看用户在当前主题下的所有回复与被提及的回复
- ✅ 自动预加载所有分页，支持解析显示跨页面引用
- ✅ 回复时上传图片，支持同时上传多个图片
- ✅ 无感自动签到，可以把签到这件事情忘掉了
- ✅ 懒加载用户头像图片
- ✅ 一直显示感谢按钮 🙏
- ✅ 一直显示隐藏回复按钮 🙈
- ✅ 快速发送感谢/快速隐藏回复（no confirm）
- ✅ 去掉 URL 中的 #replyXX，使 URL 更简洁，已添加到收藏夹状态一直有效
- ✅ 主题内容底部固定显示按钮栏
- ✅ 双击空白处快速导，在主题区，回复区，回复框之间快速跳转

> ⚠️ 兼容 V2EX Plus, V2EX Polish 等浏览器扩展/脚本。兼容手机网页版 V2EX。

## 页面截屏

- 设置功能，每个功能可单独开或关

![screenshots](assets/v2ex.rep-screenshots-01.png)

- 修复有被 block 的用户时错位的楼层号，控制台可看到被屏蔽的楼层与内容

![screenshots](assets/v2ex.rep-screenshots-02.png)

- 回复时自动带上楼层号

![screenshots](assets/v2ex.rep-screenshots-03.png)

- 显示热门回复，点击楼层数，可直达该回复

![screenshots](assets/v2ex.rep-screenshots-05.png)

- 显示回复中被引用的回复

![screenshots](assets/v2ex.rep-screenshots-08.png)

- 鼠标移至用户名，查看该用户在当前主题下的所有回复

![screenshots](assets/v2ex.rep-screenshots-06.png)

![screenshots](assets/v2ex.rep-screenshots-07.png)

- 一直显示感谢按钮/回复按钮

![screenshots](assets/v2ex.rep-screenshots-04.png)

## Installation

- Chrome Extension: [Manual Installation](manual-installation.md)
- Edge Extension: [Manual Installation](manual-installation.md)
- Firefox Addon: [Manual Installation](manual-installation.md)
- Userscript: [https://greasyfork.org/scripts/466589-v2ex-rep](https://greasyfork.org/scripts/466589-v2ex-rep)

## Development

This extension/userscript is built from [Browser Extension Starter and Userscript Starter](https://github.com/utags/browser-extension-starter)

## Features

- One codebase for Chrome extesions, Firefox addons, Userscripts, Bookmarklets and simple JavaScript modules
- Live-reload and React HMR
- [Plasmo](https://www.plasmo.com/) - The Browser Extension Framework
- [esbuild](https://esbuild.github.io/) - Bundler
- React
- TypeScript
- [Prettier](https://github.com/prettier/prettier) - Code Formatter
- [XO](https://github.com/xojs/xo) - JavaScript/TypeScript linter

## Showcases

- [UTags - Add usertags to links](https://github.com/utags/utags) - Allow users to add custom tags to links.
- [Hacker News Apps Switcher](https://github.com/dev-topics-only/hacker-news-apps-switcher) - Open Hacker News links on the favorite apps

## How To Make A New Extension

1. Fork [this starter repo](https://github.com/utags/browser-extension-starter), and rename repo to your extension name

2. Clone your repo

3. Install dependencies

```bash
pnpm install
# or
npm install
```

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!

## License

Copyright (c) 2023 [Pipecraft](https://www.pipecraft.net). Licensed under the [MIT License](LICENSE).

## >\_

[![Pipecraft](https://img.shields.io/badge/site-pipecraft-brightgreen)](https://www.pipecraft.net)
[![UTags](https://img.shields.io/badge/site-UTags-brightgreen)](https://utags.pipecraft.net)
[![DTO](https://img.shields.io/badge/site-DTO-brightgreen)](https://dto.pipecraft.net)
[![BestXTools](https://img.shields.io/badge/site-bestxtools-brightgreen)](https://www.bestxtools.com)
