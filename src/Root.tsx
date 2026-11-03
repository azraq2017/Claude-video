import { Composition } from "remotion";
import { TolakMotor } from "./TolakMotor";
import { FPS, TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TolakMotor"
    component={TolakMotor}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
