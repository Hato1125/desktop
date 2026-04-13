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

import { match } from 'ts-pattern';

app.start({
  css: `${SRC}/style.css`,
  icons: `${SRC}/icons`,
  instanceName: 'desktop',
  requestHandler(args, res) {
    match(args[0])
      .with('toggle-launcher', () => toggleWindow())
    res(1);
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
