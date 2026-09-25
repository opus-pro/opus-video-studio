import {continueRender, delayRender, staticFile} from 'remotion';

export const FONT = 'Geist';

let promise: Promise<void> | null = null;

export const loadGeist = (): Promise<void> => {
  if (promise) return promise;
  const handle = delayRender('Loading Geist');
  const face = new FontFace(FONT, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
    weight: '100 900',
    style: 'normal',
  });
  promise = face
    .load()
    .then((loaded) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(loaded);
      return document.fonts.ready;
    })
    .then(() => continueRender(handle))
    .catch((err) => {
      continueRender(handle);
      throw err;
    });
  return promise;
};
