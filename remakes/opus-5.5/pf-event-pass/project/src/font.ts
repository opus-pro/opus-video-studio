import {continueRender, delayRender, staticFile} from 'remotion';

export const FONT_FAMILY = 'Geist';

// Load the Geist variable font once, before the first frame is captured.
if (typeof window !== 'undefined' && typeof FontFace !== 'undefined') {
  const handle = delayRender('Loading Geist variable font');
  const face = new FontFace(FONT_FAMILY, `url('${staticFile('assets/GeistVF.woff2')}') format('woff2')`, {
    weight: '100 900',
    style: 'normal',
  });
  face
    .load()
    .then((loaded) => {
      document.fonts.add(loaded);
      return document.fonts.ready;
    })
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('Geist failed to load', err);
      continueRender(handle);
    });
}
