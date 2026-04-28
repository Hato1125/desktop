import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';

import type { Accessor } from 'ags';
import { idle, Timer } from 'ags/time';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Animatable = {
  opacity?: number;
  marginTop?: number;
  marginBottom?: number;
  marginStart?: number;
  marginEnd?: number;
  css?: Record<string, number>;
};

type Props = {
  when?: Accessor<boolean>;
  initial: Animatable;
  animate: Animatable;
  style?: (t: number) => string;
  transition?: {
    duration?: number;
    easing?: Adw.Easing;
    repeat?: boolean;
    alternate?: boolean;
  };
  onEnter?: () => void;
  onExit?: () => void;
  children: JSX.Element;
};

const widgetKeys = [
  'opacity',
  'marginTop',
  'marginBottom',
  'marginStart',
  'marginEnd'
] as const;

const applyFrame = (
  widget: Gtk.Widget,
  provider: Gtk.CssProvider | null,
  initial: Animatable,
  animate: Animatable,
  style: ((t: number) => string) | undefined,
  t: number,
) => {
  for (const key of widgetKeys) {
    if (animate[key] !== undefined) {
      const from = initial[key] ?? animate[key]!;
      const to = animate[key]!;
      (widget as unknown as Record<string, number>)[key] = lerp(from, to, t);
    }
  }

  if (!provider) return;

  const parts: string[] = [];

  if (animate.css) {
    const fromCss = initial.css ?? {};
    const toCss = animate.css;
    for (const [prop, to] of Object.entries(toCss)) {
      const from = fromCss[prop] ?? to;
      parts.push(`${prop}: ${lerp(from, to, t)}`);
    }
  }

  if (style) {
    parts.push(style(t));
  }

  if (parts.length > 0) {
    provider.load_from_string(`* { ${parts.join('; ')} }`);
  }
};

export const Animated = ({
  when,
  initial,
  animate,
  style,
  transition,
  onEnter,
  onExit,
  children,
}: Props) => {
  const widget = children as unknown as Gtk.Widget;

  let provider: Gtk.CssProvider | null = null;
  if (animate.css || initial.css || style) {
    provider = new Gtk.CssProvider();
    widget.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_USER);
  }

  const duration = transition?.duration ?? 300;
  const easing = transition?.easing ?? Adw.Easing.LINEAR;

  if (when) {
    let current = when() ? 1 : 0;
    let active: Adw.TimedAnimation | null = null;
    let pendingIdle: Timer | null = null;
    let pendingMap = 0;
    let gen = 0;

    applyFrame(widget, provider, initial, animate, style, current);

    const play = (target: number) => {
      active?.pause();
      pendingIdle?.cancel();
      pendingIdle = null;
      if (pendingMap) {
        widget.disconnect(pendingMap);
        pendingMap = 0;
      }
      active = null;
      const my = ++gen;

      const from = current;
      if (from === target) return;

      const anim = new Adw.TimedAnimation({
        widget,
        value_from: from,
        value_to: target,
        duration: Math.max(1, Math.round(duration * Math.abs(target - from))),
        easing,
        target: Adw.CallbackAnimationTarget.new((t: number) => {
          if (my !== gen) return;
          current = t;
          applyFrame(widget, provider, initial, animate, style, t);
        }),
      });
      active = anim;

      anim.connect('done', () => {
        if (my !== gen) return;
        active = null;
        if (target === 1) onEnter?.();
        else onExit?.();
      });

      const schedule = () => {
        pendingIdle = idle(() => {
          pendingIdle = null;
          if (my === gen) anim.play();
        });
      };

      if (widget.get_mapped()) {
        schedule();
      } else {
        applyFrame(widget, provider, initial, animate, style, from);
        pendingMap = widget.connect('map', () => {
          if (pendingMap) {
            widget.disconnect(pendingMap);
            pendingMap = 0;
          }
          if (my === gen) schedule();
        });
      }
    };

    when.subscribe(() => play(when() ? 1 : 0));
  } else {
    applyFrame(widget, provider, initial, animate, style, 0);

    idle(() => {
      const anim = new Adw.TimedAnimation({
        widget,
        value_from: 0,
        value_to: 1,
        duration,
        easing,
        repeat_count: transition?.repeat ? 0 : 1,
        alternate: transition?.alternate ?? false,
        target: Adw.CallbackAnimationTarget.new((t: number) => {
          applyFrame(widget, provider, initial, animate, style, t);
        }),
      });

      anim.play();
    });
  }

  return widget;
};
