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
import config from '@config';

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
  --bar-tint: rgba(255, 255, 255, 0.45);

  --red-0: var(--red-light-0);
  --red-50: var(--red-light-50);
  --red-100: var(--red-light-100);
  --red-200: var(--red-light-200);
  --red-300: var(--red-light-300);
  --red-400: var(--red-light-400);
  --red-500: var(--red-light-500);
  --red-600: var(--red-light-600);
  --red-700: var(--red-light-700);
  --red-800: var(--red-light-800);
  --red-900: var(--red-light-900);
  --red-950: var(--red-light-950);

  --yellow-0: var(--yellow-light-0);
  --yellow-50: var(--yellow-light-50);
  --yellow-100: var(--yellow-light-100);
  --yellow-200: var(--yellow-light-200);
  --yellow-300: var(--yellow-light-300);
  --yellow-400: var(--yellow-light-400);
  --yellow-500: var(--yellow-light-500);
  --yellow-600: var(--yellow-light-600);
  --yellow-700: var(--yellow-light-700);
  --yellow-800: var(--yellow-light-800);
  --yellow-900: var(--yellow-light-900);
  --yellow-950: var(--yellow-light-950);
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
  --bar-tint: rgba(0, 0, 0, 0.45);

  --red-0: var(--red-dark-0);
  --red-50: var(--red-dark-50);
  --red-100: var(--red-dark-100);
  --red-200: var(--red-dark-200);
  --red-300: var(--red-dark-300);
  --red-400: var(--red-dark-400);
  --red-500: var(--red-dark-500);
  --red-600: var(--red-dark-600);
  --red-700: var(--red-dark-700);
  --red-800: var(--red-dark-800);
  --red-900: var(--red-dark-900);
  --red-950: var(--red-dark-950);

  --yellow-0: var(--yellow-dark-0);
  --yellow-50: var(--yellow-dark-50);
  --yellow-100: var(--yellow-dark-100);
  --yellow-200: var(--yellow-dark-200);
  --yellow-300: var(--yellow-dark-300);
  --yellow-400: var(--yellow-dark-400);
  --yellow-500: var(--yellow-dark-500);
  --yellow-600: var(--yellow-dark-600);
  --yellow-700: var(--yellow-dark-700);
  --yellow-800: var(--yellow-dark-800);
  --yellow-900: var(--yellow-dark-900);
  --yellow-950: var(--yellow-dark-950);
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
      const { transparent, transparentTheme } = config.bar;
      const useDark = transparent && transparentTheme !== 'auto'
        ? transparentTheme === 'dark'
        : sm.dark;

      provider.load_from_string(useDark ? DARK_OVERRIDE : LIGHT_OVERRIDE);
    };

    sm.connect('notify::dark', sync);
    config.bar.connect('notify::transparent', sync);
    config.bar.connect('notify::transparent-theme', sync);
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
