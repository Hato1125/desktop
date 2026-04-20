import Gtk from 'gi://Gtk?version=4.0';
import Astal from 'gi://Astal?version=4.0';
import AstalApps from 'gi://AstalApps';

import { createBinding, For } from 'ags';

import config from '@config';
import { toggleWindow } from '@ui/launcher';

const apps = new AstalApps.Apps();

const launchByIcon = (iconName: string) => {
  const app = apps.get_list().find((a) => a.iconName === iconName);
  if (app) app.launch();
};

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
    onClicked={() => launchByIcon(name)}
  >
    <image
      class='icon'
      iconName={name}
      overflow={Gtk.Overflow.HIDDEN}
    />
  </button>
);

export default () => (
  <window
    visible={createBinding(config, 'dockEnable')}
    class='dock-layer'
    namespace='dock'
    anchor={
      Astal.WindowAnchor.BOTTOM
      | Astal.WindowAnchor.LEFT
      | Astal.WindowAnchor.RIGHT
    }
    layer={Astal.Layer.TOP}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
  >
    <box
      class='dock'
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      marginTop={4}
      marginBottom={8}
      spacing={14}
    >
      <Launcher />
      <For each={createBinding(config, 'dockApps')}>
        {(name: string) => <App name={name} />}
      </For>
    </box>
  </window>
);
