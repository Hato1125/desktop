import Gtk from 'gi://Gtk?version=4.0';
import Astal from 'gi://Astal?version=4.0';
import AstalWp from 'gi://AstalWp?version=0.1';
import AstalBluetooth from 'gi://AstalBluetooth?version=0.1';

import { createBinding } from 'ags';
import { createPopup } from '@lib/transition';

import gamemode from '@service/gamemode';
import keylock from '@service/keylock';

const osd = createPopup({
  transition: {
    opacity: [0, 1],
    marginBottom: [0, 40],
    duration: 300,
  },
  timeout: 3000,
  anchor: Astal.WindowAnchor.BOTTOM,
  className: 'osd',
  namespace: 'osd',
  replace: true,
});

const OsdItem = ({
  icon,
  children,
  cssClass,
}: {
  icon: string;
  children?: JSX.Element;
  cssClass: string;
}) => (
  <box
    class='content'
    valign={Gtk.Align.CENTER}
  >
    <box
      class={cssClass}
      valign={Gtk.Align.CENTER}
      spacing={14}
    >
      <label
        cssClasses={['filled', 'symbols', 'symbols-xl']}
        label={icon}
      />
      {children}
    </box>
  </box>
);

const speaker = AstalWp.get_default().defaultSpeaker;
let volumeHandle: { dismiss: () => void; resetTimeout: () => void } | null = null;

speaker.connect('notify::volume', () => {
  if (volumeHandle) {
    volumeHandle.resetTimeout();
    return;
  }

  volumeHandle = osd.show(
    () => (
      <OsdItem icon='volume_up' cssClass='volume'>
        <levelbar
          valign={Gtk.Align.CENTER}
          hexpand={true}
          minValue={0}
          maxValue={1.25}
          value={createBinding(speaker, 'volume')}
        />
      </OsdItem>
    ),
    () => { volumeHandle = null; },
  );
});

const bluetooth = AstalBluetooth.get_default();

const watchDevice = (device: AstalBluetooth.Device) => {
  device.connect('notify::connected', () => {
    osd.show(() => (
      <OsdItem icon='bluetooth' cssClass='bluetooth'>
        <label
          valign={Gtk.Align.CENTER}
          hexpand={true}
          label={device.name}
        />
      </OsdItem>
    ));
  });
};

bluetooth.devices.forEach(watchDevice);
bluetooth.connect('device-added', (_, device: AstalBluetooth.Device) => {
  watchDevice(device);
});

keylock.onCapsLockChanged = (active) => {
  osd.show(() => (
    <OsdItem
      icon={active ? 'shift_lock' : 'shift_lock_off'}
      cssClass='keylock'
    >
      <label
        valign={Gtk.Align.CENTER}
        hexpand={true}
        label={active ? 'Caps Lock ON' : 'Caps Lock OFF'}
      />
    </OsdItem>
  ));
};

keylock.onNumLockChanged = (active) => {
  osd.show(() => (
    <OsdItem
      icon={active ? 'grid_view' : 'grid_off'}
      cssClass='keylock'
    >
      <label
        valign={Gtk.Align.CENTER}
        hexpand={true}
        label={active ? 'Num Lock ON' : 'Num Lock OFF'}
      />
    </OsdItem>
  ));
};

gamemode.onRegistered = (game) => {
  osd.show(() => (
    <OsdItem icon='rocket_launch' cssClass='gamemode'>
      <label
        valign={Gtk.Align.CENTER}
        hexpand={true}
        label={game.name}
      />
    </OsdItem>
  ));
};

export default () => {};
