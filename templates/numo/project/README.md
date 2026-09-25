# NUMO Motion Template · Lite 1.0.0

已确认的 **NUMO 4d / Graphic Funk**：15 秒横版 AI 数据分析产品宣传片。茄紫、酸柠黄与暖白，瑞士平面 × 欧普艺术，保留原来的快切、字体减速聚焦、彩色套印阴影、纸张颗粒与 Web UI 动效。音乐没有旁白或钢琴，包含当前确认的配乐和材质音效。

`preview/reference.mp4` 是带声音的 720p 观看版。正式视频从 React / Remotion 源码渲染，**不会使用参考视频作为画面素材**。

## 运行

需要 Node.js 22 或更新版本。首次安装需要联网下载 npm 依赖，首次渲染可能需要下载 Remotion 的浏览器；素材、字体、配乐均已随包提供，不需要 API key 或原项目。

```sh
npm ci
npm run check
npm run studio
```

终端会显示 Studio 地址。选择 `NUMO`，点击播放即可预览。

```sh
npm run render
```

输出 `dist/numo.mp4`：1920 × 1080，60 fps，900 帧，H.264 + AAC。完整渲染结束后会直接复制所选 M4A 音轨，保留原来的声音和起始对齐；无需单独安装系统 FFmpeg。

```sh
npm run stills -- --frames=8,180,361,550,730,860
npm run render -- --range=300-380
```

帧号从 0 开始，片段的首尾帧均包含在内。截图输出到 `dist/frames/`；片段用于画面检查，其音频经渲染器编码，完整导出才会执行原音轨复制。可用 `RENDER_CONCURRENCY=4 npm run render` 调整并发。

## 换品牌

| 修改内容 | 位置 |
| --- | --- |
| 品牌名、结尾标语、主色 | `config/brand.json` 的 `product`、`palette` |
| 数据量、来源名称、提问、营收降幅、转化率、分享团队 | `config/brand.json` 的 `story` |
| 大字海报文案、字号和位置 | `src/numo/Optical.tsx` |
| 页面文案、按钮、图表和示例流程 | `src/web/NumoWeb.tsx` |
| 字体减速、失焦和彩色阴影 | `src/numo/MotionType.tsx` |
| 欧普条纹、颗粒 | `src/numo/OpticField.tsx`、`PrintGrain.tsx` |
| 总时长和切镜帧 | `config/timeline.json` |
| 配乐结构、音效对应动作与帧号 | `config/audio-cues.json` |

模板类型固定为 NUMO，修改显示名称不会切换模板。布局为三个来源、两个设备分组、两行提问设计；品牌名和标语宜接近原版长度。`story` 保留原项目的数据对象，`devices.before/after`、`evidence`、`action` 是故事说明字段；图表形状、部分重复标签及 Payment / Checkout 等文案仍在源码中，换产品需同步修改。界面中性色和字体粉色阴影也保留在源码中。

示例故事是“海量数据 → 问销售为何下降 → 定位移动端转化 → 发现支付超时 → 分享下一步”。NUMO 和数据均为虚构。修改示例时让提问、结果、证据、行动保持一致。字体为拉丁字体；中文品牌需更换支持中文的本地字体并检查排版。

可以把整个文件夹交给 Codex，并附上：

> 在这个 NUMO Lite 模板中替换成我的品牌。保留 15 秒横版、当前快切节奏和动效风格。先修改 config/brand.json，再把海报与 Web UI 的硬编码文案、图表和流程改成能表达我的核心功能的内容。用短大字，不加说明小字。运行 check，检查关键帧，然后 render。

## 声音

`config/brand.json` 中 `audio.mode` 可设为：

- `master`：默认，已确认的 4d 配乐 + 音效。
- `music`：仅 4d 配乐。
- `sfx`：仅已确认的材质、切镜和 UI 音效。
- `mute`：静音。

三份音频位于 `public/audio/`，均从 0 秒开始对齐。默认 master 是已确认成片的原 AAC 轨；music / sfx 供替换和独立使用，不能把压缩分轨直接相加当作无损还原 master。独立音轨没有旁白。

音乐为 144 BPM 的直拍，基础每拍 25 帧；切镜另有接触音精确对应。第 475–524 帧收缩，第 525 帧回归，第 825 帧收尾重音。更改镜头时间必须同时重新剪辑声音，cue JSON 是说明文件，不会自动重排音频。替换音乐时建议先保留原时间线与 SFX。

## 包内容和校验

包含源码、配置、本地字体及颗粒、三份紧凑音轨、带声音预览、素材来源说明和校验记录。Lite 不包含 node_modules、历史版本、API 凭据、音源库、合成工具链或完整分轨 WAV；原始项目中保留这些制作文件。

`VERIFICATION.json` 记录本次独立安装与导出检查。`manifest.json` 记录文件大小和哈希；可在未修改的包目录运行 `shasum -a 256 -c SHA256SUMS.txt` 检查分发文件。授权说明见 `ASSETS.md` 和随附许可证。
