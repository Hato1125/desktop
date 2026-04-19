import Gtk from 'gi://Gtk?version=4.0';
import Astal from 'gi://Astal?version=4.0';

import { createBinding, For } from 'ags';
import { onCleanup } from 'ags';

import config from '@config';
import { toggleWindow } from '@ui/launcher';

const Launcher = () => (
  <button
    class='item'
    onClicked={() => {
      toggleWindow();
    }}
  >
    <label
      cssClasses={[
        'icon',
        'filled',
        'symbols',
        'symbols-2xl'
      ]}
      label='rocket_launch'
    />
  </button>
);

const App = ({ name }: { name: string }) => (
  <button
    class='item'
    halign={Gtk.Align.CENTER}
    valign={Gtk.Align.CENTER}
  >
    <image
      class='icon'
      iconName={name}
      overflow={Gtk.Overflow.HIDDEN}
    />
  </button>
);

export default () => {
  let win: Astal.Window | null = null;

  const unsub = createBinding(config, 'dockApps').subscribe(() => {
    win?.set_default_size(1, 1);
  });
  onCleanup(unsub);

  return (
    <window
      $={(w) => { win = w; }}
      visible
      class='dock'
      namespace='dock'
      anchor={Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      defaultWidth={1}
      defaultHeight={1}
      marginTop={2}
      marginBottom={8}
    >
      <box
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        spacing={14}
      >
        <Launcher />
        <For each={createBinding(config, 'dockApps')}>
          {(name: string) => <App name={name} />}
        </For>
      </box>
    </window>
  );
};
