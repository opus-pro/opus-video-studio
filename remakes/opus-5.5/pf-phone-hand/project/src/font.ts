import {continueRender, delayRender, staticFile} from 'remotion';

export const FONT_FAMILY = 'Geist';
export const FONT_STACK = `'${FONT_FAMILY}', -apple-system, 'Helvetica Neue', Arial, sans-serif`;

// Load the Geist variable font once per tab and hold the render until it is ready,
// so no frame is ever captured with a fallback face.
let started = false;
export const ensureFont = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading Geist variable font');
  const face = new FontFace(FONT_FAMILY, `url('${staticFile('assets/GeistVF.woff2')}') format('woff2')`, {
    weight: '100 900',
    style: 'normal',
  });
  face
    .load()
    .then((loaded) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(loaded);
      return document.fonts.ready;
    })
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
