# Agent Opus · 品牌迁移 Lite 包

这是已确认的 **v19.10** 画面版本，工程版本 **1.1.0**。包含完整可编辑源码、必要本地素材、字体、已批准混合音轨，以及一份完整的 720p 参考视频。源码导出仍是 **1920×1080 · 30 fps · 1224 帧 · 40.8 秒**。

先看 `preview/reference.mp4`。它是本工程的 Agent Opus 演示成片，不参与后续渲染。没有历史版本、工作目录、node_modules、机器专用路径或服务密钥。所有画面都从 `src/` 渲染。

## 最快换成你的品牌

用 Codex 打开解压后的整个文件夹，提供品牌官网、Logo、素材和想表达的产品价值，发送：

> 读取 README.md，先观看 preview/reference.mp4，再检查配置和源码。把这个模板适配成【品牌名 / 官网】的完整发布视频。我提供的素材是【素材位置】。保留现有美感、字面模糊和高光、整段吐字曲线、镜头连续性，以及 40.8 秒时间轴和后续卡点。根据产品的真实用途同步改文案、对话、输入、操作和输出示例。Logo、配色、网址及旁白也换成这个品牌。先做完整视频给我确认，再交付修改后的工程。

品牌名称、文案、Logo、主配色与媒体路径集中在 `config/template.json`。聊天角色名会自动读取 `product.name`。这是一套可以由 Codex 或开发者修改的工程；不是只改名称就能自动完成所有产品适配的一键工具。

## 安装与预览

需要 Node.js 22+。首次下载依赖和渲染浏览器需要联网；默认素材不需要 API 密钥或账号。

```sh
npm ci
npm run check
npm run studio
```

在 Studio 选择 `ProductLaunch`。导出完整 1080p 视频：

```sh
npm run render
```

输出为 `dist/product-launch.mp4`。检查关键帧或渲染局部：

```sh
npm run stills -- --frames=6,24,96,350,401,610,708,818,1210
npm run render -- --range=288-445
```

局部输出为 `dist/segment-288-445.mp4`，帧范围包含首尾；局部渲染用于动作检查，最终请运行完整导出以接入混音。默认并发 2，内存不足可用 `RENDER_CONCURRENCY=1 npm run render`。

## 品牌替换入口

| 修改内容 | 配置或文件 |
|---|---|
| 品牌名、网站 | `product.name`、`product.website` |
| 开头两行、第二句、输入与结尾 CTA | `copy.openingLines`、`secondClaimLines`、其他 `copy` 字段 |
| 用户输入 → AI 剧本 → Approve → 分镜 | `workflowBrief`、`workflowTone`、`agentReply`、`screenplay`、`approval`、`storyboardReply` |
| 剧本标签及展示时长 | `copy.screenplayHeading`、`copy.screenplayDuration`；这里的 30 seconds 是示例广告长度，不是本片总长 |
| 修改对话 | `copy.revision`、`copy.revisionReply` |
| 结果问题、三类输出提示 | `copy.categoryQuestion`、`copy.categoryPrompts` |
| 片尾 Logo | `brand.wordmark` |
| 立体品牌图形 | `brand.markPaths`、`markViewBox`、`markTransform` |
| 字面流动颜色、Logo 正面和侧面颜色 | `brand.titleColors`（5 色）、`markFaceColors`（5 色）、`markSideColors`（3 色） |
| 开场三段视频及取帧/裁切 | `media.openingVideos`（3 项） |
| 输入图片、分镜素材 | `media.inputImages`（4 项）、`workflowImages`（6 项） |
| 三镜头动态预览 | `media.workflowPreviewClips`（3 项，设置开始/结束时间与速度） |
| 三个主视频 | `media.heroVideos`、`heroStartSeconds`、`heroPlaybackRates`（各 3 项） |
| 多视频结果墙 | `media.wallVideos`，保留 ads / stories / explainers 三个内部组名并更新 duration |
| 完整混合音轨 | `audio.master`；`audio.mode` 可选 master 或 mute |

素材放进 `public/`，配置填写相对于 `public/` 的路径。例如文件 `public/my-brand/logo.svg` 写成 `my-brand/logo.svg`。不使用绝对路径或在线链接。

