import Gtk from 'gi://Gtk?version=4.0';
import { type Accessor } from 'ags';

export default (
  { name, visible, class: cssClass, header, children }: {
    name: string,
    visible?: boolean | Accessor<boolean>,
    class?: string,
    header?: JSX.Element,
    children?: JSX.Element | JSX.Element[]
  }
) => (
  <box
    cssClasses={[...(cssClass ? [cssClass] : [])]}
    orientation={Gtk.Orientation.VERTICAL}
    spacing={14}
    visible={visible}
  >
    <box>
      <label
        hexpand
        halign={Gtk.Align.START}
        cssClasses={[
          'label',
          'text-lg',
        ]}
        label={name}
      />
      {header}
    </box>
    <box class='category' orientation={Gtk.Orientation.VERTICAL}>
      {children}
    </box>
  </box>
);
