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
    class={cssClass}
    orientation={Gtk.Orientation.VERTICAL}
    spacing={4}
    visible={visible}
  >
    <box class='category'>
      <label
        hexpand
        halign={Gtk.Align.START}
        cssClasses={[
          'label',
          'text-base',
        ]}
        label={name}
      />
      {header}
    </box>
    <box orientation={Gtk.Orientation.VERTICAL}>
      {children}
    </box>
  </box>
);
