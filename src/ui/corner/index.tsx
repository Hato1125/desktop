import Gdk from 'gi://Gdk?version=4.0';
import Astal from 'gi://Astal?version=4.0';
import {
  createBinding,
  createComputed,
  For,
  This
} from 'ags';
import app from 'ags/gtk4/app';

import giCairo from 'cairo';
import config from '@config';

const ROUNDED: number = 20;

const drawTopLeft = (round: number, context: giCairo.Context) => {
  context.arc(round, round, round, Math.PI, 3 * Math.PI / 2);
  context.lineTo(0, 0);
}

const drawTopRight = (round: number, context: giCairo.Context) => {
  context.arc(0, round, round, 3 * Math.PI / 2, 2 * Math.PI);
  context.lineTo(round, 0);
}

const drawBottomLeft = (round: number, context: giCairo.Context) => {
  context.arc(round, 0, round, Math.PI / 2, Math.PI);
  context.lineTo(0, round);
}

const drawBottomRight = (round: number, context: giCairo.Context) => {
  context.arc(0, 0, round, 0, Math.PI / 2);
  context.lineTo(round, round);
}

type DrawArc = (r: number, c: giCairo.Context) => void;

const makeMonitorCornerWindow = (
  monitor: Gdk.Monitor,
  anchor: Astal.WindowAnchor,
  drawCorner: DrawArc,
) => (
  <window
    visible
    class='monitor-corner'
    namespace='corner'
    gdkmonitor={monitor}
    layer={Astal.Layer.OVERLAY}
    anchor={anchor}
    exclusivity={Astal.Exclusivity.IGNORE}
  >
    <drawingarea
      widthRequest={ROUNDED}
      heightRequest={ROUNDED}
      $={(self) => {
        self.set_draw_func((_, ctx: giCairo.Context) => {
          drawCorner(ROUNDED, ctx);
          ctx.closePath();
          ctx.setSourceRGB(0, 0, 0);
          ctx.fill();
        });
      }}
    />
  </window>
);

const makeBarCornerWindow = (
  anchor: Astal.WindowAnchor,
  drawCorner: DrawArc,
  visible: boolean | object,
) => (
  <window
    visible={visible}
    class='bar-corner'
    namespace='corner'
    layer={Astal.Layer.TOP}
    anchor={anchor}
    exclusivity={Astal.Exclusivity.NORMAL}
  >
    <drawingarea
      widthRequest={ROUNDED}
      heightRequest={ROUNDED}
      $={(self) => {
        self.set_draw_func((widget, ctx: giCairo.Context) => {
          drawCorner(ROUNDED, ctx);
          ctx.closePath();
          const c = widget.get_color();
          ctx.setSourceRGBA(c.red, c.green, c.blue, c.alpha);
          ctx.fill();
        });
      }}
    />
  </window>
);

const TL = Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT;
const TR = Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT;
const BL = Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT;
const BR = Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT;

export const BarCorner = () => {
  const anchorBinding = createBinding(config.bar, 'anchor');
  const transparentBinding = createBinding(config.bar, 'transparent');
  const topVisible = createComputed(() => anchorBinding() === 'top' && !transparentBinding());
  const bottomVisible = createComputed(() => anchorBinding() !== 'top' && !transparentBinding());

  makeBarCornerWindow(TL, drawTopLeft, topVisible);
  makeBarCornerWindow(TR, drawTopRight, topVisible);
  makeBarCornerWindow(BL, drawBottomLeft, bottomVisible);
  makeBarCornerWindow(BR, drawBottomRight, bottomVisible);

  return <box visible={false} />;
};

export const MonitorCorners = () => (
  <For each={createBinding(app, 'monitors')}>
    {(monitor: Gdk.Monitor) => (
      <This this={app}>
        {makeMonitorCornerWindow(monitor, TL, drawTopLeft)}
        {makeMonitorCornerWindow(monitor, TR, drawTopRight)}
        {makeMonitorCornerWindow(monitor, BL, drawBottomLeft)}
        {makeMonitorCornerWindow(monitor, BR, drawBottomRight)}
      </This>
    )}
  </For>
);
