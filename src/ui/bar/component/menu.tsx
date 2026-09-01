import Gtk from 'gi://Gtk?version=4.0';
import { createState, With } from 'ags';
import { idle } from 'ags/time';

export default (
  { width, trigger, children }: {
    width?: number,
    trigger: JSX.Element,
    children?: () => JSX.Element | JSX.Element[]
  }
) => {
  const [open, setOpen] = createState(false);

  return (
    <menubutton>
      {trigger}
      <popover
        hasArrow={false}
        onShow={() => setOpen(true)}
        onClosed={() => idle(() => setOpen(false))}
      >
        <box
          class='menu'
          widthRequest={width ?? -1}
          orientation={Gtk.Orientation.VERTICAL}
        >
          <With value={open}>
            {(o: boolean) => o && (
              <box orientation={Gtk.Orientation.VERTICAL}>
                {children?.()}
              </box>
            )}
          </With>
        </box>
      </popover>
    </menubutton>
  );
};
