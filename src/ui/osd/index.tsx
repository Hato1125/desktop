import Gtk from 'gi://Gtk?version=4.0';
import Astal from 'gi://Astal?version=4.0';

import { createState, With } from 'ags';
import { timeout } from 'ags/time';

import AstalWp from 'gi://AstalWp?version=0.1';
import AstalBluetooth from 'gi://AstalBluetooth?version=0.1';

import gamemode from '@service/gamemode';
import keylock from '@service/keylock';
import Volume from './component/volume';
import Bluetooth, { setBluetooth } from './component/bluetooth';
import Gamemode, { setGamemodeName } from './component/gamemode';
import KeyLock, { setKeyLock } from './component/keylock';

const TIMEOUT = 3000;

let timer: import('ags/time').Timer | null = null;
let win: Astal.Window;

const [state, setState] = createState<
  'volume'
  | 'gamemode'
  | 'keylock'
  | 'bluetooth'
>('volume');

const [revealed, setRevealed] = createState(false);

const show = (duration = TIMEOUT) => {
  win.visible = true;
  setRevealed(true);

  timer?.cancel();
  timer = timeout(duration, () => {
    setRevealed(false);
    timer = null;
  });
};

export const showVolume = () => {
  setState('volume');
  show();
};

export const showBluetooth = (
  name: string,
  connected: boolean
) => {
  setState('bluetooth');
  setBluetooth(name, connected);
  show();
};

export const showGamemode = (name: string) => {
  setState('gamemode');
  setGamemodeName(name);
  show();
};

const showKeyLock = (icon: string, label: string) => {
  setState('keylock');
  setKeyLock(icon, label);
  show();
};

const speaker = AstalWp.get_default().defaultSpeaker;
speaker.connect('notify::volume', () => showVolume());

const bluetooth = AstalBluetooth.get_default();

const connected = (device: AstalBluetooth.Device) => {
  device.connect('notify::connected', () => {
    showBluetooth(
      device.name,
      device.connected
    );
  });
}

bluetooth.devices.forEach(connected);

bluetooth.connect('device-added', (_, device: AstalBluetooth.Device) => {
  connected(device);
});

keylock.onCapsLockChanged = (active) => {
  showKeyLock('keyboard_capslock', active ? 'Caps Lock ON' : 'Caps Lock OFF');
};
keylock.onNumLockChanged = (active) => {
  showKeyLock('dialpad', active ? 'Num Lock ON' : 'Num Lock OFF');
};

gamemode.onRegistered = (game) => showGamemode(game.name);

export default () => {
  return (
    <window
      $={(ref) => (win = ref)}
      class='osd'
      namespace='osd'
      anchor={Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.OVERLAY}
    >
      <box
        overflow={Gtk.Overflow.HIDDEN}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.END}
      >
        <revealer
          transitionType={Gtk.RevealerTransitionType.SLIDE_UP}
          transitionDuration={300}
          revealChild={revealed}
          onNotifyChildRevealed={(self) => {
            if (!self.childRevealed) {
              win.visible = false;
            }
          }}
        >
          <box
            class='content'
            valign={Gtk.Align.CENTER}
          >
            <With value={state}>
              {(s) => {
                switch (s) {
                  case 'gamemode':
                    return <Gamemode />;
                  case 'keylock':
                    return <KeyLock />;
                  case 'volume':
                    return <Volume />;
                  case 'bluetooth':
                    return <Bluetooth />;

                }
              }}
            </With>
          </box>
        </revealer>
      </box>
    </window>
  );
}
