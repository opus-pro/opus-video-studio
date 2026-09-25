import timeline from '../config/timeline.json';

// The artwork retains its authored frame coordinates. Only three low-information
// intervals are tightened; narration runs on the actual 900-frame output clock.
const keys=timeline.timeMap;
export function motionFrame(frame:number){
 for(let i=1;i<keys.length;i++)if(frame<=keys[i][0]){
  const [a,x]=keys[i-1],[b,y]=keys[i];
  return x+(y-x)*Math.max(0,(frame-a)/(b-a));
 }
 return keys[keys.length-1][1];
}
export function sourceVelocity(frame:number){
 for(let i=1;i<keys.length;i++)if(frame<keys[i][1])return (keys[i][1]-keys[i-1][1])/(keys[i][0]-keys[i-1][0]);
 return 1;
}
