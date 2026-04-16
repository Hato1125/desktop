import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';

import { idle } from 'ags/time';

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
  initial: Animatable;
  animate: Animatable;
  style?: (t: number) => string;
  transition?: { duration?: number; repeat?: boolean; alternate?: boolean };
  children: JSX.Element;
};

const widgetKeys = ['opacity', 'marginTop', 'marginBottom', 'marginStart', 'marginEnd'] as const;

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
      (widget as Record<string, number>)[key] = lerp(from, to, t);
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

export const Animated = ({ initial, animate, style, transition, children }: Props) => {
  const widget = children as unknown as Gtk.Widget;

  let provider: Gtk.CssProvider | null = null;
  if (animate.css || initial.css || style) {
    provider = new Gtk.CssProvider();
    widget.get_style_context().add_provider(provider, Gtk.STYLE_PROVIDER_PRIORITY_USER);
  }

  applyFrame(widget, provider, initial, animate, style, 0);

  idle(() => {
    const anim = new Adw.TimedAnimation({
      widget,
      value_from: 0,
      value_to: 1,
      duration: transition?.duration ?? 300,
      repeat_count: transition?.repeat ? 0 : 1,
      alternate: transition?.alternate ?? false,
      target: Adw.CallbackAnimationTarget.new((t: number) => {
        applyFrame(widget, provider, initial, animate, style, t);
      }),
    });

    anim.play();
  });

  return widget;
};
