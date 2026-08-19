import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function EditorialLoader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundLightRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Lock body scroll while loading
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        setIsFadingOut(true);
        // Wait for the CSS fade-out transition to complete before unmounting
        setTimeout(() => {
          document.body.style.overflow = 'auto';
          onComplete();
        }, 1200); 
      }
    });

    // 1. Initial State
    gsap.set(backgroundLightRef.current, { opacity: 0, scale: 0.8 });
    gsap.set(brandRef.current, { opacity: 0, y: 15, letterSpacing: '0.8em' });
    gsap.set(taglineRef.current, { opacity: 0, y: 10 });

    // 2. Ambient light slowly appears
    tl.to(backgroundLightRef.current, {
      opacity: 0.4,
      scale: 1.2,
      duration: 2.2,
      ease: "power2.out"
    }, 0);

    // 3. Brand Reveal
    tl.to(brandRef.current, {
      opacity: 1,
      y: 0,
      letterSpacing: '0.25em',
      duration: 1.5,
      ease: "power3.out"
    }, 0.2);

    // 4. Tagline Reveal
    tl.to(taglineRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out"
    }, 0.6);

    // 5. Completion hold & fade away (happens sooner since there's no progress bar)
    tl.to([brandRef.current, taglineRef.current], {
      opacity: 0,
      y: -5,
      duration: 0.6,
      ease: "power2.inOut",
      stagger: 0.05
    }, 1.8);

    return () => {
      tl.kill();
      document.body.style.overflow = 'auto';
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-[9999] bg-[#020202] flex flex-col items-center justify-center transition-all duration-[1200ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isFadingOut ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'}`}
    >
      {/* Subtle organic ambient glow */}
      <div 
        ref={backgroundLightRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] max-w-[800px] max-h-[800px] rounded-full blur-[120px] pointer-events-none mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0) 70%)'
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 
          ref={brandRef}
          className="text-[#F4F1E8] font-bebas text-5xl md:text-7xl lg:text-8xl tracking-widest mb-3"
          style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
        >
          FROASTER
        </h1>
        
        <p 
          ref={taglineRef}
          className="text-[#A7A39A] font-oswald text-[10px] md:text-xs uppercase tracking-[0.3em] font-light"
        >
          Where fat meets its fate.
        </p>
      </div>
    </div>
  );
}
