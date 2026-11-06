import { Composition } from "remotion";
import { Edit } from "./Edit";
import { FPS } from "./timeline";
import type { Project } from "./project";
import { tolakMotor } from "./projects/tolak-motor";
import { repairPhone } from "./projects/repair-phone";

const PROJECTS: Project[] = [tolakMotor, repairPhone];

// Projects hold functions/typed arrays, so pass them by closure instead of
// (JSON-serialised) defaultProps.
const COMPONENTS = Object.fromEntries(
  PROJECTS.map((p) => [p.id, () => <Edit project={p} />]),
) as Record<string, React.FC>;

export const RemotionRoot: React.FC = () => (
  <>
    {PROJECTS.map((p) => (
      <Composition
        key={p.id}
        id={p.id}
        component={COMPONENTS[p.id]}
        durationInFrames={p.tl.total}
        fps={FPS}
        width={1080}
        height={1920}
      />
    ))}
  </>
);
