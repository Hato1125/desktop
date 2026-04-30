import Gtk from 'gi://Gtk?version=4.0';
import { readFile } from 'ags/file';
import { defineComponent } from './component';
import power from '@service/power';

const Button = (
  { name, icon, action }: {
    name: string,
    icon: string,
    action: () => void,
  }
) => (
  <button onClicked={action}>
    <box spacing={8}>
      <label
        cssClasses={[
          'symbols',
          'symbols-xl',
        ]}
        label={icon}
      />
      <label
        cssClasses={[
          'label',
          'text-base',
        ]}
        label={name}
      />
    </box>
  </button>
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
    if (!power) return <box><Icon /></box>;

    let popupvar: Gtk.Popover;
    const p = power;

    return (
      <box>
        <button onClicked={() => popupvar.popup()}>
          <Icon />
        </button>

        <Gtk.Popover $={(ref) => (popupvar = ref)} hasArrow={false}>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
            <Button name='Shutdown' icon='power_off' action={p.powerOff} />
            <Button name='Restart' icon='restart_alt' action={p.reboot} />
            <Button name='Sleep' icon='bedtime' action={p.suspend} />
          </box>
        </Gtk.Popover>
      </box>
    );
  });
};
