import React from 'react';
import { RemotionVideo } from '@/components/RemotionVide';
import { Composition } from 'remotion';

const RemotionRoot = () => {
  return (
    <>
      <Composition id="MyComposition" durationInFrames={150} fps={30} width={1920} height={1080} component={MyComposition} />
    </>
  );
};

export default RemotionRoot;
