import Gtk from 'gi://Gtk?version=4.0';
import { readFile } from 'ags/file';
import { defineComponent } from './component';
import power from '@service/power';

const Button = (
  { name, icon, action, class: cssClass }: {
    name: string,
    icon: string,
    action: () => void,
    class?: string,
  }
) => (
  <button class={cssClass} onClicked={action}>
    <box spacing={8}>
      <label
        cssClasses={[
          'symbols',
          'symbols-xl',
        ]}
        label={icon}
      />
      <label
        halign={Gtk.Align.START}
        cssClasses={[
          'label',
          'text-base',
        ]}
        label={name}
      />
    </box>
  </button>
);

const Category = (
  { name, children }: {
    name: string,
    children?: JSX.Element | JSX.Element[]
  }
) => (
  <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
    <label
      halign={Gtk.Align.START}
      cssClasses={[
        'label',
        'text-base',
        'category',
      ]}
      label={name}
    />
    <box orientation={Gtk.Orientation.VERTICAL}>
      {children}
    </box>
  </box>
);

export default () => {
  const distro = readFile('/etc/os-release')
    .split('\n')
    .find((line) => line.startsWith('ID='))
    ?.split('=')[1] ?? 'linux';

  const Icon = () => (
    <image class='symbols-lg' iconName={`${distro}-symbolic`} />
  );

  return defineComponent('menu', () => {
    if (!power) {
      return <box><Icon /></box>;
    }

    let popupvar: Gtk.Popover;
    const p = power;

    return (
      <box class='menu'>
        <button onClicked={() => popupvar.popup()}>
          <Icon />
        </button>

        <Gtk.Popover $={(ref) => (popupvar = ref)} hasArrow={false}>
          <box class='context' orientation={Gtk.Orientation.VERTICAL} spacing={10}>
            <Category name='Power'>
              <Button name='Sleep' icon='bedtime' action={p.suspend} />
              <Button name='Restart' icon='restart_alt' action={p.reboot} />
              <Button name='Shutdown' class='error' icon='power_off' action={p.powerOff} />
            </Category>
          </box>
        </Gtk.Popover>
      </box>
    );
  });
};
