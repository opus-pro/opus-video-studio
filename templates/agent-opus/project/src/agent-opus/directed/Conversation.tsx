import React from "react";
import { Easing, interpolate } from "remotion";
import template from "../../template";

const A: React.CSSProperties = { position: "absolute" };
export const conversationSerif: React.CSSProperties = {
  fontFamily: "Fraunces", fontWeight: 450, letterSpacing: "-.045em",
  fontVariationSettings: '"opsz" 72,"SOFT" 85,"WONK" 1',
};
// Short arrivals, concentrated spatial travel, and separate reading holds.
// Storyboard drawing uses the reclaimed time; later asset and edit clocks stay fixed.
const arrive = Easing.bezier(0.22, 1, 0.36, 1);
const travel = Easing.bezier(0.76, 0, 0.24, 1);
const stream = Easing.bezier(0.22, 0.06, 0.62, 1);
const expand = Easing.bezier(0.7, 0, 0.2, 1);
const leave = Easing.bezier(0.4, 0, 1, 1);
const grow = Easing.bezier(0.42, 0, 0.2, 1);
// Approximation fitted to the user's Slow down / 50 curve screenshot.
// This is not a claim about Jitter's undisclosed internal easing formula.
const messageSlowDown = Easing.bezier(0.024, 0.57, 0.35, 1);
// Use the first 80% of that single curve for emission, normalized to completion.
// This preserves the early sweep without stretching the final few letters
// across the almost-flat tail. Their original blur easing still settles softly.
const screenplayEase = (progress: number) => messageSlowDown(progress * 0.8) / messageSlowDown(0.8);
export const messageBlurRadius = 20;
export const messageLetterFrames = 0.323 * 30;
const q = (f: number, a: number, b: number, easing = arrive) => interpolate(f, [a,b], [0,1], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp", easing,
});
const mix = (a: number, b: number, p: number) => a + (b-a)*p;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const chatExpansion = (frame: number) => q(frame, 134, 148, expand);

// One continuous message clock. Ease into 3× playback before the last ten
// letters, then compress both their emission and blur by exactly the same 3×.
// The original message Bézier and letter Bézier are unchanged.
export function screenplayClock(frame: number) {
  if (frame <= 68) return frame;
  if (frame >= 74) return 80 + (frame - 74) * 3;
  const t = frame - 68;
  return 68 + t + 2 * (t ** 3 / 36 - t ** 4 / 432);
}

// The entire screenplay is ONE animation. Line breaks affect layout only:
// no extra character positions, pauses, local curves, or restarted clocks.
export function screenplayFront(frame: number, lines: readonly string[]) {
  const total = lines.reduce((sum, line) => sum + Array.from(line).length, 0);
  return total * q(screenplayClock(frame), 53, 92, screenplayEase);
}

