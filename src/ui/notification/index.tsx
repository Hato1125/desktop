import Adw from 'gi://Adw?version=1';
import Astal from 'gi://Astal?version=4.0';
import AstalNotifd from 'gi://AstalNotifd?version=0.1';

import app from 'ags/gtk4/app';
import { createRoot } from 'ags';
import { idle, timeout } from 'ags/time';

import Notification from './component/notification';

const TIMEOUT = 5000;
const SLIDE = 320;

const notifd = AstalNotifd.get_default();

type Entry = {
  win: Astal.Window;
  height: number;
};

const entries: Entry[] = [];

const reposition = () => {
  entries.reduce((offset, entry) => {
    entry.win.marginTop = offset;
    return offset + entry.height;
  }, 0);
};

const addNotification = (notification: AstalNotifd.Notification) => {
  createRoot((dispose) => {
    let dismissing = false;

    const dismiss = () => {
      if (dismissing) {
        return;
      }

      dismissing = true;

      const target = Adw.CallbackAnimationTarget.new((v: number) => {
        content.opacity = 1 - v;
        win.marginRight = v * -SLIDE;
      });

      const anim = new Adw.TimedAnimation({
        widget: content,
        value_from: 0,
        value_to: 1,
        duration: 300,
        target,
      });

      anim.connect('done', () => {
        const idx = entries.indexOf(entry);
        if (idx !== -1) {
          entries.splice(idx, 1);
        }

        notification.dismiss();
        win.destroy();
        dispose();
        reposition();
      });

      anim.play();
    };

    const win = (
      <window
        visible
        class='notification'
        namespace='notification'
        application={app}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        layer={Astal.Layer.OVERLAY}
      >
        <Notification
          notification={notification}
          onDismiss={dismiss}
        />
      </window>
    ) as Astal.Window;

    const content = win.child;
    content.opacity = 0;
    win.marginRight = -SLIDE;

    const entry: Entry = { win, height: 0 };
    entries.unshift(entry);

    idle(() => {
      entry.height = content.get_preferred_size()[1]?.height ?? 0;
      reposition();

      const target = Adw.CallbackAnimationTarget.new((v: number) => {
        content.opacity = v;
        win.marginRight = (1 - v) * -SLIDE;
      });

      new Adw.TimedAnimation({
        widget: content,
        value_from: 0,
        value_to: 1,
        duration: 300,
        target,
      }).play();
    });

    timeout(TIMEOUT, dismiss);
    notification.connect('resolved', dismiss);
  });
};

notifd.connect('notified', (_, id: number) => {
  const notification = notifd.get_notification(id);
  if (notification) {
    addNotification(notification);
  }
});

export default () => {};
