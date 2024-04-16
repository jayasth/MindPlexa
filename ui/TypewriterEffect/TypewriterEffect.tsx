'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './TypewriterEffect.module.css';

interface TypewriterEffectProps {
  text: string;
  delay?: number;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  text,
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <span
      ref={textRef}
      className={`${styles.typewriter} ${isVisible ? '' : 'invisible'}`}
      aria-label={text}
    >
      {text}
    </span>
  );
};

export default TypewriterEffect;
