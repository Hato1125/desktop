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

import { checkAllFeatures, env } from 'src/feature/feature';

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
    const e = env();
    console.log(`[feature] env: os=${e.os} ${e.osVersion.join('.')}, compositor=${e.compositor} ${e.compositorVersion.join('.')}`);

    const featureResults = checkAllFeatures(e);
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
