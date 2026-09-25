# Margin · Motion Template Lite

已确认成片 **Fast20 快节奏版**。工程版本 **1.0.0**。
**20 秒 · 1920×1080 · 60fps · 1200 帧**。

先看 preview/reference.mp4，或打开 preview/index.html：这是本工程自己的确认版预览，720p，带音乐和音效。源码独立生成 1080p 画面，预览影片不参与渲染。

## 交给 Codex

用 Codex 打开整个解压目录，发送：

> 新产品是【产品名/官网】，素材在【目录，可选】。请先阅读 README，查看 preview/reference.mp4 和源码，将这套模板适配成新产品的代码生成短片。保留纸白留白、少量强调色、非匀速逐字输入、文字推近回位、关键词滚动、连续画布变形、细/粗/衬线对比、半拍换词，以及照片横带收束到字标的节奏。按新产品的真实流程改写内容和 UI，不只替换产品名。先检查实际画面和音画落点，再交付 MP4 与源码。

适合设计工具、创意工作区、编辑器和品牌创作流程。Margin 与 Elsewhere 是虚构示例，不代表真实上线功能。

## 安装和导出

需要 Node.js 22+。第一次安装依赖、下载渲染浏览器需要网络。复现不需要 API key、MCP、Python、系统 FFmpeg 或原工作区。

~~~sh
npm ci
npm run check
npm run studio
npm run render
~~~

Studio 中选择 MarginFast。输出 dist/margin.mp4。
默认并发 2，可使用 RENDER_CONCURRENCY=1 npm run render。

~~~sh
npm run render:sfx
npm run render:mute
npm run stills -- --frames=60,165,216,525,795,825,855,888,915,945,960,975,990,1005,1060,1110
~~~

仅音效版：dist/margin-sfx.mp4。静音版：dist/margin-mute.mp4。半尺寸检查帧：dist/frames/。

## 修改入口

| 内容 | 文件 |
| --- | --- |
| 唯一 composition、整片混音层 | src/index.tsx |
| 画布规格、默认音乐/仅音效/静音模式 | config/template.json |
| 开场句子、非匀速输入、推近回位、关键词滚动、收进输入框 | src/TypePrelude.tsx |
| 中间输入框和场景拼装 | src/CompletedFilm.tsx |
| 构图切换、照片展开、同一作品推近预览 | src/ContinuityStudy.tsx |
| 画幅连变、字体特写、半拍换词、照片横带与品牌收尾 | src/FastFinale.tsx |
| Margin 图形标记 | src/Brand.tsx |
| 120 BPM 半拍时值记录 | config/beat-grid.json |
| 源码导出、复用确认音轨 | scripts/render.mjs、scripts/finalize-audio.mjs |

文案、字标、照片路径和局部颜色在源码里，config 不会自动替换全部内容。
FastFilm 使用 TypeFilm 的前 12.5 秒，再进入 FastFinale；因此修改结尾应改 FastFinale，不是中间场景组件中保留的收尾分支。

## 保留的运动结构

- 0–4s：Make room for an idea. → a direction. → a collection.，文字缩回输入框。
- 4–6.5s：输入 brief，指针发送。
- 6.5–12.5s：版式切换、图片展开、标题落位、进入全屏作品预览。
- 12.5–13.5s：从预览退回作品，视线持续锁定主画布。
- 13.5–14.5s：横版 → 竖版 → 方形；照片采用 cover 裁切，不能拉伸照片像素。
- 14.5–16s：标题特写，Geist 细体 → 粗体 → Georgia 衬线。
- 16–17s：Make. / It. / Yours. / Make it yours.，每 15 帧切换一次。
- 17–18.4s：海浪横带展开、收成细线并消失。
- 18.4–20s：Margin 字标出现，18.5s 后静止。

同一输出帧时钟，没有全片变速映射。120 BPM 下每拍 30 帧、半拍 15 帧。保持快速变化后的清晰落定；不要把整片统一加速或加弹簧。细线应先消失，再显现字标；不能横穿文字。

## 音频

Lite 包含两条已完成混音：

- public/audio/master.m4a：确认版音乐 + 音效。
- public/audio/sfx.m4a：同一时间线的仅音效版本。

Studio 只播放一条选中的混音。完整导出先渲染静音画面，再复制对应 AAC 音轨；不会叠加两次声音。config/template.json 的 audio.mode 支持 master、sfx、mute。

这不是分轨工程。改动镜头时长、字体切点或音乐后，要同步重新混音；只改画面不会自动修改已合成音轨。config/beat-grid.json 是基线的时值记录，不是每次导出后的声学检测。

## 字体和素材

GeistVF.woff2 随包提供，其授权与版权说明在 licenses/Geist-OFL.txt。开场会在该字体加载后测量字宽。

Georgia 使用系统字体，本包不分发。非 macOS 平台或替换字体、改中文时，核对字形、行宽、斜体下降部和快速切换镜头。素材来源详见 ASSETS.json。

## 包含与验证

包含当前源码、锁定依赖清单、必要照片与字体、两条混音、确认预览、说明和校验信息。无 node_modules、历史成片、旧工程、第三方参考视频或服务凭据。

VERIFICATION.json 记录实际复现检查。manifest.json 与 SHA256SUMS.txt 用于完整性校验。
