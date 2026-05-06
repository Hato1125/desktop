import Astal from 'gi://Astal?version=4.0';

import { createPopup } from '@lib/transition';

import config from '@config';

import volume from './component/volume';
import bluetooth from './component/bluetooth';
import keylock from './component/keylock';
import gamemode from './component/gamemode';
import battery from './component/battery';

const osd = createPopup({
  transition: {
    opacity: [0, 1],
    ...(config.bar.anchor === 'top'
      ? { marginTop: [0, 20] }
      : { marginBottom: [0, 20] }),
    duration: 250,
  },
  timeout: 3750,
  anchor: config.bar.anchor === 'top'
    ? Astal.WindowAnchor.TOP
    : Astal.WindowAnchor.BOTTOM,
  exclusivity: Astal.Exclusivity.NORMAL,
  className: 'osd',
  namespace: 'osd',
  replace: true,
});

export type Osd = ReturnType<typeof createPopup>;

export default () => {
  volume(osd);
  bluetooth(osd);
  keylock(osd);
  gamemode(osd);
  battery(osd);
};
