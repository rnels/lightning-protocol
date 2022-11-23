
'use client';

import styles from './assets.module.css';
import { useEffect, useRef } from 'react';

export default function AssetPriceHistoryCanvas(
  props: {
    priceHistory: {
      price: string | number,
      dataPeriod: string
    }[],
    priceStyle: boolean
}) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const context = canvas.getContext('2d');
    if (context === null) return;
    context.strokeStyle = props.priceStyle ? '#63E163' : '#D43F3F';
    context.lineWidth = 2;
    context.translate(0.5, 0.5);
    let priceArray = props.priceHistory.map((historyObj) => Number(historyObj.price));
    let minPrice = Math.min(...priceArray);
    let maxPrice = Math.max(...priceArray);
    let step = Math.floor(canvas.width / (props.priceHistory.length - 1));
    // Given a value p (price) in the range A (minPrice) to B (maxPrice), calculate a point q (height / y) in the range C (0) to D (canvas.height) that is in the same relative place
    let heightArray = priceArray.map((price) => {
      let scale = ((canvas.height - context.lineWidth) - context.lineWidth) / (maxPrice - minPrice);
      let offset = -minPrice * ((canvas.height - context.lineWidth) - context.lineWidth) / (maxPrice - minPrice) + context.lineWidth;
      return (price * scale) + offset;
    });
    context.beginPath();
    context.moveTo(0, canvas.height - heightArray[0]);
    for (let i = 1; i < heightArray.length; i++) {
      let x = i * step;
      let y = canvas.height - heightArray[i];
      // TODO: Create bezier curves
      context.lineTo(x, y);
      context.stroke();
      // console.log('stroke', i); // DEBUG
      // console.log('priceArray[i]', priceArray[i]); // DEBUG
      // console.log(x, y); // DEBUG
    }
    context.closePath();
  }, []);

  return (
    <div className={styles.assetPriceHistoryGraph}>
      <canvas ref={canvasRef} id='pricegraph' height='40px' width='250px'> {/* TODO: look into 'role' property */}
      </canvas>
    </div>
  );

}
