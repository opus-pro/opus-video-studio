import config from '../../config/brand.json';
export const numoStory=config.story;

// Background records convey scale; they are visual texture, not reading copy.
export const rawValue=(r:number,c:number)=>{
 const n=((r+7)*7919+(c+11)*104729+(r*c+3)*1301)%98731;
 return c%4===0?(n/100).toFixed(2):String(n).padStart(5,'0');
};
