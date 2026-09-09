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

      provider.load_from_path(`${SRC}/theme/${useDark ? 'dark' : 'light'}.css`);
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
