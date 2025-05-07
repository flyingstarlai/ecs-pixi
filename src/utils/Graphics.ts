import { Graphics } from "pixi.js";

/**
 * Creates a puzzle-piece graphic similar to the reference drawing.
 *
 * @param size         Full square size of the piece (excluding the top tab)
 * @param notchR       Radius of the side notches
 * @param cornerR     radius for the outer corners (px)
 * @param lineW        Stroke width
 * @param strokeColor  Stroke color (RGB)
 */
export function createPuzzlePiece(
  size = 128 - 32,
  notchR = 14,
  cornerR = 12,
  lineW = 8,
  strokeColor = 0xc5c5c5,
): Graphics {
  const g = new Graphics();

  const w = size;
  const h = size;
  const midY = h * 0.5; // vertical centre for both side notches

  // Top edge ⇒ to top-right corner start
  g.moveTo(cornerR, 0);
  g.lineTo(w - cornerR, 0);
  g.arc(w - cornerR, cornerR, cornerR, -Math.PI / 2, 0);

  // ──▼ right edge down to the start of the concave arc
  g.lineTo(w, midY - notchR);

  // right concave notch (anticlockwise half-circle)
  g.arc(
    w + notchR / 2, // centre x
    midY, // centre y
    notchR,
    -Math.PI / 2, // from  -90°
    Math.PI / 2, // to   +90°
    false, // anticlockwise → concave
  );

  // ▼ down to bottom-right corner

  g.lineTo(w, h - midY + notchR);

  g.lineTo(w, h - cornerR);
  g.arc(w - cornerR, h - cornerR, cornerR, 0, Math.PI / 2);
  g.lineTo(cornerR, h);

  // ◄── bottom edge to bottom-left
  g.lineTo(cornerR, h);
  g.arc(cornerR, h - cornerR, cornerR, Math.PI / 2, Math.PI);

  // ▲ up left edge to bottom of left notch
  g.lineTo(0, midY + notchR);

  // left concave notch
  g.arc(
    notchR / 2, // centre x
    midY, // centre y
    notchR,
    Math.PI / 2, // from +90°
    (3 * Math.PI) / 2, // to  +270°
    true,
  );

  g.lineTo(0, midY - notchR);

  // ▲ up to top-left and close
  g.lineTo(0, cornerR);
  g.arc(cornerR, cornerR, cornerR, Math.PI, (3 * Math.PI) / 2);
  g.closePath();

  g.stroke({ width: lineW, color: strokeColor });
  g.fill({ color: 0xfff5e1 });

  return g;
}
