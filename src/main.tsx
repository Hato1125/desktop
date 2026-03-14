import app from 'ags/gtk4/app';

import {
  createBinding,
  For,
  This
} from 'ags';

import { Gdk } from 'ags/gtk4';

import {
  MonitorBottomLeftCorner,
  MonitorBottomRightCorner,
  MonitorTopLeftCorner,
  MonitorTopRightCorner,
} from './ui/corner/index';

app.start({
  main() {
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
