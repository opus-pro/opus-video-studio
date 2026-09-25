import {useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

export const FONT = "'Geist', 'Helvetica Neue', Arial, sans-serif";

let loading: Promise<void> | null = null;
const loadGeist = () => {
  if (!loading) {
    const face = new FontFace('Geist', `url('${staticFile('assets/GeistVF.woff2')}') format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    loading = face.load().then((f) => {
      (document.fonts as unknown as {add: (face: FontFace) => void}).add(f);
    });
  }
  return loading;
};

// Blocks rendering until the Geist variable font is ready.
export const useGeist = () => {
  useState(() => {
    const handle = delayRender('Loading Geist variable font');
    loadGeist()
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
    return handle;
  });
};
