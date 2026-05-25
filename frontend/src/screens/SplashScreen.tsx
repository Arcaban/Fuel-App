import React, { useEffect, useState } from 'react';

const BG     = '#0F1623';
const INK    = '#F0F3F8';
const MUTED  = '#94A3BC';
const ACCENT = '#3FB37A';
const TRACK  = '#26314A';
const FONT   = "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

interface SplashScreenProps {
  visible: boolean;
  onFadeComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ visible, onFadeComplete }) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!visible) {
      setOpacity(0);
      const t = setTimeout(onFadeComplete, 420);
      return () => clearTimeout(t);
    }
  }, [visible, onFadeComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        fontFamily: FONT,
        opacity,
        transition: 'opacity 0.4s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <h1
        style={{
          fontSize: '72px',
          fontWeight: 900,
          letterSpacing: '-4px',
          margin: 0,
          lineHeight: 1,
          color: INK,
          fontFamily: FONT,
        }}
      >
        tanq<span style={{ color: ACCENT }}>.</span>
      </h1>

      <p
        style={{
          margin: '12px 0 0',
          fontSize: '14px',
          color: MUTED,
          fontWeight: 400,
        }}
      >
        Preços de combustível em Portugal.
      </p>

      {/* Indeterminate loading bar */}
      <div
        style={{
          marginTop: '52px',
          width: '160px',
          height: '2px',
          backgroundColor: TRACK,
          borderRadius: '1px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '38%',
            height: '100%',
            backgroundColor: ACCENT,
            borderRadius: '1px',
            animation: 'tanq-sweep 1.5s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
