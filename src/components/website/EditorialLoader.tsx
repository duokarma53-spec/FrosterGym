import { useEffect, useState, useCallback } from 'react';

export default function EditorialLoader({ onComplete }: { onComplete: () => void }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleVideoComplete = useCallback(() => {
    setIsFadingOut(true);
  }, []);

  const handleTransitionEnd = useCallback(() => {
    if (isFadingOut && !isDone) {
      document.body.style.overflow = '';
      setIsDone(true);
      onComplete();
    }
  }, [isFadingOut, isDone, onComplete]);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsDone(true);
      onComplete();
      return;
    }

    // Lock scrolling behind loader
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={`absolute inset-0 z-20 bg-black flex items-center justify-center overflow-hidden transition-opacity duration-[1000ms] ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        className="w-full h-full object-cover object-center pointer-events-none"
        style={{ willChange: 'opacity' }}
        src="/FrosterGym/load.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        onEnded={handleVideoComplete}
        onError={handleVideoComplete}
      />
      
      {/* Dark cinematic overlay / vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
    </div>
  );
}
