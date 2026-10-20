import type { CSSProperties } from 'react';
import { Decode, Item } from '../ui/primitives';
import { BASE_COLOR, type SlideDef } from '../slides';

export default function Head({ slide, size }: { slide: SlideDef; size?: 'xl' | 'lg' }) {
  return (
    <>
      <Item className="eyebrow">
        <span className="base-badge" style={{ '--c': BASE_COLOR[slide.base] } as CSSProperties}>
          {slide.base}
        </span>
        <span>{slide.kicker}</span>
      </Item>
      <Item>
        <h1 className={`title ${size ? `title-${size}` : ''}`}>
          <Decode text={slide.title} />
        </h1>
      </Item>
      {slide.lede && (
        <Item>
          <p className="lede">{slide.lede}</p>
        </Item>
      )}
    </>
  );
}
