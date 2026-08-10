import Gtk from 'gi://Gtk?version=4.0';
import { readFile } from 'ags/file';
import { defineComponent } from './component';
import Category from './category';
import Popup from './popup';
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

    const p = power;

    return (
      <Popup trigger={<Icon />}>
        <Category name='Power'>
          <Button name='Sleep' icon='bedtime' action={p.suspend} />
          <Button name='Restart' icon='restart_alt' action={p.reboot} />
          <Button name='Shutdown' class='error' icon='power_off' action={p.powerOff} />
        </Category>
      </Popup>
    );
  });
};
