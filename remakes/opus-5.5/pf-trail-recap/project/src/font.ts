import {continueRender, delayRender, staticFile} from 'remotion';

export const FONT_FAMILY = 'Geist';

const handle = delayRender('Load Geist variable font');
const face = new FontFace(FONT_FAMILY, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
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
    console.error('Font failed to load', err);
    continueRender(handle);
  });
