import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

export const FONT = 'FieldGeist';

// Load the Geist variable font once per tab and hold the render until it is ready,
// so no frame is ever captured with a fallback face.
if (typeof document !== 'undefined' && !(window as unknown as {__fieldFont?: boolean}).__fieldFont) {
  (window as unknown as {__fieldFont?: boolean}).__fieldFont = true;
  const handle = delayRender('Loading Geist variable font');
  const face = new FontFace(FONT, `url('${staticFile('assets/GeistVF.woff2')}') format('woff2')`, {
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
    .catch((err) => cancelRender(err));
}
