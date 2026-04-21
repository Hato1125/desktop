import Gtk from 'gi://Gtk?version=4.0';
import Pango from 'gi://Pango?version=1.0';
import Notifd from 'gi://AstalNotifd?version=0.1';

const AppIcon = ({ notification }: { notification: Notifd.Notification }) => {
  const image = notification.image;
  const appIcon = notification.appIcon;

  if (image) {
    return image.startsWith('/')
      ? <image class='icon' file={image} />
      : <image class='icon' iconName={image} />;
  }

  return appIcon
    ? <image class='icon' iconName={appIcon} />
    : <label
      cssClasses={[
        'icon',
        'symbols',
        'symbols-xl',
        'filled'
      ]}
      label='notifications'
    />;
};

const Content = ({ notification }: { notification: Notifd.Notification }) => (
  <box
    hexpand
    valign={Gtk.Align.CENTER}
    orientation={Gtk.Orientation.VERTICAL}
    spacing={2}
  >
    <label
      cssClasses={[
        'summary',
        'text-base',
      ]}
      maxWidthChars={30}
      halign={Gtk.Align.START}
      ellipsize={Pango.EllipsizeMode.END}
      label={notification.summary}
    />
    {notification.body && (
      <label
        cssClasses={[
          'body',
          'text-xs',
        ]}
        maxWidthChars={30}
        halign={Gtk.Align.START}
        wrapMode={Pango.WrapMode.WORD_CHAR}
        wrap
        useMarkup
        label={notification.body}
      />
    )}
  </box>
);

const Actions = ({ notification }: { notification: Notifd.Notification }) => (
  <box spacing={6}>
    {notification.actions.map(action => (
      <button
        class='action'
        hexpand
        onClicked={() => notification.invoke(action.id)}
      >
        <label
          class='text-xs'
          label={action.label}
        />
      </button>
    ))}
  </box>
);

const CloseButton = ({ onDismiss }: { onDismiss: () => void }) => (
  <button
    class='close'
    valign={Gtk.Align.START}
    onClicked={onDismiss}
  >
    <label
      cssClasses={[
        'filled',
        'symbols',
        'symbols-sm',
      ]}
      label='close'
    />
  </button>
);

export default ({
  notification,
  onDismiss,
}: {
  notification: Notifd.Notification;
  onDismiss: () => void;
}) => (
  <box
    class='item'
    orientation={Gtk.Orientation.VERTICAL}
    spacing={8}
  >
    <box spacing={10}>
      <AppIcon notification={notification} />
      <Content notification={notification} />
      <CloseButton onDismiss={onDismiss} />
    </box>
    {notification.actions.length > 0 && <Actions notification={notification} />}
  </box>
);
