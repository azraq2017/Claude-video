import edl from "./edl.json";

export type Clip = { start: number; end: number; zoom?: number; note?: string };
export const CLIPS: Clip[] = edl;
