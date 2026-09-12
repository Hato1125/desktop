import Gtk from 'gi://Gtk?version=4.0';
import { createState, With } from 'ags';
import { idle } from 'ags/time';

export default (
  { classname, width, trigger, children }: {
    classname?: string,
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
        <Gtk.ScrolledWindow
          hscrollbarPolicy={width ? Gtk.PolicyType.EXTERNAL : Gtk.PolicyType.NEVER}
          vscrollbarPolicy={Gtk.PolicyType.NEVER}
          widthRequest={width ?? -1}
        >
          <box
            cssClasses={[
              'menu',
              classname ?? ''
            ]}
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
        </Gtk.ScrolledWindow>
      </popover>
    </menubutton>
  );
};
