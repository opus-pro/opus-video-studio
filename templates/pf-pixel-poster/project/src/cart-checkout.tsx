import React from 'react';
import {Img, staticFile} from 'remotion';
import {CartIcon, CheckIcon, Pointer, Scene, TextLine, linear, progress, snap, useTime} from './shared';

export const cartDefaults = {title: ['Coastal', 'study.'], brand: 'FIELD PRINTS', dimensions: '40\u00d750 CM', price: 32, quantity: 1, addLabel: 'Add to cart', viewLabel: 'View cart', confirmation: 'Added to your bag', photo: 'coast.jpg', background: '#eef1ec', accent: '#cde993'};
export type CartProps = typeof cartDefaults;
const CartContent: React.FC<CartProps> = props => {
  const {title, brand, dimensions, price, quantity, addLabel, viewLabel, confirmation, photo, accent} = props;
  const t = useTime(); const entrance = progress(t, 0, .55);
  const outward = progress(t, 1.35, 2.05, snap); const inward = progress(t, 3.1, 3.8);
  const separation = 160 * outward * (1 - inward);
  const expand = progress(t, 1.35, 1.5); const contract = progress(t, 1.5, 2.05);
  const width = 420 + 40 * expand - 360 * contract + 320 * inward;
  const pressing = t < 1.25 ? 1 - .04 * progress(t, 1.18, 1.25) : .96 + .04 * progress(t, 1.25, 1.35);
  const returned = t >= 3.1;
  const labelOpacity = returned ? progress(t, 3.42, 3.8) : 1 - progress(t, 1.35, 1.57);
  const iconAngle = t < 3.1 || t >= 3.45 ? 0 : t < 3.25 ? -8 + 13 * progress(t, 3.1, 3.25) : 5 * (1 - progress(t, 3.25, 3.45));
  const pointerIn = progress(t, 1.1, 1.24); const pointerOut = progress(t, 3.8, 4.2);
  return <>
    <div style={{position: 'absolute', left: 200 - 400 * (1 - entrance), top: 210, width: 520, height: 720, boxSizing: 'border-box', padding: 22, background: '#fff', boxShadow: '0 18px 34px rgba(28,39,31,.12)', filter: `blur(${6 * (1 - entrance)}px)`}}><Img src={staticFile(`assets/${photo}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}}/></div>
    <div style={{position: 'absolute', left: 850 + 40 * (1 - entrance), top: 290, width: 580, color: '#19251d', filter: `blur(${6 * (1 - entrance)}px)`, opacity: entrance}}>
      {title.slice(0, 2).map((line, i) => <TextLine key={i} text={line} size={86} width={580} weight={600} style={{lineHeight: '90px'}}/>)}
      <TextLine text={brand} size={22} width={580} weight={500} style={{marginTop: 34}}/>
      <TextLine text={dimensions} size={24} width={580} weight={400} style={{marginTop: 19}}/>
      <TextLine text={`$${price * quantity}`} size={50} width={580} weight={500} style={{marginTop: 30}}/>
    </div>
    {[-1, 1].map(side => <div key={side} style={{position: 'absolute', left: 1030 + side * separation, top: 800, width: 100, height: 100, borderRadius: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', color: side === -1 ? '#fff' : '#19392b', background: side === -1 ? '#1e5b42' : '#f2a79b', opacity: linear(t, 1.35, 1.53) * (1 - progress(t, 3.45, 3.8)), transform: `rotate(${-25 * (1 - Math.min(1, outward))}deg)`, zIndex: 1, fontSize: 34, fontWeight: 600}}>{side === -1 ? <CheckIcon/> : quantity}</div>)}
    <div style={{position: 'absolute', left: 1080 - width / 2, top: 800, width, height: 100, borderRadius: 50, background: accent, color: '#173628', transform: `scale(${pressing})`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15 * labelOpacity}}>
        <CartIcon size={28} style={{transform: `rotate(${iconAngle}deg)`}}/>
        <div style={{opacity: labelOpacity, maxWidth: 310 * labelOpacity, overflow: 'hidden', whiteSpace: 'nowrap'}}><TextLine text={returned ? `${viewLabel} \u00b7 ${quantity}` : addLabel} size={28} width={returned ? 210 : 180} weight={500}/></div>
      </div>
    </div>
    <div style={{position: 'absolute', left: 820, top: 990, width: 520, textAlign: 'center', color: '#294330', opacity: progress(t, 2.05, 2.4)}}><TextLine text={confirmation} size={24} width={520} weight={400}/></div>
    <div style={{position: 'absolute', left: 1300 - 165 * pointerIn + 240 * pointerOut, top: 960 - 112 * pointerIn + 185 * pointerOut, opacity: linear(t, 1.1, 1.16) * (1 - linear(t, 4.05, 4.2)), zIndex: 4}}><Pointer/></div>
  </>;
};
export const CartCheckout: React.FC<CartProps> = props => <Scene background={props.background} color="#19251d"><CartContent {...props}/></Scene>;
