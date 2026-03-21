import Gtk from 'gi://Gtk?version=4.0';
import Astal from 'gi://Astal?version=4.0';

import Distro from './component/distro';
import Client from './component/client';
import Vpn from './component/vpn';
import Network from './component/network';
import DateTime from './component/datetime';

export default () => (
  <window
    visible
    class='bar'
    namespace='bar'
    anchor={
      Astal.WindowAnchor.BOTTOM
      | Astal.WindowAnchor.LEFT
      | Astal.WindowAnchor.RIGHT
    }
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
  >
    <centerbox
      valign={Gtk.Align.CENTER}
      orientation={Gtk.Orientation.HORIZONTAL}
    >
      <box $type='start' spacing={16}>
        <Distro />
        <Client />
      </box>
      <box $type='center' spacing={16}>
      </box>
      <box $type='end' spacing={16}>
        <Vpn />
        <Network />
        <DateTime />
      </box>
    </centerbox>
  </window>
);
