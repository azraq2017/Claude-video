import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled locally (public/fonts) so rendering never depends on the network.
export const MONT = "Montserrat";
export const ANTON = "Anton";

for (const w of ["600", "800", "900"]) {
  loadFont({ family: MONT, url: staticFile(`fonts/montserrat-latin-${w}-normal.woff2`), weight: w });
}
loadFont({ family: ANTON, url: staticFile("fonts/anton-latin-400-normal.woff2"), weight: "400" });

export const C = {
  yellow: "#FFD60A",
  red: "#FF3B30",
  green: "#34C759",
  blue: "#1F4FD8",
  ink: "#0B0B0F",
  white: "#FFFFFF",
};
