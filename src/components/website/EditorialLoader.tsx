import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const Dumbbell = () => (
  <svg width="240" height="100" viewBox="0 0 240 100" className="drop-shadow-2xl">
    {/* Handle */}
    <rect x="40" y="42" width="160" height="16" fill="url(#handleGrad)" rx="2" />
    
    {/* Left Weights */}
    <rect x="50" y="30" width="12" height="40" fill="url(#plateGrad)" rx="2" />
    <rect x="35" y="15" width="15" height="70" fill="url(#plateGrad)" rx="3" />
    <rect x="15" y="10" width="20" height="80" fill="url(#plateGrad)" rx="4" />
    
    {/* Right Weights */}
    <rect x="178" y="30" width="12" height="40" fill="url(#plateGrad)" rx="2" />
    <rect x="190" y="15" width="15" height="70" fill="url(#plateGrad)" rx="3" />
    <rect x="205" y="10" width="20" height="80" fill="url(#plateGrad)" rx="4" />

    {/* Screws/Ends */}
    <rect x="5" y="40" width="10" height="20" fill="url(#handleGrad)" rx="2" />
    <rect x="225" y="40" width="10" height="20" fill="url(#handleGrad)" rx="2" />

    <defs>
      <linearGradient id="handleGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#666" />
        <stop offset="30%" stopColor="#999" />
        <stop offset="70%" stopColor="#333" />
        <stop offset="100%" stopColor="#111" />
      </linearGradient>
      <linearGradient id="plateGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#333" />
        <stop offset="15%" stopColor="#555" />
        <stop offset="50%" stopColor="#1a1a1a" />
        <stop offset="85%" stopColor="#333" />
        <stop offset="100%" stopColor="#0a0a0a" />
      </linearGradient>
    </defs>
  </svg>
);

