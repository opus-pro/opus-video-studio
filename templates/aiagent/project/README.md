# AI Agent / Codex · Lite Package 1.0.0

已审核的 v2 smooth60 成片与可编辑 Remotion 工程。保留现有 Codex 文字、标志、花田背景和用户确认的 BGM。

- 工程：1920×1080，60 fps，1688 帧，约 28.13 秒。
- 定版预览：`preview/reference.mp4`，1280×720 / 60 fps；可直接播放。
- 内容：七段正式动画；不含参考笔记上方的 Storyboard。
- UI、文字、图标与运动曲线均由 React / SVG 绘制；两张背景图为本地 PNG。

## 开始使用

需要 Node.js 22 或更新版本及 npm。解压后在本目录运行：

```sh
npm ci
npm run verify
npm run check
npm run studio
```

Studio 会选择可用端口；打开终端显示的本地网址，再选择 `AIAgentRecreation`。无需 API key 或原始制作工程。首次安装依赖和首次准备 Chromium 时可能需要联网下载；运行时素材均在包内。

`preview/reference.mp4` 仅供观看和比对，渲染不会把它当作画面或声音输入。实际音源是 `public/reference-audio.m4a`。

## 导出

```sh
# 完整 1080p / 60 fps，输出 dist/aiagent.mp4
npm run render

# 720p / 60 fps
npm run render -- --scale=0.6666666667

# 只导出全片第 300 至 380 帧，包含两端
npm run render -- --range=300-380

# 导出指定全片帧的静帧
npm run stills -- --frames=96,600,1004,1580
```

渲染脚本使用 Remotion 随附的 FFmpeg，不要求另装系统 FFmpeg。完整导出保持已确认的 AAC 音频数据，避免重新制作或替换配乐。区间导出用于检查局部动画，音频由渲染器按对应区间编码。

macOS / Linux shell 可用 `RENDER_CONCURRENCY=2 npm run render` 降低渲染并发；Windows PowerShell 可先运行 `$env:RENDER_CONCURRENCY='2'`，再运行 `npm run render`。`VERIFICATION.json` 记录独立安装、全片导出和音画一致性检查结果。

## 编辑位置

| 内容 | 文件 |
|---|---|
| 品牌名、片尾标语、输入页标题 | `src/config.ts` |
| 场景顺序、起止帧、音轨 | `src/index.tsx` |
| 贝塞尔工具、六瓣标志、光标、麦克风、星号 | `src/common.tsx` |
| 代码窗口、software 抽离 | `src/scenes/Opening.tsx` |
| Without writing / Code 字形动画 | `src/scenes/TypeSequence.tsx` |
| You just / Your idea / and it builds for you | `src/scenes/Voice.tsx` |
| Build me a website / an app / a tool、输入界面 | `src/scenes/PromptDemo.tsx` |
| 软件界面拼贴 | `src/scenes/Montage.tsx` |
| No complex syntax / No learning curve | `src/scenes/Claims.tsx` |
| 品牌片尾 | `src/scenes/Outro.tsx` |
| 六种产品界面、演示数据与细小 UI 文字 | `src/components/ProductBoard.tsx` |
| 输入页及片尾背景 | `public/images/` |

场景中的文案与部分颜色直接写在对应文件中，修改 `src/config.ts` 不会自动替换全部文字。较长文案可能需要同步调整字宽、字号和停留时间。

## 校验与兼容性

本包已在 macOS Apple Silicon 上独立安装并完成全片渲染；其他系统尚未实测。精简 Linux 环境可能需要安装 Chromium 所需的系统共享库。

`npm run check` 检查 TypeScript；`npm run verify` 检查交付文件哈希。主动修改源码或素材后，原始交付哈希不再匹配是正常结果，可保留原 ZIP 作为定版基准。

随包预览与审核成片逐字节一致。独立重渲染的全片 SSIM 为 0.998587（1 表示相同），存在少量像素差异；源码、素材及完整 AAC 音频数据均一致。审核基准请以 `preview/reference.mp4` 为准。

主要字体 Geist 已随包提供。开场代码文字保留定版中的 `Menlo, monospace`：未安装 Menlo 的系统会采用本机等宽字体，字宽和单词抽离衔接可能有细微差别。预览 MP4 始终保留已审核效果。

Lite 包包含源码、必要素材、依赖锁、渲染脚本和定版预览；不包含 `node_modules`、浏览器缓存、原参考视频、实验配乐、未使用音效及制作过程文件。

素材说明见 [ASSETS.md](ASSETS.md)，动效编辑说明见 [MOTION-NOTES.md](MOTION-NOTES.md)。
