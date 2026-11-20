import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {FPS, TOTAL_FRAMES} from './edl';
import {Main13} from './ip13/Main13';
import {TOTAL13} from './ip13/edl13';

export const Root: React.FC = () => (
  <>
    {/* iPhone 12 purple */}
    <Composition id="Main" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{showSafeZone: false}} />
    <Composition id="SafeZoneCheck" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{showSafeZone: true}} />
    {/* iPhone 13 blue */}
    <Composition id="IP13" component={Main13} durationInFrames={TOTAL13} fps={FPS} width={1080} height={1920} defaultProps={{showSafeZone: false}} />
    <Composition id="IP13SafeZone" component={Main13} durationInFrames={TOTAL13} fps={FPS} width={1080} height={1920} defaultProps={{showSafeZone: true}} />
  </>
);
