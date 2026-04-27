import Gtk from 'gi://Gtk?version=4.0';
import Pango from 'gi://Pango?version=1.0';
import { createBinding, createMemo, createState } from 'ags';
import { defineComponent } from './component';
import { createTween, easings, CANCELLED } from '@lib/tween';
import nowplaying from '@service/nowplaying';

const BLUR_MAX = 8;
const FADE_DURATION = 1200;
const SWITCH_DURATION = 1200;
const THUMB_FILTER = 'grayscale(99.99%) brightness(1.001) contrast(1.125) brightness(1.125)';
const USER_PRIORITY = Gtk.STYLE_PROVIDER_PRIORITY_USER;

const HIDDEN  = { blur: BLUR_MAX, opacity: 0 };
const VISIBLE = { blur: 0,        opacity: 1 };

const createThumb = () => {
  const bgProvider = new Gtk.CssProvider();
  const noteBlurProvider = new Gtk.CssProvider();

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
    label.get_style_context().add_provider(noteBlurProvider, USER_PRIORITY);
    return label;
  };

  const widget = (
    <overlay class='thumb-container'>
      {base}
      {note('note-1')}
      {note('note-2')}
      {note('note-3')}
    </overlay>
  ) as Gtk.Widget;

  let blur = 0;
  let bg = 'background-image: none;';
  const render = () => {
    bgProvider.load_from_string(`* { ${bg} filter: blur(${blur}px) ${THUMB_FILTER}; }`);
    noteBlurProvider.load_from_string(`* { filter: blur(${blur}px); }`);
  };
  render();

  return {
    widget,
    setArtwork: (p: string) => {
      const url = !p ? '' : /^(https?|file):\/\//.test(p) ? p : `file://${p}`;
      bg = url ? `background-image: url("${url}");` : 'background-image: none;';
      placeholder.visible = !url;
      if (url) base.remove_css_class('no-art');
      else     base.add_css_class('no-art');
      render();
    },
    setBlur: (b: number) => { blur = b; render(); },
  };
};

const createTextGroup = () => {
  const provider = new Gtk.CssProvider();
  const title = (<label cssClasses={['label', 'text-base']} maxWidthChars={40} ellipsize={Pango.EllipsizeMode.END} />) as Gtk.Label;
  const star = (<label cssClasses={['symbols', 'filled', 'symbols-sm']} label='star' />) as Gtk.Label;
  const difficulty = (<label cssClasses={['value', 'tabular', 'text-sm']} />) as Gtk.Label;
  for (const w of [title, star, difficulty]) w.get_style_context().add_provider(provider, USER_PRIORITY);

  return {
    title, star, difficulty,
    setBlur: (b: number) => provider.load_from_string(`* { color: transparent; text-shadow: 0 0 ${b}px var(--fg); }`),
  };
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
  const signature = createMemo(() => `${source()}|${text()}|${stars()}`);

  const createAnimator = (
    root: Gtk.Widget,
    thumb: ReturnType<typeof createThumb>,
    textGroup: ReturnType<typeof createTextGroup>,
    setVisible: (v: boolean) => void,
  ) => {
    let lastBlur = -1;
    let lastOpacity = -1;
    const apply = ({ blur, opacity }: { blur: number; opacity: number }) => {
      if (Math.abs(blur - lastBlur) >= 0.05) {
        lastBlur = blur;
        thumb.setBlur(blur);
        textGroup.setBlur(blur);
      }
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

    const tween = createTween(root, apply);
    const fadeIn  = () => tween(HIDDEN,  VISIBLE, FADE_DURATION,       easings.easeOut);
    const fadeOut = () => tween(VISIBLE, HIDDEN,  FADE_DURATION,       easings.easeIn);
    const swapOut = () => tween(VISIBLE, HIDDEN,  SWITCH_DURATION / 2, easings.easeInOut);
    const swapIn  = () => tween(HIDDEN,  VISIBLE, SWITCH_DURATION / 2, easings.easeInOut);

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
    available.subscribe(() => { (available() ? show : hide)(); });
    signature.subscribe(() => {
      if (!available()) return;
      if (showing) sync();
      else swap();
    });
    artwork.subscribe(() => {
      if (available()) thumb.setArtwork(artwork());
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
