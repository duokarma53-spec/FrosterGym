import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function EditorialLoader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubblesGroupRef = useRef<HTMLDivElement>(null);
  const finalLogoRef = useRef<HTMLDivElement>(null);
  const fluidLogoRef = useRef<HTMLImageElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  const [isDone, setIsDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Mobile optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const BUBBLE_COUNT = isMobile ? 8 : 15;

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const finishLoading = () => {
      if (isDone) return;
      setIsDone(true);
      setIsFadingOut(true);
      setTimeout(() => {
        document.body.style.overflow = '';
        onComplete();
      }, 1000); // smooth fade out
    };

    const fallbackTimer = setTimeout(finishLoading, 6500);

    const bubbles = Array.from(bubblesGroupRef.current?.children || []).filter(el => el.classList.contains('bubble'));
    
    // Initial Setup
    gsap.set(finalLogoRef.current, { opacity: 0, scale: 0.95 });
    gsap.set(fluidLogoRef.current, { scale: 0.1, opacity: 0 });
    gsap.set(sweepRef.current, { x: '-150%' });
    
    // Scatter bubbles in 3D space initially
    bubbles.forEach((bubble, i) => {
      const radius = isMobile ? 150 : 250;
      const angle = (i / bubbles.length) * Math.PI * 2;
      gsap.set(bubble, {
        x: Math.cos(angle) * (radius + Math.random() * 100),
        y: Math.sin(angle) * (radius + Math.random() * 100),
        scale: 0,
        opacity: 0,
        z: Math.random() * 200 - 100
      });
    });

    const tl = gsap.timeline({ onComplete: finishLoading });

    // Scene 1: Bubbles slowly appear from darkness (0 to 1 sec)
    tl.to(bubbles, {
      scale: () => Math.random() * 1.5 + 0.8,
      opacity: 1,
      duration: 1.2,
      stagger: { amount: 0.8, from: 'random' },
      ease: 'back.out(1.2)'
    }, 0);

    // Scene 2: Bubbles float organically (0.5 to 2.5 sec)
    bubbles.forEach((bubble) => {
      gsap.to(bubble, {
        x: `+=${Math.random() * 80 - 40}`,
        y: `+=${Math.random() * 80 - 40}`,
        z: `+=${Math.random() * 100 - 50}`,
        duration: 2 + Math.random(),
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut',
        delay: 0.5
      });
    });
    
    // Subtle camera drift
    tl.to(bubblesGroupRef.current, {
      scale: 1.15,
      rotationZ: 5,
      duration: 4,
      ease: 'sine.inOut'
    }, 0);

    // Scene 3: Bubbles attract, merge, and morph (2.5 to 4 sec)
    // First, fluid logo (which is hidden in the goo filter) starts scaling up
    tl.to(fluidLogoRef.current, {
      scale: 1,
      opacity: 1,
      duration: 1.2,
      ease: 'power3.inOut'
    }, 2.4);

    // Bubbles suck into the center to form the mass
    tl.to(bubbles, {
      x: 0,
      y: 0,
      z: 0,
      scale: 0,
      duration: 1.0,
      stagger: { amount: 0.4, from: 'edges' },
      ease: 'power3.inOut'
    }, 2.4);
    
    // Stretch the mass horizontally slightly during morph
    tl.to(bubblesGroupRef.current, {
      scaleX: 1.05,
      scaleY: 0.95,
      duration: 0.5,
      yoyo: true,
      repeat: 1,
      ease: 'sine.inOut'
    }, 2.6);

    // Scene 4: Reveal the sharp final logo and remove goo effect
    tl.to(finalLogoRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'power2.out'
    }, 3.5);
    
    // Fade out the fluid group underneath
    tl.to(bubblesGroupRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut'
    }, 3.5);

    // Hero Moment: Light Sweep
    tl.to(sweepRef.current, {
      x: '200%',
      duration: 1.5,
      ease: 'power2.inOut'
    }, 3.8);
    
    // Final camera push-in
    tl.to(containerRef.current, {
      scale: 1.1,
      duration: 1.5,
      ease: 'power1.inOut'
    }, 4.0);

    return () => {
      clearTimeout(fallbackTimer);
      tl.kill();
    };
  }, [isDone]);

  if (isDone && !isFadingOut) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#020202] flex items-center justify-center overflow-hidden transition-opacity duration-1000 ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* SVG Liquid Filter Definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="liquid-metal">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="
              1 0 0 0 0  
              0 1 0 0 0  
              0 0 1 0 0  
              0 0 0 35 -15
            " result="liquid" />
            <feComposite in="SourceGraphic" in2="liquid" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center perspective-[1200px]">
        
        {/* Subtle Ambient Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,30,30,0.8)_0%,rgba(2,2,2,1)_60%)] pointer-events-none"></div>

        {/* 
          LIQUID METAL BUBBLES GROUP
          This container applies the SVG filter to everything inside it.
          When the bubbles intersect, the filter merges them beautifully.
        */}
        <div 
          ref={bubblesGroupRef} 
          className="absolute inset-0 flex items-center justify-center transform-style-3d pointer-events-none"
          style={{ filter: 'url(#liquid-metal)' }}
        >
          {/* The Bubbles */}
          {Array.from({ length: BUBBLE_COUNT }).map((_, i) => {
            const size = Math.random() > 0.8 ? '120px' : Math.random() > 0.5 ? '80px' : '50px';
            return (
              <div 
                key={i} 
                className="bubble absolute rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.9),inset_5px_5px_15px_rgba(255,255,255,0.1)]"
                style={{
                  width: size,
                  height: size,
                  background: 'radial-gradient(circle at 30% 30%, #3a3a3a 0%, #1a1a1a 40%, #050505 80%, #000 100%)',
                }}
              >
                {/* Subtle gold reflection */}
                <div className="absolute top-[15%] left-[20%] w-1/4 h-1/4 rounded-full bg-[#D4AF37] opacity-10 blur-sm"></div>
              </div>
            );
          })}
          
          {/* The Fluid Logo Silhouette (Morph Target) */}
          <img 
            ref={fluidLogoRef}
            src="/FrosterGym/new-froaster-logo.png" 
            alt=""
            className="absolute w-64 md:w-80 lg:w-96 h-auto drop-shadow-2xl opacity-0"
            style={{ filter: 'brightness(1.5) contrast(2) invert(1) grayscale(1)', mixBlendMode: 'screen' }} 
          />
        </div>

        {/* 
          FINAL REVEAL
          This sits above the liquid filter so it's perfectly sharp.
        */}
        <div ref={finalLogoRef} className="absolute z-50 flex flex-col items-center justify-center">
          <div className="relative overflow-hidden group">
            {/* Dark Forged Metal Logo */}
            <img 
              src="/FrosterGym/new-froaster-logo.png" 
              alt="Froaster Fitness" 
              className="w-64 md:w-80 lg:w-96 h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              style={{ filter: 'brightness(1.2) contrast(1.5) invert(1)', mixBlendMode: 'screen' }} 
            />
            {/* Light sweep effect */}
            <div 
              ref={sweepRef}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30 skew-x-[-25deg] mix-blend-overlay"
              style={{ filter: 'blur(12px)' }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}
