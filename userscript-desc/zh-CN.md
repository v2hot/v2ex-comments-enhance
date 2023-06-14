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

> - ⚠️ 兼容 V2EX Plus, V2EX Polish 等浏览器扩展/脚本。兼容手机网页版 V2EX。
> - ⚠️ 暂时不兼容 V2EX - 超级增强脚本，以后会兼容。

## 页面截屏

- 设置功能，每个功能可单独开或关

![screenshots](https://raw.githubusercontent.com/v2hot/v2ex.rep/main/assets/v2ex.rep-screenshots-01.png)

- 修复有被 block 的用户时错位的楼层号，控制台可看到被屏蔽的楼层与内容

![screenshots](https://raw.githubusercontent.com/v2hot/v2ex.rep/main/assets/v2ex.rep-screenshots-02.png)

- 回复时自动带上楼层号

![screenshots](https://raw.githubusercontent.com/v2hot/v2ex.rep/main/assets/v2ex.rep-screenshots-03.png)

- 显示热门回复，点击楼层数，可直达该回复

![screenshots](https://raw.githubusercontent.com/v2hot/v2ex.rep/main/assets/v2ex.rep-screenshots-05.png)

- 显示回复中被引用的回复，楼中楼的替代方案

![screenshots](https://raw.githubusercontent.com/v2hot/v2ex.rep/main/assets/v2ex.rep-screenshots-08.png)

- 鼠标移至用户名，查看该用户在当前主题下的所有回复

![screenshots](https://raw.githubusercontent.com/v2hot/v2ex.rep/main/assets/v2ex.rep-screenshots-06.png)

![screenshots](https://raw.githubusercontent.com/v2hot/v2ex.rep/main/assets/v2ex.rep-screenshots-07.png)

- 一直显示感谢按钮/回复按钮

![screenshots](https://raw.githubusercontent.com/v2hot/v2ex.rep/main/assets/v2ex.rep-screenshots-04.png)

## 其他

兼容以下用户脚本管理器

- Tampermonkey (推荐)
- Violentmonkey
- Greasemonkey
- Userscripts (Safari)

## About

- Repository: [https://github.com/v2hot/v2ex.rep](https://github.com/v2hot/v2ex.rep)
- Feedback: [https://github.com/v2hot/v2ex.rep/issues](https://github.com/v2hot/v2ex.rep/issues)
- 安装浏览器扩展版本: [Manual Installation](https://github.com/v2hot/v2ex.rep/blob/main/manual-installation.md)

## 其他 V2EX 必装脚本

- [🏷️ 小鱼标签 (UTags) - 为链接添加用户标签，支持 V2EX](https://greasyfork.org/scripts/460718-utags-add-usertags-to-links)
- [🔗 链接助手](https://greasyfork.org/scripts/464541-links-helper) - 支持所有网站在新标签页中打开第三方网站链接（外链），在新标签页中打开符合指定规则的本站链接，解析文本链接为超链接，微信公众号文本转可点击的超链接，图片链接转图片标签，解析 Markdown 格式链接与图片标签
- [v2ex.min - V2EX 极简风格](https://greasyfork.org/scripts/463552-v2ex-min)

## Release Notes

- 1.3.0 2023.06.14
  - 去掉 URL 中的 #replyXX，使 URL 更简洁，已添加到收藏夹状态一直有效
  - 主题内容底部固定显示按钮栏
- 1.2.1 2023.06.13
  - 支持同时上传多个图片
- 1.2.0 2023.06.13
  - 自动签到功能
- 1.1.0 2023.06.12
  - 添加上传图片功能
- 1.0.2 2023.06.12
  - 修复 v2ex plus 2.x 兼容性问题
- 1.0.1 2023.06.10
  - 缓存 API 结果
  - Retry fetch requests
- 1.0.0 2023.06.09
  - 自动预加载所有分页，合并显示所有分页，支持显示跨页面引用
  - 优化回复中引用的楼层号解析，被引用的回复显示
  - Fix v2ex plus, v2ex polish issues
- 0.2.1 2023.06.07
  - 解析回复中引用的楼层号，显示对应楼层号的回复，点击楼层号跳转到对应回复
  - 优化性能
- 0.2.0 2023.06.06
  - 显示被引用的回复
- 0.1.2 2023.06.05
  - 优化懒加载用户头像图片
  - 设置中可开关此功能，默认关
- 0.1.1 2023.06.05
  - 懒加载用户头像图片，楼层数多时，可减少加载时间
  - 更改为 run-at: document-start，页面加载中也可使用查看用户回复功能
- 0.1.0 2023.06.02
  - 给用户头像加上链接
  - 修改手机网页版兼容性问题
  - 更新修复楼层号逻辑
- 0.0.6 2023.06.01
  - 查看用户在当前主题下的所有回复与被提及的回复
- 0.0.4 2023.05.30
  - 查看指定用户在当前主题下的所有回复
- 0.0.3 2023.05.25
  - 显示热门回复
- 0.0.2 2023.05.23
  - 修改 v2ex polish 扩展/脚本兼容性问题
  - Change emoji to icon
  - 添加侧边栏设置按钮
- 0.0.1 2023.05.19
  - ✅ 修复有被 block 的用户时错位的楼层号
  - ✅ 回复时自动带上楼层号
  - ✅ 一直显示感谢按钮 🙏
  - ✅ 一直显示隐藏回复按钮 🙈
  - ✅ 快速发送感谢/快速隐藏回复（no confirm）

## License

Copyright (c) 2023 [Pipecraft](https://www.pipecraft.net). Licensed under the [MIT License](https://github.com/v2hot/v2ex.rep/blob/main/LICENSE).

## >\_

[![Pipecraft](https://img.shields.io/badge/site-pipecraft-brightgreen)](https://www.pipecraft.net)
[![UTags](https://img.shields.io/badge/site-UTags-brightgreen)](https://utags.pipecraft.net)
[![DTO](https://img.shields.io/badge/site-DTO-brightgreen)](https://dto.pipecraft.net)
[![BestXTools](https://img.shields.io/badge/site-bestxtools-brightgreen)](https://www.bestxtools.com)
