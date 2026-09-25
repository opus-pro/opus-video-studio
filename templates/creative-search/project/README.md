# Creative Search · Motion Template Lite

已确认成片 **V8**。工程版本 **1.0.0**。
**22.6167秒 · 1920×1080 · 60fps · 1357帧**。

先看 `preview/reference.mp4`：本工程自己的确认版成片，720p，带音乐和音效。源码独立生成1080p画面，不把预览影片嵌入输出。首次安装依赖及渲染浏览器需联网；复现不需要API key、MCP或原来的本地服务。

## 交给 Codex

用 Codex 打开整个解压目录，发送：

> 新产品是【产品名/官网】，素材在【目录，可选】。请阅读README.md、观看preview/reference.mp4，并检查源码。把这套模板适配为该产品的完整短片。保留浅灰留白、金属蓝光带、逐字非匀速输入、推近回位、速度相关blur、同一对象连续变形及主要动作卡点。根据真实产品工作流改写内容；不要仅换名字、继续展示产品没有的功能。优先在源码上改，检查文字可读、对象连续性和声音落点，交付完整MP4与可编辑工程。

适合AI搜索、文件检索、设计工具、知识库和创作工作流产品。默认文件、海报和操作是概念演示内容。其他产品可借鉴视觉方法，重编功能逻辑。

## 安装和导出

需要Node.js22+。

```sh
npm ci
npm run check
npm run studio
npm run render
```

Studio中选择 `CreativeSearch`。完整成片输出到 `dist/creative-search.mp4`。默认并发2；可使用 `RENDER_CONCURRENCY=1 npm run render`。脚本使用锁定Remotion自带的FFmpeg，默认导出不依赖系统FFmpeg。

```sh
npm run stills -- --frames=236,354,767,885,944,1003,1180,1225
```

半尺寸检查帧保存至 `dist/frames/`。

## 修改入口

| 内容 | 文件 |
|---|---|
| 全局背景、文字色、音轨与静音模式 | `config/template.json` |
| 场景编排、构图尺寸与帧率 | `src/index.tsx` |
| 节拍、时长、设计帧/输出帧映射 | `src/BeatTiming.ts` |
| 工具栏输入和金属光带 | `src/Opening.tsx` |
| 问句推近、回位与格式切换 | `src/Search.tsx` |
| 描述输入和属性标签 | `src/Refine.tsx` |
| 三张可编辑海报 | `src/Results.tsx` |
| 选中→确认→打开→光带→文字 | `src/Finale.tsx` |
| 黑底结束语 | `src/Outro.tsx` |
| 逐字符速度与blur、字宽 | `src/KineticType.tsx`、`src/font-metrics.json` |
| Bézier曲线和共用元素 | `src/common.tsx` |

文案、海报颜色、文件名和部分局部颜色直接在源码里。全局颜色配置不会自动替换所有图形或文字；换主题时一起检查。

Helvetica Neue使用系统字体，本包不分发字体文件。ASCII字宽来自该字体；非macOS平台可能使用Helvetica/Arial回退而出现字距差异。跨平台或改中文时提供适用字体，并更新字宽测量和排版后核对成片。

## 动效与节奏

起步停一下、中段输入加快、末尾减速；字入场短暂虚化，落定后清晰。问句先推近再带横向拖影回位。保留慢收尾，不用统一匀速截字或整片慢放替代。

三张结果卡逐拍出现；14.75秒展开、15.73秒选中、16.72秒确认、17.70秒出现打开按钮，18.20秒点击后继续变形。选中卡与展开后的光带保持同一对象，避免换成不相干的整页展示。末句遮住收束细线，不能让线穿字。

`BeatTiming.ts`的每个锚点是 `[场景内部设计帧, 全片实际输出帧]`。`motionFrame`把输出时钟映射到设计帧，`cue`做逆映射。两轴都必须严格递增。blur采样当前与实际上一帧映射后的位移，不直接使用设计帧f−1。主要动作落在拍点，打字内部仍有自由节奏。

## 音频

Lite仅保留确认V8的 `public/audio/master.m4a`，包含House Vibez音乐和动作音效，没有旁白。Studio播放master；完整导出先渲染静音画面再复制同一AAC音轨，只加入一次声音。将 `audio.mode` 设为 `mute` 可导出静音版。

这不是分轨工程。修改动作时长或音乐后要重新混音并替换master，不能只改画面时间。`config/beat-audit.json`记录基线主要动作与音乐瞬态的检测结果，不会自动重混声音。需要分轨可向提供者索取完整制作工程。

## 包含与验证

包含源码、锁定依赖清单、配置、确认混音、720p预览、素材来源和使用说明。不包含node_modules、历史视频、原作者参考片、临时渲染或服务凭据。

`ASSETS.json`记录素材来源，包括上游键盘音效尚未确定的单项来源状态。`VERIFICATION.json`记录实际验证范围；`manifest.json`与`SHA256SUMS.txt`用于完整性校验。
