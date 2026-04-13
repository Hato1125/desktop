import Gtk from 'gi://Gtk?version=4.0';
import AstalNotifd from 'gi://AstalNotifd?version=0.1';
import Pango from 'gi://Pango?version=1.0';

const AppIcon = ({ notification }: { notification: AstalNotifd.Notification }) => {
  const image = notification.image;
  const appIcon = notification.appIcon;

  if (image) {
    return image.startsWith('/')
      ? <image cssClasses={['icon']} file={image} />
      : <image cssClasses={['icon']} iconName={image} />;
  }

  if (appIcon) {
    return (
      <image
        cssClasses={['icon']}
        iconName={appIcon}
      />
    );
  }

  return (
    <label
      cssClasses={[
        'icon',
        'symbols',
        'symbols-xl',
        'filled'
      ]}
      label='notifications'
    />
  );
};

export default ({
  notification,
  onDismiss,
}: {
  notification: AstalNotifd.Notification;
  onDismiss: () => void;
}) => (
  <box
    class='item'
    orientation={Gtk.Orientation.VERTICAL}
    spacing={8}
  >
    <box spacing={10}>
      <AppIcon notification={notification} />
      <box
        valign={Gtk.Align.CENTER}
        orientation={Gtk.Orientation.VERTICAL}
        hexpand={true}
        spacing={2}
      >
        <label
          cssClasses={[
            'summary',
            'text-base'
          ]}
          maxWidthChars={30}
          halign={Gtk.Align.START}
          ellipsize={Pango.EllipsizeMode.END}
          label={notification.summary}
        />
        {notification.body && (
          <label
            cssClasses={['body', 'text-xs']}
            label={notification.body}
            halign={Gtk.Align.START}
            maxWidthChars={30}
            wrap={true}
            wrapMode={Pango.WrapMode.WORD_CHAR}
          />
        )}
      </box>
      <button
        class='close'
        valign={Gtk.Align.START}
        onClicked={onDismiss}
      >
        <label
          cssClasses={['symbols', 'symbols-sm']}
          label='close'
        />
      </button>
    </box>
    {notification.actions.length > 0 && (
      <box spacing={6}>
        {notification.actions.map(action => (
          <button
            class='action'
            hexpand={true}
            onClicked={() => notification.invoke(action.id)}
          >
            <label
              cssClasses={['text-xs']}
              label={action.label}
            />
          </button>
        ))}
      </box>
    )}
  </box>
);
