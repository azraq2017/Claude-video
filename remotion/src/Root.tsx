import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {FPS, TOTAL_FRAMES} from './edl';

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{showSafeZone: false}} />
    <Composition id="SafeZoneCheck" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{showSafeZone: true}} />
  </>
);