export function screenplaySchedule(lines: readonly string[]) {
  const characters = lines.flatMap(line => Array.from(line));
  return characters.map((_, i) => {
    let lo = 53, hi = 92;
    for (let step = 0; step < 22; step++) {
      const mid = (lo + hi) / 2;
      if (screenplayFront(mid, lines) < i + 1) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  });
}
const screenplayLetterStarts = screenplaySchedule(template.copy.screenplay);

const realTime = (frame: number) => frame;
export const messageLetterProgress = (frame: number, start: number, clock = realTime) => q(clock(frame), clock(start), clock(start) + messageLetterFrames, messageSlowDown);

// Letters overlap for 323 ms as they lose blur; the emission schedule controls
// the spacing of their starts independently from each letter's easing.
function BlurStream({text, frame, start, end, starts, clock = realTime}: {text:string;frame:number;start:number;end:number;starts?:readonly number[];clock?:(frame:number)=>number}) {
  const characters = Array.from(text);
  return <span style={{whiteSpace:"pre"}}>{characters.map((char, i) => {
    const emittedAt = starts?.[i] ?? mix(start, Math.max(start, end - messageLetterFrames), i / Math.max(1, characters.length - 1));
    const progress = messageLetterProgress(frame, emittedAt, clock);
    return <span key={i} style={{display:"inline-block",whiteSpace:"pre",opacity:progress,filter:progress >= 1 ? "none" : `blur(${messageBlurRadius * (1-progress)}px)`}}>{char}</span>;
  })}</span>;
}

function Avatar({user = false, size = 58}: {user?: boolean; size?: number}) {
  return <div style={{width:size,height:size,borderRadius:"50%",display:"grid",placeItems:"center",flexShrink:0,
    background:user ? "#8052a6" : "radial-gradient(circle at 28% 23%,#fff 0%,#f7d7ff 19%,#b564df 47%,#64299c 78%,#a774c8)",
    boxShadow: user ? "inset 0 0 0 2px #ffffff77" : "inset 5px 6px 12px #ffffff77,0 6px 18px #86569822"}}>
    {user && <svg width={size*.6} height={size*.6} viewBox="0 0 36 36" fill="none" stroke="white" strokeWidth="2.5"><circle cx="18" cy="11" r="5"/><path d="M8 29v-3a10 10 0 0 1 20 0v3"/></svg>}
  </div>;
}

function Tail({user=false}: {user?:boolean}) {
  return <svg width="36" height="35" viewBox="0 0 36 35" style={{...A,bottom:-2,[user?"right":"left"]:-24,scale:user?"1 1":"-1 1",overflow:"visible"}}>
    <path d="M0 0C2 18 14 28 32 31C18 35 6 32-5 27Z" fill={user?"#e8d5f6":"#fff"}/>
  </svg>;
}

function Role({user=false}: {user?:boolean}) {
  return <div style={{...A,top:-54,[user?"right":"left"]:0,display:"flex",alignItems:"center",gap:12,flexDirection:user?"row-reverse":"row",fontFamily:"Geist",fontSize:27,fontWeight:520,letterSpacing:"-.02em",color:"#765c85"}}>
    <Avatar user={user} size={36}/>{user?template.copy.userLabel:template.product.name}
  </div>;
}

function Bubble({user=false,children,style,role=true}: {user?:boolean;children:React.ReactNode;style?:React.CSSProperties;role?:boolean}) {
  return <div style={{...A,background:user?"linear-gradient(135deg,#f1e3fc,#e8d5f6)":"#fff",borderRadius:user?"32px 32px 6px 32px":"32px 32px 32px 6px",border:"2px solid #ffffffdd",boxShadow:"0 18px 55px #62427712",...style}}>
    {role&&<Role user={user}/>}<Tail user={user}/>{children}
  </div>;
}

// A softly feathered character front moves through the entire response.
// Letters never move vertically; paragraphs share the authored emission
// schedule, without independently animating or settling individual words.
function Stream({text,frame,start,end,position,feather=3,style}: {text:string;frame:number;start:number;end:number;position?:number;feather?:number;style?:React.CSSProperties}) {
  const front = position ?? (text.length + feather) * q(frame, start, end, stream);
  return <span style={{whiteSpace:"pre",...style}}>{Array.from(text).map((char,i)=>{
    const edge = clamp((front-i)/feather);
    const opacity = edge*edge*(3-2*edge);
    return <span key={i} style={{opacity}}>{char}</span>;
  })}</span>;
}

function Send({size=58}: {size?:number}) {
  return <div style={{width:size,height:size,borderRadius:"50%",background:"#8052a6",display:"grid",placeItems:"center",color:"white"}}>
    <svg width={size*.54} height={size*.54} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 31V9m-8 8 8-8 8 8"/></svg>
  </div>;
}

/** Six seconds inside the original workflow window; all later edit clocks stay fixed. */
export function ConversationIntro({frame:f}: {frame:number}) {
  const sent=q(f,25,35,travel), reply=q(f,37,46), scroll=q(f,79,91,travel), approve=q(f,81,90), handoff=q(f,103,111);
  const unfold=chatExpansion(f), away=q(f,128,136,leave), clearReply=q(f,134,143,leave);
  const typed=Math.floor(template.copy.workflowBrief.length*q(f,0,20,stream));
  const panelHeight=mix(170,440,q(f,46,66,grow));
  const scriptFront=screenplayFront(f, template.copy.screenplay);
  return <div style={{...A,inset:0,fontFamily:"Geist",color:"#302439",pointerEvents:"none"}}>
    <div style={{...A,inset:0,translate:`0 ${-scroll*275}px`,opacity:1-away}}>
      <Bubble user style={{left:mix(395,620,sent),top:mix(385,133,sent),width:1130,height:163,padding:"27px 35px",opacity:q(f,-1,8)}}>
        <div style={{...conversationSerif,fontSize:59,lineHeight:1.08,whiteSpace:"nowrap"}}>{template.copy.workflowBrief.slice(0,typed)}{f<25&&<span style={{opacity:0.65+0.35*Math.cos(f*.22)}}>|</span>}</div>
        <div style={{fontSize:28,color:"#785988",marginTop:12}}>{template.copy.workflowTone}</div>
        <div style={{...A,right:27,bottom:25,opacity:1-sent}}><Send/></div>
      </Bubble>
      <Bubble style={{left:205,top:365+(1-reply)*24,width:1330,height:panelHeight,opacity:reply}}>
        <div style={{height:"100%",overflow:"hidden",padding:"24px 36px"}}>
          <div style={{...conversationSerif,fontSize:50,lineHeight:1.1}}><BlurStream text={template.copy.agentReply} frame={f} start={40} end={57}/></div>
          <div style={{fontSize:23,letterSpacing:".09em",fontWeight:600,color:"#8a629e",marginTop:23,marginBottom:14,opacity:q(f,48,55)}}>{template.copy.screenplayHeading} <span style={{letterSpacing:".01em",fontWeight:400,marginLeft:14,color:"#97869e"}}>{template.copy.screenplayDuration}</span></div>
          <div style={{height:1,background:"#e9deee",marginBottom:15,opacity:q(f,48,55)}}/>
          {template.copy.screenplay.map((line,i)=>{
            const offset=template.copy.screenplay.slice(0,i).reduce((sum,previous)=>sum+Array.from(previous).length,0);
            const position=scriptFront-offset;
            return <div key={line} style={{display:"flex",gap:23,marginTop:14,lineHeight:1.35,fontSize:42,letterSpacing:"-.025em"}}>
              <span style={{fontSize:23,color:"#ad91bd",paddingTop:9,opacity:clamp(position/4)}}>{String(i+1).padStart(2,"0")}</span>
              <BlurStream text={line} frame={f} start={53} end={82} starts={screenplayLetterStarts.slice(offset, offset + Array.from(line).length)} clock={screenplayClock}/>
            </div>;
          })}
        </div>
      </Bubble>
    </div>
    <Bubble user style={{left:1445,top:625+(1-approve)*25,width:305,height:112,padding:"23px 33px",opacity:approve*(1-away)}}>
      <div style={{...conversationSerif,fontSize:52,lineHeight:1.1}}><Stream text={template.copy.approval} frame={f} start={82} end={88}/></div>
      <div style={{...A,right:24,top:38,color:"#8052a6",opacity:q(f,89,93),fontSize:27}}>✓</div>
    </Bubble>
    <div style={{...A,left:mix(205,165,unfold),top:mix(830,242,unfold)+(1-handoff)*28,width:mix(1330,1590,unfold),height:mix(137,510,unfold),borderRadius:mix(32,25,unfold),background:"#fff",border:"2px solid white",boxShadow:"0 18px 55px #62427712",opacity:handoff}}>
      <div style={{opacity:1-clearReply}}><Role/><Tail/></div>
      <div style={{...conversationSerif,fontSize:60,padding:"28px 36px",opacity:1-clearReply}}><BlurStream text={template.copy.storyboardReply} frame={f} start={104} end={120}/></div>
      {[1,2].map(i=><div key={i} style={{...A,left:i*545-2,top:-2,height:"101%",width:45,background:"#f6f1f3",scale:`1 ${unfold}`,transformOrigin:"top",opacity:unfold}}/>)}
    </div>
  </div>;
}

export function RevisionChat({frame:f}: {frame:number}) {
  const enter=q(f,554,566,travel), response=q(f,573,582), exit=q(f,609,619,leave);
  return <div style={{...A,inset:0,opacity:1-exit,translate:`0 ${-exit*230}px`}}>
    <Bubble user style={{left:mix(1940,840,enter),top:70,width:900,height:111,padding:"21px 31px"}}>
      <span style={{...conversationSerif,fontSize:54,whiteSpace:"nowrap"}}>{template.copy.revision}</span>
    </Bubble>
    <Bubble role={false} style={{left:165,top:208+(1-response)*22,width:955,height:79,padding:"12px 25px",opacity:response,display:"flex",gap:19,alignItems:"center"}}>
      <Avatar size={45}/><span style={{...conversationSerif,fontSize:40}}><BlurStream text={template.copy.revisionReply} frame={f} start={575} end={590}/></span>
    </Bubble>
  </div>;
}
