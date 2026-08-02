import Gtk from 'gi://Gtk?version=4.0';
import Pango from 'gi://Pango?version=1.0';
import { createBinding, createMemo, createState, onCleanup } from 'ags';
import { defineComponent } from './component';
import { createTween, easings, CANCELLED } from '@lib/tween';
import nowplaying from '@service/nowplaying';

const FADE_DURATION = 1200;
const SWITCH_DURATION = 1200;
const USER_PRIORITY = Gtk.STYLE_PROVIDER_PRIORITY_USER;

const HIDDEN = { opacity: 0 };
const VISIBLE = { opacity: 1 };
const BLUR_CLASSES = [
  'blur-fade-in',
  'blur-fade-out',
  'blur-swap-in',
  'blur-swap-out',
] as const;

const createThumb = () => {
  const bgProvider = new Gtk.CssProvider();

  const placeholder = (
    <label
      cssClasses={['symbols', 'filled', 'thumb-placeholder']}
      label='music_note'
      halign={Gtk.Align.FILL}
      valign={Gtk.Align.FILL}
      xalign={0.5}
      yalign={0.5}
    />
  ) as Gtk.Label;

  const base = (
    <box
      class='thumbnail'
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      overflow={Gtk.Overflow.HIDDEN}
    >
      {placeholder}
    </box>
  ) as Gtk.Widget;
  base.get_style_context().add_provider(bgProvider, USER_PRIORITY);
  base.add_css_class('no-art');

  const note = (cls: string) => {
    const label = (
      <label
        $type='overlay'
        cssClasses={['symbols', 'filled', 'note', cls]}
        label='music_note'
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
    ) as Gtk.Label;
    return label;
  };

  const widget = (
    <overlay class='thumb-container'>
      {base}
      {note('note-1')}
      {note('note-2')}
    </overlay>
  ) as Gtk.Widget;

  let currentArtwork: string | null = null;

  return {
    widget,
    setArtwork: (p: string) => {
      if (p === currentArtwork) return;
      currentArtwork = p;

      const url = !p ? '' : /^(https?|file):\/\//.test(p) ? p : `file://${p}`;
      const bg = url ? `url("${url}")` : 'none';
      placeholder.visible = !url;
      if (url) base.remove_css_class('no-art');
      else     base.add_css_class('no-art');
      bgProvider.load_from_string(`* { background-image: ${bg}; }`);
    },
  };
};

const createTextGroup = () => {
  const title = (<label cssClasses={['label', 'text-base']} maxWidthChars={40} ellipsize={Pango.EllipsizeMode.END} />) as Gtk.Label;
  const star = (<label cssClasses={['symbols', 'filled', 'symbols-sm']} label='star' />) as Gtk.Label;
  const difficulty = (<label cssClasses={['value', 'tabular', 'text-sm']} />) as Gtk.Label;

  return { title, star, difficulty };
};

export default () => {
  if (!nowplaying) return null;

  const available = createBinding(nowplaying, 'available');
  const title = createBinding(nowplaying, 'title');
  const artist = createBinding(nowplaying, 'artist');
  const artwork = createBinding(nowplaying, 'artwork');
  const stars = createBinding(nowplaying, 'stars');
  const source = createBinding(nowplaying, 'source');
  const isOsu = createMemo(() => source() === 'tosu');
  const text = createMemo(() => artist() ? `${artist()} - ${title()}` : title());
  const signature = createMemo(() => `${source()}|${text()}|${stars()}|${artwork()}`);

  const createAnimator = (
    root: Gtk.Widget,
    thumb: ReturnType<typeof createThumb>,
    textGroup: ReturnType<typeof createTextGroup>,
    setVisible: (v: boolean) => void,
  ) => {
    let lastOpacity = -1;
    const apply = ({ opacity }: { opacity: number }) => {
      if (Math.abs(opacity - lastOpacity) >= 0.005) {
        lastOpacity = opacity;
        root.opacity = opacity;
      }
    };
    const sync = () => {
      textGroup.title.set_label(text());
      textGroup.difficulty.set_label(stars().toFixed(2));
      thumb.setArtwork(artwork());
    };
    const animateBlur = (cssClass: typeof BLUR_CLASSES[number]) => {
      for (const cls of BLUR_CLASSES) root.remove_css_class(cls);
      root.add_css_class(cssClass);
    };

    const tween = createTween(root, apply);
    const animate = (
      cssClass: typeof BLUR_CLASSES[number],
      from: typeof HIDDEN,
      to: typeof HIDDEN,
      duration: number,
      easing: typeof easings[keyof typeof easings],
    ) => {
      animateBlur(cssClass);
      return tween(from, to, duration, easing);
    };
    const fadeIn  = () => animate('blur-fade-in',  HIDDEN,  VISIBLE, FADE_DURATION,       easings.easeOut);
    const fadeOut = () => animate('blur-fade-out', VISIBLE, HIDDEN,  FADE_DURATION,       easings.easeIn);
    const swapOut = () => animate('blur-swap-out', VISIBLE, HIDDEN,  SWITCH_DURATION / 2, easings.easeInOut);
    const swapIn  = () => animate('blur-swap-in',  HIDDEN,  VISIBLE, SWITCH_DURATION / 2, easings.easeInOut);

    const safe = (fn: () => Promise<void>) => async () => {
      try { await fn(); } catch (e) { if (e !== CANCELLED) throw e; }
    };

    let showing = false;

    const show = safe(async () => {
      sync();
      apply(HIDDEN);
      setVisible(true);
      showing = true;
      await fadeIn();
      showing = false;
    });

    const hide = safe(async () => {
      showing = false;
      await fadeOut();
      setVisible(false);
    });

    const swap = safe(async () => {
      await swapOut();
      sync();
      await swapIn();
    });

    sync();
    if (available()) show();
    const unsubscribeAvailable = available.subscribe(() => {
      (available() ? show : hide)();
    });
    const unsubscribeSignature = signature.subscribe(() => {
      if (!available()) return;
      if (showing) sync();
      else swap();
    });
    onCleanup(() => {
      unsubscribeAvailable();
      unsubscribeSignature();
    });
  };

  return defineComponent('nowplaying', () => {
    const [visible, setVisible] = createState(false);
    const thumb = createThumb();
    const textGroup = createTextGroup();

    const root = (
      <box visible={visible} class='nowplaying' spacing={8}>
        {thumb.widget}
        {textGroup.title}
        <box class='difficulty' spacing={3} valign={Gtk.Align.CENTER} visible={isOsu}>
          {textGroup.star}
          {textGroup.difficulty}
        </box>
      </box>
    ) as Gtk.Widget;

    createAnimator(root, thumb, textGroup, setVisible);
    return root;
  });
};
