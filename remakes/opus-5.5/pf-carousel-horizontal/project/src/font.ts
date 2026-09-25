import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

export const FONT_FAMILY = 'Geist';

let loaded = false;

export const ensureFont = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Loading Geist');
  const face = new FontFace(FONT_FAMILY, `url('${staticFile('assets/GeistVF.woff2')}') format('woff2')`, {
    weight: '100 900',
    style: 'normal',
  });
  face
    .load()
    .then((f) => {
      document.fonts.add(f);
      return document.fonts.ready;
    })
    .then(() => continueRender(handle))
    .catch((err) => cancelRender(err));
};
