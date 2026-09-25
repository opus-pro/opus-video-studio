# TOVO · Motion Template Lite

已确认版本：**2026-09-07 TOVO 最终版**；Lite 工程 **1.0.0**。
**15 秒 · 横版 1920×1080 · 60 fps · 900 帧 · 144 BPM · 18 个镜头**。

先看 `preview/reference.mp4`：随包的 720p 演示成片。它不参与渲染；所有画面由本包源码生成。TOVO 是虚构的 AI 会议行动项工具。

包含可编辑源码、配置、本地字体、颗粒素材、已批准的音乐＋英文旁白混音。没有历史版本、其他产品、node_modules、独立声音分轨、第三方参考视频或服务凭据。复现默认成片不需要 MCP 或 API key。

## 交给 Codex 换品牌

用 Codex 打开解压后的整个文件夹，发送：

> 请读取 README.md，观看 preview/reference.mp4，再检查配置和源码。把模板适配成【产品名 / 官网】，素材在【目录，可选】。保留横版 15 秒、快切、大字、真实 Web UI、对象连续性与 144 BPM 踩点。根据新产品的真实功能改写输入→处理→输出的具体演示，同步替换品牌、配色、任务示例、Logo 和旁白。不要加说明小字或做成 PPT。交付完整视频及修改后的工程。

这是可由 Codex 或开发者修改的工程，不是只改名称即可适配任何产品的一键工具。

## 安装、预览与导出

需要 Node.js 22+。第一次安装依赖与下载渲染浏览器需要联网。默认成片无需系统 FFmpeg；使用锁定版本 Remotion 自带的二进制程序。

```sh
npm ci
npm run check
npm run studio
```

在 Studio 选择 `TOVO`。导出 1080p：

```sh
npm run render
```

输出 `dist/tovo.mp4`。默认并发 2，可用 `RENDER_CONCURRENCY=1 npm run render` 降低内存占用。

```sh
npm run stills -- --frames=8,188,330,337,338,369,550,857
npm run render -- --range=288-388
```

关键帧输出在 `dist/frames/`；局部范围含首尾帧。完整交付请运行完整导出，以接入精确的 15 秒混音。

## 修改入口

| 内容 | 位置 |
|---|---|
| 品牌名、tagline、四种主色、示例任务、混音路径 | `config/brand.json` |
| 总长、帧率、18 镜头的实际帧落点 | `config/timeline.json` |
| 旁白语句窗口、音乐模型及剪辑落点 | `config/audio-cues.json` |
| 全片编排与音轨 | `src/index.tsx` |
| 字体、曲线、字标图形、大字和颗粒 | `src/style.css`、`src/shared.tsx` |
| 大字与图形镜头 | `src/tovo/` |
| 真实 Web UI 与 5–6 秒连续衔接 | `src/web/TovoWeb.tsx` |
| 通用 UI 容器、按钮与图标 | `src/web/ui.tsx` |

`task.title` 是卡片短标题，`task.action` 是口语动作短语；owner / due 是责任人与截止时间。改示例时也检查全部对话、日历数字、Said / Sorted 大字及旁白。配色配置控制主要画面；UI 的中性色、细边框、日历状态色仍在源码内。Logo 图形在 `Mark` 组件，名称变化不会自动改变图形。

素材放 `public/`，配置用相对路径，例如 `audio/new-master.m4a`。字体默认针对英文；其他语言需提供相应字形字体并调整宽度、换行和阅读时间。

## 产品逻辑和已确认动作

影片围绕一个具体例子：杂乱交谈 → “谁做什么？” → Extract → 提取 Send deck → 分配 Maya → 截止 Friday → 完整任务 → 看板 → 回溯原始对话 → Said / Sorted → 品牌。

适合 AI 会议助手、任务提取、消息转工作流等产品。迁移到其他类别时，演示结果应由前面的输入和操作自然产生；不要留下产品没有的能力。

每一镜只保留一个主要信息。大字用于强调，真实 UI 展示操作和结果；不要重新加说明小字或每镜重复标题。保留当前快切和可读停留，不将全部镜头替换成统一淡入淡出。

第 7 镜任务头像在 5–6 秒向左上方扩展为 Maya 大头像，帧 337 与 338 连续；不要在新镜头重新启动零尺寸 spring。Meeting 镜头的摄像机与波形也跨镜延续。

保持 900 帧及现有切点。动画内部使用 60 fps，修改时长或帧率需要同时重新安排所有场景和声音。包中帧号就是实际成片帧号。

## 声音

`public/audio/master.m4a` 是已批准成片的 AAC 音轨原流，包含 API 生成的音乐、英文旁白与剪辑重音。音乐经校准约 144 BPM，旁白在 `config/audio-cues.json` 中列出。Lite 不含独立分轨。

换品牌或改变产品逻辑时，同步替换旁白与最终混音。`audio.mode` 支持 `master` 或 `mute`。M4A 完整导出会复制音频流，其他格式编码 AAC。素材来源与字体许可见 `ASSETS.md`。
