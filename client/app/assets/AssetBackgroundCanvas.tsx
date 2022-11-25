
'use client';

import styles from './assets.module.scss';
import { useEffect, useRef } from 'react';
import { Asset } from '../../lib/types';

export default function AssetBackgroundCanvas(props: { asset: Asset}) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const context = canvas.getContext('2d');
    if (context === null) return;
    const image = new Image(); // Create new img element
    image.src = `/logos/${props.asset.symbol}_logo.svg`; // Set source path
    image.onload = () => {
      context.drawImage(image, 0, 0);
      context.drawImage(image, 30, 0);
      context.drawImage(image, 60, 0);
      console.log(canvas.toDataURL());
    };

  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        id='iconbackground'
        height='100px'
        width='225px'
      >
      </canvas>
    </div>
  );

}
