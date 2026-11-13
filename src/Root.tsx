import { Composition } from "remotion";
import { Edit } from "./Edit";
import { FPS } from "./timeline";
import { projectFrames, type Project } from "./project";
import { tolakMotor } from "./projects/tolak-motor";
import { repairPhone } from "./projects/repair-phone";
import { showroom } from "./projects/showroom";
import { stokBaru } from "./projects/stok-baru";
import { ex5Mahal } from "./projects/ex5-mahal";
import { phoneLama } from "./projects/phone-lama";
import { repairTv } from "./projects/repair-tv";
import { stokWalkthrough } from "./projects/stok-walkthrough";
import { minimalDemo } from "./projects/minimal-demo";
import { promoDeepavali } from "./projects/promo-deepavali";
import { offerBos } from "./projects/offer-bos";
import { antiScam } from "./projects/anti-scam";
import { tolakPhone } from "./projects/tolak-phone";
import { stok100 } from "./projects/stok-100";
import { lc2999 } from "./projects/lc-2999";
import { OutroPreview, OUTRO_FRAMES } from "./brand/Outro19";
import { OutroTasTechPreview, TT_OUTRO_FRAMES } from "./brand/OutroTasTech";

const PROJECTS: Project[] = [tolakMotor, repairPhone, showroom, stokBaru, ex5Mahal, phoneLama, repairTv, stokWalkthrough, minimalDemo, promoDeepavali, offerBos, antiScam, tolakPhone, stok100, lc2999];

// Projects hold functions/typed arrays, so pass them by closure instead of
// (JSON-serialised) defaultProps.
const COMPONENTS = Object.fromEntries(
  PROJECTS.map((p) => [p.id, () => <Edit project={p} />]),
) as Record<string, React.FC>;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Outro19" component={OutroPreview} durationInFrames={OUTRO_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="OutroTasTech" component={OutroTasTechPreview} durationInFrames={TT_OUTRO_FRAMES} fps={FPS} width={1080} height={1920} />
    {PROJECTS.map((p) => (
      <Composition
        key={p.id}
        id={p.id}
        component={COMPONENTS[p.id]}
        durationInFrames={projectFrames(p)}
        fps={FPS}
        width={1080}
        height={1920}
      />
    ))}
  </>
);
