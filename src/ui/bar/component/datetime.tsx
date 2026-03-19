import Gtk from 'gi://Gtk?version=4.0'
import GLib from 'gi://GLib?version=2.0'
import { createPoll } from 'ags/time'

const ampm = createPoll('', 1000, () =>
  GLib.DateTime.new_now_local().format('%p')!
);

const time = createPoll('', 1000, () =>
  GLib.DateTime.new_now_local().format('%-I:%M')!
);

const date = createPoll('', 60000, () =>
  GLib.DateTime.new_now_local().format('%m/%d')!
);

export default () => (
  <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
    <label halign={Gtk.Align.END} label={ampm} />
    <label halign={Gtk.Align.END} label={time} />
    <label halign={Gtk.Align.END} label={date} />
  </box>
);
