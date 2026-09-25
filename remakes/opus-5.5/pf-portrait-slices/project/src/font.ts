import {continueRender, delayRender, staticFile} from 'remotion';

export const FONT_FAMILY = 'GeistLocal';

let loaded = false;

export const ensureFont = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Loading Geist variable font');
  const face = new FontFace(FONT_FAMILY, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
    weight: '100 900',
    style: 'normal',
  });
  face
    .load()
    .then(() => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(face);
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
