'use client';

import styles from './assets.module.scss';
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
    let dotRadius = 4;
    let marginOffset = context.lineWidth + dotRadius;
    context.lineCap = 'butt';
    context.translate(0.5, 0.5);
    let maxHeight = canvas.height;
    let priceArray = props.priceHistory.map((historyObj) => Number(historyObj.price));
    let minPrice = Math.min(...priceArray);
    let maxPrice = Math.max(...priceArray);
    let step = Math.floor((canvas.width - marginOffset) / (props.priceHistory.length - 1));
    // Given a value p (price) in the range A (minPrice) to B (maxPrice), calculate a point q (height / y) in the range C (0) to D (maxHeight) that is in the same relative place
    let heightArray = priceArray.map((price, i) => {
      let scale = (maxHeight - (marginOffset * 2)) / (maxPrice - minPrice);
      let offset = -minPrice * scale + marginOffset;
      return (price * scale) + offset;
    });
    let preP = {
      x: marginOffset,
      y: maxHeight - heightArray[0]
    }
    var m = 0;
    var dx1 = 0;
    var dy1 = 0;
    context.beginPath();
    context.moveTo(preP.x, preP.y);
    // console.log(priceArray); // DEBUG
    for (let i = 1; i < heightArray.length; i++) {
      let dx2: number, dy2: number;
      var curP = {
        x: i * step,
        y: maxHeight - heightArray[i]
      };
      let nexP = {
        x: (i + 1) * step,
        y: maxHeight - heightArray[i + 1]
      };
      if (i < heightArray.length - 1) {
          m = (nexP.y-preP.y)/(nexP.x-preP.x);
          dx2 = (nexP.x - curP.x) * -0.3;
          dy2 = dx2 * m * 0.6;
      } else {
          dx2 = 0;
          dy2 = 0;
      }
      // console.log('curP.y', curP.y); // DEBUG
      // console.log('nexP', nexP.x, nexP.y); // DEBUG
      context.bezierCurveTo(
        preP.x - dx1, preP.y - dy1,
        curP.x + dx2, curP.y + dy2,
        curP.x, curP.y
      );
      // context.lineTo(
      //   curP.x, curP.y
      // );
      dx1 = dx2;
      dy1 = dy2;
      preP = curP;
      context.stroke();
      // console.log('stroke', i); // DEBUG
      // console.log('priceArray[i]', priceArray[i]); // DEBUG
      // console.log(x, y); // DEBUG
    }
    context.closePath();
    context.fillStyle = props.priceStyle ? '#63E163' : '#D43F3F';
    for (let i = 0; i < heightArray.length; i++) {
      var curP = {
        x: i * step,
        y: maxHeight - heightArray[i]
      };
      context.beginPath();
      context.ellipse(
        curP.x || marginOffset,
        curP.y,
        dotRadius,
        dotRadius,
        0, 0, 360
      );
      context.fill();
    }
  }, []);

  return (
    <div className={styles.assetPriceHistoryGraph}>
      <canvas
        ref={canvasRef}
        id='pricegraph'
        height='40px'
        width='250px'
      >
        {/* TODO: look into 'role' property */}
      </canvas>
    </div>
  );

}
