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
    Launcher();
    Notification();
    Osd();
    Bar();
    BarCorner();
    MonitorCorners();
    Dock();
  }
});