export default function EditorialLoader({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dumbbellRef = useRef<HTMLDivElement>(null);
  const explosionRef = useRef<HTMLDivElement>(null);
  const text3dRef = useRef<HTMLDivElement>(null);
  const finalLogoRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const loadingProgressRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const shockwaveRef = useRef<HTMLDivElement>(null);

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Optimizations for mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const EXTRUSION_LAYERS = isMobile ? 8 : 16;
  const PARTICLE_COUNT = isMobile ? 50 : 120;

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const finishLoading = () => {
      if (isDone) return;
      setIsDone(true);
      setIsFadingOut(true);
      setTimeout(() => {
        document.body.style.overflow = '';
        onComplete();
      }, 700);
    };

    // Safety fallback (ensures the user is never stuck on loading screen)
    const fallbackTimer = setTimeout(finishLoading, 7500);

    const particles = Array.from(explosionRef.current?.children || []);
    
    // 0. Initial Setup
    gsap.set(dumbbellRef.current, { y: -window.innerHeight * 0.7, rotation: 25, scale: 0.8, opacity: 0 });
    gsap.set(text3dRef.current, { scale: 0.5, opacity: 0, rotationX: 45, y: 50 });
    gsap.set(finalLogoRef.current, { opacity: 0, scale: 0.9, y: -20 });
    gsap.set(loadingBarRef.current, { opacity: 0, y: 20 });
    gsap.set(loadingProgressRef.current, { scaleX: 0, transformOrigin: 'left' });
    gsap.set(flashRef.current, { opacity: 0 });
    gsap.set(shockwaveRef.current, { scale: 0, opacity: 0 });
    gsap.set(sweepRef.current, { backgroundPosition: '200% 0' });
    gsap.set(particles, { opacity: 0, scale: 0 });

    const tl = gsap.timeline({
      onComplete: finishLoading
    });

    // 1. Dumbbell Drop
    tl.to(dumbbellRef.current, {
      y: 0,
      rotation: 0,
      scale: 1.2,
      opacity: 1,
      duration: 0.5,
      ease: "power4.in"
    }, 0.3);

    // 2. IMPACT
    tl.add(() => {
      // Hide dumbbell instantly
      gsap.set(dumbbellRef.current, { opacity: 0 });
      
      // Screen shake (vertical slam)
      gsap.fromTo(containerRef.current, 
        { y: 20, rotation: (Math.random() - 0.5) * 2 }, 
        { y: 0, rotation: 0, duration: 0.7, ease: "elastic.out(1, 0.2)" }
      );

      // Gold impact flash
      gsap.fromTo(flashRef.current,
        { opacity: 0.85 }, { opacity: 0, duration: 0.5, ease: "power2.out" }
      );

      // Shockwave expansion
      gsap.fromTo(shockwaveRef.current,
        { scale: 0.1, opacity: 0.8 },
        { scale: 4.5, opacity: 0, duration: 0.8, ease: "power3.out" }
      );

      // Metal fragments explosion
      gsap.to(particles, {
        x: () => (Math.random() - 0.5) * window.innerWidth * (isMobile ? 0.9 : 1.3),
        y: () => (Math.random() - 0.5) * window.innerHeight * 0.9,
        rotation: () => Math.random() * 1080 - 540,
        opacity: () => Math.random() * 0.8 + 0.2,
        scale: () => Math.random() * 3 + 0.5,
        duration: () => Math.random() * 0.8 + 0.5,
        ease: "power4.out"
      });
    }, 0.8);

    // 3. Transformation (The fragments form the 3D Text)
    tl.to(text3dRef.current, {
      scale: 1,
      opacity: 1,
      rotationX: 0,
      y: 0,
      duration: 1.4,
      ease: "elastic.out(1, 0.6)"
    }, 0.9);

    // Particles implosion / fade out
    tl.to(particles, {
      x: 0,
      y: 0,
      scale: 0,
      opacity: 0,
      duration: 0.9,
      ease: "power3.in"
    }, 1.4);

    // 4. Gold Sweep across heavy 3D text
    tl.to(sweepRef.current, {
      backgroundPosition: '-100% 0',
      duration: 1.2,
      ease: "power2.inOut"
    }, 2.0);

    // 5. Crossfade to Final Premium Brand Reveal
    tl.to(text3dRef.current, {
      opacity: 0,
      scale: 1.15,
      filter: 'blur(8px)',
      duration: 0.7,
      ease: "power2.inOut"
    }, 3.4);

    tl.to([finalLogoRef.current, loadingBarRef.current], {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out"
    }, 3.8);

    // 6. Loading bar fills up
    tl.to(loadingProgressRef.current, {
      scaleX: 1,
      duration: 1.2,
      ease: "power2.inOut"
    }, 4.2);

    // 7. Cinematic Exit
    tl.to([finalLogoRef.current, loadingBarRef.current], {
      opacity: 0,
      scale: 1.1,
      filter: 'blur(6px)',
      duration: 0.6,
      ease: "power3.in"
    }, 5.8);

    return () => {
      tl.kill();
      clearTimeout(fallbackTimer);
      document.body.style.overflow = '';
    };
  }, [onComplete, isDone]);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-[9999] bg-[#030303] overflow-hidden flex flex-col items-center justify-center transition-opacity duration-700 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ perspective: '1200px' }}
    >
      {/* Cinematic Studio Floor / Light */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] max-w-[1200px] max-h-[1200px] rounded-full blur-[140px] pointer-events-none mix-blend-screen opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(3,3,3,0) 70%)'
        }}
      />

      {/* 1. The Dumbbell Drop */}
      <div ref={dumbbellRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <Dumbbell />
      </div>

      {/* 2. Shockwave Ring */}
      <div 
        ref={shockwaveRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-[#D4AF37] pointer-events-none z-20"
        style={{ boxShadow: '0 0 50px rgba(212,175,55,0.6), inset 0 0 30px rgba(212,175,55,0.4)' }}
      />

      {/* 3. The 3D Forged Text */}
      <div 
        ref={text3dRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center z-10 w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative w-full flex justify-center" style={{ transformStyle: 'preserve-3d' }}>
           {Array.from({ length: EXTRUSION_LAYERS }).map((_, i) => {
             const isFront = i === EXTRUSION_LAYERS - 1;
             return (
               <div 
                 key={i}
                 className={`font-display font-bold text-[18vw] sm:text-[15vw] md:text-[12vw] lg:text-[10rem] tracking-[0.1em] leading-none select-none flex items-center justify-center uppercase ${isFront ? 'relative' : 'absolute inset-0'}`}
                 style={{
                   transform: `translateZ(${i * 2}px)`,
                   WebkitTextStroke: isFront ? '1.5px rgba(212,175,55,0.8)' : '2px rgba(10,10,10,1)',
                   color: isFront ? 'transparent' : '#050505',
                   backgroundImage: isFront ? 'linear-gradient(135deg, #888 0%, #333 30%, #666 50%, #222 70%, #555 100%)' : 'none',
                   WebkitBackgroundClip: isFront ? 'text' : 'none',
                   filter: !isFront ? `brightness(${0.15 + (i/EXTRUSION_LAYERS)*0.7})` : 'none',
                   textShadow: !isFront ? '0px 2px 5px rgba(0,0,0,0.8)' : 'none'
                 }}
               >
                 FROASTER
               </div>
             );
           })}
           
           {/* Sweep Layer overlay for 3D text */}
           <div 
             ref={sweepRef}
             className="absolute inset-0 font-display font-bold text-[18vw] sm:text-[15vw] md:text-[12vw] lg:text-[10rem] tracking-[0.1em] leading-none select-none flex items-center justify-center uppercase pointer-events-none"
             style={{
                transform: `translateZ(${EXTRUSION_LAYERS * 2 + 1}px)`,
                backgroundImage: 'linear-gradient(110deg, transparent 0%, rgba(212,175,55,0) 40%, rgba(255,230,150,0.95) 50%, rgba(212,175,55,0) 60%, transparent 100%)',
                backgroundSize: '200% 100%',
                backgroundPosition: '200% 0',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
             }}
           >
             FROASTER
           </div>
        </div>
      </div>

      {/* Explosion Fragments (Particles) */}
      <div ref={explosionRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none z-30">
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
          const size = Math.random() > 0.8 ? '14px' : '6px';
          const isGold = Math.random() > 0.85;
          return (
            <div
              key={`fragment-${i}`}
              className="absolute top-0 left-0"
              style={{ 
                width: size,
                height: size,
                backgroundColor: isGold ? '#D4AF37' : (Math.random() > 0.5 ? '#555' : '#111'),
                clipPath: Math.random() > 0.5 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                opacity: 0, 
                boxShadow: isGold ? '0 0 12px rgba(212,175,55,0.6)' : '0 0 8px rgba(0,0,0,0.9)' 
              }}
            />
          );
        })}
      </div>

      {/* Final Logo Reveal (Shield + Text) */}
      <div 
        ref={finalLogoRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-40 w-full px-6 pointer-events-none"
      >
        <img 
          src="/FrosterGym/froaster-logo.png" 
          alt="Froaster Logo" 
          className="h-28 sm:h-32 md:h-40 object-contain drop-shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
          style={{ filter: 'brightness(1.2) contrast(1.5) invert(1) sepia(1) hue-rotate(5deg) saturate(2)', mixBlendMode: 'screen' }}
          onError={(e) => { e.currentTarget.src = '/FrosterGym/logo.png' }}
        />
      </div>

      {/* Loading Bar */}
      <div 
        ref={loadingBarRef}
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-40 pointer-events-none"
      >
        <span className="text-[#D4AF37] font-display text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
          Loading...
        </span>
        <div className="w-56 md:w-72 h-[1px] bg-white/10 relative overflow-hidden">
          <div 
            ref={loadingProgressRef}
            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-[#D4AF37] to-[#FFF4D0] shadow-[0_0_15px_#D4AF37]"
          />
        </div>
      </div>

      {/* Impact Flash Overlay */}
      <div 
        ref={flashRef}
        className="absolute inset-0 bg-[#D4AF37] pointer-events-none mix-blend-screen z-50 opacity-0"
      />
    </div>
  );
}
