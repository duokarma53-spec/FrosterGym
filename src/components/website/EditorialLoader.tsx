import { useEffect, useRef, useState, useCallback } from 'react';

export default function EditorialLoader({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const doneRef = useRef(false);

  const finishLoading = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      document.body.style.overflow = '';
      setIsDone(true);
      onComplete();
    }, 800);
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Safety fallback — always open the site even if video fails
    const fallback = setTimeout(finishLoading, 12000);

    return () => clearTimeout(fallback);
  }, [finishLoading]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-800 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/FrosterGym/load.mp4"
        autoPlay
        muted
        playsInline
        onEnded={finishLoading}
        onError={finishLoading}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
