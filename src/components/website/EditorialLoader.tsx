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
    // Lock scrolling behind loader
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (isDone) return null;

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={`fixed inset-0 z-[9999] bg-[#000] flex items-center justify-center overflow-hidden transition-opacity duration-[800ms] ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <style>{`
        .cinematic-loader-video {
          width: 100vw;
          height: 100dvh;
          object-fit: cover;
          object-position: center;
          pointer-events: none; /* Prevents interaction/controls */
          will-change: opacity;
        }

        /* 
          MOBILE SAFE-AREA STRATEGY (Portrait screens)
          Instead of cropping the sides (which cuts off FROASTER) 
          or leaving harsh black bars, we:
          1. Use 'contain' to preserve the full composition width
          2. Scale slightly (1.15) for a more premium, filled feel
          3. Use a gradient mask to feather the top/bottom edges seamlessly into the #000 background
        */
        @media (max-aspect-ratio: 4/5) {
          .cinematic-loader-video {
            object-fit: contain;
            transform: scale(1.15);
            -webkit-mask-image: linear-gradient(
              to bottom, 
              transparent 0%, 
              black 15%, 
              black 85%, 
              transparent 100%
            );
            mask-image: linear-gradient(
              to bottom, 
              transparent 0%, 
              black 15%, 
              black 85%, 
              transparent 100%
            );
          }
        }
      `}</style>

      <video
        className="cinematic-loader-video"
        src="/FrosterGym/load.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        onEnded={handleVideoComplete}
        onError={handleVideoComplete}
      />
    </div>
  );
}
