import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

export const FONT = 'Geist';
let loading: Promise<void> | null = null;

const load = () => {
  if (!loading) {
    const face = new FontFace(FONT, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    loading = face.load().then((f) => {
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
    });
  }
  return loading;
};

export const useGeist = () => {
  const [handle] = useState(() => delayRender('Loading Geist'));
  useEffect(() => {
    load()
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle]);
};
