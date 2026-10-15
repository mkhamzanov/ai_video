import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/** Pass a pure, trusted renderSvg(seconds) function from a local composition.
 * No Audio/Reel wrapper: silent output is deliberate.
 * Set composition width=1080 height=1920 fps=30 and durationInFrames=900.
 * Add local content to Root.local.tsx; keep it outside the public engine.
 */
export const RemotionCutout: React.FC<{renderSvg:(seconds:number)=>string}> = ({renderSvg}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  return <AbsoluteFill><div style={{width:'100%',height:'100%'}}>
    <style>{'.cutout-frame svg {width:100%;height:100%;display:block;}'}</style>
    <div className="cutout-frame" style={{width:'100%',height:'100%'}}
      dangerouslySetInnerHTML={{__html:renderSvg(frame/fps)}} />
  </div></AbsoluteFill>;
};
