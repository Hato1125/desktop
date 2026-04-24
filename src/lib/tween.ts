import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';

import { idle } from 'ags/time';

type Values = Record<string, number>;

export type Easing = (t: number) => number;

export const easings = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOut: (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
} as const;

export const createTween = <T extends Values>(widget: Gtk.Widget, apply: (v: T) => void) => {
  let anim: Adw.TimedAnimation | null = null;
  let gen = 0;

  return (from: T, to: T, duration: number, easing: Easing) => new Promise<void>((resolve) => {
    anim?.pause();
    const my = ++gen;
    const keys = Object.keys(from) as (keyof T)[];

    const current = new Adw.TimedAnimation({
      widget,
      value_from: 0,
      value_to: 1,
      duration,
      easing: Adw.Easing.LINEAR,
      target: Adw.CallbackAnimationTarget.new((t: number) => {
        if (my !== gen) return;
        const e = easing(t);
        const out = {} as Record<string, number>;
        for (const k of keys) {
          const a = from[k] as number;
          const b = to[k] as number;
          out[k as string] = a + (b - a) * e;
        }
        apply(out as T);
      }),
    });
    anim = current;

    current.connect('done', () => {
      if (my !== gen) return;
      apply(to);
      resolve();
    });

    idle(() => { if (my === gen) current.play(); });
  });
};
