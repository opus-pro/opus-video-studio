import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  OffthreadVideo,
  registerRoot,
  staticFile,
} from "remotion";

type VideoProps = { title: string; videoSrc: string; audioSrc: string };

const Video = ({ title, videoSrc, audioSrc }: VideoProps) => (
  <AbsoluteFill style={{ backgroundColor: "#101010" }}>
    {videoSrc ? (
      <OffthreadVideo src={staticFile(videoSrc)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    ) : (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", color: "#ffffff", fontFamily: "sans-serif", fontSize: 96 }}>
        {title}
      </AbsoluteFill>
    )}
    {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
  </AbsoluteFill>
);

registerRoot(() => (
  <Composition
    id="Video"
    component={Video}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{ title: "Your video", videoSrc: "", audioSrc: "" }}
  />
));
