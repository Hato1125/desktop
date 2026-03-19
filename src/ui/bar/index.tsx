import Gtk from 'gi://Gtk?version=4.0';
import Astal from 'gi://Astal?version=4.0';

import Distro from './component/distro';
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
      <box $type='start' spacing={18}>
        <Distro />
      </box>
      <box $type='center' spacing={18}>
      </box>
      <box $type='end' spacing={18}>
        <DateTime />
      </box>
    </centerbox>
  </window>
);
