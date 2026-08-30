import { useEffect, useRef, useState, useCallback } from 'react';

export default function EditorialLoader({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const doneRef = useRef(false);

  const finishLoading = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    
    // 2. Fade the loading overlay smoothly
    setIsFadingOut(true);
    
    // 3 & 4. Reveal website and completely unmount after fade
    setTimeout(() => {
      document.body.style.overflow = '';
      setIsDone(true);
      onComplete();
    }, 1000); // 1-second smooth transition
  }, [onComplete]);

  useEffect(() => {
    // Lock scrolling behind loader
    document.body.style.overflow = 'hidden';

    // Fallback safety — if video fails or hangs, open site automatically
    const fallback = setTimeout(finishLoading, 12000);

    return () => clearTimeout(fallback);
  }, [finishLoading]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#000] flex items-center justify-center overflow-hidden transition-opacity duration-1000 ease-in-out ${
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
        ref={videoRef}
        className="cinematic-loader-video"
        src="/FrosterGym/load.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        onEnded={() => {
          // 1. Keep the final FROASTER frame visible briefly before starting the fade
          setTimeout(finishLoading, 400);
        }}
        onError={finishLoading}
      />
    </div>
  );
}
