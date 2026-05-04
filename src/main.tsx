declare const SRC: string;

import Adw from 'gi://Adw?version=1';
import Gdk from 'gi://Gdk?version=4.0';
import Gtk from 'gi://Gtk?version=4.0';

import app from 'ags/gtk4/app';

import Launcher, { toggleWindow } from '@ui/launcher/index';
import {
  MonitorCorners,
  BarCorner,
} from '@ui/corner/index';
import Bar from '@ui/bar/index';
import Dock from '@ui/dock/index';
import Notification from '@ui/notification/index';
import Osd from '@ui/osd/index';

import { checkAllFeatures, env } from 'src/feature/feature';

const LIGHT_OVERRIDE = `
* {
  --bg: var(--light-0);
  --bg-subtle: var(--light-50);
  --bg-muted: var(--light-100);
  --border: var(--light-200);
  --border-muted: var(--light-300);
  --fg-muted: var(--light-500);
  --fg-subtle: var(--light-600);
  --fg: var(--light-900);
  --fg-emphasis: var(--light-950);
  --bg-inverse: var(--light-900);
  --fg-inverse: var(--light-0);
  --overlay-subtle: rgba(0, 0, 0, 0.06);
  --overlay-muted: rgba(0, 0, 0, 0.12);
}
`;

const DARK_OVERRIDE = `
* {
  --bg: var(--dark-0);
  --bg-subtle: var(--dark-50);
  --bg-muted: var(--dark-100);
  --border: var(--dark-200);
  --border-muted: var(--dark-300);
  --fg-muted: var(--dark-500);
  --fg-subtle: var(--dark-600);
  --fg: var(--dark-900);
  --fg-emphasis: var(--dark-950);
  --bg-inverse: var(--dark-900);
  --fg-inverse: var(--dark-0);
  --overlay-subtle: rgba(255, 255, 255, 0.06);
  --overlay-muted: rgba(255, 255, 255, 0.12);
}
`;

const initThemeSync = () => {
  const sm = Adw.StyleManager.get_default();
  const display = Gdk.Display.get_default();

  if (display) {
    const provider = new Gtk.CssProvider();
    Gtk.StyleContext.add_provider_for_display(
      display,
      provider,
      Gtk.STYLE_PROVIDER_PRIORITY_USER + 1
    );

    const sync = () => {
      provider.load_from_string(
        sm.dark
          ? DARK_OVERRIDE
          : LIGHT_OVERRIDE
      );
    };

    sm.connect('notify::dark', sync);
    sync();
  }
}

app.start({
  css: `${SRC}/style.css`,
  icons: `${SRC}/icons`,
  instanceName: 'desktop',
  requestHandler(args, res) {
    switch (args[0]) {
      case 'toggle-launcher': toggleWindow(); break;
    }
    res('');
  },
  main() {
    const e = env();
    console.log(`[feature] env: os=${e.os} ${e.osVersion.join('.')}, compositor=${e.compositor} ${e.compositorVersion.join('.')}`);

    const featureResults = checkAllFeatures(e);
    for (const r of featureResults) {
      if (r.available) {
        console.log(`[feature] ${r.name}: available`);
      } else {
        console.warn(`[feature] ${r.name}: UNAVAILABLE on this environment`);
      }
    }

    initThemeSync();

    Launcher();
    Notification();
    Osd();
    Bar();
    BarCorner();
    MonitorCorners();
    Dock();
  }
});
