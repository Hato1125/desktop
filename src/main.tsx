import app from 'ags/gtk4/app';

import {
  createBinding,
  For,
  This
} from 'ags';

import { Gdk } from 'ags/gtk4';

import Bar from './ui/bar/index';
import {
  MonitorBottomLeftCorner,
  MonitorBottomRightCorner,
  MonitorTopLeftCorner,
  MonitorTopRightCorner,
  BarBottomLeftCorner,
  BarBottomRightCorner,
} from './ui/corner/index';

app.start({
  css: 'css/main.css',
  icons: `${SRC}/icons`,
  instanceName: 'desktop',
  main() {
    Bar();
    BarBottomLeftCorner();
    BarBottomRightCorner();

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
  }
});
