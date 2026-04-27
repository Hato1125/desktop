import Gtk from 'gi://Gtk?version=4.0';
import Astal from 'gi://Astal?version=4.0';

import { createBinding, For } from 'ags';

import config from '@config';
import Battery from './component/battery';
import Devices from './component/devices';
import Menu from './component/menu';
import Client from './component/client';
import Vpn from './component/vpn';
import Network from './component/network';
import DateTime from './component/datetime';
import Weather from './component/weather';
import Workspaces from './component/workspaces';
import KeyLock from './component/keylock';
import Nowplaying from './component/nowplaying';

const components = new Map(
  [
    Battery(),
    Devices(),
    Menu(),
    Client(),
    Vpn(),
    Network(),
    DateTime(),
    Weather(),
    Workspaces(),
    KeyLock(),
    Nowplaying(),
  ]
    .filter((c): c is NonNullable<typeof c> => c !== null && c !== false)
    .map((c) => [c.name, c]),
);

const Slot = ({ align }: { align: 'start' | 'center' | 'end' }) => (
  <For each={createBinding(config.bar, align)}>
    {(name: string) => components.get(name)?.render() ?? (<box visible={false} />)}
  </For>
);

export default () => (
  <window
    visible
    class='bar'
    namespace='bar'
    anchor={
      createBinding(config.bar, 'anchor').as((a) =>
        (a === 'top' ? Astal.WindowAnchor.TOP : Astal.WindowAnchor.BOTTOM)
        | Astal.WindowAnchor.LEFT
        | Astal.WindowAnchor.RIGHT
      )
    }
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
  >
    <centerbox
      valign={Gtk.Align.CENTER}
      orientation={Gtk.Orientation.HORIZONTAL}
    >
      <box $type='start' spacing={20}>
        <Slot align='start' />
      </box>
      <box $type='center' spacing={20}>
        <Slot align='center' />
      </box>
      <box $type='end' spacing={20}>
        <Slot align='end' />
      </box>
    </centerbox>
  </window>
);
