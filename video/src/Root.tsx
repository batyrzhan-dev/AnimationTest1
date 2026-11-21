import '@fontsource/montserrat/cyrillic-800.css';
import '@fontsource/montserrat/cyrillic-900.css';
import '@fontsource/montserrat/latin-900.css';
import React from 'react';
import { Composition, continueRender, delayRender } from 'remotion';
import { SCENE01_FPS, SCENE01_FRAMES, Scene01 } from './Scene01';

// Ждём загрузки шрифта, чтобы субтитры не рендерились запасным шрифтом
const handle = delayRender('fonts');
Promise.all([
  document.fonts.load('900 64px Montserrat', 'АБВабв'),
  document.fonts.load('800 64px Montserrat', 'АБВабв'),
]).then(() => continueRender(handle));

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Scene01"
    component={Scene01}
    durationInFrames={SCENE01_FRAMES}
    fps={SCENE01_FPS}
    width={1920}
    height={1080}
  />
);
