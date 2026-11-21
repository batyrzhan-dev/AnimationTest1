import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
// В облачном контейнере используем предустановленный Chromium (headless shell).
// Локально на Windows/WSL эту строку можно удалить — Remotion скачает свой браузер.
if (process.env.REMOTION_CHROME) Config.setBrowserExecutable(process.env.REMOTION_CHROME);
