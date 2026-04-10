import Gtk from 'gi://Gtk?version=4.0'
import GLib from 'gi://GLib?version=2.0'
import { createPoll } from 'ags/time'

const now = createPoll(new GLib.DateTime(), 1000, () => GLib.DateTime.new_now_local());

export default () => (
  <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
    <label cssClasses={['label', 'text-base']} halign={Gtk.Align.END} label={now.as(d => d.format('%p')!)} />
    <label cssClasses={['label', 'text-base']} halign={Gtk.Align.END} label={now.as(d => d.format('%-I:%M')!)} />
    <label cssClasses={['label', 'text-base']} halign={Gtk.Align.END} label={now.as(d => d.format('%m/%d')!)} />
  </box>
);
