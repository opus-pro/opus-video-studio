import React from "react";
import { useCurrentFrame } from "remotion";
import { Avatar, TrainWorld } from "./companion-world";
import {
  Arrow,
  Check,
  Frame,
  Text,
  ease,
  mix,
  pos,
  progress,
  serif,
} from "./shared";
export type CompanionProps = {
  character: string;
  prompt: string;
  artwork: string;
  share: string;
  reply: string;
  create: string;
  ready: string;
  shareAction: string;
  sharingTitle: string;
  productTitle: string;
  suggestions: string[];
  backgroundTop: string;
  backgroundMiddle: string;
  backgroundBottom: string;
  characterColor: string;
  friendColor: string;
  status: string;
  keyboard: string[];
  geometry: {
    phoneWidth: number;
    phoneHeight: number;
    cardWidth: number;
    cardHeight: number;
    artHeight: number;
    avatarRadius: number;
  };
  timing: {
    phone: number;
    press: number;
    ready: number;
    result: number;
    avatar: number;
    share: number;
    friend: number;
    community: number;
    closing: number;
  };
};
export const companionDefaults: CompanionProps = {
  character: "Pip",
  prompt: "A train to the moon.",
  artwork: "A train to the moon",
  share: "Made this with Pip.",
  reply: "Can I join?",
  create: "Create story",
  ready: "Story ready",
  shareAction: "Share",
  sharingTitle: "Made for sharing.",
  productTitle: "Companion",
  suggestions: ["A garden above the clouds", "A train to the moon"],
  backgroundTop: "#08615f",
  backgroundMiddle: "#278d83",
  backgroundBottom: "#e8fff0",
  characterColor: "#b58bdd",
  friendColor: "#a8d7a4",
  status: "9:41",
  keyboard: ["qwertyuiop", "asdfghjkl", "zxcvbnm"],
  geometry: {
    phoneWidth: 330,
    phoneHeight: 632,
    cardWidth: 510,
    cardHeight: 370,
    artHeight: 285,
    avatarRadius: 1.2,
  },
  timing: {
    phone: 28,
    press: 57,
    ready: 74,
    result: 103,
    avatar: 134,
    share: 159,
    friend: 183,
    community: 241,
    closing: 279,
  },
};
const glass = {
  background: "rgba(245,255,249,.50)",
  border: "1px solid rgba(255,255,255,.48)",
  boxShadow: "inset 0 1px 0 #ffffff66, 0 18px 30px #063f3f21",
};
const Phone: React.FC<{
  p: CompanionProps;
  result: boolean;
  scale: number;
  x: number;
  y: number;
  rotation: number;
  blur: number;
  opacity: number;
}> = ({ p, result, scale, x, y, rotation, blur, opacity }) => {
  const f = useCurrentFrame(),
    g = p.geometry;
  return (
    <div
      style={{
        ...pos(
          x - g.phoneWidth / 2,
          y - g.phoneHeight / 2,
          g.phoneWidth,
          g.phoneHeight,
        ),
        borderRadius: 42,
        background:
          "linear-gradient(100deg,#cee9d9,#f6fff4 20%,#e9f8e7 80%,#a4ceba)",
        border: "6px solid #d8efdd",
        boxSizing: "border-box",
        boxShadow:
          "inset 2px 0 4px #fff, inset -2px -1px 5px #79a69855, 0 24px 35px #002f3f33",
        transform: `perspective(1300px) scale(${scale}) rotateZ(${rotation}deg) rotateY(${result ? -10 : 0}deg)`,
        filter: `blur(${blur}px)`,
        opacity,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: 32,
          background: result ? "#f3faf4" : "#ffffff",
        }}
      />
      <Text
        text={p.status}
        x={24}
        y={15}
        w={80}
        h={16}
        size={11}
        bold
        color="#30473d"
      />
      <div
        style={{
          ...pos(116, 8, 86, 18),
          borderRadius: 10,
          background: "#243a32",
        }}
      />
      <svg width="42" height="12" style={{ ...pos(252, 18, 42, 12) }}>
        <path
          d="M1 10V7m4 3V4m4 6V1M18 5q6-7 12 0m-10 3q4-4 8 0"
          stroke="#30473d"
          strokeWidth="2"
          fill="none"
        />
        <rect x="33" y="2" width="8" height="8" rx="1" fill="#30473d" />
      </svg>
      {result ? (
        <>
          <Text
            text={p.ready}
            x={24}
            y={65}
            w={278}
            h={35}
            size={20}
            bold
            color="#233f33"
          />
          <Text
            text={p.artwork}
            x={24}
            y={542}
            w={278}
            h={56}
            size={22}
            min={16}
            family={serif}
            color="#233f33"
            lines={2}
          />
        </>
      ) : (
        <>
          <Text
            text={p.character}
            x={24}
            y={63}
            w={280}
            h={42}
            size={28}
            min={20}
            family={serif}
            color="#233f33"
          />
          {p.suggestions.map((s, i) => (
            <div
              key={i}
              style={{
                ...pos(16, 120 + 49 * i, 286, 40),
                background: "#f1f5f1",
                borderRadius: 8,
              }}
            >
              <Text
                text={s}
                x={13}
                y={12}
                w={257}
                h={22}
                size={13}
                min={11}
                color="#728076"
              />
            </div>
          ))}
          <div
            style={{
              ...pos(16, 332, 286, 49),
              borderRadius: 25,
              background: "#55a893",
              transform: `scale(${f >= p.timing.press && f < p.timing.press + 3 ? 0.97 : 1})`,
            }}
          >
            <Text
              text={p.create}
              x={15}
              y={13}
              w={256}
              h={28}
              size={20}
              min={16}
              align="center"
              color="#ffffff"
            />
          </div>
          <div
            style={{
              ...pos(0, 405 + 90 * ease(f, 60, 71), 318, 224),
              background: "#e1e5e5",
              opacity: 1 - ease(f, 60, 71),
            }}
          >
            {p.keyboard.map((row, i) => (
              <div
                key={i}
                style={{
                  ...pos(i * 12, 10 + i * 45, 318 - i * 24, 39),
                  display: "flex",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                {row.split("").map((k) => (
                  <div
                    key={k}
                    style={{
                      width: 26,
                      height: 37,
                      background: "#fff",
                      borderRadius: 4,
                      boxShadow: "0 1px 0 #adb5b4",
                      textAlign: "center",
                      paddingTop: 8,
                      fontSize: 17,
                      color: "#3c4544",
                    }}
                  >
                    {k}
                  </div>
                ))}
              </div>
            ))}
            <div
              style={{
                ...pos(76, 153, 161, 36),
                background: "#fff",
                borderRadius: 4,
                boxShadow: "0 1px 0 #adb5b4",
              }}
            />
            <svg width="27" height="23" style={{ ...pos(267, 161, 27, 23) }}>
              <path
                d="M24 2v11H4m6-7-7 7 7 7"
                stroke="#3c4544"
                fill="none"
                strokeWidth="2"
              />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};
const AvatarAt: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  friend?: boolean;
  opacity?: number;
}> = ({ x, y, size, color, friend, opacity = 1 }) => (
  <div
    style={{
      ...pos(x - size / 2, y - size / 2, size, size),
      opacity,
      filter: "drop-shadow(0px 8px 10px #18454626)",
    }}
  >
    <Avatar size={size} color={color} friend={friend} />
  </div>
);
export const Companion: React.FC<CompanionProps> = (p) => {
  const f = useCurrentFrame(),
    t = p.timing,
    g = p.geometry,
    phone = ease(f, t.phone, 52),
    recede = ease(f, 60, 72),
    result = ease(f, t.result, 121),
    av = ease(f, t.avatar, 153),
    handoff = ease(f, t.share, 182),
    conv = ease(f, 208, 240),
    community = ease(f, t.community, 259),
    out = ease(f, t.closing, 298);
  const phoneScale = mix(mix(1.08, 1.58, phone), 0.95, recede),
    phoneY = mix(mix(335, 261, phone), 312, recede);
  const initial = f < 103;
  const mainScale = mix(mix(1, 1.02, conv), 470 / 510, community);
  const mainX = mix(mix(480, 468, conv), 480, community),
    mainY = mix(mix(279, 274, conv), 283, community);
  const artW = mix(330 * 1.03 - 32, 510, handoff) * mainScale,
    artH = mix(390 * 1.03, 285, handoff) * mainScale,
    artX = mix(487, mainX, handoff),
    artY =
      mix(331 + 150 * (1 - result), mainY - 42.5 * mainScale, handoff) -
      40 * out;
  return (
    <Frame
      background={`linear-gradient(180deg,${p.backgroundTop} 0%,${p.backgroundMiddle} 53%,${p.backgroundBottom} 100%)`}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg,transparent 10%,rgba(255,255,255,.10) 17%,rgba(255,255,255,.08) 28%,transparent 36%)",
        }}
      />
      {initial && f >= 28 && (
        <Phone
          p={p}
          result={false}
          scale={phoneScale}
          x={480}
          y={phoneY}
          rotation={mix(-2, 0, phone)}
          blur={7 * recede}
          opacity={ease(f, 28, 39) * (1 - 0.72 * recede)}
        />
      )}{" "}
      {f < 74 && (
        <div
          style={{
            ...pos(
              mix(150, 480 - 143 * phoneScale, phone),
              mix(
                233 + 18 * (1 - ease(f, 0, 10)),
                phoneY + (-316 + 249) * phoneScale,
                phone,
              ),
              mix(660, 286 * phoneScale, phone),
              mix(70, 66 * phoneScale, phone),
            ),
            ...glass,
            borderRadius: 35,
            display: "flex",
            alignItems: "center",
            filter: `blur(${6 * (1 - ease(f, 0, 10)) + 5 * recede}px)`,
            opacity: 1 - ease(f, 64, 74),
          }}
        >
          <div style={{ position: "absolute", left: 20, top: 17 }}>
            <Avatar size={36} color={p.characterColor} />
          </div>
          <Text
            text={p.prompt.slice(
              0,
              Math.round(p.prompt.length * progress(f, 0, 20)),
            )}
            x={72}
            y={20}
            w={mix(490, 286 * phoneScale - 135, phone)}
            h={34}
            size={21}
            min={16}
            color="#234c40"
          />
          <div
            style={{
              position: "absolute",
              right: 15,
              top: 14,
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#70bda6",
              display: "grid",
              placeItems: "center",
              opacity: mix(0.4, 1, ease(f, 20, 24)),
            }}
          >
            <Arrow color="#fff" size={22} />
          </div>
        </div>
      )}
      {f >= 74 && f < 103 && (
        <div
          style={{
            ...pos(341.5, 236, 277, 68),
            ...glass,
            borderRadius: 34,
            opacity: ease(f, 74, 84) * (1 - ease(f, 94, 102)),
            transform: `translateY(${12 * (1 - ease(f, 74, 84))}px)`,
          }}
        >
          <div data-ready-check style={pos(33, 20.5, 27, 27)}>
            <Check color="#397960" size={27} />
          </div>
          <Text
            text={p.ready}
            x={77}
            y={22}
            w={177}
            h={31}
            size={22}
            min={17}
            color="#315d4b"
          />
        </div>
      )}
      {f >= 103 && f < 183 && (
        <Phone
          p={p}
          result
          scale={1.03}
          x={487}
          y={330 + 150 * (1 - result)}
          rotation={-7}
          blur={12 * av}
          opacity={(1 - 0.85 * av) * (1 - handoff)}
        />
      )}{" "}
      {f >= 241 &&
        f < 299 &&
        [
          [142, 77, 300, 185, -12],
          [849, 71, 282, 174, 9],
          [150, 476, 277, 172, 8],
          [851, 468, 280, 173, -11],
        ].map(([x, y, w, h, r], i) => {
          const dx = x - 480,
            dy = y - 283;
          const cx = mix(480, x, community) + Math.sign(dx) * 95 * out,
            cy = mix(283, y, community) + Math.sign(dy) * 95 * out;
          return (
            <div
              key={i}
              style={{
                ...pos(cx - w / 2, cy - h / 2, w, h),
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #ffffff60",
                boxShadow: "0 12px 25px #063f3f28",
                transform: `perspective(1200px) rotate(${r * community}deg) rotateY(${(1 - community) * 25}deg) scale(${mix(0.65, 1, community)})`,
                opacity: community * (1 - out),
                filter: `blur(${6 * (1 - community)}px)`,
              }}
            >
              <TrainWorld
                width={w}
                height={h}
                tint={i === 0 ? "#243342" : i === 3 ? "#3b3042" : "#103d42"}
              />
            </div>
          );
        })}
      {f >= 159 && f < 299 && (
        <div
          style={{
            ...pos(
              mainX - (g.cardWidth * mainScale) / 2,
              mainY - (g.cardHeight * mainScale) / 2 - 40 * out,
              g.cardWidth * mainScale,
              g.cardHeight * mainScale,
            ),
            ...glass,
            borderRadius: 14,
            opacity: handoff * (1 - out),
            transform: `perspective(1300px) rotateY(${mix(-5, 0, handoff)}deg)`,
          }}
        >
          <div
            style={{
              ...pos(0, 285 * mainScale, 510 * mainScale, 85 * mainScale),
              background: "rgba(240,255,245,.35)",
              borderTop: "1px solid #ffffff77",
              borderRadius: "0 0 14px 14px",
            }}
          >
            <Text
              text={p.share}
              x={82 * mainScale}
              y={28 * mainScale}
              w={330 * mainScale}
              h={30 * mainScale}
              size={17 * mainScale}
              min={13}
              color="#285448"
            />
            <div
              style={{
                ...pos(
                  425 * mainScale,
                  29 * mainScale,
                  62 * mainScale,
                  30 * mainScale,
                ),
                background: "#ffffff66",
                border: "1px solid #ffffff88",
                borderRadius: 16,
                transform: `scale(${f >= 188 && f < 192 ? 0.94 : 1})`,
              }}
            >
              <Text
                text={p.shareAction}
                x={4}
                y={7}
                w={54 * mainScale}
                h={22}
                size={13 * mainScale}
                min={11}
                align="center"
                color="#315e4c"
              />
            </div>
          </div>
        </div>
      )}
      {f >= 103 && f < 299 && (
        <div
          style={{
            ...pos(artX - artW / 2, artY - artH / 2, artW, artH),
            overflow: "hidden",
            borderRadius: mix(5, 14, handoff),
            transform: `perspective(1300px) rotateZ(${-7 * (1 - handoff)}deg) rotateY(${-10 * (1 - handoff)}deg)`,
            opacity: mix(1 - 0.85 * av, 1, handoff) * (1 - out),
            filter: `blur(${12 * av * (1 - handoff)}px)`,
          }}
        >
          <TrainWorld width={artW} height={artH} />
        </div>
      )}
      {f >= 134 && f < 159 && (
        <Text
          text={p.sharingTitle}
          x={mix(550, -420, progress(f, 136, 157))}
          y={206}
          w={1100}
          h={130}
          size={92}
          min={62}
          family={serif}
          color="#e8ffef"
          style={{
            filter: `blur(${8 * Math.abs(2 * progress(f, 136, 157) - 1)}px)`,
          }}
        />
      )}
      {f >= 134 && (
        <AvatarAt
          x={mix(
            mix(500, 480, av),
            mix(mix(269, 241, conv), 130, out),
            handoff,
          )}
          y={mix(
            mix(455, 270, av),
            mix(mix(421, 433, conv), 402, out),
            handoff,
          )}
          size={mix(mix(80, 290, av), mix(mix(44, 56, conv), 62, out), handoff)}
          color={p.characterColor}
        />
      )}{" "}
      {f >= 183 && (
        <AvatarAt
          x={mix(mix(882, 842, ease(f, 183, 195)), mix(807, 832, out), conv)}
          y={mix(mix(461, 449, ease(f, 183, 195)), mix(464, 402, out), conv)}
          size={62 * mix(0.6, 1, ease(f, 183, 195))}
          color={p.friendColor}
          friend
          opacity={ease(f, 183, 195)}
        />
      )}{" "}
      {f >= 194 && f < 299 && (
        <div
          style={{
            ...pos(
              mix(850, 740, ease(f, 194, 207)) - 28 * conv,
              372 + 10 * conv,
              140,
              40,
            ),
            ...glass,
            borderRadius: 20,
            opacity: ease(f, 194, 207) * (1 - out),
            filter: `blur(${4 * (1 - ease(f, 194, 207))}px)`,
          }}
        >
          <Text
            text={p.reply}
            x={10}
            y={11}
            w={120}
            h={23}
            size={15}
            min={12}
            align="center"
            color="#275c4c"
          />
        </div>
      )}
      <Text
        text={p.productTitle}
        x={260}
        y={198 + 18 * (1 - out)}
        w={440}
        h={95}
        size={64}
        min={44}
        family={serif}
        align="center"
        color="#e8fff0"
        style={{ opacity: out, filter: `blur(${6 * (1 - out)}px)` }}
      />
    </Frame>
  );
};
