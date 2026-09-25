# 素材与来源

| 文件或内容 | 来源与用途 |
|---|---|
| `public/images/meadow-input.png` | 制作时用 ImageGen 生成的青绿花田图；输入页背景 |
| `public/images/meadow-outro.png` | 制作时用 ImageGen 生成的紫粉花田图；片尾背景 |
| `public/fonts/GeistVF.woff2` | Geist 可变字体 |
| `public/fonts/Geist-OFL.txt` | 随附的 SIL Open Font License 1.1 |
| `public/reference-audio.m4a` | 用户提供的小红书参考视频原音轨；用户明确确认保留的定版 BGM |
| `src/common.tsx` | 本工程重新绘制的六瓣标志、终端符号、光标、麦克风和星号 |
| `src/components/ProductBoard.tsx` | 本工程重新绘制的软件界面与演示数据 |
| `preview/reference.mp4` | 用户审核通过的 v2 smooth60 导出；只供观看，不是渲染输入 |

视觉与节奏参考来自用户提供的 [AIAgent 软件宣传片笔记](https://xhslink.cn/o/9iqZ6fj2E9q)，作者为「创意者UI商业动画」。正式动画由可编辑图层重建，画面未嵌入原参考视频；花田背景重新生成。

音轨按用户要求原样保留。其来源为上述参考视频，本包未为该参考音轨授予新的版权许可。未使用的替代 BGM 和实验 Foley 不包含在本包中。

定版音频文件 SHA-256：

```text
e1666a3205b5afbe00105525f03a5be4a9adf5a7491c5102c778b30a8e950e31
```

定版预览与音源的 AAC 数据包 SHA-256 一致：

```text
c28aff649f545318b89d5db61ecb2ccc3b7bc4cb99878a4d30ee018f7f7c261f
```

开场使用系统 Menlo 等宽字体，未将该字体文件打包。缺少 Menlo 时浏览器会采用系统等宽字体；其他主要文字使用已包含的 Geist。
