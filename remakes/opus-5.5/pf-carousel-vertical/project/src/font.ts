import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

export const FONT_FAMILY = 'Geist';
export const FONT_STACK = `${FONT_FAMILY}, "Helvetica Neue", Helvetica, Arial, sans-serif`;

let loaded: Promise<void> | null = null;
const loadGeist = () => {
  if (!loaded) {
    const face = new FontFace(FONT_FAMILY, `url(${staticFile('assets/GeistVF.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    });
    loaded = face.load().then((f) => {
      document.fonts.add(f);
    });
  }
  return loaded;
};

/** Blocks rendering until the Geist variable font is ready. */
export const useGeist = () => {
  const [handle] = useState(() => delayRender('Loading Geist'));
  useEffect(() => {
    loadGeist()
      .then(() => continueRender(handle))
      .catch((err) => cancelRender(err));
  }, [handle]);
};
