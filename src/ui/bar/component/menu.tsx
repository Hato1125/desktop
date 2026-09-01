import Gtk from 'gi://Gtk?version=4.0';

export default (
  { width, trigger, children }: {
    width?: number,
    trigger: JSX.Element,
    children?: JSX.Element | JSX.Element[]
  }
) => (
  <menubutton>
    {trigger}
    <popover hasArrow={false}>
      <box
        class='menu'
        widthRequest={width ?? -1}
        orientation={Gtk.Orientation.VERTICAL}
      >
        {children}
      </box>
    </popover>
  </menubutton>
);
