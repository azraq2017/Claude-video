export type Box = { x: number; y: number; w: number; h: number };
export type FaceTrack = ReturnType<typeof createFaceTrack>;

/** `track` rows are [t, x, y, w, h] normalised to the source frame, sampled at 5 fps. */
export const createFaceTrack = (track: number[][]) => {
  const faceAt = (srcT: number): Box => {
    const i = Math.max(0, Math.min(track.length - 1, Math.round(srcT * 5)));
    // light smoothing over +-2 samples
    const win = track.slice(Math.max(0, i - 2), i + 3);
    const avg = (k: number) => win.reduce((s, r) => s + r[k], 0) / win.length;
    return { x: avg(1), y: avg(2), w: avg(3), h: avg(4) };
  };
  return { faceAt };
};
