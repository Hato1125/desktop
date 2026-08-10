import Gtk from 'gi://Gtk?version=4.0';

export default (
  { trigger, width, children }: {
    trigger: JSX.Element,
    width?: number,
    children?: JSX.Element | JSX.Element[]
  }
) => (
  <menubutton>
    {trigger}
    <popover hasArrow={false}>
      <box
        class='context'
        widthRequest={width ?? -1}
        orientation={Gtk.Orientation.VERTICAL}
        spacing={10}
      >
        {children}
      </box>
    </popover>
  </menubutton>
);
