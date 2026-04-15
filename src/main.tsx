declare const SRC: string;

import app from 'ags/gtk4/app';
import {
  createBinding,
  For,
  This
} from 'ags';

import { Gdk } from 'ags/gtk4';

import Launcher, { toggleWindow } from '@ui/launcher/index';
import {
  MonitorBottomLeftCorner,
  MonitorBottomRightCorner,
  MonitorTopLeftCorner,
  MonitorTopRightCorner,
  BarBottomLeftCorner,
  BarBottomRightCorner,
} from '@ui/corner/index';
import Bar from '@ui/bar/index';
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
    BarBottomLeftCorner();
    BarBottomRightCorner();

    return (
      <For each={createBinding(app, 'monitors')}>
        {(monitor: Gdk.Monitor) => (
          <This this={app}>
            <MonitorTopLeftCorner gdkmonitor={monitor} />
            <MonitorTopRightCorner gdkmonitor={monitor} />
            <MonitorBottomLeftCorner gdkmonitor={monitor} />
            <MonitorBottomRightCorner gdkmonitor={monitor} />
          </This>
        )}
      </For>
    );
  }
});
