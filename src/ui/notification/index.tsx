import Astal from 'gi://Astal?version=4.0';
import AstalNotifd from 'gi://AstalNotifd?version=0.1';

import { createPopup } from '@lib/transition';
import Notification from './component/notification';

const notifd = AstalNotifd.get_default();

const popup = createPopup({
  transition: {
    opacity: [0, 1],
    marginRight: [-320, 0],
    duration: 300,
  },
  timeout: 5000,
  anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT,
  className: 'notification',
  namespace: 'notification',
});

notifd.connect('notified', (_, id: number) => {
  const notification = notifd.get_notification(id);

  if (notification) {
    const handle = popup.show(
      <Notification
        notification={notification}
        onDismiss={() => handle.dismiss()}
      />,
      () => notification.dismiss(),
    );

    notification.connect('resolved', () => handle.dismiss());
  }
});

export default () => {};
