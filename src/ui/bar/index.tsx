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

import { Component } from './component/component';

const components: Component[] = [
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
];

const byName = new Map(components.map((c) => [c.name, c]));

const Slot = ({ names }: { names: 'start' | 'center' | 'end' }) => (
  <For each={createBinding(config.bar, names)}>
    {(name: string) => byName.get(name)?.render() ?? (<box visible={false} />) as JSX.Element}
  </For>
);

export default () => (
  <window
    visible
    class='bar'
    namespace='bar'
    anchor={createBinding(config.bar, 'anchor').as((a) =>
      (a === 'top' ? Astal.WindowAnchor.TOP : Astal.WindowAnchor.BOTTOM)
      | Astal.WindowAnchor.LEFT
      | Astal.WindowAnchor.RIGHT
    )}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
  >
    <centerbox
      valign={Gtk.Align.CENTER}
      orientation={Gtk.Orientation.HORIZONTAL}
    >
      <box $type='start' spacing={20}>
        <Slot names='start' />
      </box>
      <box $type='center' spacing={20}>
        <Slot names='center' />
      </box>
      <box $type='end' spacing={20}>
        <Slot names='end' />
      </box>
    </centerbox>
  </window>
);
