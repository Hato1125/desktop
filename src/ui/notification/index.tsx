import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib?version=2.0';
import Astal from 'gi://Astal?version=4.0';
import AstalNotifd from 'gi://AstalNotifd?version=0.1';

import Notification from './component/notification';

const TIMEOUT = 5000;

const notifd = AstalNotifd.get_default();

let win: Astal.Window;
let container: Gtk.Box;
let count = 0;

const addNotification = (notification: AstalNotifd.Notification) => {
  let revealer: Gtk.Revealer;

  count++;
  win.visible = true;

  const dismiss = () => {
    revealer.revealChild = false;
  };

  const widget = (
    <revealer
      $={(ref: Gtk.Revealer) => (revealer = ref)}
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      transitionDuration={300}
      revealChild={false}
      onNotifyChildRevealed={(self: Gtk.Revealer) => {
        if (!self.childRevealed) {
          container.remove(widget as Gtk.Widget);
          notification.dismiss();
          count--;
          if (count === 0) {
            win.visible = false;
          }
        }
      }}
    >
      <Notification notification={notification} onDismiss={dismiss} />
    </revealer>
  );

  container.prepend(widget as Gtk.Widget);
  revealer!.revealChild = true;

  const timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, TIMEOUT, () => {
    dismiss();
    return GLib.SOURCE_REMOVE;
  });

  notification.connect('resolved', () => {
    GLib.source_remove(timeout);
    dismiss();
  });
};

notifd.connect('notified', (_, id: number) => {
  const notification = notifd.get_notification(id);
  if (notification) {
    addNotification(notification);
  }
});

export default () => (
  <window
    $={(ref: Astal.Window) => (win = ref)}
    class='notification'
    namespace='notification'
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
    exclusivity={Astal.Exclusivity.IGNORE}
    layer={Astal.Layer.OVERLAY}
  >
    <box
      $={(ref: Gtk.Box) => (container = ref)}
      orientation={Gtk.Orientation.VERTICAL}
      halign={Gtk.Align.END}
      valign={Gtk.Align.START}
      spacing={8}
    />
  </window>
);