更换 Logo 时，要同时更新片尾字标和立体图形的 SVG 路径；仅替换 wordmark 不会改变开场和对话之外的立体标志。颜色数组控制对应渐变，气泡、阴影、按钮和环境底色仍在场景代码里；如需完整换色，需一并适配这些颜色并检查对比度。

文案不是自动排版：先保持现有行数和相近长度。剧本固定 3 行，一整段共用同一个输出曲线；不要给每行重新启动动画。更长文案需要调整字级、宽度、遮罩与阅读时间。字体是本地 Fraunces / Geist；需要中文等其他文字时，增加有相应字形的字体并检查布局。

示例产品逻辑也要跟品牌一起更换。分镜中的草图是代码绘制的 SVG，位于 `src/agent-opus/locked/Workflow.tsx`；换照片不会自动重画草图。主视频默认故事片从 20 秒处开始，换短素材必须同步改起始位置。结果墙使用 14 条示例视频重复错位取帧，卡片数不代表独立素材数量。

## 已确认的动作与时间约束

本版包含：新的不对称开场、文字 blur → 清晰、粉紫流动色和字面光泽；有明确角色的对话；剧本整体吐字及加速 3 倍的末段；紧接的 Approve；Scene 1/2/3 分镜；连续向前的播放线及贝塞尔镜头切换；从音轨面板衔接下一段的转场；统一的后段 Fraunces 字体。

第一轮品牌迁移固定 40.8 秒及所有后续段落落点。不要加回 Storyboard / Preview 章节标题，不要把卡片做成 PPT。保留明确的进入、快速运动、收势和可读停留；不要用一条通用 spring 替换全部曲线。动效从对象之间的连续关系产生，而非额外添加无意义漂移。

| 内容 | 源码 |
|---|---|
| 全片组织与音轨 | `src/Film.tsx` |
| 开场、字体材质、卡片镜头 | `src/agent-opus/code-ui/IdeaOpening.tsx` |
| 第二句、开头输入框 | `code-ui/SecondClaim.tsx`、`code-ui/PromptCraft.tsx` |
| 对话、整段吐字、Approve 和修改回复 | `directed/Conversation.tsx` |
| 分镜、素材、预览 | `locked/Workflow.tsx`；`directed/Workflow.tsx` 复用同一实现 |
| 播放线与镜头贝塞尔 | `directed/PreviewMotion.ts` |
| 面板到下一句的衔接 | `directed/OutputHandoff.ts` |
| 输入、结果墙、放大转场 | `multiples/Inputs.tsx`、`multiples/Cycles.tsx` |
| 结尾与立体品牌标志 | `code-ui/BloomFull.tsx`、`brand/OpusMark.tsx` |

以上简写路径均相对于 `src/agent-opus/`。旧的 `BloomOpening.tsx`、`HeadlineB.tsx` 保留作为源码依赖或参考；当前开场以 `IdeaOpening.tsx` 为准。

`config/timeline.json` 是全片落点。工作流内部帧 = 全片帧 + 24；ConversationIntro 内部帧 = 全片帧 − 288。开头和结尾还有 `code-ui/motion.ts` 的时间映射，不能把内部数字直接当成全片秒数。视频墙从全片 800 / 935 / 1070 帧展开，音乐重音在 808 / 942 / 1077 帧。

## 声音与交付

包中只保留批准的混音 `public/audio/approved-master.m4a`，包含 Agent Opus 品牌旁白。换品牌时需要同步替换完整旁白/混音；参考 `config/audio-cues.json` 的语句时间窗与音效重音。Lite 不包含独立音乐、旁白或音效分轨。如需重混，准备自己的分轨或从原完整工程取出。不要把旧品牌声音当成新品牌的最终音轨。

将新混音放到 `public/audio/` 并修改 `audio.master`。完整导出使用 Remotion 自带的 FFmpeg 接入混音：M4A 直接复制音频流，其他格式编码为 AAC。换声音后，输入与工作流波形 JSON 也需要重新计算。

完成后正常速度检查全片，并检查开场、对话结尾、播放线、转场、字面裁切、音画同步及最后一秒。交付完整 MP4 和修改后的工程；说明任何尚未适配的内容。素材来源和字体许可见 `ASSETS.md`。

