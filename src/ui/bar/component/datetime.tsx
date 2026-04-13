import Gtk from 'gi://Gtk?version=4.0'
import GLib from 'gi://GLib?version=2.0'
import { createMemo } from 'ags';
import { createPoll } from 'ags/time'

const now = createPoll(new GLib.DateTime(), 1000, () => GLib.DateTime.new_now_local());

export default () => (
  <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
    <label
      cssClasses={[
        'label',
        'text-base',
        'tabular',
      ]}
      halign={Gtk.Align.END}
      label={createMemo(() => now().format('%-m/%-d')!)}
    />
    <label
      cssClasses={[
        'label',
        'text-base',
        'tabular',
      ]}
      halign={Gtk.Align.END}
      label={createMemo(() => now().format('%-I:%M')!)}
    />
    <label
      cssClasses={[
        'label',
        'text-base',
        'tabular',
      ]}
      halign={Gtk.Align.END}
      label={createMemo(() => now().format('%p')!)}
    />
  </box>
);
