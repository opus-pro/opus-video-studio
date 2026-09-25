import {a} from './motion';
import timing from '../config/interactions.json';
export const interactions=timing;
export type Action=keyof typeof timing;
export const press=(t:number,key:Action)=>{const c=timing[key];return t<c.up?a(t,c.down,c.down+.075):1-a(t,c.up,c.up+.14)};
export const done=(t:number,key:Action)=>t>=timing[key].result;
