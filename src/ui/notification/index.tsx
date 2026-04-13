import Gtk from 'gi://Gtk?version=4.0';
import Astal from 'gi://Astal?version=4.0';
import AstalNotifd from 'gi://AstalNotifd?version=0.1';

import { timeout } from 'ags/time';
import { createRoot } from 'ags';

import Notification from './component/notification';

const TIMEOUT = 5000;

const notifd = AstalNotifd.get_default();

let win: Astal.Window;
let container: Gtk.Box;

let count = 0;

const addNotification = (notification: AstalNotifd.Notification) => {
  count++;
  win.visible = true;

  createRoot((dispose) => {
    const revealer = (
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        transitionDuration={300}
        onNotifyChildRevealed={(self: Gtk.Revealer) => {
          if (!self.childRevealed) {
            container.remove(self);
            notification.dismiss();
            count--;
            dispose();

            if (count === 0) {
              win.visible = false;
            }
          }
        }}
      >
        <Notification
          notification={notification}
          onDismiss={() => {
            revealer.revealChild = false;
          }}
        />
      </revealer>
    ) as Gtk.Revealer;

    container.prepend(revealer);
    revealer.revealChild = true;

    timeout(TIMEOUT, () => {
      revealer.revealChild = false;
    });
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
    />
  </window>
);
