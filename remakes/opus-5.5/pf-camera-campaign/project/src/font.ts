import {continueRender, delayRender, staticFile} from 'remotion';

export const FONT = 'Geist, "Helvetica Neue", Helvetica, Arial, sans-serif';

let loaded = false;

export const ensureFont = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Load Geist variable font');
  const face = new FontFace('Geist', `url('${staticFile('assets/GeistVF.woff2')}') format('woff2')`, {
    weight: '100 900',
    style: 'normal',
  });
  face
    .load()
    .then((f) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
      return document.fonts.ready;
    })
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
