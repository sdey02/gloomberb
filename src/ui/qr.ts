/**
 * Renders QR codes as half-block Unicode lines so one terminal row carries two
 * QR module rows, keeping the code square-ish and scannable.
 *
 * The characters only encode which half of each cell is dark. A QR code must
 * be dark-on-light for phone cameras, so whatever displays these lines has to
 * paint them with a dark foreground on a light background regardless of the
 * terminal theme.
 */
import qrcode from "qrcode-generator";

/** Mandatory light border around the code: the QR spec requires 4 modules on every side. */
const QUIET_ZONE_MODULES = 4;

const BOTH_LIGHT = " ";
const TOP_DARK = "\u2580"; // ▀
const BOTTOM_DARK = "\u2584"; // ▄
const BOTH_DARK = "\u2588"; // █

export function renderQrLines(text: string): string[] {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const size = moduleCount + QUIET_ZONE_MODULES * 2;
  const isDark = (row: number, col: number): boolean => {
    const moduleRow = row - QUIET_ZONE_MODULES;
    const moduleCol = col - QUIET_ZONE_MODULES;
    if (moduleRow < 0 || moduleCol < 0 || moduleRow >= moduleCount || moduleCol >= moduleCount) {
      return false;
    }
    return qr.isDark(moduleRow, moduleCol);
  };

  const lines: string[] = [];
  for (let row = 0; row < size; row += 2) {
    let line = "";
    for (let col = 0; col < size; col += 1) {
      const top = isDark(row, col);
      // An odd total height leaves the last line with no bottom row; pad it light.
      const bottom = row + 1 < size && isDark(row + 1, col);
      line += top ? (bottom ? BOTH_DARK : TOP_DARK) : (bottom ? BOTTOM_DARK : BOTH_LIGHT);
    }
    lines.push(line);
  }
  return lines;
}
