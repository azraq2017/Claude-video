import React from 'react';
import {Composition, Series} from 'remotion';
import {Main} from './Main';
import {FPS, TOTAL_FRAMES} from './edl';
import {Main13} from './ip13/Main13';
import {TOTAL13} from './ip13/edl13';
import {Outro, OUTRO_FRAMES} from './Outro';
import {RepairEdit, REPAIR_TOTAL} from './repair/RepairEdit';

const WithOutro: React.FC<{which: '12' | '13'}> = ({which}) => (
  <Series>
    <Series.Sequence durationInFrames={which === '12' ? TOTAL_FRAMES : TOTAL13}>{which === '12' ? <Main /> : <Main13 />}</Series.Sequence>
    <Series.Sequence durationInFrames={OUTRO_FRAMES}>
      <Outro />
    </Series.Sequence>
  </Series>
);

const V = {fps: FPS, width: 1080, height: 1920};

export const Root: React.FC = () => (
  <>
    {/* TasTech brand outro on its own */}
    <Composition id="TastechOutro" component={Outro} durationInFrames={OUTRO_FRAMES} {...V} />
    {/* Oppo LCD repair timelapse (minimal style) */}
    <Composition id="RepairLCD" component={RepairEdit} durationInFrames={REPAIR_TOTAL} {...V} />
    {/* iPhone 12 purple */}
    <Composition id="Main" component={Main} durationInFrames={TOTAL_FRAMES} {...V} defaultProps={{showSafeZone: false}} />
    <Composition id="SafeZoneCheck" component={Main} durationInFrames={TOTAL_FRAMES} {...V} defaultProps={{showSafeZone: true}} />
    <Composition id="IP12WithOutro" component={WithOutro} durationInFrames={TOTAL_FRAMES + OUTRO_FRAMES} {...V} defaultProps={{which: '12' as const}} />
    {/* iPhone 13 blue */}
    <Composition id="IP13" component={Main13} durationInFrames={TOTAL13} {...V} defaultProps={{showSafeZone: false}} />
    <Composition id="IP13SafeZone" component={Main13} durationInFrames={TOTAL13} {...V} defaultProps={{showSafeZone: true}} />
    <Composition id="IP13WithOutro" component={WithOutro} durationInFrames={TOTAL13 + OUTRO_FRAMES} {...V} defaultProps={{which: '13' as const}} />
  </>
);
