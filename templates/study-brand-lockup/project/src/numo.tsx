import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import {
  Check,
  Cursor,
  Frame,
  Text,
  ease,
  mix,
  pos,
  progress,
  S,
} from "./shared";
export type NumoProps = {
  brand: string;
  baseline: number;
  current: number;
  evidence: string;
  action: string;
  team: string;
  tagline: string;
  background: string;
  paper: string;
  acid: string;
  supportingCopy: {
    sales: string;
    byDevice: string;
    desktop: string;
    stable: string;
    mobile: string;
    declining: string;
    checkout: string;
    steps: string[];
    timeout: string;
    source: string;
    logs: string;
    path: string;
    command: string[];
    insight: string;
    next: string;
    share: string;
    shareTitle: string;
    shared: string;
    closing: string[];
  };
  geometry: {
    app: [number, number, number, number];
    stripeCount: number;
    stripeWidth: number;
    stripePitch: number;
  };
  timing: { boundaries: number[]; beat: number };
};
export const numoDefaults: NumoProps = {
  brand: "NUMO",
  baseline: 100000,
  current: 82000,
  evidence: "Payment timeout",
  action: "Review payment flow",
  team: "Growth",
  tagline: "Ask. See. Understand.",
  background: "#30134b",
  paper: "#f5f0e8",
  acid: "#d6f53c",
  supportingCopy: {
    sales: "SALES",
    byDevice: "By device",
    desktop: "Desktop",
    stable: "Stable",
    mobile: "Mobile",
    declining: "Declining",
    checkout: "Mobile checkout",
    steps: ["Cart", "Details", "Payment"],
    timeout: "Timeout",
    source: "Source",
    logs: "Checkout logs",
    path: "Mobile > Payment",
    command: ["CHECK", "PAYMENTS."],
    insight: "Insight",
    next: "Next step",
    share: "Share",
    shareTitle: "Share insight",
    shared: "Shared with Growth.",
    closing: ["KNOW WHY.", "ACT FAST."],
  },
  geometry: {
    app: [42, 34, 876, 468],
    stripeCount: 92,
    stripeWidth: 9,
    stripePitch: 18,
  },
  timing: {
    boundaries: [0, 63, 113, 163, 238, 288, 338, 388, 438, 513, 612],
    beat: 25,
  },
};
const Stripes: React.FC<{ p: NumoProps; f: number }> = ({ p, f }) => (
  <svg width="960" height="540" style={{ position: "absolute" }}>
    <g
      transform={`matrix(1 0 -.12 1 ${f >= 532 ? 14 * Math.sin((2 * Math.PI * 532) / 200) + 10 * progress(f, 532, 611) : 14 * Math.sin((2 * Math.PI * f) / 200)} 0)`}
    >
      {Array.from({ length: p.geometry.stripeCount }, (_, i) => {
        const x = -260 + p.geometry.stripePitch * i;
        return (
          <path
            key={i}
            d={`M${x},-40 C${x + 260},150 ${x - 240},325 ${x + 120},580`}
            stroke={p.acid}
            strokeWidth={p.geometry.stripeWidth}
            fill="none"
          />
        );
      })}
    </g>
  </svg>
);
const Grain: React.FC = () => {
  const src = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;
    const c = canvas.getContext("2d")!,
      d = c.createImageData(960, 540);
    for (let i = 0; i < 960 * 540; i++) {
      const a = Math.sin(i * 127.1 + 311.7) * 43758.5453,
        v = Math.floor((a - Math.floor(a)) * 255);
      d.data.set([v, v, v, 255], i * 4);
    }
    c.putImageData(d, 0, 0);
    return canvas.toDataURL();
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${src})`,
        opacity: 0.055,
        pointerEvents: "none",
        mixBlendMode: "multiply",
      }}
    />
  );
};
const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  p: NumoProps;
  acid?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, w, h, p, acid, children, style }) => (
  <div
    style={{
      ...pos(x, y, w, h),
      background: acid ? p.acid : p.paper,
      outline: `2px solid ${p.background}88`,
      ...style,
    }}
  >
    {children}
  </div>
);
const DocumentGlyph: React.FC<{
  p: NumoProps;
  style?: React.CSSProperties;
}> = ({ p, style }) => (
  <svg width="24" height="28" viewBox="0 0 24 28" style={style}>
    <path
      d="M3 2h12l6 6v18H3Zm12 0v7h6M7 14h10M7 19h10"
      fill="none"
      stroke={p.background}
      strokeWidth="2"
    />
  </svg>
);
const Window: React.FC<{
  p: NumoProps;
  title: string;
  children: React.ReactNode;
  scale?: number;
}> = ({ p, title, children, scale = 1 }) => (
  <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})` }}>
    <div
      style={{
        ...pos(...p.geometry.app),
        background: p.paper,
        border: `3px solid ${p.background}`,
        boxShadow: `7px 7px 0 ${p.acid}`,
      }}
    />
    <div style={{ ...pos(42, 83, 876, 1), background: p.background }} />
    {[57, 69, 81].map((x) => (
      <div
        key={x}
        style={{
          ...pos(x, 56, 6, 6),
          borderRadius: 3,
          background: p.background,
        }}
      />
    ))}
    <svg width="27" height="26" style={{ ...pos(105, 48, 27, 26) }}>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={i * 9}
          y={14 - i * 7}
          width="6"
          height={12 + i * 7}
          fill={p.background}
        />
      ))}
    </svg>
    <Text
      text={title}
      x={144}
      y={42}
      w={690}
      h={42}
      size={34}
      min={24}
      bold
      color={p.background}
    />
    <div
      style={{ ...pos(87, 83, 1, 419), background: p.background, opacity: 0.4 }}
    />
    {[0, 1, 2, 3, 4].map((i) => (
      <svg
        key={i}
        width="23"
        height="26"
        style={{ ...pos(53, 113 + i * 66, 23, 26) }}
      >
        <rect
          x="2"
          y="3"
          width="18"
          height="18"
          fill="none"
          stroke={p.background}
          strokeWidth="1.5"
        />
        <path
          d={i % 2 ? "M4 13h14M11 5v14" : "M5 18l4-6 4 3 4-7"}
          stroke={p.background}
          fill="none"
        />
      </svg>
    ))}
    <div style={{ ...pos(110, 105, 781, 370), background: "#e5deea" }} />
    {children}
  </div>
);
const Insight: React.FC<{ p: NumoProps; f: number }> = ({ p, f }) => {
  const c = p.supportingCopy;
  return (
    <Panel x={113} y={135} w={745} h={327} p={p}>
      <Text
        text={c.next}
        x={25}
        y={20}
        w={640}
        h={50}
        size={38}
        bold
        color={p.background}
      />
      {[p.action.split(" ")[0], p.action.split(" ").slice(1).join(" ")].map(
        (v, i) => (
          <Text
            key={i}
            text={v}
            x={25}
            y={78 + i * 77}
            w={690}
            h={80}
            size={68}
            min={38}
            bold
            color={p.background}
            style={{
              opacity: ease(f, 292 + i * 2, 304 + i * 2),
              transform: `translateY(${15 * (1 - ease(f, 292 + i * 2, 304 + i * 2))}px)`,
            }}
          />
        ),
      )}
      <DocumentGlyph p={p} style={{ ...pos(25, 277, 24, 28) }} />
      <Text
        text={c.logs}
        x={59}
        y={279}
        w={410}
        h={34}
        size={24}
        color={p.background}
      />
      <div
        style={{
          ...pos(580, 269, 142, 50),
          background: p.acid,
          border: `2px solid ${p.background}`,
        }}
      >
        <Text
          text={c.share}
          x={6}
          y={8}
          w={126}
          h={35}
          size={28}
          min={18}
          align="center"
          color={p.background}
        />
      </div>
    </Panel>
  );
};
export const Numo: React.FC<NumoProps> = (p) => {
  const f = useCurrentFrame(),
    c = p.supportingCopy,
    percent = Math.round((100 * (p.current - p.baseline)) / p.baseline);
  let content: React.ReactNode;
  if (f < 63) {
    const value = Math.round(mix(-2, percent, ease(f, 0, 20)));
    content = (
      <>
        <div style={{ ...pos(0, 0, 660, 540), background: p.acid }} />
        <Text
          text={c.sales}
          x={34}
          y={40}
          w={570}
          h={77}
          size={60}
          bold
          color={p.background}
        />
        <div style={{ ...pos(34, 134, 570, 2), background: p.background }} />
        <div
          style={{
            ...pos(18, 170 + 35 * (1 - ease(f, 0, 20)), 590, 250),
            color: p.background,
          }}
        >
          <Text
            text={String(value)}
            x={0}
            y={0}
            w={445}
            h={250}
            size={252}
            min={150}
            bold
          />
          <Text
            text="%"
            x={429}
            y={91}
            w={150}
            h={157}
            size={145}
            min={100}
            bold
          />
        </div>
        <svg width="63" height="74" style={{ ...pos(559, 427, 63, 74) }}>
          <path
            d="M30 3v55M8 36l22 22 22-22"
            fill="none"
            stroke={p.background}
            strokeWidth="7"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - ease(f, 25, 35)}
          />
        </svg>
      </>
    );
  } else if (f < 113) {
    content = (
      <Window p={p} title={c.byDevice} scale={mix(1.05, 1, ease(f, 63, 69))}>
        {[0, 1].map((i) => (
          <Panel
            key={i}
            x={113 + 380 * i}
            y={168}
            w={365}
            h={290}
            p={p}
            acid={i === 1}
          >
            <Text
              text={i ? c.mobile : c.desktop}
              x={20}
              y={20}
              w={325}
              h={46}
              size={38}
              bold
              color={p.background}
            />
            <svg width="323" height="125" style={{ ...pos(22, 105, 323, 125) }}>
              <path
                d={
                  i
                    ? "M0 0 65 -2 130 6 195 12 240 46 283 72 318 76"
                    : "M0 4 65 7 130 2 195 8 260 4 318 6"
                }
                transform="translate(0 40)"
                stroke={p.background}
                strokeWidth="3"
                fill="none"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={1 - ease(f, 67, 89)}
              />
            </svg>
            <Text
              text={i ? c.declining : c.stable}
              x={20}
              y={232}
              w={325}
              h={40}
              size={28}
              color={p.background}
            />
          </Panel>
        ))}
        {f >= 90 && (
          <Cursor
            x={mix(420, 690, ease(f, 90, 102))}
            y={mix(410, 298, ease(f, 90, 102))}
            click={103}
            frame={f}
          />
        )}
      </Window>
    );
  } else if (f < 163) {
    content = (
      <Window p={p} title={c.checkout}>
        <div style={{ ...pos(160, 318, 640, 2), background: p.background }} />
        {c.steps.map((v, i) => (
          <Panel
            key={i}
            x={113 + 258 * i + 45 * (1 - ease(f, 113 + i * 3, 125 + i * 3))}
            y={159}
            w={229}
            h={307}
            p={p}
            acid={i === 2}
            style={{ opacity: ease(f, 113 + i * 3, 121 + i * 3) }}
          >
            <Text
              text={v}
              x={15}
              y={22}
              w={199}
              h={49}
              size={36}
              min={24}
              bold
              align="center"
              color={p.background}
            />
            {i < 2 ? (
              <div
                style={{
                  ...pos(64, 111, 100, 100),
                  borderRadius: "50%",
                  border: `3px solid ${p.background}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check
                  size={70}
                  color={p.background}
                  draw={ease(f, 132, 141)}
                />
              </div>
            ) : (
              <div style={{ opacity: ease(f, 143, 154) }}>
                <svg width="70" height="70" style={{ ...pos(80, 133, 70, 70) }}>
                  <circle
                    cx="35"
                    cy="35"
                    r="30"
                    fill="none"
                    stroke={p.background}
                    strokeWidth="3"
                  />
                  <path
                    d="m23 23 24 24m0-24-24 24"
                    stroke={p.background}
                    strokeWidth="3"
                  />
                </svg>
                <Text
                  text={c.timeout}
                  x={15}
                  y={245}
                  w={199}
                  h={40}
                  size={28}
                  align="center"
                  color={p.background}
                />
              </div>
            )}
          </Panel>
        ))}
      </Window>
    );
  } else if (f < 238) {
    content = (
      <Window p={p} title={c.source}>
        <Panel
          x={113}
          y={135}
          w={745}
          h={327}
          p={p}
          style={{
            transform: `scaleY(${mix(0.08, 1, ease(f, 163, 181))})`,
            transformOrigin: "right bottom",
          }}
        >
          <DocumentGlyph p={p} style={{ ...pos(24, 21, 24, 28) }} />
          <Text
            text={c.logs}
            x={64}
            y={18}
            w={630}
            h={43}
            size={32}
            bold
            color={p.background}
          />
          <div
            style={{
              ...pos(0, 65, 745, 2),
              background: p.background,
              opacity: 0.55,
            }}
          />
          <Text
            text={p.evidence.replace(" ", "\n")}
            x={24}
            y={84}
            w={696}
            h={180}
            size={70}
            min={40}
            bold
            lines={2}
            color={p.background}
          />
          <Text
            text={c.path}
            x={24}
            y={278}
            w={697}
            h={43}
            size={36}
            min={24}
            color={p.background}
          />
        </Panel>
        {f >= 203 && (
          <Cursor
            x={mix(783, 217, ease(f, 203, 215))}
            y={mix(415, 176, ease(f, 203, 215))}
            click={216}
            frame={f}
          />
        )}
      </Window>
    );
  } else if (f < 288) {
    const q = ease(f, 238, 246);
    content = (
      <>
        <div style={{ ...pos(0, 0, 660, 540), background: p.acid }} />
        {c.command.map((v, i) => (
          <Text
            key={i}
            text={v}
            x={34 - 60 * (1 - q)}
            y={i ? 296 : 64}
            w={600}
            h={i ? 139 : 179}
            size={i ? 113 : 157}
            min={i ? 65 : 85}
            bold
            color={p.background}
            style={{ filter: `blur(${10 * (1 - q)}px)` }}
          />
        ))}
        <div style={{ ...pos(34, 270, 570, 2), background: p.background }} />
      </>
    );
  } else if (f < 438) {
    content = (
      <Window p={p} title={c.insight}>
        <Insight p={p} f={f} />
        {f < 338 && f >= 315 && (
          <Cursor
            x={mix(554, 783, ease(f, 315, 328))}
            y={mix(372, 428, ease(f, 315, 328))}
            click={330}
            frame={f}
          />
        )}{" "}
        {f >= 338 && f < 388 && (
          <>
            <div
              style={{
                ...pos(88, 84, 828, 416),
                background: p.paper,
                opacity: 0.65,
              }}
            />
            <Panel
              x={235}
              y={136 + 18 * (1 - ease(f, 338, 350))}
              w={507}
              h={319}
              p={p}
              style={{
                outline: `3px solid ${p.background}`,
                boxShadow: `8px 8px 0 ${p.background}`,
                transform: `scale(${mix(0.9, 1, ease(f, 338, 350))})`,
                filter: `blur(${7 * (1 - ease(f, 338, 350))}px)`,
              }}
            >
              <Text
                text={c.shareTitle}
                x={28}
                y={25}
                w={451}
                h={49}
                size={38}
                min={26}
                bold
                color={p.background}
              />
              <div
                style={{
                  ...pos(28, 98, 451, 80),
                  background: f >= 354 ? p.acid : p.paper,
                  border: `2px solid ${p.background}`,
                }}
              >
                <svg width="40" height="46" style={{ ...pos(15, 17, 40, 46) }}>
                  <circle
                    cx="20"
                    cy="12"
                    r="8"
                    fill="none"
                    stroke={p.background}
                    strokeWidth="2"
                  />
                  <path
                    d="M3 42v-8c0-16 34-16 34 0v8"
                    stroke={p.background}
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <Text
                  text={p.team}
                  x={70}
                  y={11}
                  w={312}
                  h={58}
                  size={44}
                  min={26}
                  bold
                  color={p.background}
                />
                <div style={{ ...pos(397, 24, 30, 30) }}>
                  <Check color={p.background} />
                </div>
              </div>
              <div
                style={{
                  ...pos(322, 240, 156, 50),
                  background: p.acid,
                  border: `2px solid ${p.background}`,
                }}
              >
                <Text
                  text={c.share}
                  x={10}
                  y={8}
                  w={136}
                  h={37}
                  size={28}
                  min={18}
                  align="center"
                  color={p.background}
                />
              </div>
            </Panel>
            {f >= 360 && (
              <Cursor
                x={mix(468, 657, ease(f, 360, 373))}
                y={mix(287, 400, ease(f, 360, 373))}
                click={375}
                frame={f}
              />
            )}
          </>
        )}
        {f >= 388 && (
          <Panel
            x={113}
            y={135}
            w={745}
            h={327}
            p={p}
            style={{ transform: `scale(${mix(0.94, 1, ease(f, 388, 398))})` }}
          >
            <div
              style={{
                ...pos(45, 109, 72, 72),
                background: p.acid,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Check size={52} color={p.background} draw={ease(f, 388, 400)} />
            </div>
            <Text
              text={"Shared with\n" + p.team + "."}
              x={204}
              y={91}
              w={515}
              h={170}
              size={67}
              min={38}
              bold
              lines={2}
              color={p.background}
            />
          </Panel>
        )}
      </Window>
    );
  } else if (f < 513) {
    content = (
      <>
        {c.closing.map((v, i) => {
          const q = ease(f, i ? 463 : 438, i ? 476 : 451);
          return (
            <div
              key={i}
              style={{
                ...pos(
                  (i ? 234 : 25) + (i ? 1000 : -1000) * (1 - q),
                  i ? 280 : 55,
                  718,
                  i ? 174 : 155,
                ),
                background: i ? p.acid : p.paper,
              }}
            >
              <Text
                text={v}
                x={19}
                y={9}
                w={680}
                h={i ? 155 : 138}
                size={i ? 121 : 116}
                min={80}
                bold
                color={p.background}
              />
            </div>
          );
        })}
      </>
    );
  } else {
    const q = ease(f, 513, 531);
    content = (
      <>
        <div
          style={{
            ...pos(0, 35, 926, 310),
            background: p.background,
            transform: `translateX(${-70 * (1 - q)}px)`,
          }}
        >
          <Text
            text={p.brand}
            x={30}
            y={-5}
            w={870}
            h={315}
            size={290}
            min={130}
            bold
            color={p.paper}
          />
          <Text
            text={p.brand}
            x={31.5}
            y={-4.5}
            w={870}
            h={315}
            size={290}
            min={130}
            bold
            color={p.acid}
            style={{ opacity: 0.2, mixBlendMode: "multiply" }}
          />
        </div>
        <div
          style={{
            ...pos(27, 415 + 45 * (1 - q), 849, 78),
            background: p.paper,
          }}
        >
          <Text
            text={p.tagline}
            x={19}
            y={14}
            w={810}
            h={58}
            size={46}
            min={24}
            bold
            color={p.background}
          />
        </div>
      </>
    );
  }
  return (
    <Frame background={p.background}>
      <Stripes p={p} f={f} />
      {content}
      <Grain />
    </Frame>
  );
};
