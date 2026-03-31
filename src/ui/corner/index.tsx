import Gdk from 'gi://Gdk?version=4.0';
import Astal from 'gi://Astal?version=4.0';
import giCairo from 'cairo';

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

const makeCornerWindow = (
  props: {
    monitor: Gdk.Monitor | undefined;
    layer: Astal.Layer;
    anchor: Astal.WindowAnchor;
    exclusivity: Astal.Exclusivity;
    drawCorner: DrawArc;
  }
) => (
  <window
    visible
    class='corner'
    namespace='corner'
    gdkmonitor={props.monitor}
    layer={props.layer}
    anchor={props.anchor}
    exclusivity={props.exclusivity}
  >
    <drawingarea
      widthRequest={ROUNDED}
      heightRequest={ROUNDED}
      $={(self) => {
        self.set_draw_func((_, context: giCairo.Context) => {
          props.drawCorner(ROUNDED, context);

          context.closePath();
          context.setSourceRGB(0, 0, 0);
          context.fill();
        });
      }}
    />
  </window>
);

const makeMonitorCorner = (
  anchor: Astal.WindowAnchor,
  drawCorner: DrawArc,
) => ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) =>
  makeCornerWindow({
    monitor: gdkmonitor,
    layer: Astal.Layer.OVERLAY,
    anchor,
    exclusivity: Astal.Exclusivity.IGNORE,
    drawCorner,
  });

const makeBarCorner = (
  anchor: Astal.WindowAnchor,
  drawCorner: DrawArc,
) => () =>
  makeCornerWindow({
    monitor: undefined,
    layer: Astal.Layer.TOP,
    anchor,
    exclusivity: Astal.Exclusivity.EXCLUSIVE,
    drawCorner,
  });

const TL = Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT;
const TR = Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT;
const BL = Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT;
const BR = Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT;

export const MonitorTopLeftCorner = makeMonitorCorner(TL, drawTopLeft);
export const MonitorTopRightCorner = makeMonitorCorner(TR, drawTopRight);
export const MonitorBottomLeftCorner = makeMonitorCorner(BL, drawBottomLeft);
export const MonitorBottomRightCorner = makeMonitorCorner(BR, drawBottomRight);

export const BarBottomLeftCorner = makeBarCorner(BL, drawBottomLeft);
export const BarBottomRightCorner = makeBarCorner(BR, drawBottomRight);
