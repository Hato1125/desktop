import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';
import Astal from 'gi://Astal?version=4.0';

import app from 'ags/gtk4/app';
import { createRoot } from 'ags';
import { idle, timeout } from 'ags/time';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type TransitionConfig = {
  opacity?: [number, number];
  marginRight?: [number, number];
  marginTop?: [number, number];
  marginBottom?: [number, number];
  marginLeft?: [number, number];
  duration: number;
};

type PopupConfig = {
  transition: TransitionConfig;
  timeout: number;
  anchor: Astal.WindowAnchor;
  className?: string;
  namespace?: string;
  replace?: boolean;
};

type Entry = {
  win: Astal.Window;
  height: number;
  dismiss: () => void;
};

const apply = (
  win: Astal.Window,
  widget: Gtk.Widget,
  config: TransitionConfig,
  v: number,
) => {
  if (config.opacity) widget.opacity = lerp(config.opacity[0], config.opacity[1], v);
  if (config.marginRight) win.marginRight = lerp(config.marginRight[0], config.marginRight[1], v);
  if (config.marginTop) win.marginTop = lerp(config.marginTop[0], config.marginTop[1], v);
  if (config.marginBottom) win.marginBottom = lerp(config.marginBottom[0], config.marginBottom[1], v);
  if (config.marginLeft) win.marginLeft = lerp(config.marginLeft[0], config.marginLeft[1], v);
};

const animate = (
  win: Astal.Window,
  widget: Gtk.Widget,
  config: TransitionConfig,
  from: number,
  to: number,
) => new Promise<void>((resolve) => {
  const anim = new Adw.TimedAnimation({
    widget,
    value_from: from,
    value_to: to,
    duration: config.duration,
    target: Adw.CallbackAnimationTarget.new((v: number) => apply(win, widget, config, v)),
  });
  anim.connect('done', () => {
    apply(win, widget, config, to);
    resolve();
  });
  anim.play();
});

export const createPopup = (config: PopupConfig) => {
  const entries: Entry[] = [];

  const reposition = () => {
    if (config.replace) return;
    entries.reduce((offset, entry) => {
      entry.win.marginTop = offset;
      return offset + entry.height;
    }, 0);
  };

  const dismissAll = () => {
    [...entries].forEach((entry) => entry.dismiss());
  };

  type PopupHandle = {
    dismiss: () => void;
    resetTimeout: () => void;
  };

  const show = (render: () => JSX.Element, onDestroy?: () => void): PopupHandle => {
    if (config.replace) dismissAll();

    let dismiss: () => void;
    let resetTimeout: () => void;

    createRoot((dispose) => {
      let dismissing = false;
      let timer: import('ags/time').Timer | null = null;

      const startTimer = () => {
        timer?.cancel();
        timer = timeout(config.timeout, () => dismiss());
      };

      dismiss = async () => {
        if (dismissing) return;
        dismissing = true;
        timer?.cancel();

        await animate(win, content, config.transition, 1, 0);

        const idx = entries.indexOf(entry);
        if (idx !== -1) entries.splice(idx, 1);

        win.destroy();
        dispose();
        onDestroy?.();
        reposition();
      };

      resetTimeout = () => startTimer();

      const win = (
        <window
          visible
          class={config.className ?? ''}
          namespace={config.namespace ?? ''}
          application={app}
          anchor={config.anchor}
          exclusivity={Astal.Exclusivity.IGNORE}
          layer={Astal.Layer.OVERLAY}
        >
          {render()}
        </window>
      ) as Astal.Window;

      const content = win.child;
      apply(win, content, config.transition, 0);

      const entry: Entry = { win, height: 0, dismiss: () => dismiss() };
      entries.unshift(entry);

      idle(() => {
        entry.height = content.get_preferred_size()[1]?.height ?? 0;
        reposition();
        animate(win, content, config.transition, 0, 1);
      });

      startTimer();
    });

    return {
      dismiss: () => dismiss(),
      resetTimeout: () => resetTimeout(),
    };
  };

  return { show, dismissAll };
};
