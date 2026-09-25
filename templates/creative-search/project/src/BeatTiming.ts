// Scene movement and character SFX share this invertible clock.
// Anchors preserve the original easing inside each movement, shifting its attack onto music beats.
export const beatF=(n:number)=>Math.round(n*.4916721455*60);
export const SHOTS={open:0,search:beatF(10),refine:beatF(18),results:beatF(26),explore:beatF(30),canvas:beatF(38),outro:beatF(42),end:beatF(46)};
export const clocks={
 opening:[[0,0],[74,beatF(2.5)],[124,beatF(4)],[168,beatF(6)],[230,beatF(8)],[281,beatF(9.5)],[300,SHOTS.search]],
 search:[[0,SHOTS.search],[40,beatF(11.5)],[64,beatF(12)],[101,beatF(13.5)],[106,beatF(14)],[141,beatF(15)],[155,beatF(16)],[208,beatF(17.5)],[231,SHOTS.refine]],
 refine:[[0,SHOTS.refine],[35,beatF(19)],[110,beatF(21.5)],[125,beatF(22)],[138,beatF(22.5)],[151,beatF(23)],[179,beatF(24)],[221,beatF(25.5)],[240,SHOTS.results]],
 results:[[0,SHOTS.results],[26,beatF(27)],[46,beatF(28)],[80,beatF(29)],[177,SHOTS.explore]],
 finale:[[0,SHOTS.explore],[62,beatF(32)],[123,beatF(34)],[180,beatF(36)],[223,beatF(37)],[246,beatF(38)],[282,beatF(39)],[288,beatF(39.25)],[310,beatF(40.25)],[350,beatF(41.75)],[360,SHOTS.outro]],
};
export type Scene=keyof typeof clocks;
const map=(x:number,points:number[][],reverse=false)=>{const k=reverse?1:0,j=1-k;let i=0;while(i<points.length-2&&x>points[i+1][k])i++;const a=points[i],b=points[i+1];return a[j]+(x-a[k])/(b[k]-a[k])*(b[j]-a[j]);};
export const cue=(scene:Scene,virtual:number)=>Math.round(map(virtual,clocks[scene]));
export const motionFrame=(scene:Scene,local:number)=>map(local+clocks[scene][0][1],clocks[scene],true);
