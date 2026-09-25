# Trace · AI Research Motion Template — Lite

基于已确认的 **0.5.0 / research-setting** 成片。19.2 秒 · 30 fps · 576 帧。源码输出 1920×1080；包内完整试听样片为 1280×720。

这套模板适合 AI 搜索、研究助手、知识库和证据分析产品：**散落资料 → 聚焦证据 → 得到答案 → 收成品牌标识**。人物、橙铜色光场、空间层次、逐字动效和连续转场均保留。

## 直接交给 Codex

把**整个解压文件夹**放进 Codex 工作目录，再发送：

> 请阅读 README.md、PROMPT.zh-CN.md 和 MOTION-SPEC.md，并查看 preview/reference.mp4。以这套可编辑源码为基础，为【产品名 / 官网】制作完整的产品 motion video。保留样片的光学质感、文字运动、速度对比和场景连续性；先理解新产品的输入、动作、结果，再替换演示内容、品牌与素材。不要重新做成逐页标题加卡片的动态 PPT。先复现基线，再修改，最终交付完整 MP4 和源码。品牌色 / logo / 必须表达的能力：【可选补充】。

## 运行

需要 Node.js 20 或更高版本（本包在 Node.js 24 验证）。在解压文件夹内运行：

```sh
npm ci
npm run check
npm run studio
```

导出完整 1080p MP4：

```sh
npm run render
```

输出 `dist/trace.mp4`。第一次安装 / 渲染会下载 npm 依赖及 Remotion 浏览器；依赖未塞进压缩包。复现已包含的音画不需要 MCP、模型 API 或账户密钥。

需要检查局部帧时：

```sh
npm run stills -- --frames=103,162,382,533
```

默认源码渲染独立于 `preview/reference.mp4`，样片只是视觉与声音参考。

## 改哪里

| 文件 | 内容 |
|---|---|
| `config/brand.ts` | 产品名称、主文案、问题、答案、引用 |
| `src/Film.tsx` | 全片时间轴、光场、搜索输入、问答界面 |
| `src/EvidenceWorld.tsx` | 资料、人物、生成摄影背景、引用到 logo 的连续变形 |
| `src/Typography.tsx` / `src/motion.ts` | 逐字相位、进退场、贝塞尔曲线、速度模糊 |
| `config/audio.json` | 成品混音位置、是否播放声音 |
| `config/audio-cues.json` | 旁白语句、转场重音及点击时间记录 |
| `config/image-prompts.json` | 摄影背景的生成提示与人物素材对应关系 |

主色、局部界面文字、资料内容仍在源码中，**不是所有内容都由 brand.ts 一键替换**。改产品时，同时检查文件名、引用、问题与答案的因果关系。改字长后检查裁切与阅读时间。

人物 RGB 图 `creator-copper.png` 必须配套 `creator.png` 的 alpha 遮罩，两者不能错位或单独删除。背景是同一研究空间整理前 / 后的生成图；资料结论与可读 UI 用代码绘制。

## 音频和精简范围

`public/audio/master.m4a` 是从确认成片直接提取的 AAC 混音，含音乐、旁白、SFX。导出时先渲染画面，再封装这条音轨，避免多次压缩。改品牌或文案后需要重新配音并提供新的完整混音；将其放进 public/audio，再修改 config/audio.json。这里的时间标记不会自动重配音乐。

Lite 保留必要源码、原尺寸图片、字体及许可、混音、完整压缩样片、迁移说明。工作历史、原参考片、音频分轨、对比页、缓存和依赖未打包。图片来源与许可说明见 ASSETS.md。SHA256SUMS.txt 可核对文件完整性。
