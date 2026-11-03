// Combined TikTok + Instagram Reels safe zone for a 1080x1920 canvas.
// TikTok: top ~150px (Following/For You), bottom ~480px (caption, sound, nav), right ~140px (like/comment/share rail).
// IG Reels: top ~220px, bottom ~420px. We take the stricter of each.
export const SAFE = {
  top: 230,
  bottom: 1920 - 480, // y = 1440 is the lowest any graphic may reach
  left: 70,
  right: 1080 - 150, // x = 930
};
export const SAFE_W = SAFE.right - SAFE.left;
export const SAFE_CX = (SAFE.left + SAFE.right) / 2; // visual centre inside safe area
