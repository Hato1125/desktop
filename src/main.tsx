declare const SRC: string;

import app from 'ags/gtk4/app';

import Launcher, { toggleWindow } from '@ui/launcher/index';
import {
  MonitorCorners,
  BarCorner,
} from '@ui/corner/index';
import Bar from '@ui/bar/index';
import Dock from '@ui/dock/index';
import Notification from '@ui/notification/index';
import Osd from '@ui/osd/index';

import { checkAllFeatures } from 'src/feature/feature';
import { detectEnv } from 'src/feature/env';

app.start({
  css: `${SRC}/style.css`,
  icons: `${SRC}/icons`,
  instanceName: 'desktop',
  requestHandler(args, res) {
    switch (args[0]) {
      case 'toggle-launcher': toggleWindow(); break;
    }
    res('');
  },
  main() {
    const env = detectEnv();
    console.log(`[feature] env: os=${env.os} ${env.osVersion.join('.')}, compositor=${env.compositor} ${env.compositorVersion.join('.')}`);

    const featureResults = checkAllFeatures(env);
    for (const r of featureResults) {
      if (r.available) {
        console.log(`[feature] ${r.name}: available`);
      } else {
        console.warn(`[feature] ${r.name}: UNAVAILABLE on this environment`);
      }
    }

    Launcher();
    Notification();
    Osd();
    Bar();
    BarCorner();
    MonitorCorners();
    Dock();
  }
});
